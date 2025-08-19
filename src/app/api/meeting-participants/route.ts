import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthContext } from '@/lib/userQueries';

interface ParticipantData {
  meetingId: string;
  meetingTitle?: string;
  meetingDateTime: string;
  email: string;
  displayName?: string;
  responseStatus?: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  isOrganizer?: boolean;
  isOptional?: boolean;
  platform?: string;
}

interface BulkImportRequest {
  participants: ParticipantData[];
  source?: string;
  autoMatch?: boolean;
}

interface ParticipantResponse {
  id: string;
  email: string;
  displayName?: string;
  enrichmentStatus: string;
  contactId?: string;
  contact?: any;
}

// Helper function to auto-match participants with existing contacts
async function autoMatchParticipants(
  supabaseClient: any,
  organizationId: string,
  participants: any[]
): Promise<any[]> {
  const matchedParticipants = [];

  for (const participant of participants) {
    let matchedContact = null;
    let confidence = 0;

    try {
      // Try exact email match first
      const { data: exactMatch } = await supabaseClient
        .from('contacts')
        .select('id, full_name, email, role_title, company_id')
        .eq('organization_id', organizationId)
        .ilike('email', participant.email)
        .single();

      if (exactMatch) {
        matchedContact = exactMatch;
        confidence = 1.0;
      } else if (participant.displayName) {
        // Try fuzzy matching on name + domain
        const domain = participant.email.split('@')[1];
        const { data: fuzzyMatches } = await supabaseClient
          .from('contacts')
          .select('id, full_name, email, role_title, company_id')
          .eq('organization_id', organizationId)
          .like('email', `%@${domain}`)
          .limit(5);

        if (fuzzyMatches && fuzzyMatches.length > 0) {
          // Simple name similarity check
          for (const contact of fuzzyMatches) {
            if (contact.full_name) {
              const nameSimilarity = calculateStringSimilarity(
                participant.displayName.toLowerCase(),
                contact.full_name.toLowerCase()
              );
              
              if (nameSimilarity > 0.7 && nameSimilarity > confidence) {
                matchedContact = contact;
                confidence = nameSimilarity * 0.8; // Reduce confidence for fuzzy matches
              }
            }
          }
        }
      }

      matchedParticipants.push({
        ...participant,
        contact_id: matchedContact?.id || null,
        enrichment_status: matchedContact ? 'matched' : 'pending',
        auto_match_confidence: confidence > 0 ? confidence : null,
        matched_contact: matchedContact
      });

    } catch (error) {
      console.error('Auto-match error for', participant.email, error);
      matchedParticipants.push({
        ...participant,
        contact_id: null,
        enrichment_status: 'pending',
        auto_match_confidence: null
      });
    }
  }

  return matchedParticipants;
}

// Simple string similarity calculation (Jaccard similarity)
function calculateStringSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.split(' '));
  const set2 = new Set(str2.split(' '));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

