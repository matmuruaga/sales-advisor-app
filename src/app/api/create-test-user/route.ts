import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// This endpoint creates a test user using the client-side approach
export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Try to sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'matias@elevaitelabs.io',
      password: 'Matias123',
      options: {
        data: {
          full_name: 'Matias Rodriguez',
          role: 'admin'
        }
      }
    });

    if (signUpError) {
      // If user already exists, try to update password
      if (signUpError.message.includes('already registered')) {
        return NextResponse.json({ 
          message: 'User already exists. Please use password reset if needed.',
          error: signUpError.message 
        });
      }
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    // Create user record in public.users table
    if (signUpData.user) {
      const { error: insertError } = await supabase
        .from('users')
        .upsert({
          id: signUpData.user.id,
          organization_id: '47fba630-b113-4fe9-b68f-947d79c09fb2',
          email: 'matias@elevaitelabs.io',
          full_name: 'Matias Rodriguez',
          role: 'admin',
          territory: 'Global'
        }, {
          onConflict: 'id'
        });

      if (insertError) {
        console.error('Error creating user record:', insertError);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'User created successfully. Check your email for confirmation link.',
      userId: signUpData.user?.id,
      note: 'If you have email confirmation disabled in Supabase, you can login immediately.'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}