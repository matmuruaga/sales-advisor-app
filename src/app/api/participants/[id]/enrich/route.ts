import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const EnrichRequestSchema = z.object({
  source: z.enum(['clearbit', 'apollo', 'linkedin', 'manual']).default('manual'),
  contactData: z.object({
    fullName: z.string(),
    email: z.string().email(),
    roleTitle: z.string().optional(),
    companyName: z.string().optional(),
    location: z.string().optional(),
    phone: z.string().optional(),
    linkedinUrl: z.string().url().optional(),
    avatarUrl: z.string().url().optional()
  }).optional()
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

// POST /api/participants/[id]/enrich - Enrich participant and create contact
export async function POST(request: NextRequest) {
  try {
    const { supabase, user, organizationId } = await getAuthenticatedSupabase(request);
    
    const url = new URL(request.url);
    const participantId = url.pathname.split('/')[2]; // Extract ID from /participants/[id]/enrich
    
    if (!participantId) {
      return NextResponse.json({ error: 'Participant ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { source, contactData } = EnrichRequestSchema.parse(body);

    // Get the participant to enrich
    const { data: participant, error: participantError } = await supabase
      .from('meeting_participants')
      .select('*')
      .eq('id', participantId)
      .eq('organization_id', organizationId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }

    let enrichedData = contactData;
    let confidenceScore = 1.00;
    let enrichmentCost = 0;

    // If no manual data provided, attempt API enrichment
    if (!contactData && source !== 'manual') {
      // TODO: Implement actual API enrichment based on source
      switch (source) {
        case 'clearbit':
          enrichedData = await enrichWithClearbit(participant.email);
          enrichmentCost = 100; // 1 cent
          break;
        case 'apollo':
          enrichedData = await enrichWithApollo(participant.email);
          enrichmentCost = 50; // 0.5 cents
          break;
        case 'linkedin':
          enrichedData = await enrichWithLinkedIn(participant.email);
          enrichmentCost = 200; // 2 cents
          break;
        default:
          enrichedData = {
            fullName: participant.display_name || '',
            email: participant.email
          };
      }
      confidenceScore = 0.85; // API enrichment is good but not perfect
    }

    if (!enrichedData) {
      return NextResponse.json({ 
        error: 'No enrichment data available',
        details: `Failed to enrich participant from ${source}`
      }, { status: 400 });
    }

    // Check if company exists or create it
    let companyId = null;
    if (enrichedData.companyName) {
      // Try to find existing company
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('organization_id', organizationId)
        .ilike('name', enrichedData.companyName)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            organization_id: organizationId,
            name: enrichedData.companyName,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (!companyError && newCompany) {
          companyId = newCompany.id;
        }
      }
    }

    // Create the contact
    const contactInsertData = {
      organization_id: organizationId,
      company_id: companyId,
      full_name: enrichedData.fullName,
      email: enrichedData.email,
      phone: enrichedData.phone,
      role_title: enrichedData.roleTitle,
      location: enrichedData.location,
      avatar_url: enrichedData.avatarUrl,
      status: 'warm' as const, // Default status for new contacts from meetings
      score: 65, // Default score
      source: `participant_enrichment_${source}`,
      social_profiles: enrichedData.linkedinUrl ? { linkedin: enrichedData.linkedinUrl } : null,
      created_at: new Date().toISOString()
    };

    const { data: newContact, error: contactError } = await supabase
      .from('contacts')
      .insert(contactInsertData)
      .select(`
        *,
        company:companies(id, name, industry_id, employee_count, logo_url)
      `)
      .single();

    if (contactError) {
      console.error('Error creating contact:', contactError);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    // Update participant to link with the new contact
    const { error: updateError } = await supabase
      .from('meeting_participants')
      .update({
        contact_id: newContact.id,
        enrichment_status: 'enriched',
        enrichment_source: source,
        auto_match_confidence: confidenceScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', participantId);

    if (updateError) {
      console.error('Error updating participant:', updateError);
      // Don't fail the whole operation, just log it
    }

    // Log the enrichment history
    await supabase
      .from('participant_enrichment_history')
      .insert({
        participant_id: participantId,
        organization_id: organizationId,
        enrichment_type: 'api_lookup',
        enrichment_source: source,
        status: 'success',
        confidence_score: confidenceScore,
        data_found: enrichedData,
        matched_contact_id: newContact.id,
        performed_by: user.id,
        cost_cents: enrichmentCost
      });

    return NextResponse.json({
      contact: newContact,
      enrichmentSource: source,
      confidenceScore,
      cost: enrichmentCost,
      message: 'Participant successfully enriched and added to contacts'
    });

  } catch (error) {
    console.error('POST /api/participants/[id]/enrich error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}

// Mock enrichment functions - replace with actual API calls
async function enrichWithClearbit(email: string) {
  // Mock implementation - replace with actual Clearbit API call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
  
  // This would be replaced with actual Clearbit API response
  return {
    fullName: 'John Doe',
    email,
    roleTitle: 'Senior Developer',
    companyName: 'Tech Corp',
    location: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/johndoe'
  };
}

async function enrichWithApollo(email: string) {
  // Mock implementation - replace with actual Apollo API call
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return {
    fullName: 'Jane Smith',
    email,
    roleTitle: 'Product Manager',
    companyName: 'Startup Inc',
    location: 'New York, NY',
    phone: '+1-555-0123'
  };
}

async function enrichWithLinkedIn(email: string) {
  // Mock implementation - replace with actual LinkedIn API call
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  return {
    fullName: 'Mike Johnson',
    email,
    roleTitle: 'VP of Sales',
    companyName: 'Enterprise Solutions',
    location: 'Chicago, IL',
    linkedinUrl: 'https://linkedin.com/in/mikejohnson',
    avatarUrl: 'https://example.com/avatar.jpg'
  };
}