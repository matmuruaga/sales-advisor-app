import { supabase } from '../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint para probar el login del usuario admin
 * GET /api/test-login?email=email&password=password
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'matias@elevaitelabs.io';
  const password = searchParams.get('password') || 'Matias123';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.status,
        email
      }, { status: 400 });
    }

    // Cerrar sesión inmediatamente
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      userId: data.user?.id,
      email: data.user?.email
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      email
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email = 'matias@elevaitelabs.io', password = 'Matias123' } = body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.status,
        email
      }, { status: 400 });
    }

    // Cerrar sesión inmediatamente
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      userId: data.user?.id,
      email: data.user?.email
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      email
    }, { status: 500 });
  }
}