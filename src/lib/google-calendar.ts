import { calendar_v3 } from '@googleapis/calendar';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { supabase } from '@/lib/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees: string[];
  meetingLink?: string;
  platform?: 'google-meet' | 'teams' | 'zoom';
}

async function getOAuth2Client(userId: string, authenticatedSupabase?: SupabaseClient): Promise<OAuth2Client | null> {
  console.log('Getting OAuth2 client for user:', userId);
  
  // Use the authenticated client if provided, otherwise fall back to global client
  const supabaseClient = authenticatedSupabase || supabase;
  
  const { data: tokenData, error } = await supabaseClient
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching tokens from database:', error);
    return null;
  }

  if (!tokenData) {
    console.log('No tokens found for user:', userId);
    return null;
  }

  console.log('Tokens found for user, creating OAuth2 client');

  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: tokenData.expiry_date,
    scope: tokenData.scope,
    token_type: tokenData.token_type
  });

  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.refresh_token) {
      await supabaseClient
        .from('google_calendar_tokens')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expiry_date: tokens.expiry_date,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } else if (tokens.access_token) {
      await supabaseClient
        .from('google_calendar_tokens')
        .update({
          access_token: tokens.access_token,
          expiry_date: tokens.expiry_date,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    }
  });

  return oauth2Client;
}

function detectPlatform(event: calendar_v3.Schema$Event): 'google-meet' | 'teams' | 'zoom' | undefined {
  const description = event.description?.toLowerCase() || '';
  const location = event.location?.toLowerCase() || '';
  const hangoutLink = event.hangoutLink;
  
  if (hangoutLink || description.includes('meet.google.com') || location.includes('meet.google.com')) {
    return 'google-meet';
  }
  if (description.includes('teams.microsoft.com') || location.includes('teams.microsoft.com')) {
    return 'teams';
  }
  if (description.includes('zoom.us') || location.includes('zoom.us')) {
    return 'zoom';
  }
  
  return undefined;
}

function getMeetingLink(event: calendar_v3.Schema$Event): string | undefined {
  if (event.hangoutLink) {
    return event.hangoutLink;
  }
  
  const description = event.description || '';
  const location = event.location || '';
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const descriptionUrls = description.match(urlRegex);
  const locationUrls = location.match(urlRegex);
  
  const urls = [...(descriptionUrls || []), ...(locationUrls || [])];
  
  for (const url of urls) {
    if (url.includes('meet.google.com') || 
        url.includes('teams.microsoft.com') || 
        url.includes('zoom.us')) {
      return url;
    }
  }
  
  return undefined;
}

export async function getCalendarEvents(
  userId: string,
  startDate: Date,
  endDate: Date,
  authenticatedSupabase?: SupabaseClient
): Promise<CalendarEvent[] | null> {
  console.log('getCalendarEvents called for user:', userId);
  
  const auth = await getOAuth2Client(userId, authenticatedSupabase);
  
  if (!auth) {
    console.log('No OAuth2 client available for user:', userId);
    return null;
  }

  console.log('Creating Google Calendar API client');
  const calendar = google.calendar({ version: 'v3', auth });

  try {
    console.log('Fetching events from Google Calendar API');
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 100
    });

    const events = response.data.items || [];
    
    return events.map((event): CalendarEvent => {
      const attendees = event.attendees?.map(a => a.email || 'Unknown') || [];
      
      return {
        id: event.id || '',
        title: event.summary || 'Sin título',
        description: event.description || '',
        startTime: event.start?.dateTime || event.start?.date || '',
        endTime: event.end?.dateTime || event.end?.date || '',
        attendees,
        meetingLink: getMeetingLink(event),
        platform: detectPlatform(event)
      };
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return null;
  }
}

export async function checkGoogleCalendarConnection(userId: string, authenticatedSupabase?: SupabaseClient): Promise<boolean> {
  const auth = await getOAuth2Client(userId, authenticatedSupabase);
  return auth !== null;
}