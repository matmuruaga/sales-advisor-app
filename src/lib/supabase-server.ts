import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

export async function getServerSession(request?: NextRequest) {
  const cookieStore = await cookies();
  
  // Buscar el token de sesión en las cookies
  const accessToken = cookieStore.get('sb-bscgeritvbwvrlrsipbj-auth-token')?.value;
  
  if (!accessToken) {
    // Intentar obtener el token de otras posibles cookies de Supabase
    const allCookies = cookieStore.getAll();
    const authCookie = allCookies.find(c => c.name.includes('auth-token'));
    
    if (!authCookie) {
      return null;
    }
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: request?.headers.get('authorization') || '',
        },
      },
      auth: {
        persistSession: false,
      },
    }
  );

  // Obtener el usuario desde el token
  const { data: { user }, error } = await supabase.auth.getUser(
    accessToken || request?.headers.get('authorization')?.replace('Bearer ', '')
  );

  if (error || !user) {
    return null;
  }

  return user;
}