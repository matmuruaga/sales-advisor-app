import { supabase } from './supabase';

/**
 * Script de depuración y resolución de problemas de autenticación
 * Para resolver el problema de login de matias@elevaitelabs.io
 */

export const authDebugUtils = {
  /**
   * Solución 1: Eliminar y recrear el usuario completamente
   */
  async recreateUser(email: string, password: string, userData: { full_name: string; role: string }) {
    try {
      console.log('🔍 Iniciando proceso de recreación de usuario...');
      
      // Paso 1: Verificar usuario actual
      const { data: currentUser } = await supabase.auth.admin.listUsers();
      const existingUser = currentUser.users?.find(u => u.email === email);
      
      if (existingUser) {
        console.log('👤 Usuario encontrado, eliminando:', existingUser.id);
        
        // Eliminar de auth.users (esto también debería eliminar de public.users por el trigger)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
        
        if (deleteError) {
          console.error('❌ Error eliminando usuario:', deleteError);
          throw deleteError;
        }
        
        console.log('✅ Usuario eliminado correctamente');
        
        // Esperar un momento para asegurar que la eliminación se complete
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Paso 2: Crear nuevo usuario con signup estándar
      console.log('📝 Creando nuevo usuario...');
      
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: undefined // No redirigir, confirmar automáticamente si es posible
        }
      });
      
      if (signUpError) {
        console.error('❌ Error en signup:', signUpError);
        throw signUpError;
      }
      
      console.log('✅ Usuario creado:', newUser.user?.id);
      
      return {
        success: true,
        user: newUser.user,
        message: 'Usuario recreado exitosamente'
      };
      
    } catch (error) {
      console.error('❌ Error en recreateUser:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al recrear usuario'
      };
    }
  },

  /**
   * Solución 2: Intentar reset de contraseña
   */
  async resetPassword(email: string) {
    try {
      console.log('🔐 Iniciando reset de contraseña para:', email);
      
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });
      
      if (error) {
        console.error('❌ Error en reset:', error);
        throw error;
      }
      
      console.log('✅ Email de reset enviado');
      return {
        success: true,
        message: 'Email de reset enviado correctamente'
      };
      
    } catch (error) {
      console.error('❌ Error en resetPassword:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error al enviar reset'
      };
    }
  },

  /**
   * Método de prueba para verificar login
   */
  async testLogin(email: string, password: string) {
    try {
      console.log('🧪 Probando login para:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Error en login:', error);
        return {
          success: false,
          error: error.message,
          code: error.status,
          message: 'Login fallido'
        };
      }
      
      console.log('✅ Login exitoso:', data.user?.id);
      return {
        success: true,
        user: data.user,
        session: data.session,
        message: 'Login exitoso'
      };
      
    } catch (error) {
      console.error('❌ Error en testLogin:', error);
      return {
        success: false,
        error: error.message,
        message: 'Error inesperado en login'
      };
    }
  },

  /**
   * Verificar estado actual del usuario
   */
  async checkUserStatus(email: string) {
    try {
      console.log('🔍 Verificando estado del usuario:', email);
      
      // Verificar en auth.users mediante RPC o admin
      const { data: users } = await supabase.auth.admin.listUsers();
      const authUser = users.users?.find(u => u.email === email);
      
      // Verificar en public.users
      const { data: publicUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      return {
        authUser,
        publicUser,
        exists: !!authUser,
        emailConfirmed: !!authUser?.email_confirmed_at,
        lastSignIn: authUser?.last_sign_in_at
      };
      
    } catch (error) {
      console.error('❌ Error verificando estado:', error);
      return null;
    }
  }
};

/**
 * Función principal para resolver el problema de matias@elevaitelabs.io
 */
export async function fixMatiasLogin() {
  const email = 'matias@elevaitelabs.io';
  const password = 'Matias123';
  const userData = {
    full_name: 'Matias Rodriguez',
    role: 'admin'
  };

  console.log('🚀 Iniciando solución para el problema de login de Matias...');
  
  // Paso 1: Verificar estado actual
  const currentStatus = await authDebugUtils.checkUserStatus(email);
  console.log('📊 Estado actual:', currentStatus);
  
  // Paso 2: Intentar login actual
  const loginTest = await authDebugUtils.testLogin(email, password);
  console.log('🧪 Prueba de login:', loginTest);
  
  if (loginTest.success) {
    console.log('✅ El login ya funciona correctamente');
    return loginTest;
  }
  
  // Paso 3: Recrear usuario
  console.log('🔄 Procediendo a recrear el usuario...');
  const recreateResult = await authDebugUtils.recreateUser(email, password, userData);
  
  if (!recreateResult.success) {
    console.error('❌ Falló la recreación, intentando reset de contraseña...');
    return await authDebugUtils.resetPassword(email);
  }
  
  // Paso 4: Verificar que el login funciona
  await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar un poco
  const finalTest = await authDebugUtils.testLogin(email, password);
  
  console.log('🏁 Resultado final:', finalTest);
  return finalTest;
}

// Para uso directo en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).authDebug = authDebugUtils;
  (window as any).fixMatiasLogin = fixMatiasLogin;
}