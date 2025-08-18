import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

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

  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new Error('Authentication failed');
  }

  // Get user's organization
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (userError || !userData) {
    throw new Error('User organization not found');
  }

  return { supabase, user, organizationId: userData.organization_id };
}

// GET /api/participants - List participants with optional filters
export async function GET(request: NextRequest) {
  try {
    const { supabase, organizationId } = await getAuthenticatedSupabase(request);
    
    const searchParams = request.nextUrl.searchParams;
    const queryParams = ParticipantQuerySchema.parse({
      meetingId: searchParams.get('meetingId'),
      email: searchParams.get('email'),
      contactId: searchParams.get('contactId'),
      enrichmentStatus: searchParams.get('enrichmentStatus'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset')
    });

    let query = supabase
      .from('meeting_participants')
      .select(`
        *,
        contact:contacts(
          id, full_name, email, role_title, company_id, status, score, avatar_url,
          company:companies(id, name, industry_id, employee_count, logo_url)
        ),
        enrichment_history:participant_enrichment_history(
          id, enrichment_type, status, confidence_score, performed_at
        )
      `)
      .eq('organization_id', organizationId)
      .order('meeting_date_time', { ascending: false })
      .range(queryParams.offset, queryParams.offset + queryParams.limit - 1);

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
    
    // Handle both single participant and bulk creation
    const participantsData = Array.isArray(body) ? body : [body];
    
    const validatedParticipants = participantsData.map(p => 
      ParticipantCreateSchema.parse(p)
    );

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

    // Use upsert to handle duplicate meeting_id + email combinations
    const { data: participants, error } = await supabase
      .from('meeting_participants')
      .upsert(participantsToInsert, { 
        onConflict: 'meeting_id,email',
        ignoreDuplicates: false 
      })
      .select(`
        *,
        contact:contacts(
          id, full_name, email, role_title, company_id, status, score, avatar_url
        )
      `);

    if (error) {
      console.error('Error creating participants:', error);
      return NextResponse.json({ error: 'Failed to create participants' }, { status: 500 });
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

// PUT /api/participants/[id] - Update participant (link to contact, change status)
export async function PUT(request: NextRequest) {
  try {
    const { supabase, organizationId } = await getAuthenticatedSupabase(request);
    
    const url = new URL(request.url);
    const participantId = url.pathname.split('/').pop();
    
    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID required' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = ParticipantUpdateSchema.parse(body);

    const { data: participant, error } = await supabase
      .from('meeting_participants')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId)
      .eq('organization_id', organizationId)
      .select(`
        *,
        contact:contacts(
          id, full_name, email, role_title, company_id, status, score, avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating participant:', error);
      return NextResponse.json({ error: 'Failed to update participant' }, { status: 500 });
    }

    // If linking to a contact, log the enrichment
    if (updateData.contactId) {
      await supabase
        .from('participant_enrichment_history')
        .insert({
          participant_id: participantId,
          organization_id: organizationId,
          enrichment_type: 'contact_match',
          enrichment_source: 'manual',
          status: 'success',
          confidence_score: 1.00,
          matched_contact_id: updateData.contactId
        });
    }

    return NextResponse.json({ participant });

  } catch (error) {
    console.error('PUT /api/participants error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}