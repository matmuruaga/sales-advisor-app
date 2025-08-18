import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface N8nEnrichedData {
  email: string;
  fullName?: string;
  roleTitle?: string;
  companyName?: string;
  companyDomain?: string;
  location?: string;
  phone?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  avatarUrl?: string;
  
  // Company data
  companySize?: string;
  companyIndustry?: string;
  companyDescription?: string;
  companyLogo?: string;
  companyWebsite?: string;
  companyLinkedin?: string;
  companyFunding?: string;
  companyTechnologies?: string[];
  
  // Enriched insights
  profileSummary?: string;
  interests?: string[];
  skills?: string[];
  experience?: any[];
  recentActivity?: any[];
  mutualConnections?: any[];
  
  // Metadata
  enrichmentSource: 'linkedin' | 'clearbit' | 'apollo' | 'hunter';
  enrichmentConfidence: number; // 0-1
  dataQuality: 'high' | 'medium' | 'low';
  lastUpdated: string;
  
  // Context
  participantId?: string;
  organizationId: string;
  userId: string;
  enrichmentHistoryId?: string;
}

interface N8nWebhookRequest {
  success: boolean;
  data?: N8nEnrichedData;
  error?: string;
  source: string;
  processingTimeMs?: number;
  apiCallsCost?: number; // in cents
  metadata?: any;
}

// Create Supabase admin client for webhooks
function createAdminSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Admin key for webhooks
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}

