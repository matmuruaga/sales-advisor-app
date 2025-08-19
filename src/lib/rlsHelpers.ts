import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { User as AppUser, Organization } from './supabase';
import { 
  isFeatureEnabled, 
  isRLSEnabledForTable, 
  isMockAuthEnabled,
  FeatureFlag,
  logFeatureUsage 
} from './featureFlags';

/**
 * RLS Helpers - Critical utilities for Row Level Security implementation
 * 
 * These helpers provide the foundation for all RLS operations in the application.
 * They handle organization context, user validation, and policy construction.
 */

// Cache for organization data to minimize database calls
const organizationCache = new Map<string, { organizationId: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Error classes for RLS operations
 */
export class RLSError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'RLSError';
  }
}

export class UnauthorizedError extends RLSError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED');
  }
}

export class OrganizationNotFoundError extends RLSError {
  constructor(message: string = 'Organization not found') {
    super(message, 'ORGANIZATION_NOT_FOUND');
  }
}

export class UserNotFoundError extends RLSError {
  constructor(message: string = 'User not found') {
    super(message, 'USER_NOT_FOUND');
  }
}

/**
 * Types for RLS operations
 */
export interface RLSContext {
  userId: string;
  organizationId: string;
  userRole: string;
  supabaseClient: SupabaseClient;
  isMockContext?: boolean;
}

export interface PolicyCondition {
  column: string;
  operator: 'eq' | 'neq' | 'in' | 'not_in' | 'is' | 'is_not';
  value: any;
}

export interface RLSPolicy {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  conditions: PolicyCondition[];
  name?: string;
}

/**
 * Get organization ID for the authenticated user from cache or database
 * @param supabaseClient - Authenticated Supabase client
 * @param userId - User ID from authentication
 * @returns Organization ID
 */
export async function getUserOrganizationId(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<string> {
  // If mock auth is enabled, return mock organization ID
  if (isMockAuthEnabled()) {
    logFeatureUsage('getUserOrganizationId', true, { userId, mockAuth: true });
    return '47fba630-b113-4fe9-b68f-947d79c09fb2'; // Mock organization ID
  }

  // Check cache first
  const cacheKey = `user_org_${userId}`;
  const cached = organizationCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logFeatureUsage('getUserOrganizationId', true, { userId, cached: true });
    return cached.organizationId;
  }

  try {
    const { data: userData, error } = await supabaseClient
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single();

    if (error) {
      throw new UserNotFoundError(`Failed to fetch user organization: ${error.message}`);
    }

    if (!userData?.organization_id) {
      throw new OrganizationNotFoundError('User does not belong to any organization');
    }

    // Cache the result
    organizationCache.set(cacheKey, {
      organizationId: userData.organization_id,
      timestamp: Date.now()
    });

    logFeatureUsage('getUserOrganizationId', true, { userId, fromDatabase: true });
    return userData.organization_id;
  } catch (error) {
    if (error instanceof RLSError) throw error;
    throw new RLSError(`Failed to get user organization: ${error}`, 'DATABASE_ERROR');
  }
}

/**
 * Verify if a user belongs to a specific organization
 * @param supabaseClient - Authenticated Supabase client
 * @param userId - User ID to check
 * @param organizationId - Organization ID to verify against
 * @returns True if user belongs to organization
 */
export async function verifyUserOrganization(
  supabaseClient: SupabaseClient,
  userId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const userOrgId = await getUserOrganizationId(supabaseClient, userId);
    return userOrgId === organizationId;
  } catch (error) {
    console.error('Error verifying user organization:', error);
    return false;
  }
}

/**
 * Get user role within their organization
 * @param supabaseClient - Authenticated Supabase client
 * @param userId - User ID
 * @returns User role
 */
export async function getUserRole(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<AppUser['role']> {
  try {
    const { data: userData, error } = await supabaseClient
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      throw new UserNotFoundError(`Failed to fetch user role: ${error.message}`);
    }

    return userData.role;
  } catch (error) {
    if (error instanceof RLSError) throw error;
    throw new RLSError(`Failed to get user role: ${error}`, 'DATABASE_ERROR');
  }
}

/**
 * Get complete RLS context for a user
 * @param supabaseClient - Authenticated Supabase client
 * @param userId - User ID
 * @returns Complete RLS context
 */
