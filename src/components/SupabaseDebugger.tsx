'use client'

import { useEffect } from 'react'
import { initializeSupabaseDebugger } from '@/lib/supabase-debug'

export function SupabaseDebugger() {
  useEffect(() => {
    initializeSupabaseDebugger()
  }, [])
  
  return null
}