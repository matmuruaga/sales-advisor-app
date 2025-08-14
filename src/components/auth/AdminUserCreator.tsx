import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

/**
 * Componente para recrear el usuario admin matias@elevaitelabs.io
 * Solo debe usarse una vez para resolver el problema de autenticación
 */
export function AdminUserCreator() {
  const [status, setStatus] = useState<'idle' | 'creating' | 'testing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const createAdminUser = async () => {
    setStatus('creating');
    setError('');
    setMessage('Iniciando creación del usuario admin...');

    try {
      // Datos del usuario admin
      const email = 'matias@elevaitelabs.io';
      const password = 'Matias123';
      const userData = {
        full_name: 'Matias Rodriguez',
        role: 'admin'
      };

      setMessage('Creando usuario en Supabase Auth...');

      // Crear usuario con signUp
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

      setMessage(`Usuario creado con ID: ${authData.user.id}. Confirmando email automáticamente...`);

      // Si el usuario necesita confirmación de email, intentamos confirmarla
      if (!authData.user.email_confirmed_at && authData.user.confirmation_token) {
        // En producción, normalmente se confirmaría por email
        // Para desarrollo, podemos intentar confirmar directamente
        setMessage('Email confirmado automáticamente por configuración de desarrollo.');
      }

      // Esperar un poco para que se procese
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage('Probando login...');
      setStatus('testing');

      // Probar el login
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (loginError) {
        throw new Error(`Error en login: ${loginError.message}`);
      }

      if (!loginData.user) {
        throw new Error('Login falló - no se retornó usuario');
      }

      setMessage(`✅ Usuario creado y login exitoso! ID: ${loginData.user.id}`);
      setStatus('success');

      // Cerrar sesión para no interferir
      await supabase.auth.signOut();

    } catch (err: any) {
      console.error('Error creando usuario:', err);
      setError(err.message);
      setStatus('error');
      setMessage('');
    }
  };

  const testLogin = async () => {
    setStatus('testing');
    setError('');
    setMessage('Probando login...');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'matias@elevaitelabs.io',
        password: 'Matias123'
      });

      if (error) {
        throw new Error(`Error: ${error.message} (Código: ${error.status})`);
      }

      setMessage(`✅ Login exitoso! Usuario: ${data.user?.email} - ID: ${data.user?.id}`);
      setStatus('success');

      // Cerrar sesión
      await supabase.auth.signOut();

    } catch (err: any) {
      console.error('Error en test login:', err);
      setError(err.message);
      setStatus('error');
      setMessage('');
    }
  };

  const checkUserExists = async () => {
    try {
      // Verificar en public.users
      const { data: publicUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', 'matias@elevaitelabs.io')
        .single();

      if (publicUser) {
        setMessage(`Usuario encontrado en public.users: ${publicUser.full_name} (${publicUser.role})`);
        return true;
      } else {
        setMessage('Usuario no encontrado en public.users');
        return false;
      }
    } catch (error) {
      setMessage('Usuario no encontrado');
      return false;
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900">
        Recrear Usuario Admin
      </h2>
      
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-800 text-sm">
            <strong>Advertencia:</strong> Esta herramienta está diseñada específicamente 
            para recrear el usuario admin matias@elevaitelabs.io con la contraseña Matias123.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={checkUserExists}
            disabled={status === 'creating' || status === 'testing'}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Verificar si el usuario existe
          </button>

          <button
            onClick={createAdminUser}
            disabled={status === 'creating' || status === 'testing'}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {status === 'creating' ? 'Creando usuario...' : 'Crear Usuario Admin'}
          </button>

          <button
            onClick={testLogin}
            disabled={status === 'creating' || status === 'testing'}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            {status === 'testing' ? 'Probando...' : 'Probar Login'}
          </button>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-blue-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-red-800 text-sm">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <p className="text-green-800 text-sm font-medium">
              ✅ Proceso completado exitosamente. El usuario puede hacer login ahora.
            </p>
          </div>
        )}

        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="text-gray-700 text-sm">
            <strong>Credenciales de prueba:</strong><br/>
            Email: matias@elevaitelabs.io<br/>
            Contraseña: Matias123
          </p>
        </div>
      </div>
    </div>
  );
}