export async function getRLSContext(
  supabaseClient: SupabaseClient,
  userId: string
): Promise<RLSContext> {
  try {
    // If RLS is disabled globally, return mock context
    if (!isFeatureEnabled(FeatureFlag.RLS_ENABLED)) {
      logFeatureUsage('getRLSContext', false, { userId, reason: 'RLS_DISABLED' });
      return createMockRLSContext(userId, '47fba630-b113-4fe9-b68f-947d79c09fb2');
    }

    const [organizationId, userRole] = await Promise.all([
      getUserOrganizationId(supabaseClient, userId),
      getUserRole(supabaseClient, userId)
    ]);

    const context: RLSContext = {
      userId,
      organizationId,
      userRole,
      supabaseClient,
      isMockContext: isMockAuthEnabled()
    };

    logFeatureUsage('getRLSContext', true, { 
      userId, 
      organizationId, 
      userRole, 
      isMock: context.isMockContext 
    });

    return context;
  } catch (error) {
    if (error instanceof RLSError) throw error;
    throw new RLSError(`Failed to get RLS context: ${error}`, 'CONTEXT_ERROR');
  }
}

/**
 * Create a Supabase client with RLS context pre-configured
 * @param user - Authenticated user
 * @param organizationId - Organization ID to set in context
 * @returns Supabase client with RLS context
 */
