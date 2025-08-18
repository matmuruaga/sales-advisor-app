'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/lib/supabase';
import { apiCall } from '@/lib/api-client';

export interface MeetingParticipantWithContact {
  id: string;
  meeting_id: string;
  meeting_title?: string;
  meeting_date_time: string;
  email: string;
  display_name?: string;
  response_status: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  is_organizer: boolean;
  is_optional: boolean;
  meeting_platform: string;
  contact_id?: string;
  enrichment_status: 'pending' | 'matched' | 'enriched' | 'unknown';
  enrichment_source?: string;
  auto_match_confidence?: number;
  created_at: string;
  updated_at: string;
  last_seen_in_meeting: string;
  
  // Relations
  contact?: Contact & {
    company?: {
      id: string;
      name: string;
      logo_url?: string;
      domain?: string;
    };
  };
}

export interface ParticipantStats {
  total: number;
  matched: number;
  enriched: number;
  unknown: number;
  pending: number;
}

export interface UseMeetingParticipantsReturn {
  participants: MeetingParticipantWithContact[];
  stats: ParticipantStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  syncFromCalendar: (calendarEvents: any[]) => Promise<{ created: number }>;
  linkToContact: (participantId: string, contactId: string) => Promise<void>;
  enrichParticipant: (participantId: string, source?: string, linkedinUrl?: string) => Promise<void>;
  getParticipantsForMeeting: (meetingId: string) => MeetingParticipantWithContact[];
  unknownParticipants: MeetingParticipantWithContact[];
  enrichmentOpportunities: MeetingParticipantWithContact[];
}

export interface CalendarEvent {
  id: string;
  title?: string;
  dateTime: string;
  participants?: string[];
  attendees?: string[];
  platform?: string;
}

