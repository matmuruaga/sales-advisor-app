import { NextRequest, NextResponse } from 'next/server';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { 
  createAuthenticatedClient, 
  validateSupabaseSession, 
  handleAuthError,
  AuthValidationResult,
  PermissionLevel,
  validateUserPermission,
  logAuthEvent
} from '../lib/authValidation';
import { 
  getRLSContext, 
  validateOrganizationAccess,
  RLSContext,
  RLSError,
  UnauthorizedError,
  OrganizationNotFoundError,
  shouldBypassRLS
} from '../lib/rlsHelpers';
import { 
  isFeatureEnabled, 
  isMockAuthEnabled,
  FeatureFlag,
  validateFeatureConfig,
  logFeatureUsage
} from '../lib/featureFlags';

/**
 * RLS Validation Middleware
 * 
 * Provides middleware functions for validating authentication, injecting RLS context,
 * and handling RLS violations consistently across the application.
 */

/**
 * Middleware configuration options
 */
export interface RLSMiddlewareConfig {
  requireAuth?: boolean;
  requiredPermission?: PermissionLevel;
  resource?: string;
  bypassRLS?: boolean;
  logAccess?: boolean;
  rateLimitKey?: string;
}

/**
 * RLS middleware result
 */
export interface RLSMiddlewareResult {
  success: boolean;
  context?: RLSContext;
  validation?: AuthValidationResult;
  error?: string;
  statusCode?: number;
}

/**
 * Request with RLS context attached
 */
export interface RLSRequest extends NextRequest {
  rlsContext?: RLSContext;
  authValidation?: AuthValidationResult;
}

/**
 * Main RLS validation middleware function
 * @param request - Next.js request object
 * @param config - Middleware configuration
 * @returns Middleware result with context or error
 */
export async function validateRLSMiddleware(
  request: NextRequest,
  config: RLSMiddlewareConfig = {}
): Promise<RLSMiddlewareResult> {
  const {
    requireAuth = true,
    requiredPermission,
    resource,
    bypassRLS = false,
    logAccess = true,
    rateLimitKey
  } = config;

  try {
    // Validate feature flag configuration
    const configIssues = validateFeatureConfig();
    if (configIssues.length > 0) {
      console.warn('Feature flag configuration issues detected:', configIssues);
      logFeatureUsage('validateRLSMiddleware', false, { 
        configIssues, 
        endpoint: request.nextUrl.pathname 
      });
    }

    // Check if RLS is globally disabled
    const rlsEnabled = isFeatureEnabled(FeatureFlag.RLS_ENABLED);
    if (!rlsEnabled && !bypassRLS) {
      logFeatureUsage('validateRLSMiddleware', false, { 
        reason: 'RLS_GLOBALLY_DISABLED',
        endpoint: request.nextUrl.pathname 
      });
      
      // Allow request without RLS validation when RLS is disabled
      return { success: true };
    }

    // Skip authentication if not required
    if (!requireAuth) {
      return { success: true };
    }

    // If mock auth is enabled, create mock context
    if (isMockAuthEnabled() && !requireAuth) {
      logFeatureUsage('validateRLSMiddleware', true, { 
        mockAuth: true,
        endpoint: request.nextUrl.pathname 
      });
      
      return { 
        success: true,
        context: {
          userId: 'cc99e9f4-f68a-45f8-9d59-282cca1d0f94',
          organizationId: '47fba630-b113-4fe9-b68f-947d79c09fb2',
          userRole: 'admin',
          supabaseClient: {} as SupabaseClient,
          isMockContext: true
        }
      };
    }

    // Rate limiting check
    if (rateLimitKey) {
      const rateLimitResult = await checkRateLimit(request, rateLimitKey);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: 'Rate limit exceeded',
          statusCode: 429
        };
      }
    }

    // Create authenticated client and validate session
    const { supabaseClient, validation, token } = await createAuthenticatedClient(request);

    if (!validation.isValid) {
      return {
        success: false,
        error: 'Invalid authentication',
        statusCode: 401
      };
    }

    // Get full RLS context
    const context = await getRLSContext(supabaseClient, validation.user.id);

    // Validate permissions if required
    if (requiredPermission && resource) {
      const hasPermission = validateUserPermission(
        context.userRole,
        resource,
        requiredPermission
      );

      if (!hasPermission) {
        // Log permission denied event
        if (logAccess) {
          await logAuthEvent(
            'permission_denied',
            context.userId,
            context.organizationId,
            {
              resource,
              requiredPermission,
              userRole: context.userRole,
              endpoint: request.nextUrl.pathname
            }
          );
        }

        return {
          success: false,
          error: `Insufficient permissions for ${resource}`,
          statusCode: 403
        };
      }
    }

    // Log successful access
    if (logAccess) {
      await logAuthEvent(
        'login',
        context.userId,
        context.organizationId,
        {
          endpoint: request.nextUrl.pathname,
          method: request.method,
          resource,
          userAgent: request.headers.get('user-agent')
        }
      );
    }

    return {
      success: true,
      context,
      validation
    };

  } catch (error) {
    console.error('RLS middleware error:', error);
    
    const authError = handleAuthError(error, 'RLS middleware');
    
    return {
      success: false,
      error: authError.error,
      statusCode: authError.statusCode
    };
  }
}

