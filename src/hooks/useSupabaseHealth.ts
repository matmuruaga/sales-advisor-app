'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseHealth() {
  const [isHealthy, setIsHealthy] = useState(true)
  const [lastError, setLastError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected'>('connected')

  const checkHealth = useCallback(async () => {
    try {
      console.log('🏥 Checking Supabase health...')
      const startTime = Date.now()
      
      // Try a simple query with a short timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      )
      
      const queryPromise = supabase
        .from('users')
        .select('id')
        .limit(1)
        .single()
      
      const result = await Promise.race([queryPromise, timeoutPromise]) as any
      const responseTime = Date.now() - startTime
      
      if (result.error) {
        // Check if it's a no rows error (which is fine for health check)
        if (result.error.code === 'PGRST116') {
          console.log(`✅ Supabase is healthy (no data, but connection works) - ${responseTime}ms`)
          setIsHealthy(true)
          setConnectionState('connected')
          setLastError(null)
        } else {
          console.error('❌ Supabase health check failed:', result.error)
          setIsHealthy(false)
          setConnectionState('disconnected')
          setLastError(result.error.message)
        }
      } else {
        console.log(`✅ Supabase is healthy - ${responseTime}ms`)
        setIsHealthy(true)
        setConnectionState('connected')
        setLastError(null)
      }
      
      return isHealthy
    } catch (error) {
      console.error('💀 Supabase health check error:', error)
      setIsHealthy(false)
      setConnectionState('disconnected')
      setLastError(error instanceof Error ? error.message : 'Unknown error')
      return false
    }
  }, [])

  // Check health periodically
  useEffect(() => {
    // Initial check
    checkHealth()
    
    // Check every 30 seconds
    const intervalId = setInterval(() => {
      checkHealth()
    }, 30000)
    
    return () => clearInterval(intervalId)
  }, [checkHealth])

  // Monitor auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        console.log('🔌 User signed out or session lost')
        setConnectionState('disconnected')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log('🔌 Connection restored')
        setConnectionState('connected')
        // Recheck health after auth change
        checkHealth()
      }
    })
    
    return () => subscription.unsubscribe()
  }, [checkHealth])

  return {
    isHealthy,
    connectionState,
    lastError,
    checkHealth
  }
}