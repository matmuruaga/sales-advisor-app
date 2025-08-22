import { supabase } from './supabase'

/**
 * Manages Supabase connections and subscriptions
 */
class SupabaseConnectionManager {
  private activeChannels: Set<string> = new Set()
  private cleanupTimer: NodeJS.Timeout | null = null

  /**
   * Track a channel subscription
   */
  trackChannel(channelName: string) {
    this.activeChannels.add(channelName)
    console.log(`📡 Tracking channel: ${channelName}, Total active: ${this.activeChannels.size}`)
    
    // Monitor channel state
    const channel = supabase.getChannels().find(ch => ch.topic === channelName)
    if (channel) {
      console.log(`Channel ${channelName} state:`, channel.state)
      
      // Add state change listener
      channel.on('system', {}, (payload) => {
        console.log(`🔔 Channel ${channelName} state change:`, payload)
      })
    }
    
    // Start cleanup timer if not already running
    if (!this.cleanupTimer) {
      this.startCleanupTimer()
    }
  }

  /**
   * Untrack a channel subscription
   */
  untrackChannel(channelName: string) {
    this.activeChannels.delete(channelName)
    console.log(`🧹 Untracking channel: ${channelName}, Total active: ${this.activeChannels.size}`)
    
    // Stop cleanup timer if no active channels
    if (this.activeChannels.size === 0 && this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
  }

  /**
   * Get all active channels
   */
  getActiveChannels() {
    return Array.from(this.activeChannels)
  }

  /**
   * Clean up all subscriptions
   */
  async cleanupAll() {
    console.log('🧹 Cleaning up all Supabase subscriptions...')
    const channels = supabase.getChannels()
    
    for (const channel of channels) {
      console.log(`  Removing channel: ${channel.topic}`)
      await supabase.removeChannel(channel)
    }
    
    this.activeChannels.clear()
    console.log('✅ All subscriptions cleaned')
  }

  /**
   * Start periodic cleanup of stale connections
   */
  private startCleanupTimer() {
    // Clean up stale connections every 5 minutes
    this.cleanupTimer = setInterval(() => {
      this.checkAndCleanStaleConnections()
    }, 5 * 60 * 1000)
  }

  /**
   * Check for and clean stale connections
   */
  private async checkAndCleanStaleConnections() {
    console.log('🔍 Checking for stale connections...')
    const channels = supabase.getChannels()
    
    // Check each channel's state
    for (const channel of channels) {
      const state = channel.state
      
      if (state === 'closed' || state === 'errored') {
        console.log(`  Found stale channel: ${channel.topic} (${state})`)
        await supabase.removeChannel(channel)
        this.untrackChannel(channel.topic)
      }
    }
    
    // If we have too many channels, clean some up
    if (channels.length > 10) {
      console.warn(`⚠️ Too many channels open (${channels.length}), cleaning oldest...`)
      // Remove oldest channels beyond the limit
      const toRemove = channels.slice(0, channels.length - 10)
      for (const channel of toRemove) {
        await supabase.removeChannel(channel)
        this.untrackChannel(channel.topic)
      }
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const channels = supabase.getChannels()
    const states: Record<string, number> = {}
    
    for (const channel of channels) {
      states[channel.state] = (states[channel.state] || 0) + 1
    }
    
    return {
      totalChannels: channels.length,
      activeTracked: this.activeChannels.size,
      states,
      channels: channels.map(c => ({
        topic: c.topic,
        state: c.state
      }))
    }
  }
}

// Export singleton instance
export const connectionManager = new SupabaseConnectionManager()

// Add global error handler for Supabase
if (typeof window !== 'undefined') {
  // Log connection stats periodically in development
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const stats = connectionManager.getStats()
      if (stats.totalChannels > 0) {
        console.log('📊 Supabase connection stats:', stats)
      }
    }, 60000) // Every minute
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', () => {
    connectionManager.cleanupAll()
  })
}