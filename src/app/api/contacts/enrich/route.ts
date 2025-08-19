import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthContext } from '@/lib/userQueries';

interface EnrichContactRequest {
  email: string;
  linkedinUrl?: string;
  fullName?: string;
  companyName?: string;
  source?: 'linkedin' | 'clearbit' | 'apollo' | 'manual';
  participantId?: string; // If enriching from a participant
  additionalData?: {
    roleTitle?: string;
    phone?: string;
    location?: string;
    companyDomain?: string;
  };
}

interface N8nWebhookPayload {
  webhookUrl: string;
  contactEmail: string;
  linkedinUrl?: string;
  source: string;
  participantId?: string;
  organizationId: string;
  userId: string;
}

// POST - Trigger enrichment workflow in n8n
export async function POST(request: NextRequest) {
  try {
    const body: EnrichContactRequest = await request.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required for enrichment' },
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

    // Get user info
    const { data: { user }, error: userAuthError } = await supabaseClient.auth.getUser();
    if (userAuthError || !user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to get user organization' },
        { status: 403 }
      );
    }

    // Check if this contact already exists and is enriched
    const { data: existingContact } = await supabaseClient
      .from('contacts')
      .select('id, full_name, role_title, company_id, ai_insights')
      .eq('organization_id', userData.organization_id)
      .ilike('email', body.email)
      .single();

    // If contact exists and is already enriched, return early
    if (existingContact && existingContact.ai_insights) {
      return NextResponse.json({
        success: true,
        message: 'Contact is already enriched',
        contact: existingContact,
        skip_enrichment: true
      });
    }

    // Record the enrichment attempt in history
    let enrichmentHistoryId = null;
    if (body.participantId) {
      const { data: enrichmentHistory, error: historyError } = await supabaseClient
        .from('participant_enrichment_history')
        .insert({
          participant_id: body.participantId,
          organization_id: userData.organization_id,
          enrichment_type: 'api_lookup',
          enrichment_source: body.source || 'linkedin',
          status: 'pending',
          performed_by: user.id,
          performed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (historyError) {
        console.error('Failed to create enrichment history:', historyError);
      } else {
        enrichmentHistoryId = enrichmentHistory.id;
      }
    }

    // Prepare n8n webhook payload
    const n8nPayload: N8nWebhookPayload = {
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/api/webhooks/n8n`,
      contactEmail: body.email,
      linkedinUrl: body.linkedinUrl,
      source: body.source || 'linkedin',
      participantId: body.participantId,
      organizationId: userData.organization_id,
      userId: user.id
    };

    // Get n8n webhook URL from environment
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: 'N8N webhook URL not configured' },
        { status: 500 }
      );
    }

    // Trigger n8n workflow
    try {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'SalesAdvisor/1.0'
        },
        body: JSON.stringify({
          ...n8nPayload,
          enrichmentHistoryId,
          metadata: {
            fullName: body.fullName,
            companyName: body.companyName,
            additionalData: body.additionalData,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (!n8nResponse.ok) {
        throw new Error(`N8N workflow failed: ${n8nResponse.status} ${n8nResponse.statusText}`);
      }

      const n8nResult = await n8nResponse.json();

      // Update enrichment history with success
      if (enrichmentHistoryId) {
        await supabaseClient
          .from('participant_enrichment_history')
          .update({
            status: 'success',
            data_found: { n8n_response: n8nResult }
          })
          .eq('id', enrichmentHistoryId);
      }

      return NextResponse.json({
        success: true,
        message: 'Enrichment workflow triggered successfully',
        enrichment_id: enrichmentHistoryId,
        n8n_response: n8nResult
      });

    } catch (n8nError) {
      console.error('N8N workflow error:', n8nError);

      // Update enrichment history with failure
      if (enrichmentHistoryId) {
        await supabaseClient
          .from('participant_enrichment_history')
          .update({
            status: 'failed',
            data_found: { error: n8nError instanceof Error ? n8nError.message : 'Unknown error' }
          })
          .eq('id', enrichmentHistoryId);
      }

      return NextResponse.json(
        { 
          error: 'Failed to trigger enrichment workflow',
          details: n8nError instanceof Error ? n8nError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in POST /api/contacts/enrich:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET - Check enrichment status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const participantId = searchParams.get('participantId');
    const enrichmentId = searchParams.get('enrichmentId');

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

    if (enrichmentId) {
      // Get specific enrichment status
      const { data: enrichment, error: enrichmentError } = await supabaseClient
        .from('participant_enrichment_history')
        .select('*')
        .eq('id', enrichmentId)
        .eq('organization_id', userData.organization_id)
        .single();

      if (enrichmentError) {
        return NextResponse.json(
          { error: 'Enrichment record not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        enrichment: enrichment
      });
    }

    if (email || participantId) {
      // Get recent enrichment attempts for email or participant
      let query = supabaseClient
        .from('participant_enrichment_history')
        .select(`
          id,
          enrichment_type,
          enrichment_source,
          status,
          confidence_score,
          performed_at,
          data_found,
          matched_contact_id
        `)
        .eq('organization_id', userData.organization_id)
        .order('performed_at', { ascending: false })
        .limit(10);

      if (participantId) {
        query = query.eq('participant_id', participantId);
      }

      const { data: enrichments, error: enrichmentsError } = await query;

      if (enrichmentsError) {
        throw new Error(`Failed to fetch enrichment history: ${enrichmentsError.message}`);
      }

      return NextResponse.json({
        success: true,
        enrichments: enrichments || [],
        count: enrichments?.length || 0
      });
    }

    return NextResponse.json(
      { error: 'Email, participantId, or enrichmentId parameter required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in GET /api/contacts/enrich:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}