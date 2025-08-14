import { supabase } from './supabase'

export async function testLogin() {
  try {
    console.log('🧪 Testing login with matias@elevaitelabs.io...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'matias@elevaitelabs.io',
      password: 'Matias123'
    })

    if (error) {
      console.error('❌ Login failed:', error)
      return { success: false, error }
    }

    console.log('✅ Login successful:', data.user?.email)
    
    // Test data access with RLS
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .single()

    if (userError) {
      console.error('❌ User data access failed:', userError)
      return { success: false, error: userError }
    }

    console.log('✅ User data access successful:', userData.full_name)

    // Test contacts access
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('id, full_name, email')
      .limit(5)

    if (contactsError) {
      console.error('❌ Contacts access failed:', contactsError)
    } else {
      console.log('✅ Contacts access successful:', contacts.length, 'contacts found')
    }

    return { success: true, user: data.user, userData, contacts }
  } catch (err) {
    console.error('💥 Test failed:', err)
    return { success: false, error: err }
  }
}

export async function testLogout() {
  try {
    console.log('🧪 Testing logout...')
    
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('❌ Logout failed:', error)
      return { success: false, error }
    }

    console.log('✅ Logout successful')
    return { success: true }
  } catch (err) {
    console.error('💥 Logout test failed:', err)
    return { success: false, error: err }
  }
}