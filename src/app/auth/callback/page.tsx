'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL for PKCE flow
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const searchParams = new URLSearchParams(window.location.search)
        
        // Check for error in URL params
        const errorParam = searchParams.get('error') || hashParams.get('error')
        const errorDescription = searchParams.get('error_description') || hashParams.get('error_description')
        
        if (errorParam) {
          console.error('Auth callback error:', errorParam, errorDescription)
          setError(errorDescription || errorParam)
          setTimeout(() => {
            router.push(`/login?error=${encodeURIComponent(errorParam)}`)
          }, 2000)
          return
        }

        // Exchange code for session if present
        const code = searchParams.get('code')
        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            console.error('Code exchange error:', exchangeError)
            setError('Failed to complete authentication')
            setTimeout(() => {
              router.push('/login?error=code_exchange_failed')
            }, 2000)
            return
          }
          
          if (data.session) {
            console.log('✅ Session established via code exchange')
            router.push('/')
            return
          }
        }

        // Fallback: Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session check error:', sessionError)
          setError('Authentication verification failed')
          setTimeout(() => {
            router.push('/login?error=session_failed')
          }, 2000)
          return
        }

        if (session) {
          console.log('✅ Existing session found')
          router.push('/')
        } else {
          console.log('ℹ️ No session found, redirecting to login')
          router.push('/login')
        }
      } catch (err) {
        console.error('💥 Unexpected callback error:', err)
        setError('An unexpected error occurred')
        setTimeout(() => {
          router.push('/login?error=unexpected')
        }, 2000)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">{error}</p>
            <p className="mt-2 text-gray-600 text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Completing authentication...</p>
          </>
        )}
      </div>
    </div>
  )
}