'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Session, User } from '@supabase/supabase-js'

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    try {
      console.log('🔄 Manually refreshing session...')
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
      
      if (refreshError) {
        console.error('❌ Manual refresh failed:', refreshError)
        setError('Failed to refresh session')
        return false
      }
      
      if (newSession) {
        console.log('✅ Session manually refreshed successfully')
        setSession(newSession)
        setUser(newSession.user)
        setError(null)
        return true
      }
      
      return false
    } catch (err) {
      console.error('💥 Error during manual refresh:', err)
      setError(err instanceof Error ? err.message : 'Failed to refresh session')
      return false
    }
  }, [])

  // Function to check session validity
  const checkSession = useCallback(async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('❌ Error checking session:', sessionError)
        setError(sessionError.message)
        setSession(null)
        setUser(null)
        return
      }
      
      if (currentSession) {
        // Check if session is about to expire
        const expiresAt = currentSession.expires_at
        if (expiresAt) {
          const expiresIn = expiresAt * 1000 - Date.now()
          const tenMinutes = 10 * 60 * 1000
          
          if (expiresIn < tenMinutes) {
            console.log('⏰ Session expiring in less than 10 minutes, refreshing proactively...')
            await refreshSession()
            return
          }
        }
        
        setSession(currentSession)
        setUser(currentSession.user)
        setError(null)
      } else {
        setSession(null)
        setUser(null)
      }
    } catch (err) {
      console.error('💥 Error in checkSession:', err)
      setError(err instanceof Error ? err.message : 'Failed to check session')
    } finally {
      setLoading(false)
    }
  }, [refreshSession])

  useEffect(() => {
    // Initial session check
    checkSession()

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log(`🔐 Auth state changed: ${event}`)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(newSession)
        setUser(newSession?.user || null)
        setError(null)
      } else if (event === 'SIGNED_OUT') {
        setSession(null)
        setUser(null)
        setError(null)
      } else if (event === 'USER_UPDATED') {
        setUser(newSession?.user || null)
      }
    })

    // Set up periodic session check every 5 minutes
    const intervalId = setInterval(() => {
      console.log('⏱️ Periodic session check...')
      checkSession()
    }, 5 * 60 * 1000) // Check every 5 minutes

    // Cleanup
    return () => {
      subscription.unsubscribe()
      clearInterval(intervalId)
    }
  }, [checkSession])

  // Function to handle API responses that might have new tokens
  const handleApiResponse = useCallback((response: Response) => {
    const newAccessToken = response.headers.get('X-New-Access-Token')
    const newRefreshToken = response.headers.get('X-New-Refresh-Token')
    
    if (newAccessToken) {
      console.log('📦 Received new tokens from API response, updating session...')
      // The Supabase client will handle this automatically when we use it next
      // but we can trigger a session check to update our state
      checkSession()
    }
  }, [checkSession])

  return {
    session,
    user,
    loading,
    error,
    refreshSession,
    checkSession,
    handleApiResponse,
    isAuthenticated: !!session,
    isExpiringSoon: session?.expires_at 
      ? (session.expires_at * 1000 - Date.now()) < 10 * 60 * 1000 
      : false
  }
}