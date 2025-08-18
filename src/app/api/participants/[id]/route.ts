import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface UpdateParticipantRequest {
  contactId?: string;
  enrichmentStatus?: 'pending' | 'matched' | 'enriched' | 'unknown';
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
}

// PUT /api/participants/[id] - Update participant (link to contact)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const participantId = params.id;
    const body: UpdateParticipantRequest = await request.json();
    
    // Validate request
    if (!participantId) {
      return NextResponse.json(
        { error: 'Participant ID is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    await supabaseClient.auth.setSession({
      access_token: token,
      refresh_token: token
    });

    // Get user's organization
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('organization_id')
      .eq('id', (await supabaseClient.auth.getUser()).data.user?.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to get user organization' },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (body.contactId !== undefined) {
      updateData.contact_id = body.contactId;
    }

    if (body.enrichmentStatus !== undefined) {
      updateData.enrichment_status = body.enrichmentStatus;
    }

    if (body.responseStatus !== undefined) {
      updateData.response_status = body.responseStatus;
    }

    // Update participant
    const { data: participant, error: updateError } = await supabaseClient
      .from('meeting_participants')
      .update(updateData)
      .eq('id', participantId)
      .eq('organization_id', userData.organization_id)
      .select(`
        id,
        meeting_id,
        meeting_title,
        meeting_date_time,
        email,
        display_name,
        response_status,
        is_organizer,
        is_optional,
        meeting_platform,
        contact_id,
        enrichment_status,
        enrichment_source,
        auto_match_confidence,
        created_at,
        updated_at,
        last_seen_in_meeting,
        contact:contacts(
          id,
          full_name,
          email,
          role_title,
          avatar_url,
          status,
          score,
          probability,
          deal_value,
          pipeline_stage,
          social_profiles,
          ai_insights,
          company:companies(id, name, logo_url, domain)
        )
      `)
      .single();

    if (updateError) {
      throw new Error(`Failed to update participant: ${updateError.message}`);
    }

    if (!participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // If linking to a contact, also update enrichment history
    if (body.contactId && body.enrichmentStatus === 'matched') {
      await supabaseClient
        .from('participant_enrichment_history')
        .insert({
          participant_id: participantId,
          organization_id: userData.organization_id,
          enrichment_type: 'manual_link',
          enrichment_source: 'manual',
          status: 'success',
          confidence_score: 1.0,
          matched_contact_id: body.contactId,
          performed_at: new Date().toISOString(),
          cost_cents: 0
        });
    }

    return NextResponse.json({
      success: true,
      participant: participant
    });

  } catch (error) {
    console.error('Error in PUT /api/participants/[id]:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}