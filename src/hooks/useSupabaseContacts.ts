'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase, type Contact } from '@/lib/supabase'
import { useSupabaseHealth } from './useSupabaseHealth'
import { connectionManager } from '@/lib/supabase-manager'

export interface ContactFilters {
  status?: 'hot' | 'warm' | 'cold'
  assignedUserId?: string
  companyId?: string
  search?: string
  tags?: string[]
  pipelineStage?: string
  minScore?: number
  maxScore?: number
}

export function useSupabaseContacts(filters?: ContactFilters) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isHealthy, connectionState, checkHealth } = useSupabaseHealth()

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching contacts with filters:', filters)
      
      // Check connection health first
      if (connectionState === 'disconnected') {
        console.log('⚠️ Supabase disconnected, checking health...')
        const healthy = await checkHealth()
        if (!healthy) {
          console.error('❌ Supabase is not healthy, aborting fetch')
          setError('Connection to database lost. Please refresh the page.')
          setLoading(false)
          return
        }
      }

      // Check session before making request
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.log('⚠️ Session expired or not found, attempting to refresh...')
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !newSession) {
          console.error('❌ Failed to refresh session:', refreshError)
          setError('Session expired. Please refresh the page or log in again.')
          setLoading(false)
          return
        }
        console.log('✅ Session refreshed successfully')
      }

      // Build query
      let query = supabase
        .from('contacts')
        .select(`
          *,
          company:companies(
            id,
            name,
            industry_id,
            employee_count:size_category,
            revenue_range,
            location:headquarters
          )
        `)
        .order('score', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.assignedUserId) {
        query = query.eq('assigned_user_id', filters.assignedUserId)
      }
      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId)
      }
      if (filters?.pipelineStage) {
        query = query.eq('pipeline_stage', filters.pipelineStage)
      }
      if (filters?.minScore !== undefined) {
        query = query.gte('score', filters.minScore)
      }
      if (filters?.maxScore !== undefined) {
        query = query.lte('score', filters.maxScore)
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }
      if (filters?.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,role_title.ilike.%${filters.search}%`
        )
      }

      // Execute query with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout after 30 seconds')), 30000)
      )
      
      try {
        console.log('⏳ Executing Supabase query...')
        const startTime = Date.now()
        
        const { data, error: fetchError } = await Promise.race([
          query,
          timeoutPromise
        ]) as any
        
        const queryTime = Date.now() - startTime
        console.log(`⏱️ Query completed in ${queryTime}ms`)

        if (fetchError) {
          console.error('❌ Supabase query error:', {
            message: fetchError.message,
            code: fetchError.code,
            details: fetchError.details,
            hint: fetchError.hint,
            queryTime: `${queryTime}ms`
          })
          
          // Check if it's an auth error
          if (fetchError.message?.includes('JWT') || fetchError.code === 'PGRST301') {
            console.log('🔄 Auth error detected, attempting to refresh session...')
            await supabase.auth.refreshSession()
            // Retry once after refresh
            const { data: retryData, error: retryError } = await query
            if (retryError) throw retryError
            console.log('✅ Retry successful after session refresh')
            setContacts(retryData || [])
            return
          }
          throw fetchError
        }

        console.log('✅ Contacts fetched successfully:', data?.length || 0, 'contacts')
        setContacts(data || [])
      } catch (timeoutError) {
        if (timeoutError instanceof Error && timeoutError.message.includes('timeout')) {
          console.error('⏱️ Query timed out')
          throw new Error('Request timed out. Please check your connection and try again.')
        }
        throw timeoutError
      }
    } catch (err) {
      console.error('💥 Error fetching contacts:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch contacts')
    } finally {
      setLoading(false)
    }
  }, [
    filters?.status,
    filters?.assignedUserId,
    filters?.companyId,
    filters?.pipelineStage,
    filters?.minScore,
    filters?.maxScore,
    filters?.search,
    // Use a more stable comparison for tags array
    filters?.tags?.join(','),
    connectionState,
    checkHealth
  ])

  const createContact = async (contactData: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contactData])
        .select()
        .single()

      if (error) throw error

      setContacts(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating contact:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to create contact' 
      }
    }
  }

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setContacts(prev => 
        prev.map(contact => contact.id === id ? data : contact)
      )
      return { data, error: null }
    } catch (err) {
      console.error('Error updating contact:', err)
      return { 
        data: null, 
        error: err instanceof Error ? err.message : 'Failed to update contact' 
      }
    }
  }

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id)

      if (error) throw error

      setContacts(prev => prev.filter(contact => contact.id !== id))
      return { error: null }
    } catch (err) {
      console.error('Error deleting contact:', err)
      return { 
        error: err instanceof Error ? err.message : 'Failed to delete contact' 
      }
    }
  }

  // Fetch contacts when filters change with debounce
  useEffect(() => {
    console.log('🔄 Fetching contacts with filters')
    
    // Add a small debounce to prevent rapid re-fetches
    const timeoutId = setTimeout(() => {
      fetchContacts()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [fetchContacts])

  // Set up real-time subscription (separate from fetching)
  useEffect(() => {
    console.log('📡 Setting up real-time contacts subscription')
    
    const channelName = `contacts_changes_${Math.random().toString(36).substr(2, 9)}`
    connectionManager.trackChannel(channelName)
    
    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('🔔 Real-time update:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT') {
            // Check if contact already exists to prevent duplicates
            setContacts(prev => {
              const exists = prev.some(c => c.id === payload.new.id)
              if (exists) {
                console.log('⚠️ Preventing duplicate insert for contact:', payload.new.id)
                return prev
              }
              return [payload.new as Contact, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setContacts(prev =>
              prev.map(contact =>
                contact.id === payload.new.id ? payload.new as Contact : contact
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setContacts(prev =>
              prev.filter(contact => contact.id !== payload.old.id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🧹 Cleaning up contacts subscription')
      subscription.unsubscribe()
      connectionManager.untrackChannel(channelName)
    }
  }, []) // Real-time subscription only needs to be set up once

  // Derive companies from contacts to avoid undefined in SmartActionComposer
  const companies = React.useMemo(() => {
    try {
      return (contacts || [])
        .map(contact => contact?.company)
        .filter((company, index, self) => 
          company && 
          company.id && 
          self.findIndex(c => c?.id === company.id) === index
        ) as NonNullable<Contact['company']>[]
    } catch (error) {
      console.error('Error deriving companies from contacts:', error)
      return []
    }
  }, [contacts])

  return {
    contacts,
    companies,
    loading,
    error,
    refetch: fetchContacts,
    createContact,
    updateContact,
    deleteContact
  }
}