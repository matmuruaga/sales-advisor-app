import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getAuthContext } from '@/lib/userQueries';

// Validation schemas
const ParticipantCreateSchema = z.object({
  meetingId: z.string(),
  meetingTitle: z.string().optional(),
  meetingDateTime: z.string().datetime(),
  email: z.string().email(),
  displayName: z.string().optional(),
  responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).default('needsAction'),
  isOrganizer: z.boolean().default(false),
  isOptional: z.boolean().default(false),
  platform: z.string().default('google-meet')
});

const ParticipantUpdateSchema = z.object({
  contactId: z.string().uuid().optional(),
  enrichmentStatus: z.enum(['pending', 'matched', 'enriched', 'unknown']).optional(),
  responseStatus: z.enum(['accepted', 'declined', 'tentative', 'needsAction']).optional()
});

const ParticipantQuerySchema = z.object({
  meetingId: z.string().optional(),
  email: z.string().email().optional(),
  contactId: z.string().uuid().optional(),
  enrichmentStatus: z.enum(['pending', 'matched', 'enriched', 'unknown']).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0)
});

async function getAuthenticatedSupabase(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No authorization header found');
  }

  const token = authHeader.replace('Bearer ', '');
  
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

  // RLS-READY: Use the helper function that handles organization lookup safely
  const authContext = await getAuthContext(supabase);
  
  return { 
    supabase, 
    user: authContext.user, 
    organizationId: authContext.organizationId 
  };
}

// GET /api/participants - List participants with optional filters
export async function GET(request: NextRequest) {
  try {
    const { supabase, organizationId } = await getAuthenticatedSupabase(request);
    
    const searchParams = request.nextUrl.searchParams;
    const queryParams = ParticipantQuerySchema.parse({
      meetingId: searchParams.get('meetingId') || undefined,
      email: searchParams.get('email') || undefined,
      contactId: searchParams.get('contactId') || undefined,
      enrichmentStatus: searchParams.get('enrichmentStatus') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined
    });

    // SIMPLIFIED QUERY - Fetch participants first, then fetch related data separately if needed
    let query = supabase
      .from('meeting_participants')
      .select('*')
      .eq('organization_id', organizationId)
      .order('meeting_date_time', { ascending: false })
      .limit(queryParams.limit);

    // Apply filters
    if (queryParams.meetingId) {
      query = query.eq('meeting_id', queryParams.meetingId);
    }
    if (queryParams.email) {
      query = query.eq('email', queryParams.email);
    }
    if (queryParams.contactId) {
      query = query.eq('contact_id', queryParams.contactId);
    }
    if (queryParams.enrichmentStatus) {
      query = query.eq('enrichment_status', queryParams.enrichmentStatus);
    }

    const { data: participants, error } = await query;

    if (error) {
      console.error('Error fetching participants:', error);
      return NextResponse.json({ error: 'Failed to fetch participants' }, { status: 500 });
    }

    // Calculate enrichment stats
    const stats = {
      total: participants.length,
      matched: participants.filter(p => p.enrichment_status === 'matched').length,
      enriched: participants.filter(p => p.enrichment_status === 'enriched').length,
      unknown: participants.filter(p => p.enrichment_status === 'unknown').length,
      pending: participants.filter(p => p.enrichment_status === 'pending').length
    };

    return NextResponse.json({ 
      participants,
      stats,
      pagination: {
        offset: queryParams.offset,
        limit: queryParams.limit,
        hasMore: participants.length === queryParams.limit
      }
    });

  } catch (error) {
    console.error('GET /api/participants error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// POST /api/participants - Create or bulk create participants from calendar events
export async function POST(request: NextRequest) {
  try {
    const { supabase, organizationId } = await getAuthenticatedSupabase(request);
    
    const body = await request.json();
    
    console.log('POST /api/participants - Received body:', {
      isArray: Array.isArray(body),
      length: Array.isArray(body) ? body.length : 1,
      sample: Array.isArray(body) ? body[0] : body
    });
    
    // Handle both single participant and bulk creation
    const participantsData = Array.isArray(body) ? body : [body];
    
    // Filter out invalid participants and validate the rest
    const validatedParticipants = participantsData
      .filter(p => {
        const isValid = p && p.email && p.meetingId;
        if (!isValid) {
          console.warn('Filtering out participant - missing required fields:', p);
        }
        return isValid;
      })
      .map(p => {
        try {
          return ParticipantCreateSchema.parse(p);
        } catch (error) {
          console.error('Validation error for participant:', {
            participant: p,
            error: error instanceof Error ? error.message : error
          });
          return null;
        }
      })
      .filter(Boolean);

    const participantsToInsert = validatedParticipants.map(p => ({
      organization_id: organizationId,
      meeting_id: p.meetingId,
      meeting_title: p.meetingTitle,
      meeting_date_time: p.meetingDateTime,
      email: p.email,
      display_name: p.displayName,
      response_status: p.responseStatus,
      is_organizer: p.isOrganizer,
      is_optional: p.isOptional,
      meeting_platform: p.platform
    }));

    // Log the data we're trying to insert
    console.log('Attempting to insert participants:', {
      count: participantsToInsert.length,
      sample: participantsToInsert[0],
      organizationId: organizationId
    });

    // Use upsert with the unique constraint name - SIMPLIFIED without JOINs
    const { data: participants, error } = await supabase
      .from('meeting_participants')
      .upsert(participantsToInsert, { 
        onConflict: 'meeting_id,email'
      })
      .select('*');

    if (error) {
      console.error('Error creating participants:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
        organizationId: organizationId
      });
      
      // Return more detailed error information
      return NextResponse.json({ 
        error: 'Failed to create participants',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({ 
      participants,
      created: participants.length,
      message: `Successfully processed ${participants.length} participants`
    });

  } catch (error) {
    console.error('POST /api/participants error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// PUT method moved to /api/participants/[id]/route.ts for proper dynamic routing