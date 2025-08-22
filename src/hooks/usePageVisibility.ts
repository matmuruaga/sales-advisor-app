'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState(!document.hidden)
  
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const visible = !document.hidden
      setIsVisible(visible)
      
      if (visible) {
        console.log('📱 Page became visible - reconnecting to Supabase...')
        
        // Force reconnect all channels
        const channels = supabase.getChannels()
        
        for (const channel of channels) {
          console.log(`🔄 Reconnecting channel: ${channel.topic}`)
          
          // Unsubscribe and resubscribe to force reconnection
          await supabase.removeChannel(channel)
          
          // Wait a bit before reconnecting
          await new Promise(resolve => setTimeout(resolve, 100))
          
          // Resubscribe with the same topic
          const newChannel = supabase.channel(channel.topic)
          
          // Re-add the listeners (this is a simplified version)
          // In production, you'd need to preserve and re-add the original listeners
          newChannel.subscribe((status) => {
            console.log(`📡 Channel ${channel.topic} status:`, status)
          })
        }
        
        // Also refresh the session
        const { data: { session }, error } = await supabase.auth.refreshSession()
        if (error) {
          console.error('❌ Failed to refresh session:', error)
        } else if (session) {
          console.log('✅ Session refreshed after page visibility')
        }
      } else {
        console.log('😴 Page hidden - connections may be suspended')
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
  
  return isVisible
}