export function createRLSClient(user: User, organizationId: string): SupabaseClient {
  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${user.access_token || ''}`,
          'X-Organization-ID': organizationId,
          'X-User-ID': user.id
        }
      }
    }
  );

  return client;
}

/**
 * Build RLS policy conditions programmatically
 * @param table - Table name
 * @param operation - SQL operation
 * @param organizationId - Organization ID for filtering
 * @param additionalConditions - Additional policy conditions
 * @returns RLS policy object
 */
export function buildRLSPolicy(
  table: string,
  operation: RLSPolicy['operation'],
  organizationId: string,
  additionalConditions: PolicyCondition[] = []
): RLSPolicy {
  const baseConditions: PolicyCondition[] = [
    {
      column: 'organization_id',
      operator: 'eq',
      value: organizationId
    }
  ];

  return {
    table,
    operation,
    conditions: [...baseConditions, ...additionalConditions],
    name: `${table}_${operation}_policy`
  };
}

/**
 * Apply RLS context to a query builder
 * @param query - Supabase query builder
 * @param context - RLS context
 * @param tableName - Optional table name for table-specific RLS checking
 * @returns Query with RLS context applied
 */
export function applyRLSContext<T>(
  query: any,
  context: RLSContext,
  tableName?: string
): any {
  // If RLS is disabled globally, don't apply any filters
  if (!isFeatureEnabled(FeatureFlag.RLS_ENABLED)) {
    logFeatureUsage('applyRLSContext', false, { tableName, reason: 'GLOBAL_RLS_DISABLED' });
    return query;
  }

  // If table-specific RLS is configured and this table is disabled, skip RLS
  if (tableName && !isRLSEnabledForTable(tableName)) {
    logFeatureUsage('applyRLSContext', false, { tableName, reason: 'TABLE_RLS_DISABLED' });
    return query;
  }

  // Apply organization filter
  logFeatureUsage('applyRLSContext', true, { 
    tableName, 
    organizationId: context.organizationId,
    isMock: context.isMockContext 
  });
  
  return query.eq('organization_id', context.organizationId);
}

/**
 * Validate organization access for a resource
 * @param supabaseClient - Supabase client
 * @param table - Table name
 * @param resourceId - Resource ID to check
 * @param organizationId - Expected organization ID
 * @returns True if resource belongs to organization
 */
export async function validateOrganizationAccess(
  supabaseClient: SupabaseClient,
  table: string,
  resourceId: string,
  organizationId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabaseClient
      .from(table)
      .select('organization_id')
      .eq('id', resourceId)
      .single();

    if (error) {
      console.error(`Error validating access to ${table}:`, error);
      return false;
    }

    return data?.organization_id === organizationId;
  } catch (error) {
    console.error(`Failed to validate organization access:`, error);
    return false;
  }
}

/**
 * Clear organization cache for a user (use when user data changes)
 * @param userId - User ID to clear cache for
 */
export function clearUserCache(userId: string): void {
  const cacheKey = `user_org_${userId}`;
  organizationCache.delete(cacheKey);
}

/**
 * Clear all cached organization data
 */
export function clearAllCache(): void {
  organizationCache.clear();
}

/**
 * Get organization details for RLS context
 * @param supabaseClient - Supabase client
 * @param organizationId - Organization ID
 * @returns Organization details
 */
export async function getOrganizationDetails(
  supabaseClient: SupabaseClient,
  organizationId: string
): Promise<Organization> {
  try {
    const { data, error } = await supabaseClient
      .from('organizations')
      .select('*')
      .eq('id', organizationId)
      .single();

    if (error) {
      throw new OrganizationNotFoundError(`Organization not found: ${error.message}`);
    }

    return data;
  } catch (error) {
    if (error instanceof RLSError) throw error;
    throw new RLSError(`Failed to get organization details: ${error}`, 'DATABASE_ERROR');
  }
}

/**
 * Check if user has admin privileges in their organization
 * @param context - RLS context
 * @returns True if user is admin
 */
export function isUserAdmin(context: RLSContext): boolean {
  return context.userRole === 'admin';
}

/**
 * Check if user has manager privileges in their organization
 * @param context - RLS context
 * @returns True if user is admin or manager
 */
export function isUserManager(context: RLSContext): boolean {
  return ['admin', 'manager'].includes(context.userRole);
}

/**
 * Generate SQL for RLS policy (for database migrations)
 * @param policy - RLS policy object
 * @returns SQL string for policy creation
 */
export function generatePolicySQL(policy: RLSPolicy): string {
  const conditions = policy.conditions
    .map(condition => {
      const value = typeof condition.value === 'string' 
        ? `'${condition.value}'` 
        : condition.value;
      
      switch (condition.operator) {
        case 'eq': return `${condition.column} = ${value}`;
        case 'neq': return `${condition.column} != ${value}`;
        case 'in': return `${condition.column} IN (${Array.isArray(condition.value) ? condition.value.map(v => `'${v}'`).join(',') : value})`;
        case 'not_in': return `${condition.column} NOT IN (${Array.isArray(condition.value) ? condition.value.map(v => `'${v}'`).join(',') : value})`;
        case 'is': return `${condition.column} IS ${value}`;
        case 'is_not': return `${condition.column} IS NOT ${value}`;
        default: return `${condition.column} = ${value}`;
      }
    })
    .join(' AND ');

  const policyName = policy.name || `${policy.table}_${policy.operation}_policy`;
  
  return `
    CREATE POLICY "${policyName}" ON "${policy.table}"
    FOR ${policy.operation.toUpperCase()} TO authenticated
    USING (${conditions});
  `.trim();
}

/**
 * Test utility: Create mock RLS context for testing
 * @param userId - User ID
 * @param organizationId - Organization ID  
 * @param userRole - User role
 * @returns Mock RLS context
 */
export function createMockRLSContext(
  userId: string,
  organizationId: string,
  userRole: AppUser['role'] = 'rep'
): RLSContext {
  return {
    userId,
    organizationId,
    userRole,
    supabaseClient: supabase, // Use default client for testing
    isMockContext: true
  };
}

/**
 * Check if RLS should be bypassed for a given operation
 * @param tableName - Table name
 * @param operation - Operation type
 * @returns Whether to bypass RLS
 */
export function shouldBypassRLS(
  tableName?: string,
  operation?: 'select' | 'insert' | 'update' | 'delete'
): boolean {
  // Global RLS check
  if (!isFeatureEnabled(FeatureFlag.RLS_ENABLED)) {
    return true;
  }

  // Table-specific RLS check
  if (tableName && !isRLSEnabledForTable(tableName)) {
    return true;
  }

  return false;
}

/**
 * Create RLS-aware query helper
 * @param baseQuery - Base Supabase query
 * @param context - RLS context
 * @param tableName - Table name for logging
 * @returns Query with appropriate RLS applied
 */
export function createRLSQuery<T>(
  baseQuery: any,
  context: RLSContext,
  tableName?: string
): any {
  if (shouldBypassRLS(tableName)) {
    logFeatureUsage('createRLSQuery', false, { tableName, bypass: true });
    return baseQuery;
  }

  return applyRLSContext(baseQuery, context, tableName);
}