// POST - Receive enriched data from n8n workflow
export async function POST(request: NextRequest) {
  try {
    // Verify webhook authenticity (optional but recommended)
    const webhookSecret = request.headers.get('x-webhook-secret');
    const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
    
    if (expectedSecret && webhookSecret !== expectedSecret) {
      console.warn('Unauthorized webhook attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: N8nWebhookRequest = await request.json();
    
    if (!body.success && body.error) {
      console.error('N8N workflow failed:', body.error);
      return await handleEnrichmentFailure(body);
    }

    if (!body.data) {
      return NextResponse.json(
        { error: 'No enrichment data provided' },
        { status: 400 }
      );
    }

    const enrichedData = body.data;
    
    // Validate required fields
    if (!enrichedData.email || !enrichedData.organizationId) {
      return NextResponse.json(
        { error: 'Missing required fields: email, organizationId' },
        { status: 400 }
      );
    }

    const supabaseClient = createAdminSupabaseClient();

    console.log(`🔍 Processing enriched data for ${enrichedData.email}`);

    // Process the enriched data
    const result = await processEnrichedContact(supabaseClient, enrichedData, body);

    return NextResponse.json({
      success: true,
      message: 'Enriched data processed successfully',
      result: {
        contact_id: result.contactId,
        participant_updated: result.participantUpdated,
        company_created: result.companyCreated
      }
    });

  } catch (error) {
    console.error('Error in POST /api/webhooks/n8n:', error);
    
    // Try to update enrichment history with failure
    try {
      const body: N8nWebhookRequest = await request.json();
      if (body.data?.enrichmentHistoryId) {
        const supabaseClient = createAdminSupabaseClient();
        await supabaseClient
          .from('participant_enrichment_history')
          .update({
            status: 'failed',
            data_found: {
              error: error instanceof Error ? error.message : 'Processing failed',
              timestamp: new Date().toISOString()
            }
          })
          .eq('id', body.data.enrichmentHistoryId);
      }
    } catch (updateError) {
      console.error('Failed to update enrichment history:', updateError);
    }

    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

async function handleEnrichmentFailure(body: N8nWebhookRequest): Promise<NextResponse> {
  try {
    const supabaseClient = createAdminSupabaseClient();

    if (body.data?.enrichmentHistoryId) {
      await supabaseClient
        .from('participant_enrichment_history')
        .update({
          status: 'failed',
          data_found: {
            error: body.error,
            metadata: body.metadata,
            timestamp: new Date().toISOString()
          },
          cost_cents: body.apiCallsCost || 0
        })
        .eq('id', body.data.enrichmentHistoryId);
    }

    return NextResponse.json({
      success: false,
      message: 'Enrichment failed',
      error: body.error
    });
  } catch (error) {
    console.error('Error handling enrichment failure:', error);
    return NextResponse.json(
      { error: 'Failed to process enrichment failure' },
      { status: 500 }
    );
  }
}

async function processEnrichedContact(
  supabaseClient: any,
  enrichedData: N8nEnrichedData,
  webhookBody: N8nWebhookRequest
): Promise<{
  contactId: string;
  participantUpdated: boolean;
  companyCreated: boolean;
}> {
  const {
    email,
    fullName,
    roleTitle,
    companyName,
    companyDomain,
    location,
    phone,
    linkedinUrl,
    twitterUrl,
    avatarUrl,
    companySize,
    companyIndustry,
    companyDescription,
    companyLogo,
    companyWebsite,
    companyLinkedin,
    companyTechnologies,
    profileSummary,
    interests,
    skills,
    experience,
    recentActivity,
    organizationId,
    participantId,
    enrichmentHistoryId,
    enrichmentSource,
    enrichmentConfidence,
    dataQuality
  } = enrichedData;

  let companyId = null;
  let companyCreated = false;

  // Handle company creation/update if company data is available
  if (companyName) {
    try {
      // Try to find existing company by name or domain
      const { data: existingCompany } = await supabaseClient
        .from('companies')
        .select('id')
        .eq('organization_id', organizationId)
        .or(`name.ilike.${companyName}${companyDomain ? `,domain.ilike.${companyDomain}` : ''}`)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
        
        // Update existing company with new data
        await supabaseClient
          .from('companies')
          .update({
            domain: companyDomain || undefined,
            industry_id: companyIndustry || undefined,
            employee_count: companySize || undefined,
            description: companyDescription || undefined,
            logo_url: companyLogo || undefined,
            website: companyWebsite || undefined,
            linkedin_url: companyLinkedin || undefined,
            technologies: companyTechnologies || undefined,
            updated_at: new Date().toISOString()
          })
          .eq('id', companyId);
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await supabaseClient
          .from('companies')
          .insert({
            organization_id: organizationId,
            name: companyName,
            domain: companyDomain,
            industry_id: companyIndustry,
            employee_count: companySize,
            description: companyDescription,
            logo_url: companyLogo,
            website: companyWebsite,
            linkedin_url: companyLinkedin,
            technologies: companyTechnologies,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (companyError) {
          console.error('Failed to create company:', companyError);
        } else {
          companyId = newCompany.id;
          companyCreated = true;
        }
      }
    } catch (error) {
      console.error('Error handling company data:', error);
    }
  }

  // Prepare AI insights from enriched data
  const aiInsights = {
    profile_summary: profileSummary,
    enrichment_source: enrichmentSource,
    data_quality: dataQuality,
    confidence_score: enrichmentConfidence,
    skills: skills,
    experience: experience,
    recent_activity: recentActivity,
    enriched_at: new Date().toISOString(),
    interests_analyzed: interests,
    linkedin_profile_analyzed: !!linkedinUrl
  };

  // Create or update contact
  const contactData = {
    organization_id: organizationId,
    company_id: companyId,
    full_name: fullName || email.split('@')[0],
    email: email.toLowerCase(),
    role_title: roleTitle,
    location: location,
    phone: phone,
    avatar_url: avatarUrl,
    status: 'warm' as const, // Enriched contacts are warm by default
    score: Math.min(100, Math.floor(enrichmentConfidence * 100)), // Convert confidence to score
    source: enrichmentSource,
    interests: interests,
    social_profiles: {
      linkedin: linkedinUrl,
      twitter: twitterUrl
    },
    professional_background: {
      skills: skills,
      experience: experience,
      profile_summary: profileSummary
    },
    ai_insights: aiInsights,
    last_activity_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Upsert contact
  const { data: contact, error: contactError } = await supabaseClient
    .from('contacts')
    .upsert(contactData, {
      onConflict: 'organization_id,email',
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (contactError) {
    throw new Error(`Failed to upsert contact: ${contactError.message}`);
  }

  const contactId = contact.id;

  // Update participant if participantId is provided
  let participantUpdated = false;
  if (participantId) {
    const { error: participantError } = await supabaseClient
      .from('meeting_participants')
      .update({
        contact_id: contactId,
        enrichment_status: 'enriched',
        enrichment_source: enrichmentSource,
        auto_match_confidence: enrichmentConfidence,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId)
      .eq('organization_id', organizationId);

    if (participantError) {
      console.error('Failed to update participant:', participantError);
    } else {
      participantUpdated = true;
    }
  }

  // Update enrichment history
  if (enrichmentHistoryId) {
    await supabaseClient
      .from('participant_enrichment_history')
      .update({
        status: 'success',
        confidence_score: enrichmentConfidence,
        matched_contact_id: contactId,
        data_found: {
          enriched_data: enrichedData,
          processing_time_ms: webhookBody.processingTimeMs,
          data_quality: dataQuality,
          timestamp: new Date().toISOString()
        },
        cost_cents: webhookBody.apiCallsCost || 0
      })
      .eq('id', enrichmentHistoryId);
  }

  console.log(`✅ Successfully processed enriched contact: ${email} -> ${contactId}`);

  return {
    contactId,
    participantUpdated,
    companyCreated
  };
}

// GET - Health check for webhook endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'N8N webhook endpoint is active',
    timestamp: new Date().toISOString()
  });
}