/**
 * RLS-Ready User Query Helpers
 * 
 * CRITICAL: All queries in this file are designed to work with RLS enabled.
 * Each query includes proper organization_id filtering or uses auth context appropriately.
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  organization_id: string;
  territory?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Get current user profile with organization context
 * Uses auth.getUser() first, then queries users table with proper RLS filtering
 */
export async function getCurrentUserProfile(supabase: SupabaseClient): Promise<UserProfile | null> {
  try {
    // First get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed in getCurrentUserProfile:', authError?.message);
      return null;
    }

    // Query users table - this will work with RLS because we're querying by auth user ID
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Error loading user profile:', profileError.message);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('💥 Unexpected error in getCurrentUserProfile:', error);
    return null;
  }
}

/**
 * Get team members within the same organization
 * Requires organizationId parameter to ensure proper RLS filtering
 */
export async function getTeamMembers(supabase: SupabaseClient, organizationId: string): Promise<UserProfile[]> {
  try {
    const { data: teamMembers, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .in('role', ['rep', 'bdr', 'manager', 'admin']);

    if (error) {
      console.error('❌ Error loading team members:', error.message);
      return [];
    }

    return teamMembers || [];
  } catch (error) {
    console.error('💥 Unexpected error in getTeamMembers:', error);
    return [];
  }
}

/**
 * Get user by email within organization context
 * CRITICAL: Always requires organizationId to prevent cross-org access
 */
export async function getUserByEmailInOrganization(
  supabase: SupabaseClient, 
  email: string, 
  organizationId: string
): Promise<UserProfile | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned - user not found in this organization
        return null;
      }
      console.error('❌ Error finding user by email:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('💥 Unexpected error in getUserByEmailInOrganization:', error);
    return null;
  }
}

/**
 * Get user by ID within organization context
 * Used when we need to validate a user belongs to a specific organization
 */
export async function getUserByIdInOrganization(
  supabase: SupabaseClient, 
  userId: string, 
  organizationId: string
): Promise<UserProfile | null> {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .eq('organization_id', organizationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('❌ Error finding user by ID in organization:', error.message);
      return null;
    }

    return user;
  } catch (error) {
    console.error('💥 Unexpected error in getUserByIdInOrganization:', error);
    return null;
  }
}

/**
 * Get organization ID for the current authenticated user
 * This is often needed to perform subsequent organization-scoped queries
 */
export async function getCurrentUserOrganizationId(supabase: SupabaseClient): Promise<string | null> {
  try {
    const profile = await getCurrentUserProfile(supabase);
    return profile?.organization_id || null;
  } catch (error) {
    console.error('💥 Error getting user organization ID:', error);
    return null;
  }
}

/**
 * Check if current user has specific role
 * Uses current user profile to avoid additional queries
 */
export async function currentUserHasRole(supabase: SupabaseClient, role: string | string[]): Promise<boolean> {
  try {
    const profile = await getCurrentUserProfile(supabase);
    if (!profile) return false;

    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(profile.role);
  } catch (error) {
    console.error('💥 Error checking user role:', error);
    return false;
  }
}

/**
 * Get sales reps within organization
 * Specific helper for common use case
 */
export async function getSalesReps(supabase: SupabaseClient, organizationId: string): Promise<UserProfile[]> {
  try {
    const { data: reps, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .in('role', ['rep', 'bdr'])
      .order('full_name');

    if (error) {
      console.error('❌ Error loading sales reps:', error.message);
      return [];
    }

    return reps || [];
  } catch (error) {
    console.error('💥 Unexpected error in getSalesReps:', error);
    return [];
  }
}

/**
 * Authentication helper that returns both user and organization context
 * Used in API routes to get complete auth context in one call
 */
export async function getAuthContext(supabase: SupabaseClient) {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication failed');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id, role, full_name')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User organization not found');
    }

    return {
      user,
      organizationId: userData.organization_id,
      role: userData.role,
      fullName: userData.full_name
    };
  } catch (error) {
    throw new Error(`Auth context error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * SPECIAL CASE HANDLERS
 * These may need to be converted to RPC functions when RLS is enabled
 */

/**
 * Count users in organization (for admin purposes)
 * This query should work with RLS as it's scoped to organization
 */
export async function getUserCountInOrganization(supabase: SupabaseClient, organizationId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (error) {
      console.error('❌ Error counting users:', error.message);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('💥 Error counting users in organization:', error);
    return 0;
  }
}

/**
 * TODO: Functions that may need RPC implementation with RLS:
 * 
 * 1. Global user search (admin only)
 * 2. Cross-organization user lookup (system features)
 * 3. User migration/transfer operations
 * 4. System-wide user statistics
 * 
 * These should be implemented as secure RPC functions that validate
 * permissions at the database level.
 */