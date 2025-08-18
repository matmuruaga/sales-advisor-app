import { NextRequest, NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google-auth';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  
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

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'No authenticated user' }, { status: 401 });
  }

  const state = Buffer.from(JSON.stringify({ 
    userId: user.id,
    returnUrl: request.nextUrl.searchParams.get('returnUrl') || '/'
  })).toString('base64');

  const authUrl = getAuthUrl(state);
  
  return NextResponse.json({ authUrl });
}