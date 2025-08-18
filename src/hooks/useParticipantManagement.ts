'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/lib/supabase';

export interface MeetingParticipant {
  id: string;
  organizationId: string;
  meetingId: string;
  meetingTitle?: string;
  meetingDateTime: string;
  email: string;
  displayName?: string;
  responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  isOrganizer: boolean;
  isOptional: boolean;
  meetingPlatform: string;
  contactId?: string;
  enrichmentStatus: 'pending' | 'matched' | 'enriched' | 'unknown';
  enrichmentSource?: string;
  autoMatchConfidence?: number;
  createdAt: string;
  updatedAt: string;
  lastSeenInMeeting: string;
  
  // Relations
  contact?: Contact & {
    company?: {
      id: string;
      name: string;
      industryId?: string;
      employeeCount?: string;
      logoUrl?: string;
    };
  };
  enrichmentHistory?: EnrichmentHistoryItem[];
}

export interface EnrichmentHistoryItem {
  id: string;
  enrichmentType: string;
  status: string;
  confidenceScore?: number;
  performedAt: string;
}

export interface ParticipantStats {
  total: number;
  matched: number;
  enriched: number;
  unknown: number;
  pending: number;
}

export interface ParticipantFilters {
  meetingId?: string;
  email?: string;
  contactId?: string;
  enrichmentStatus?: 'pending' | 'matched' | 'enriched' | 'unknown';
}

export interface EnrichContactData {
  fullName: string;
  email: string;
  roleTitle?: string;
  companyName?: string;
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
}

export function useParticipantManagement(filters?: ParticipantFilters) {
  const [participants, setParticipants] = useState<MeetingParticipant[]>([]);
  const [stats, setStats] = useState<ParticipantStats>({
    total: 0, matched: 0, enriched: 0, unknown: 0, pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch participants from API
  const fetchParticipants = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const searchParams = new URLSearchParams();
      if (filters?.meetingId) searchParams.set('meetingId', filters.meetingId);
      if (filters?.email) searchParams.set('email', filters.email);
      if (filters?.contactId) searchParams.set('contactId', filters.contactId);
      if (filters?.enrichmentStatus) searchParams.set('enrichmentStatus', filters.enrichmentStatus);

      const response = await fetch(`/api/participants?${searchParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch participants');
      }

      const data = await response.json();
      setParticipants(data.participants || []);
      setStats(data.stats || { total: 0, matched: 0, enriched: 0, unknown: 0, pending: 0 });

    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  }, [filters?.meetingId, filters?.email, filters?.contactId, filters?.enrichmentStatus]);

  // Create participants from calendar events
  const syncParticipantsFromCalendar = useCallback(async (calendarEvents: any[]) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      // Transform calendar events to participant format
      const participantsData = calendarEvents.flatMap(event => 
        (event.participants || event.attendees || []).map((attendee: string) => ({
          meetingId: event.id,
          meetingTitle: event.title,
          meetingDateTime: event.dateTime,
          email: attendee,
          displayName: attendee.split('@')[0], // Extract name from email if no display name
          responseStatus: 'needsAction' as const,
          isOrganizer: false,
          isOptional: false,
          platform: event.platform || 'google-meet'
        }))
      );

      if (participantsData.length === 0) {
        return { success: true, created: 0 };
      }

      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(participantsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync participants');
      }

      const result = await response.json();
      
      // Refresh participants list
      await fetchParticipants();
      
      return { success: true, created: result.created };

    } catch (err) {
      console.error('Error syncing participants:', err);
      throw err;
    }
  }, [fetchParticipants]);

  // Link participant to existing contact
  const linkParticipantToContact = useCallback(async (participantId: string, contactId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/participants/${participantId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contactId,
          enrichmentStatus: 'matched'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to link participant');
      }

      const result = await response.json();
      
      // Update local state
      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, contactId, enrichmentStatus: 'matched', contact: result.participant.contact }
          : p
      ));

      return result.participant;

    } catch (err) {
      console.error('Error linking participant:', err);
      throw err;
    }
  }, []);

  // Enrich participant and create new contact
  const enrichParticipant = useCallback(async (
    participantId: string, 
    source: 'clearbit' | 'apollo' | 'linkedin' | 'manual' = 'manual',
    contactData?: EnrichContactData
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`/api/participants/${participantId}/enrich`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source,
          contactData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enrich participant');
      }

      const result = await response.json();
      
      // Update local state
      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { 
              ...p, 
              contactId: result.contact.id, 
              enrichmentStatus: 'enriched',
              enrichmentSource: source,
              contact: result.contact
            }
          : p
      ));

      return result;

    } catch (err) {
      console.error('Error enriching participant:', err);
      throw err;
    }
  }, []);

  // Get participants for a specific meeting
  const getParticipantsForMeeting = useCallback((meetingId: string) => {
    return participants.filter(p => p.meetingId === meetingId);
  }, [participants]);

  // Get unknown participants (not linked to contacts)
  const unknownParticipants = useMemo(() => {
    return participants.filter(p => p.enrichmentStatus === 'unknown' || p.enrichmentStatus === 'pending');
  }, [participants]);

  // Get enrichment opportunities (high-confidence auto-matches)
  const enrichmentOpportunities = useMemo(() => {
    return participants.filter(p => 
      p.enrichmentStatus === 'pending' && 
      (p.autoMatchConfidence || 0) > 0.7
    );
  }, [participants]);

  // Set up real-time subscription
  useEffect(() => {
    console.log('🔄 Setting up participant management and fetching data');
    fetchParticipants();

    // Subscribe to participant changes
    const participantSubscription = supabase
      .channel('participant_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_participants'
        },
        (payload) => {
          console.log('🔔 Participant update:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            setParticipants(prev => {
              const exists = prev.some(p => p.id === payload.new.id);
              if (exists) return prev;
              return [payload.new as MeetingParticipant, ...prev];
            });
          } else if (payload.eventType === 'UPDATE') {
            setParticipants(prev =>
              prev.map(p =>
                p.id === payload.new.id ? payload.new as MeetingParticipant : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setParticipants(prev =>
              prev.filter(p => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up participant subscription');
      participantSubscription.unsubscribe();
    };
  }, [fetchParticipants]);

  return {
    participants,
    stats,
    loading,
    error,
    unknownParticipants,
    enrichmentOpportunities,
    
    // Actions
    refetch: fetchParticipants,
    syncParticipantsFromCalendar,
    linkParticipantToContact,
    enrichParticipant,
    getParticipantsForMeeting
  };
}