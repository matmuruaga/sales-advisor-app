// src/lib/devAuth.ts
// Development authentication helper

export const enableDevAuth = async (supabase: any) => {
  if (process.env.NODE_ENV !== 'development') return;
  
  try {
    // Try to sign in with a development user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'manager@company.com',
      password: 'development123'
    });

    if (error && error.message.includes('Invalid login credentials')) {
      // If user doesn't exist, create a mock session
      console.log('Creating mock session for development');
      return;
    }

    if (error) {
      console.error('Dev auth error:', error);
      return;
    }

    console.log('Dev authentication successful:', data.user?.email);
  } catch (err) {
    console.error('Dev auth error:', err);
  }
};