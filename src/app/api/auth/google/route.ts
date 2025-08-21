import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-auth';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Google Auth endpoint called');
    
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No authorization header found');
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('✅ Authorization token extracted');
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return NextResponse.json({ error: 'Failed to authenticate user', details: userError.message }, { status: 401 });
    }
    
    if (!user) {
      console.error('❌ No authenticated user found');
      return NextResponse.json({ error: 'No authenticated user' }, { status: 401 });
    }

    console.log('✅ User authenticated:', user.email);

    const returnUrl = request.nextUrl.searchParams.get('returnUrl') || '/';
    const state = Buffer.from(JSON.stringify({ 
      userId: user.id,
      returnUrl: returnUrl
    })).toString('base64');

    console.log('📝 Creating auth URL with state:', { userId: user.id, returnUrl });
    
    const authUrl = getAuthUrl(state);
    
    if (!authUrl) {
      console.error('❌ Failed to generate auth URL');
      return NextResponse.json({ error: 'Failed to generate Google auth URL' }, { status: 500 });
    }
    
    console.log('✅ Auth URL generated successfully');
    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('❌ Unexpected error in Google auth endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}