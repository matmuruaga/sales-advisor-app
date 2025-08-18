import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '@/lib/google-auth';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/?error=google_auth_denied', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_auth_code', request.url));
  }

  try {
    console.log('OAuth callback received - code:', code ? 'present' : 'missing', 'state:', state ? 'present' : 'missing');
    
    const tokens = await getTokens(code);
    console.log('Tokens received:', { 
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiryDate: tokens.expiry_date,
      scope: tokens.scope
    });
    
    let userId = null;
    let returnUrl = '/';
    
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
        userId = stateData.userId;
        returnUrl = stateData.returnUrl || '/';
        console.log('State parsed - userId:', userId, 'returnUrl:', returnUrl);
      } catch (e) {
        console.error('Error parsing state:', e);
      }
    }

    if (!userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get: async (name: string) => {
              const cookieStore = await cookies();
              const cookie = cookieStore.get(name);
              return cookie?.value;
            },
          },
        }
      );
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.redirect(new URL('/?error=no_user', request.url));
    }

    // Create a client for database operations (using anon key with updated RLS policies)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Use the secure function to bypass RLS while maintaining security
    console.log('Attempting to save tokens for user:', userId);
    const { error: upsertError } = await supabase.rpc('upsert_google_calendar_tokens', {
      p_user_id: userId,
      p_access_token: tokens.access_token,
      p_refresh_token: tokens.refresh_token,
      p_expiry_date: tokens.expiry_date,
      p_scope: tokens.scope,
      p_token_type: tokens.token_type
    });

    if (upsertError) {
      console.error('Error saving tokens:', upsertError);
      return NextResponse.redirect(new URL('/?error=token_save_failed', request.url));
    }

    console.log('Tokens saved successfully, redirecting to:', returnUrl);
    return NextResponse.redirect(new URL(returnUrl + '?google_connected=true', request.url));
  } catch (error) {
    console.error('Error getting tokens:', error);
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
  }
}