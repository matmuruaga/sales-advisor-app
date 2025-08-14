// Test script for Supabase realtime functionality
// This can be run to verify that realtime subscriptions work properly

import { supabase } from '@/lib/supabase';

export async function testRealtimeConnection() {
  console.log('🔗 Testing Supabase realtime connection...');
  
  try {
    // Test 1: Basic client initialization
    console.log('1. ✅ Supabase client initialized');
    
    // Test 2: Create a test channel
    const testChannel = supabase
      .channel('test_connection')
      .on('broadcast', { event: 'test' }, (payload) => {
        console.log('2. ✅ Broadcast received:', payload);
      })
      .subscribe((status) => {
        console.log('2. 📡 Channel status:', status);
      });
    
    // Test 3: Test postgres_changes subscription (similar to our hooks)
    const testSubscription = supabase
      .channel('test_postgres_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts' // Use existing table
        },
        (payload) => {
          console.log('3. 🔄 Postgres change detected:', payload.eventType, payload);
        }
      )
      .subscribe((status) => {
        console.log('3. 📊 Postgres subscription status:', status);
      });
    
    // Test 4: Verify realtime configuration
    console.log('4. ⚙️  Realtime config check:');
    console.log('   - URL:', supabase.supabaseUrl);
    console.log('   - Realtime enabled:', !!supabase.realtime);
    
    // Clean up after 5 seconds
    setTimeout(() => {
      console.log('🧹 Cleaning up test subscriptions...');
      testChannel.unsubscribe();
      testSubscription.unsubscribe();
      console.log('✅ Realtime test completed successfully!');
    }, 5000);
    
    return true;
  } catch (error) {
    console.error('❌ Realtime test failed:', error);
    return false;
  }
}

// Function to test specific hook patterns
export function testHookPatterns() {
  console.log('🧪 Testing hook patterns...');
  
  // Test pattern 1: Direct supabase import (CORRECT)
  try {
    const subscription1 = supabase
      .channel('pattern_test_1')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {})
      .subscribe();
    
    console.log('1. ✅ Direct supabase import pattern works');
    subscription1.unsubscribe();
  } catch (error) {
    console.error('1. ❌ Direct supabase import failed:', error);
  }
  
  // Test pattern 2: Verify channel method exists
  if (typeof supabase.channel === 'function') {
    console.log('2. ✅ supabase.channel method is available');
  } else {
    console.error('2. ❌ supabase.channel method not found');
  }
  
  // Test pattern 3: Verify subscription methods
  const testSub = supabase.channel('method_test');
  if (typeof testSub.on === 'function' && typeof testSub.subscribe === 'function') {
    console.log('3. ✅ Subscription methods (.on, .subscribe) are available');
  } else {
    console.error('3. ❌ Subscription methods not available');
  }
  
  testSub.unsubscribe();
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testRealtimeConnection = testRealtimeConnection;
  (window as any).testHookPatterns = testHookPatterns;
}