const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  try {
    console.log('Creating admin user for ElevaiteLabs...');
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'matias@elevaitelabs.io',
      password: 'Matias123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Matias Rodriguez',
        role: 'admin'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      return;
    }

    console.log('Auth user created successfully:', authData.user.id);

    // Create or update user in public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        organization_id: '47fba630-b113-4fe9-b68f-947d79c09fb2', // ElevaiteLabs
        email: 'matias@elevaitelabs.io',
        full_name: 'Matias Rodriguez',
        role: 'admin',
        territory: 'Global',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select();

    if (userError) {
      console.error('Error creating user record:', userError);
      return;
    }

    console.log('User record created successfully:', userData);

    // Verify we can sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'matias@elevaitelabs.io',
      password: 'Matias123'
    });

    if (signInError) {
      console.error('Error testing sign in:', signInError);
    } else {
      console.log('Sign in test successful!');
      console.log('User can now login with:');
      console.log('Email: matias@elevaitelabs.io');
      console.log('Password: Matias123');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createAdminUser();