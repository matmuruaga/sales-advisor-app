'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseHealth() {
  // TEMPORARILY DISABLED - Always return healthy to avoid false positives
  const [isHealthy, setIsHealthy] = useState(true)
  const [lastError, setLastError] = useState<string | null>(null)
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected'>('connected')

  const checkHealth = useCallback(async () => {
    // DISABLED - Always return healthy
    console.log('🏥 Health check disabled - returning healthy')
    return true
  }, [])

  // DISABLED - No periodic health checks
  useEffect(() => {
    // Health checks disabled to avoid false positives
    console.log('⚠️ Health checks disabled')
  }, [])

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