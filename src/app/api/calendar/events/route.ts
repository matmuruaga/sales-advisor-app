import { NextRequest, NextResponse } from 'next/server';
import { getCalendarEvents } from '@/lib/google-calendar';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  // Obtener el token del header Authorization
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No authorization header found');
    return NextResponse.json({ 
      error: 'No authenticated user',
      needsAuth: true 
    }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');
  
  // Crear cliente de Supabase con el token
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.log('Error getting user:', error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      needsAuth: true 
    }, { status: 401 });
  }

  console.log('User authenticated:', user.email, 'ID:', user.id);

  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Missing date parameters' }, { status: 400 });
  }

  console.log('Fetching calendar events for user:', user.id);
  console.log('Date range:', startDate, 'to', endDate);

  try {
    const events = await getCalendarEvents(
      user.id,
      new Date(startDate),
      new Date(endDate),
      supabase
    );

    console.log('Calendar events response:', events ? `${events.length} events` : 'null (no auth)');

    if (events === null) {
      console.log('Google Calendar not connected or error fetching events');
      return NextResponse.json({ 
        error: 'Google Calendar not connected',
        needsAuth: true 
      }, { status: 401 });
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error in calendar/events route:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch calendar events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}