/**
 * Inject organization ID into query context
 * @param request - Request object
 * @param context - RLS context
 * @returns Enhanced request with organization context
 */
export function injectOrganizationContext(
  request: NextRequest,
  context: RLSContext
): RLSRequest {
  const enhancedRequest = request as RLSRequest;
  enhancedRequest.rlsContext = context;
  
  // Add organization context to headers for downstream services
  const headers = new Headers(request.headers);
  headers.set('X-Organization-ID', context.organizationId);
  headers.set('X-User-ID', context.userId);
  headers.set('X-User-Role', context.userRole);

  return enhancedRequest;
}

/**
 * Handle RLS violations uniformly
 * @param error - RLS error object
 * @param request - Request object for context
 * @param organizationId - Organization ID for logging
 * @returns Standardized error response
 */
export async function handleRLSViolation(
  error: any,
  request: NextRequest,
  organizationId?: string
): Promise<NextResponse> {
  console.error('RLS violation detected:', {
    error: error.message,
    endpoint: request.nextUrl.pathname,
    method: request.method,
    organizationId,
    timestamp: new Date().toISOString()
  });

  // Log RLS violation for security monitoring
  if (organizationId) {
    try {
      await logSecurityEvent('rls_violation', {
        endpoint: request.nextUrl.pathname,
        method: request.method,
        error: error.message,
        organizationId,
        ip: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
    } catch (logError) {
      console.error('Failed to log RLS violation:', logError);
    }
  }

  if (error instanceof UnauthorizedError) {
    return NextResponse.json(
      { 
        error: 'Unauthorized access',
        code: 'UNAUTHORIZED',
        details: 'Authentication required' 
      },
      { status: 401 }
    );
  }

  if (error instanceof OrganizationNotFoundError) {
    return NextResponse.json(
      { 
        error: 'Organization access denied',
        code: 'ORGANIZATION_NOT_FOUND',
        details: 'User does not belong to the requested organization' 
      },
      { status: 404 }
    );
  }

  if (error instanceof RLSError) {
    return NextResponse.json(
      { 
        error: 'Access forbidden',
        code: error.code,
        details: 'Insufficient permissions for this resource' 
      },
      { status: 403 }
    );
  }

  // Generic error
  return NextResponse.json(
    { 
      error: 'Access denied',
      code: 'ACCESS_DENIED',
      details: 'Unable to process request' 
    },
    { status: 403 }
  );
}

/**
 * Create Supabase client with service role for RLS bypass (admin operations)
 * @param organizationId - Organization ID for context
 * @returns Service role Supabase client
 */
export function createServiceRoleClient(organizationId?: string): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Service role key not configured');
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      global: {
        headers: organizationId ? {
          'X-Organization-ID': organizationId
        } : {}
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  return client;
}

/**
 * Validate resource ownership within organization context
 * @param context - RLS context
 * @param table - Table name
 * @param resourceId - Resource ID to validate
 * @returns True if resource belongs to user's organization
 */
export async function validateResourceOwnership(
  context: RLSContext,
  table: string,
  resourceId: string
): Promise<boolean> {
  return await validateOrganizationAccess(
    context.supabaseClient,
    table,
    resourceId,
    context.organizationId
  );
}

/**
 * Log access attempts and violations for security monitoring
 * @param eventType - Type of security event
 * @param details - Event details
 */
export async function logSecurityEvent(
  eventType: 'rls_violation' | 'unauthorized_access' | 'permission_denied' | 'rate_limit_exceeded',
  details: Record<string, any>
): Promise<void> {
  try {
    // Log to security monitoring system
    const serviceClient = createServiceRoleClient();
    
    await serviceClient
      .from('security_events')
      .insert({
        event_type: eventType,
        event_data: details,
        severity: getSeverityLevel(eventType),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Failed to log security event:', error);
    // Don't throw - logging failures shouldn't break the flow
  }
}

/**
 * Get severity level for security events
 * @param eventType - Type of security event
 * @returns Severity level
 */
function getSeverityLevel(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
  switch (eventType) {
    case 'rls_violation':
      return 'high';
    case 'unauthorized_access':
      return 'high';
    case 'permission_denied':
      return 'medium';
    case 'rate_limit_exceeded':
      return 'low';
    default:
      return 'medium';
  }
}

/**
 * Rate limiting implementation
 * @param request - Request object
 * @param key - Rate limit key
 * @returns Rate limit result
 */
async function checkRateLimit(
  request: NextRequest,
  key: string
): Promise<{ allowed: boolean; resetTime?: number }> {
  try {
    // Simple in-memory rate limiting (replace with Redis in production)
    const identifier = getClientIdentifier(request);
    const rateLimitKey = `${key}:${identifier}`;
    
    // This is a placeholder - implement proper rate limiting with Redis
    // For now, always allow
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return { allowed: true }; // Fail open
  }
}

/**
 * Get client identifier for rate limiting
 * @param request - Request object
 * @returns Client identifier
 */
function getClientIdentifier(request: NextRequest): string {
  // Use IP address or authenticated user ID
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT (simplified)
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      return `user:${payload.sub}`;
    } catch {
      // Fall back to IP
    }
  }
  
  return `ip:${request.ip || 'unknown'}`;
}

/**
 * Middleware factory for easy endpoint protection
 * @param config - Middleware configuration
 * @returns Middleware function
 */
export function createRLSMiddleware(config: RLSMiddlewareConfig = {}) {
  return async function middleware(request: NextRequest) {
    const result = await validateRLSMiddleware(request, config);
    
    if (!result.success) {
      if (result.statusCode === 429) {
        return NextResponse.json(
          { 
            error: result.error,
            code: 'RATE_LIMIT_EXCEEDED' 
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: result.error,
          code: 'ACCESS_DENIED' 
        },
        { status: result.statusCode || 403 }
      );
    }

    // Attach context to request for downstream handlers
    if (result.context) {
      const enhancedRequest = injectOrganizationContext(request, result.context);
      return NextResponse.next({
        request: enhancedRequest
      });
    }

    return NextResponse.next();
  };
}

/**
 * Helper to extract RLS context from enhanced request
 * @param request - Enhanced request with RLS context
 * @returns RLS context or throws error
 */
export function extractRLSContext(request: RLSRequest): RLSContext {
  if (!request.rlsContext) {
    throw new UnauthorizedError('No RLS context found in request');
  }
  return request.rlsContext;
}

/**
 * Helper to create consistent API error responses
 * @param error - Error message
 * @param code - Error code
 * @param statusCode - HTTP status code
 * @param details - Additional error details
 * @returns Next.js response
 */
export function createErrorResponse(
  error: string,
  code: string,
  statusCode: number,
  details?: any
): NextResponse {
  return NextResponse.json(
    {
      error,
      code,
      details,
      timestamp: new Date().toISOString()
    },
    { status: statusCode }
  );
}

/**
 * Test utility: Create mock RLS request
 * @param originalRequest - Original request
 * @param context - RLS context to attach
 * @returns Mock RLS request
 */
export function createMockRLSRequest(
  originalRequest: NextRequest,
  context: RLSContext
): RLSRequest {
  const request = originalRequest as RLSRequest;
  request.rlsContext = context;
  return request;
}