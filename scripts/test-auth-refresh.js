#!/usr/bin/env node

/**
 * Script to test Supabase auth token refresh mechanism
 * Run with: node scripts/test-auth-refresh.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create Supabase client with auto-refresh enabled
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    // Set a very short auto-refresh buffer for testing (10 seconds before expiry)
    autoRefreshBuffer: 10
  }
});

async function testAuthRefresh() {
  console.log('🧪 Testing Supabase Auth Token Refresh...\n');
  
  try {
    // 1. Sign in with test credentials
    console.log('1️⃣ Signing in...');
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'matias@elevaitelabs.io',
      password: 'test123' // You'll need to use your actual password
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
      return;
    }
    
    console.log('✅ Signed in successfully');
    console.log('   User:', authData.user?.email);
    console.log('   Session expires at:', new Date(authData.session.expires_at * 1000).toISOString());
    console.log('   Expires in:', authData.session.expires_in, 'seconds\n');
    
    // 2. Set up auth state change listener
    console.log('2️⃣ Setting up auth state change listener...\n');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`🔔 Auth Event: ${event}`);
      if (session) {
        console.log('   New expiry:', new Date(session.expires_at * 1000).toISOString());
        console.log('   Time until expiry:', Math.round((session.expires_at * 1000 - Date.now()) / 1000), 'seconds');
      }
      console.log('');
    });
    
    // 3. Test manual refresh
    console.log('3️⃣ Testing manual token refresh...');
    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('❌ Manual refresh failed:', refreshError.message);
    } else {
      console.log('✅ Manual refresh successful');
      console.log('   New expiry:', new Date(refreshData.session.expires_at * 1000).toISOString());
      console.log('   Expires in:', refreshData.session.expires_in, 'seconds\n');
    }
    
    // 4. Test session retrieval
    console.log('4️⃣ Testing session retrieval...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Failed to get session:', sessionError.message);
    } else if (session) {
      console.log('✅ Session retrieved successfully');
      console.log('   Valid until:', new Date(session.expires_at * 1000).toISOString());
      console.log('   Time remaining:', Math.round((session.expires_at * 1000 - Date.now()) / 1000), 'seconds\n');
    }
    
    // 5. Test API call with auth
    console.log('5️⃣ Testing authenticated API call...');
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('id, full_name')
      .limit(1);
    
    if (contactsError) {
      console.error('❌ API call failed:', contactsError.message);
    } else {
      console.log('✅ API call successful');
      console.log('   Retrieved', contactsData.length, 'contact(s)\n');
    }
    
    // 6. Monitor for auto-refresh (for 2 minutes)
    console.log('6️⃣ Monitoring for auto-refresh events (2 minutes)...');
    console.log('   The token should auto-refresh when it gets close to expiry.');
    console.log('   Press Ctrl+C to stop monitoring.\n');
    
    // Keep the script running to monitor auth events
    let checkCount = 0;
    const intervalId = setInterval(async () => {
      checkCount++;
      console.log(`⏱️ Check #${checkCount} (${new Date().toLocaleTimeString()})`);
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession) {
        const timeRemaining = Math.round((currentSession.expires_at * 1000 - Date.now()) / 1000);
        console.log(`   Token expires in: ${timeRemaining} seconds (${Math.round(timeRemaining / 60)} minutes)`);
        
        if (timeRemaining < 60) {
          console.log('   ⚠️ Token expiring soon, auto-refresh should trigger...');
        }
      }
      console.log('');
      
      // Stop after 2 minutes
      if (checkCount >= 24) {
        console.log('✅ Test completed. No issues detected!');
        clearInterval(intervalId);
        subscription.unsubscribe();
        process.exit(0);
      }
    }, 5000); // Check every 5 seconds
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  }
}

// Run the test
testAuthRefresh().catch(console.error);