// POST - Bulk import participants from calendar events
export async function POST(request: NextRequest) {
  try {
    const body: BulkImportRequest = await request.json();
    
    // Validate request
    if (!body.participants || !Array.isArray(body.participants) || body.participants.length === 0) {
      return NextResponse.json(
        { error: 'Participants array is required and must not be empty' },
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

    // RLS-READY: Get user's organization using helper
    let userData;
    try {
      const authContext = await getAuthContext(supabaseClient);
      userData = { organization_id: authContext.organizationId };
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to get user organization' },
        { status: 403 }
      );
    }

    // Prepare participants data
    const participantsToProcess = body.participants.map(p => ({
      organization_id: userData.organization_id,
      meeting_id: p.meetingId,
      meeting_title: p.meetingTitle || 'Untitled Meeting',
      meeting_date_time: new Date(p.meetingDateTime).toISOString(),
      email: p.email.toLowerCase(),
      display_name: p.displayName || p.email.split('@')[0],
      response_status: p.responseStatus || 'needsAction',
      is_organizer: p.isOrganizer || false,
      is_optional: p.isOptional || false,
      meeting_platform: p.platform || 'google-meet',
      enrichment_status: 'pending',
      enrichment_source: null,
      auto_match_confidence: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_seen_in_meeting: new Date().toISOString()
    }));

    // Auto-match participants with existing contacts if enabled
    let processedParticipants = participantsToProcess;
    if (body.autoMatch !== false) { // Default is true
      processedParticipants = await autoMatchParticipants(
        supabaseClient,
        userData.organization_id,
        participantsToProcess
      );
    }

    // Batch insert participants with upsert to handle duplicates
    const { data: insertedParticipants, error: insertError } = await supabaseClient
      .from('meeting_participants')
      .upsert(processedParticipants, {
        onConflict: 'meeting_id,email',
        ignoreDuplicates: false
      })
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
        auto_match_confidence,
        created_at,
        updated_at
      `);

    if (insertError) {
      throw new Error(`Failed to insert participants: ${insertError.message}`);
    }

    // Get statistics
    const totalParticipants = insertedParticipants?.length || 0;
    const matchedParticipants = insertedParticipants?.filter(p => p.contact_id).length || 0;
    const unknownParticipants = totalParticipants - matchedParticipants;

    // Create meeting summaries for unique meetings
    const uniqueMeetings = new Map();
    processedParticipants.forEach(p => {
      if (!uniqueMeetings.has(p.meeting_id)) {
        uniqueMeetings.set(p.meeting_id, {
          organization_id: userData.organization_id,
          meeting_id: p.meeting_id,
          title: p.meeting_title,
          date_time: p.meeting_date_time,
          platform: p.meeting_platform,
          total_participants: 0,
          known_contacts: 0,
          unknown_participants: 0,
          external_participants: 0,
          acceptance_rate: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
      const meeting = uniqueMeetings.get(p.meeting_id);
      meeting.total_participants++;
      
      if (p.contact_id) {
        meeting.known_contacts++;
      } else {
        meeting.unknown_participants++;
      }
      
      // Count external participants (different domain from organization)
      // This would need organization domain lookup, simplified for now
      if (!p.email.includes('company.com')) { // Placeholder logic
        meeting.external_participants++;
      }
    });

    // Insert meeting summaries
    const meetingSummaries = Array.from(uniqueMeetings.values());
    if (meetingSummaries.length > 0) {
      await supabaseClient
        .from('meeting_summaries')
        .upsert(meetingSummaries, {
          onConflict: 'meeting_id',
          ignoreDuplicates: false
        });
    }

    // Log enrichment history for auto-matched participants
    const enrichmentHistoryEntries = processedParticipants
      .filter(p => p.contact_id && p.auto_match_confidence)
      .map(p => ({
        participant_id: insertedParticipants?.find(ip => ip.email === p.email)?.id,
        organization_id: userData.organization_id,
        enrichment_type: 'contact_match',
        enrichment_source: 'auto',
        status: 'success',
        confidence_score: p.auto_match_confidence,
        matched_contact_id: p.contact_id,
        performed_at: new Date().toISOString(),
        cost_cents: 0
      }));

    if (enrichmentHistoryEntries.length > 0) {
      await supabaseClient
        .from('participant_enrichment_history')
        .insert(enrichmentHistoryEntries.filter(e => e.participant_id));
    }

    return NextResponse.json({
      success: true,
      message: 'Participants imported successfully',
      results: {
        total_imported: totalParticipants,
        matched_contacts: matchedParticipants,
        unknown_participants: unknownParticipants,
        meetings_processed: meetingSummaries.length,
        auto_match_enabled: body.autoMatch !== false
      },
      participants: insertedParticipants?.map((p): ParticipantResponse => ({
        id: p.id,
        email: p.email,
        displayName: p.display_name,
        enrichmentStatus: p.enrichment_status,
        contactId: p.contact_id,
        contact: processedParticipants.find(pp => pp.email === p.email)?.matched_contact
      })) || []
    });

  } catch (error) {
    console.error('Error in POST /api/meeting-participants:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Get participants with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');
    const email = searchParams.get('email');
    const enrichmentStatus = searchParams.get('enrichmentStatus');
    const contactId = searchParams.get('contactId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

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

    // RLS-READY: Get user's organization using helper
    let userData;
    try {
      const authContext = await getAuthContext(supabaseClient);
      userData = { organization_id: authContext.organizationId };
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to get user organization' },
        { status: 403 }
      );
    }

    // Build query
    let query = supabaseClient
      .from('meeting_participants')
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
      .eq('organization_id', userData.organization_id)
      .order('meeting_date_time', { ascending: false });

    // Apply filters
    if (meetingId) {
      query = query.eq('meeting_id', meetingId);
    }

    if (email) {
      query = query.ilike('email', email);
    }

    if (enrichmentStatus) {
      query = query.eq('enrichment_status', enrichmentStatus);
    }

    if (contactId) {
      query = query.eq('contact_id', contactId);
    }

    if (dateFrom) {
      query = query.gte('meeting_date_time', dateFrom);
    }

    if (dateTo) {
      query = query.lte('meeting_date_time', dateTo);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: participants, error: participantsError } = await query;

    if (participantsError) {
      throw new Error(`Failed to fetch participants: ${participantsError.message}`);
    }

    // Get statistics
    const { data: stats } = await supabaseClient
      .from('meeting_participants')
      .select('enrichment_status')
      .eq('organization_id', userData.organization_id);

    const statistics = {
      total: stats?.length || 0,
      matched: stats?.filter(s => s.enrichment_status === 'matched').length || 0,
      enriched: stats?.filter(s => s.enrichment_status === 'enriched').length || 0,
      pending: stats?.filter(s => s.enrichment_status === 'pending').length || 0,
      unknown: stats?.filter(s => s.enrichment_status === 'unknown').length || 0
    };

    return NextResponse.json({
      success: true,
      participants: participants || [],
      stats: statistics,
      pagination: {
        page,
        limit,
        total: statistics.total,
        totalPages: Math.ceil(statistics.total / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/meeting-participants:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}