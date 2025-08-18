'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/lib/supabase';

interface ContactWithMeetings extends Contact {
  recent_meetings?: {
    meeting_id: string;
    meeting_title: string;
    meeting_date_time: string;
    response_status: string;
    is_organizer: boolean;
  }[];
  enrichment_history?: {
    id: string;
    enrichment_type: string;
    enrichment_source: string;
    status: string;
    confidence_score?: number;
    performed_at: string;
    cost_cents?: number;
  }[];
}

export interface UseContactReturn {
  contact: ContactWithMeetings | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateContact: (updates: Partial<Contact>) => Promise<void>;
  deleteContact: () => Promise<void>;
  enrichContact: (linkedinUrl?: string, source?: string) => Promise<void>;
}

export function useContact(email: string | null): UseContactReturn {
  const [contact, setContact] = useState<ContactWithMeetings | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch contact data from API
  const fetchContact = useCallback(async () => {
    if (!email) {
      setContact(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/contacts/${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        // Contact not found
        setContact(null);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch contact');
      }

      const data = await response.json();
      setContact(data.contact);

    } catch (err) {
      console.error('Error fetching contact:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch contact');
      setContact(null);
    } finally {
      setLoading(false);
    }
  }, [email]);

  // Update contact
  const updateContact = useCallback(async (updates: Partial<Contact>) => {
    if (!email) {
      throw new Error('No email provided');
    }

    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/contacts/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update contact');
      }

      const data = await response.json();
      setContact(data.contact);

    } catch (err) {
      console.error('Error updating contact:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [email]);

  // Delete contact
  const deleteContact = useCallback(async () => {
    if (!email) {
      throw new Error('No email provided');
    }

    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/contacts/${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete contact');
      }

      setContact(null);

    } catch (err) {
      console.error('Error deleting contact:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [email]);

  // Enrich contact via n8n workflow
  const enrichContact = useCallback(async (linkedinUrl?: string, source: string = 'linkedin') => {
    if (!email) {
      throw new Error('No email provided');
    }

    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch('/api/contacts/enrich', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          linkedinUrl,
          fullName: contact?.full_name,
          companyName: contact?.company?.name,
          source
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enrich contact');
      }

      const data = await response.json();
      
      if (data.skip_enrichment) {
        // Contact is already enriched
        return;
      }

      // Enrichment workflow started successfully
      // The contact will be updated via webhook when enrichment completes
      console.log('Enrichment workflow started:', data.enrichment_id);

    } catch (err) {
      console.error('Error enriching contact:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to enrich contact';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [email, contact?.full_name, contact?.company?.name]);

  // Set up real-time subscription for contact updates
  useEffect(() => {
    if (!email || !contact?.id) return;

    console.log(`🔄 Setting up real-time subscription for contact ${contact.id}`);

    const subscription = supabase
      .channel('contact_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contacts',
          filter: `id=eq.${contact.id}`
        },
        (payload) => {
          console.log('🔔 Contact update received:', payload.eventType, payload);
          
          if (payload.eventType === 'UPDATE') {
            // Merge the updated data with existing contact
            setContact(prev => prev ? {
              ...prev,
              ...payload.new,
              // Preserve relations that might not be in the update
              company: prev.company,
              recent_meetings: prev.recent_meetings,
              enrichment_history: prev.enrichment_history
            } : null);
          } else if (payload.eventType === 'DELETE') {
            setContact(null);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up contact subscription');
      subscription.unsubscribe();
    };
  }, [email, contact?.id]);

  // Fetch contact on email change
  useEffect(() => {
    fetchContact();
  }, [fetchContact]);

  return {
    contact,
    loading,
    error,
    refetch: fetchContact,
    updateContact,
    deleteContact,
    enrichContact
  };
}