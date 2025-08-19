import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { supabase } from './supabase';
import { RLSError, UnauthorizedError, UserNotFoundError } from './rlsHelpers';

/**
 * Authentication Validation Utilities
 * 
 * Provides comprehensive authentication validation, token management,
 * and permission checking for the application.
 */

/**
 * Authentication result interface
 */
export interface AuthValidationResult {
  user: User;
  session: Session;
  supabaseClient: SupabaseClient;
  isValid: boolean;
  organizationId?: string;
  userRole?: string;
}

/**
 * JWT payload interface (from Supabase)
 */
export interface JWTPayload {
  sub: string; // user id
  email: string;
  aud: string;
  role: string;
  iat: number;
  exp: number;
  iss: string;
  organization_id?: string;
  user_role?: string;
}

/**
 * Permission levels enum
 */
export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

/**
 * Resource permissions mapping
 */
export const RESOURCE_PERMISSIONS: Record<string, Record<string, PermissionLevel[]>> = {
  contacts: {
    admin: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    manager: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE],
    rep: [PermissionLevel.READ, PermissionLevel.WRITE],
    bdr: [PermissionLevel.READ, PermissionLevel.WRITE]
  },
  companies: {
    admin: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    manager: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE],
    rep: [PermissionLevel.READ, PermissionLevel.WRITE],
    bdr: [PermissionLevel.READ, PermissionLevel.WRITE]
  },
  users: {
    admin: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    manager: [PermissionLevel.READ],
    rep: [PermissionLevel.READ],
    bdr: [PermissionLevel.READ]
  },
  actions: {
    admin: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE, PermissionLevel.ADMIN],
    manager: [PermissionLevel.READ, PermissionLevel.WRITE, PermissionLevel.DELETE],
    rep: [PermissionLevel.READ, PermissionLevel.WRITE],
    bdr: [PermissionLevel.READ, PermissionLevel.WRITE]
  },
  analytics: {
    admin: [PermissionLevel.READ, PermissionLevel.ADMIN],
    manager: [PermissionLevel.READ],
    rep: [PermissionLevel.READ],
    bdr: [PermissionLevel.READ]
  }
};

/**
 * Validate Supabase session and return authentication result
 * @param supabaseClient - Supabase client instance
 * @param throwOnError - Whether to throw errors or return invalid result
 * @returns Authentication validation result
 */
export async function validateSupabaseSession(
  supabaseClient: SupabaseClient,
  throwOnError = false
): Promise<AuthValidationResult> {
  try {
    const { data: { session, user }, error } = await supabaseClient.auth.getSession();

    if (error) {
      if (throwOnError) {
        throw new UnauthorizedError(`Session validation failed: ${error.message}`);
      }
      return {
        user: null as any,
        session: null as any,
        supabaseClient,
        isValid: false
      };
    }

    if (!session || !user) {
      if (throwOnError) {
        throw new UnauthorizedError('No active session found');
      }
      return {
        user: null as any,
        session: null as any,
        supabaseClient,
        isValid: false
      };
    }

    // Check if session is expired
    if (session.expires_at && session.expires_at * 1000 < Date.now()) {
      if (throwOnError) {
        throw new UnauthorizedError('Session has expired');
      }
      return {
        user,
        session,
        supabaseClient,
        isValid: false
      };
    }

    // Get user organization and role
    let organizationId: string | undefined;
    let userRole: string | undefined;

    try {
      const { data: userData } = await supabaseClient
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single();

      organizationId = userData?.organization_id;
      userRole = userData?.role;
    } catch (error) {
      console.warn('Failed to fetch user organization data:', error);
    }

    return {
      user,
      session,
      supabaseClient,
      isValid: true,
      organizationId,
      userRole
    };

  } catch (error) {
    if (error instanceof RLSError) throw error;
    
    if (throwOnError) {
      throw new UnauthorizedError(`Authentication validation failed: ${error}`);
    }

    return {
      user: null as any,
      session: null as any,
      supabaseClient,
      isValid: false
    };
  }
}

/**
 * Extract and validate JWT token from request headers
 * @param request - NextJS request object
 * @returns Decoded JWT payload
 */
export function extractJWTFromRequest(request: NextRequest): string {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new UnauthorizedError('No authorization header found');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Invalid authorization header format');
  }

  const token = authHeader.replace('Bearer ', '').trim();
  
  if (!token) {
    throw new UnauthorizedError('No token found in authorization header');
  }

  return token;
}

/**
 * Validate JWT token structure (basic validation)
 * @param token - JWT token string
 * @returns True if token has valid structure
 */
export function isValidJWTStructure(token: string): boolean {
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
}

/**
 * Create authenticated Supabase client from request
 * @param request - NextJS request object
 * @returns Authenticated Supabase client and validation result
 */
export async function createAuthenticatedClient(
  request: NextRequest
): Promise<{ 
  supabaseClient: SupabaseClient; 
  validation: AuthValidationResult;
  token: string;
}> {
  const token = extractJWTFromRequest(request);

  if (!isValidJWTStructure(token)) {
    throw new UnauthorizedError('Invalid JWT token structure');
  }

  const supabaseClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: false, // Don't auto-refresh in API routes
        persistSession: false    // Don't persist in API routes
      }
    }
  );

  const validation = await validateSupabaseSession(supabaseClient, true);

  return {
    supabaseClient,
    validation,
    token
  };
}

