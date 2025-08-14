'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔄 Processing auth callback...')
        
        // Handle the auth callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Auth callback error:', error.message)
          router.push('/login?error=auth_callback_failed')
          return
        }
        
        if (data.session) {
          console.log('✅ Auth callback successful, user authenticated')
          router.push('/')
        } else {
          console.log('ℹ️ No session found in callback')
          router.push('/login')
        }
      } catch (err) {
        console.error('💥 Unexpected auth callback error:', err)
        router.push('/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Completando autenticación...</p>
      </div>
    </div>
  )
}