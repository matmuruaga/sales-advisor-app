'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/lib/supabase';
import { apiCall } from '@/lib/api-client';

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

// Cache participants in localStorage for emergency fallback
const PARTICIPANTS_CACHE_KEY = 'sales_advisor_participants_cache';

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
      
      // Add default pagination params
      searchParams.set('limit', '50');
      searchParams.set('offset', '0');

      const response = await apiCall(`/api/participants?${searchParams.toString()}`, {
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
      const participantsData = data.participants || [];
      setParticipants(participantsData);
      setStats(data.stats || { total: 0, matched: 0, enriched: 0, unknown: 0, pending: 0 });

      // Cache the successful response
      if (participantsData.length > 0) {
        try {
          localStorage.setItem(PARTICIPANTS_CACHE_KEY, JSON.stringify({
            data: participantsData,
            stats: data.stats,
            timestamp: Date.now()
          }));
          console.log('💾 Participants cached for emergency fallback');
        } catch (e) {
          console.warn('Failed to cache participants:', e);
        }
      }

    } catch (err) {
      console.error('Error fetching participants:', err);
      
      // Try to load from cache if API call fails
      try {
        const cached = localStorage.getItem(PARTICIPANTS_CACHE_KEY);
        if (cached) {
          const { data, stats, timestamp } = JSON.parse(cached);
          const cacheAge = Date.now() - timestamp;
          const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (cacheAge < maxCacheAge) {
            console.log('📦 Using cached participants due to connection issues');
            console.log(`Cache age: ${Math.round(cacheAge / 1000 / 60)} minutes`);
            setParticipants(data);
            setStats(stats || { total: 0, matched: 0, enriched: 0, unknown: 0, pending: 0 });
            setError('Using cached data - connection issues detected');
          } else {
            console.log('⏰ Cache too old, not using');
            setError(err instanceof Error ? err.message : 'Failed to fetch participants');
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch participants');
        }
      } catch (cacheError) {
        console.error('Failed to load from cache:', cacheError);
        setError(err instanceof Error ? err.message : 'Failed to fetch participants');
      }
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

      console.log('📅 Syncing participants from', calendarEvents.length, 'calendar events');

      // Transform calendar events to participant format
      const participantsData = calendarEvents.flatMap(event => {
        // event.participants should already be an array of email strings from useGoogleCalendar
        const emails = event.participants || [];
        
        console.log(`Processing event "${event.title}" with ${emails.length} participants`);
        
        return emails
          .filter((email: any) => {
            const isValid = typeof email === 'string' && email.includes('@');
            if (!isValid && email) {
              console.warn('Invalid participant email format:', email);
            }
            return isValid;
          })
          .map((email: string) => ({
            meetingId: event.id,
            meetingTitle: event.title,
            meetingDateTime: new Date(event.dateTime).toISOString(),
            email: email.trim(),
            displayName: email.split('@')[0], // Extract name from email if no display name
            responseStatus: 'needsAction' as const,
            isOrganizer: false,
            isOptional: false,
            platform: event.platform || 'google-meet'
          }));
      });

      if (participantsData.length === 0) {
        console.log('📭 No participants to sync');
        return { success: true, created: 0 };
      }

      console.log('📤 Sending participants to API:', {
        count: participantsData.length,
        sample: participantsData[0] // Log first participant for debugging
      });

      const response = await apiCall('/api/participants', {
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

      const response = await apiCall(`/api/participants/${participantId}/enrich`, {
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

  // Set up data fetching without real-time subscriptions
  useEffect(() => {
    console.log('🔄 Setting up participant management and fetching data');
    fetchParticipants();

    // DISABLED: Real-time subscriptions causing WebSocket connection issues
    console.log('⚠️ Real-time participant subscriptions temporarily disabled');
    
    // Instead, poll for updates every 30 seconds when page is visible
    let intervalId: NodeJS.Timeout | null = null;
    
    const startPolling = () => {
      if (!document.hidden) {
        intervalId = setInterval(() => {
          if (!document.hidden) {
            console.log('🔄 Polling for participant updates...');
            fetchParticipants();
          }
        }, 30000); // Poll every 30 seconds
      }
    };
    
    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };
    
    // Start polling initially
    startPolling();
    
    // Handle visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        // Fetch immediately when page becomes visible
        fetchParticipants();
        startPolling();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      console.log('🧹 Cleaning up participant polling');
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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