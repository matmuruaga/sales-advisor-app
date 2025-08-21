import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Middleware helper to ensure authenticated Supabase client with auto-refresh
 * This handles token refresh automatically for API routes
 */
export async function withAuthRefresh(
  request: NextRequest,
  handler: (supabase: any, user: any) => Promise<NextResponse>
) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ No authorization header found');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Create a new Supabase client with the user's token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: false, // Don't persist in API routes
      }
    }
  );

  try {
    // First try to get the session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log('⚠️ Session invalid, attempting to refresh...');
      
      // Try to refresh the session
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !newSession) {
        console.error('❌ Failed to refresh session in API route:', refreshError);
        return NextResponse.json({ error: 'Session expired' }, { status: 401 });
      }
      
      console.log('✅ Session refreshed successfully in API route');
      
      // Create response with new token in header
      const response = await handler(supabase, newSession.user);
      response.headers.set('X-New-Access-Token', newSession.access_token);
      response.headers.set('X-New-Refresh-Token', newSession.refresh_token || '');
      return response;
    }

    // Check if token is about to expire (within 5 minutes)
    const expiresAt = session.expires_at;
    if (expiresAt) {
      const expiresIn = expiresAt * 1000 - Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (expiresIn < fiveMinutes) {
        console.log('🔄 Token expiring soon, proactively refreshing...');
        const { data: { session: newSession } } = await supabase.auth.refreshSession();
        
        if (newSession) {
          const response = await handler(supabase, newSession.user);
          response.headers.set('X-New-Access-Token', newSession.access_token);
          response.headers.set('X-New-Refresh-Token', newSession.refresh_token || '');
          return response;
        }
      }
    }

    // Session is valid, proceed with the handler
    return await handler(supabase, session.user);
    
  } catch (error) {
    console.error('💥 Error in auth middleware:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Helper to extract organization ID from authenticated user
 */
export async function getOrganizationId(supabase: any, userId: string): Promise<string | null> {
  const { data: userData, error } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', userId)
    .single();
    
  if (error || !userData) {
    console.error('Failed to get organization ID:', error);
    return null;
  }
  
  return userData.organization_id;
}