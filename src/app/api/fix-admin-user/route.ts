import { supabase } from '../../../lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint para recrear el usuario admin
 * POST /api/fix-admin-user
 */
export async function POST(request: NextRequest) {
  try {
    // Datos del usuario admin
    const email = 'matias@elevaitelabs.io';
    const password = 'Matias123';
    const userData = {
      full_name: 'Matias Rodriguez',
      role: 'admin'
    };

    // Paso 1: Verificar si el usuario ya existe y puede hacer login
    const { data: existingLogin, error: testError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (!testError && existingLogin.user) {
      await supabase.auth.signOut();
      return NextResponse.json({
        success: true,
        message: 'El usuario ya existe y puede hacer login correctamente',
        userId: existingLogin.user.id
      });
    }

    // Paso 2: Crear el usuario
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (signUpError) {
      throw new Error(`Error en signUp: ${signUpError.message}`);
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // Paso 3: Probar el login inmediatamente
    await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar un poco

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      return NextResponse.json({
        success: true,
        message: 'Usuario creado, pero necesita confirmación de email. Revisa tu bandeja de entrada.',
        userId: authData.user.id,
        needsConfirmation: true
      });
    }

    // Cerrar sesión para no interferir
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Usuario creado y login verificado exitosamente',
      userId: loginData.user?.id
    });

  } catch (error: any) {
    console.error('Error fixing admin user:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to fix admin user',
    endpoints: {
      createUser: 'POST /api/fix-admin-user',
      testLogin: 'GET /api/test-login'
    }
  });
}