export function useMeetingParticipants(
  meetingId?: string,
  options?: {
    enrichmentStatus?: 'pending' | 'matched' | 'enriched' | 'unknown';
    dateFrom?: string;
    dateTo?: string;
    autoRefresh?: boolean;
  }
): UseMeetingParticipantsReturn {
  const [participants, setParticipants] = useState<MeetingParticipantWithContact[]>([]);
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
      if (meetingId) searchParams.set('meetingId', meetingId);
      if (options?.enrichmentStatus) searchParams.set('enrichmentStatus', options.enrichmentStatus);
      if (options?.dateFrom) searchParams.set('dateFrom', options.dateFrom);
      if (options?.dateTo) searchParams.set('dateTo', options.dateTo);

      const response = await apiCall(`/api/meeting-participants?${searchParams.toString()}`, {
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
  }, [meetingId, options?.enrichmentStatus, options?.dateFrom, options?.dateTo]);

  // Sync participants from calendar events
  const syncFromCalendar = useCallback(async (calendarEvents: CalendarEvent[]): Promise<{ created: number }> => {
    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      // Transform calendar events to participant format
      const participantsData = calendarEvents.flatMap(event => {
        const attendees = event.participants || event.attendees || [];
        return attendees.map((attendee: string) => ({
          meetingId: event.id,
          meetingTitle: event.title || 'Untitled Meeting',
          meetingDateTime: event.dateTime,
          email: attendee,
          displayName: attendee.includes('@') ? attendee.split('@')[0] : attendee,
          responseStatus: 'needsAction' as const,
          isOrganizer: false,
          isOptional: false,
          platform: event.platform || 'google-meet'
        }));
      });

      if (participantsData.length === 0) {
        return { created: 0 };
      }

      const response = await apiCall('/api/meeting-participants', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          participants: participantsData,
          autoMatch: true // Enable auto-matching with existing contacts
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to sync participants');
      }

      const result = await response.json();
      
      // Refresh participants list
      await fetchParticipants();
      
      return { created: result.results.total_imported };

    } catch (err) {
      console.error('Error syncing participants:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync participants';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchParticipants]);

  // Link participant to existing contact
  const linkToContact = useCallback(async (participantId: string, contactId: string) => {
    try {
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await apiCall(`/api/participants/${participantId}`, {
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
          ? { 
              ...p, 
              contact_id: contactId, 
              enrichment_status: 'matched',
              contact: result.participant.contact
            }
          : p
      ));

      // Update stats
      setStats(prev => ({
        ...prev,
        matched: prev.matched + 1,
        pending: Math.max(0, prev.pending - 1)
      }));

    } catch (err) {
      console.error('Error linking participant:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to link participant';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Enrich participant via n8n workflow
  const enrichParticipant = useCallback(async (
    participantId: string, 
    source: string = 'linkedin',
    linkedinUrl?: string
  ) => {
    try {
      setError(null);

      const participant = participants.find(p => p.id === participantId);
      if (!participant) {
        throw new Error('Participant not found');
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await apiCall('/api/contacts/enrich', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: participant.email,
          linkedinUrl,
          fullName: participant.display_name,
          source,
          participantId
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to enrich participant');
      }

      const result = await response.json();
      
      if (result.skip_enrichment) {
        // Participant/contact is already enriched
        return;
      }

      // Update participant status to show enrichment in progress
      setParticipants(prev => prev.map(p => 
        p.id === participantId 
          ? { ...p, enrichment_status: 'pending' }
          : p
      ));

      console.log('Enrichment workflow started:', result.enrichment_id);

    } catch (err) {
      console.error('Error enriching participant:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to enrich participant';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [participants]);

  // Get participants for a specific meeting
  const getParticipantsForMeeting = useCallback((targetMeetingId: string) => {
    return participants.filter(p => p.meeting_id === targetMeetingId);
  }, [participants]);

  // Get unknown participants (not linked to contacts)
  const unknownParticipants = useMemo(() => {
    return participants.filter(p => 
      p.enrichment_status === 'unknown' || 
      p.enrichment_status === 'pending'
    );
  }, [participants]);

  // Get enrichment opportunities (high-confidence auto-matches)
  const enrichmentOpportunities = useMemo(() => {
    return participants.filter(p => 
      p.enrichment_status === 'pending' && 
      (p.auto_match_confidence || 0) > 0.7
    );
  }, [participants]);

  // Set up real-time subscription for participant updates
  useEffect(() => {
    console.log('🔄 Setting up meeting participants real-time subscription');
    
    // Create unique channel name to avoid conflicts
    const channelName = `meeting_participants_changes_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const subscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'meeting_participants'
        },
        (payload) => {
          console.log('🔔 Meeting participant update:', payload.eventType, payload);
          
          if (payload.eventType === 'INSERT') {
            // Add new participant if it doesn't exist
            setParticipants(prev => {
              const exists = prev.some(p => p.id === payload.new.id);
              if (exists) return prev;
              return [...prev, payload.new as MeetingParticipantWithContact];
            });
          } else if (payload.eventType === 'UPDATE') {
            // Update existing participant
            setParticipants(prev =>
              prev.map(p =>
                p.id === payload.new.id 
                  ? { ...p, ...payload.new as MeetingParticipantWithContact }
                  : p
              )
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove deleted participant
            setParticipants(prev =>
              prev.filter(p => p.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Also subscribe to contact changes to update participant contact data
    // Create unique channel name to avoid conflicts
    const contactChannelName = `contact_changes_for_participants_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const contactSubscription = supabase
      .channel(contactChannelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts'
        },
        (payload) => {
          console.log('🔔 Contact update for participants:', payload);
          
          // Update participants that have this contact
          setParticipants(prev =>
            prev.map(p =>
              p.contact_id === payload.new.id 
                ? { ...p, contact: { ...p.contact, ...payload.new } as any }
                : p
            )
          );
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up meeting participants subscriptions');
      subscription.unsubscribe();
      contactSubscription.unsubscribe();
    };
  }, []);

  // Fetch participants on mount and dependency changes
  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!options?.autoRefresh) return;

    const interval = setInterval(() => {
      if (!loading) {
        fetchParticipants();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [options?.autoRefresh, loading, fetchParticipants]);

  return {
    participants,
    stats,
    loading,
    error,
    refetch: fetchParticipants,
    syncFromCalendar,
    linkToContact,
    enrichParticipant,
    getParticipantsForMeeting,
    unknownParticipants,
    enrichmentOpportunities
  };
}