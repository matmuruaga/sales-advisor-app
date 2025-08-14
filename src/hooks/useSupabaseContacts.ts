'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase, type Contact } from '@/lib/supabase'

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

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Fetching contacts with filters:', filters)

      // Use the original join approach - should work now with updated RLS policy
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

      const { data, error: fetchError } = await query

      if (fetchError) {
        console.error('❌ Supabase query error:', fetchError)
        throw fetchError
      }

      console.log('✅ Contacts fetched successfully:', data?.length || 0, 'contacts')
      setContacts(data || [])
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
    JSON.stringify(filters?.tags) // Stable dependency for array
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

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔄 Setting up contacts subscription and initial fetch')
    fetchContacts()

    const subscription = supabase
      .channel('contacts_changes')
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
    }
  }, []) // Remove fetchContacts dependency to prevent loop

  // Separate effect for refetching when filters change
  useEffect(() => {
    console.log('🔄 Filters changed, refetching contacts')
    fetchContacts()
  }, [fetchContacts])

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