/**
 * Validate user permissions for a specific resource and operation
 * @param userRole - User's role in the organization
 * @param resource - Resource name (e.g., 'contacts', 'companies')
 * @param permission - Required permission level
 * @returns True if user has permission
 */
export function validateUserPermission(
  userRole: string,
  resource: string,
  permission: PermissionLevel
): boolean {
  const resourcePermissions = RESOURCE_PERMISSIONS[resource];
  
  if (!resourcePermissions) {
    console.warn(`No permissions defined for resource: ${resource}`);
    return false;
  }

  const userPermissions = resourcePermissions[userRole];
  
  if (!userPermissions) {
    console.warn(`No permissions defined for role: ${userRole} on resource: ${resource}`);
    return false;
  }

  return userPermissions.includes(permission);
}

/**
 * Refresh authentication token when needed
 * @param supabaseClient - Supabase client
 * @returns New session data or null if refresh failed
 */
export async function refreshAuthToken(
  supabaseClient: SupabaseClient
): Promise<{ session: Session; user: User } | null> {
  try {
    const { data, error } = await supabaseClient.auth.refreshSession();
    
    if (error || !data.session) {
      console.error('Token refresh failed:', error);
      return null;
    }

    return {
      session: data.session,
      user: data.user
    };
  } catch (error) {
    console.error('Error during token refresh:', error);
    return null;
  }
}

/**
 * Handle authentication errors consistently across the application
 * @param error - Error object
 * @param context - Additional context for logging
 * @returns Standardized error response
 */
export function handleAuthError(
  error: any, 
  context: string = 'authentication'
): { 
  error: string; 
  code: string; 
  statusCode: number; 
} {
  console.error(`Authentication error in ${context}:`, error);

  if (error instanceof UnauthorizedError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: 401
    };
  }

  if (error instanceof UserNotFoundError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: 404
    };
  }

  if (error instanceof RLSError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: 403
    };
  }

  // Generic authentication error
  return {
    error: 'Authentication failed',
    code: 'AUTH_ERROR',
    statusCode: 401
  };
}

/**
 * Check if a user can access another user's data
 * @param requestingUserRole - Role of the user making the request
 * @param targetUserId - ID of the user whose data is being accessed
 * @param requestingUserId - ID of the user making the request
 * @param organizationId - Organization ID for context
 * @returns True if access is allowed
 */
export function canAccessUserData(
  requestingUserRole: string,
  targetUserId: string,
  requestingUserId: string,
  organizationId: string
): boolean {
  // Users can always access their own data
  if (requestingUserId === targetUserId) {
    return true;
  }

  // Admins can access any user data in their organization
  if (requestingUserRole === 'admin') {
    return true;
  }

  // Managers can access rep and bdr data
  if (requestingUserRole === 'manager') {
    return true; // Note: Should validate target user role in real implementation
  }

  // Default: no access
  return false;
}

/**
 * Generate authentication headers for service-to-service calls
 * @param serviceKey - Service role key (only for internal services)
 * @returns Headers object
 */
export function generateServiceHeaders(serviceKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (serviceKey) {
    // Only use service role for internal operations
    headers['Authorization'] = `Bearer ${serviceKey}`;
    headers['X-Service-Role'] = 'true';
  }

  return headers;
}

/**
 * Validate API key for external integrations
 * @param apiKey - API key to validate
 * @param organizationId - Organization ID
 * @returns True if API key is valid
 */
export async function validateAPIKey(
  apiKey: string,
  organizationId: string
): Promise<boolean> {
  try {
    // Implementation would validate against api_keys table
    // This is a placeholder for future API key functionality
    const { data, error } = await supabase
      .from('api_keys')
      .select('id, is_active')
      .eq('key_hash', apiKey) // Store hashed keys
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .single();

    return !error && !!data;
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

/**
 * Log authentication events for audit purposes
 * @param event - Event type
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param details - Additional event details
 */
export async function logAuthEvent(
  event: 'login' | 'logout' | 'token_refresh' | 'permission_denied' | 'invalid_token',
  userId: string,
  organizationId: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    // Log to audit table (implementation depends on audit table structure)
    await supabase
      .from('audit_logs')
      .insert({
        event_type: event,
        user_id: userId,
        organization_id: organizationId,
        event_data: details,
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log auth event:', error);
    // Don't throw - logging failures shouldn't break auth flow
  }
}

/**
 * Test utility: Create mock authentication result
 * @param userId - User ID
 * @param organizationId - Organization ID
 * @param userRole - User role
 * @returns Mock authentication result
 */
export function createMockAuthResult(
  userId: string,
  organizationId: string,
  userRole: string = 'rep'
): AuthValidationResult {
  const mockUser: User = {
    id: userId,
    email: `test-${userId}@example.com`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated'
  } as User;

  const mockSession: Session = {
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser
  };

  return {
    user: mockUser,
    session: mockSession,
    supabaseClient: supabase,
    isValid: true,
    organizationId,
    userRole
  };
}