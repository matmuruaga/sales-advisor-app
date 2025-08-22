/**
 * Supabase Debug Monitor
 * Temporary debugging utility to identify connection issues
 */

import { supabase } from './supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

// Track all active queries
const activeQueries = new Map<string, { startTime: number; details: any }>()

export function initializeSupabaseDebugger() {
  if (typeof window === 'undefined') return
  
  console.log('🔍 Supabase Debugger Initialized')
  
  // Monitor all fetch requests to Supabase
  const originalFetch = window.fetch
  window.fetch = async function(...args: Parameters<typeof fetch>) {
    const [resource, init] = args
    const url = typeof resource === 'string' ? resource : resource.url
    
    // Only monitor Supabase requests
    if (!url.includes(SUPABASE_URL)) {
      return originalFetch.apply(this, args)
    }
    
    const queryId = `${Date.now()}-${Math.random()}`
    const startTime = Date.now()
    
    // Extract meaningful info from URL
    const urlObj = new URL(url)
    const endpoint = urlObj.pathname
    const params = Object.fromEntries(urlObj.searchParams.entries())
    
    activeQueries.set(queryId, {
      startTime,
      details: {
        endpoint,
        params,
        method: init?.method || 'GET'
      }
    })
    
    console.log(`🚀 [${queryId}] Supabase request started:`, {
      endpoint,
      method: init?.method || 'GET',
      params
    })
    
    try {
      const response = await originalFetch.apply(this, args)
      const duration = Date.now() - startTime
      
      if (!response.ok) {
        console.error(`❌ [${queryId}] Supabase request failed:`, {
          status: response.status,
          statusText: response.statusText,
          duration: `${duration}ms`,
          endpoint
        })
        
        // Try to get error details
        try {
          const errorBody = await response.clone().json()
          console.error('Error details:', errorBody)
        } catch {}
      } else if (duration > 5000) {
        console.warn(`🐢 [${queryId}] Slow Supabase request:`, {
          duration: `${duration}ms`,
          endpoint
        })
      } else {
        console.log(`✅ [${queryId}] Supabase request completed:`, {
          duration: `${duration}ms`,
          endpoint
        })
      }
      
      activeQueries.delete(queryId)
      return response
      
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`💀 [${queryId}] Supabase request crashed:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
        endpoint,
        details: activeQueries.get(queryId)?.details
      })
      
      activeQueries.delete(queryId)
      throw error
    }
  }
  
  // Monitor WebSocket connections
  const channels = supabase.getChannels()
  console.log('📡 Initial channels:', channels.map(ch => ({
    topic: ch.topic,
    state: ch.state
  })))
  
  // Check for stuck queries every 10 seconds
  setInterval(() => {
    const now = Date.now()
    const stuckQueries: any[] = []
    
    activeQueries.forEach((query, id) => {
      const duration = now - query.startTime
      if (duration > 10000) { // More than 10 seconds
        stuckQueries.push({
          id,
          duration: `${Math.round(duration / 1000)}s`,
          ...query.details
        })
      }
    })
    
    if (stuckQueries.length > 0) {
      console.error('🚨 Stuck Supabase queries detected:', stuckQueries)
    }
    
    // Also check channel states
    const currentChannels = supabase.getChannels()
    const problematicChannels = currentChannels.filter(ch => 
      ch.state === 'closed' || ch.state === 'errored'
    )
    
    if (problematicChannels.length > 0) {
      console.error('🚨 Problematic channels:', problematicChannels.map(ch => ({
        topic: ch.topic,
        state: ch.state
      })))
    }
  }, 10000)
  
  // Log when page becomes visible/hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      console.log('👁️ Page hidden - connections may be suspended')
    } else {
      console.log('👁️ Page visible - connections should resume')
    }
  })
  
  // Monitor online/offline
  window.addEventListener('online', () => {
    console.log('🌐 Network: ONLINE')
  })
  
  window.addEventListener('offline', () => {
    console.error('🌐 Network: OFFLINE')
  })
}

// Export utility to check current state
export function getSupabaseDebugState() {
  const channels = supabase.getChannels()
  const queries = Array.from(activeQueries.entries()).map(([id, data]) => ({
    id,
    duration: `${Date.now() - data.startTime}ms`,
    ...data.details
  }))
  
  return {
    activeQueries: queries,
    channels: channels.map(ch => ({
      topic: ch.topic,
      state: ch.state
    })),
    timestamp: new Date().toISOString()
  }
}