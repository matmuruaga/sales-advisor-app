import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useParticipantManagement } from './useParticipantManagement';

export interface Meeting {
  id: string;
  title: string;
  description: string;
  time: string;
  dateTime: string;
  duration: string;
  platform: "google-meet" | "teams" | "zoom";
  type: "opportunity" | "follow-up" | "weekly";
  participants: string[];
}

interface UseGoogleCalendarReturn {
  meetings: Record<string, Meeting[]>;
  isLoading: boolean;
  error: string | null;
  needsAuth: boolean;
  refetch: () => void;
  connectGoogle: () => void;
}

function mapEventToMeeting(event: any): Meeting {
  const startDate = new Date(event.startTime);
  const endDate = new Date(event.endTime);
  const duration = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60));
  
  const type = event.title.toLowerCase().includes('demo') ? 'opportunity' :
               event.title.toLowerCase().includes('follow') ? 'follow-up' : 
               'weekly';

  return {
    id: event.id,
    title: event.title,
    description: event.description || '',
    time: format(startDate, 'HH:mm'),
    dateTime: event.startTime,
    duration: duration.toString(),
    platform: event.platform || 'google-meet',
    type,
    participants: event.attendees
  };
}

export function useGoogleCalendar(selectedDate: Date): UseGoogleCalendarReturn {
  const [meetings, setMeetings] = useState<Record<string, Meeting[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  
  // Use participant management hook to sync participants from calendar events
  const { syncParticipantsFromCalendar } = useParticipantManagement();

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const rangeStart = startOfWeek(monthStart);
    const rangeEnd = endOfWeek(monthEnd);

    try {
      // Obtener el token de sesión actual
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `/api/calendar/events?startDate=${rangeStart.toISOString()}&endDate=${rangeEnd.toISOString()}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': session?.access_token ? `Bearer ${session.access_token}` : '',
          },
        }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.needsAuth) {
          setNeedsAuth(true);
          setError('Necesitas conectar tu cuenta de Google Calendar');
        } else {
          setError(data.error || 'Error al cargar eventos');
        }
        return;
      }

      const groupedMeetings: Record<string, Meeting[]> = {};
      
      data.events.forEach((event: any) => {
        const meeting = mapEventToMeeting(event);
        const dateKey = format(new Date(event.startTime), 'yyyy-MM-dd');
        
        if (!groupedMeetings[dateKey]) {
          groupedMeetings[dateKey] = [];
        }
        
        groupedMeetings[dateKey].push(meeting);
      });

      Object.keys(groupedMeetings).forEach(key => {
        groupedMeetings[key].sort((a, b) => 
          new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
        );
      });

      setMeetings(groupedMeetings);
      setNeedsAuth(false);
      
      // Automatically sync participants from calendar events
      try {
        const allMeetings = Object.values(groupedMeetings).flat();
        if (allMeetings.length > 0) {
          await syncParticipantsFromCalendar(allMeetings);
          console.log('✅ Participants synced from calendar events');
        }
      } catch (syncError) {
        console.error('⚠️ Failed to sync participants, but calendar events loaded:', syncError);
        // Don't fail the whole operation if participant sync fails
      }
    } catch (err) {
      console.error('Error fetching calendar events:', err);
      setError('Error al conectar con Google Calendar');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google_connected') === 'true') {
      fetchEvents();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchEvents]);

  const connectGoogle = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setError('No hay sesión activa. Por favor inicia sesión primero.');
      return;
    }
    
    // Hacer la petición con el token de autorización
    const response = await fetch('/api/auth/google?returnUrl=' + window.location.pathname, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } else {
      // Si falla, intentar redirigir directamente
      window.location.href = '/api/auth/google?returnUrl=' + window.location.pathname;
    }
  }, []);

  return {
    meetings,
    isLoading,
    error,
    needsAuth,
    refetch: fetchEvents,
    connectGoogle
  };
}