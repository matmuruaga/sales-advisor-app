import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuthContext } from '@/lib/userQueries';

interface RouteContext {
  params: {
    email: string;
  };
}

// GET - Get contact by email
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { email } = params;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    // Decode the email parameter (in case it's URL encoded)
    const decodedEmail = decodeURIComponent(email);

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

    // Find contact by email
    const { data: contact, error: contactError } = await supabaseClient
      .from('contacts')
      .select(`
        id,
        full_name,
        email,
        role_title,
        phone,
        location,
        avatar_url,
        status,
        score,
        probability,
        deal_value,
        pipeline_stage,
        source,
        tags,
        interests,
        social_profiles,
        recent_posts,
        recent_comments,
        sentiment_analysis,
        personality_insights,
        professional_background,
        buying_behavior,
        engagement_metrics,
        ai_insights,
        last_activity_at,
        last_contact_at,
        next_action_date,
        next_action_description,
        notes_count,
        activities_count,
        meetings_count,
        last_meeting_date,
        first_meeting_date,
        created_at,
        updated_at,
        company:companies(
          id,
          name,
          domain,
          industry_id,
          employee_count,
          revenue_range,
          location,
          logo_url,
          description,
          website,
          linkedin_url,
          technologies,
          funding_stage
        )
      `)
      .eq('organization_id', userData.organization_id)
      .ilike('email', decodedEmail)
      .single();

    if (contactError) {
      if (contactError.code === 'PGRST116') {
        // No contact found
        return NextResponse.json(
          { 
            success: false,
            contact: null,
            message: 'Contact not found'
          },
          { status: 404 }
        );
      }
      
      throw new Error(`Failed to fetch contact: ${contactError.message}`);
    }

    // Get recent meeting participants for this contact
    const { data: recentMeetings } = await supabaseClient
      .from('meeting_participants')
      .select(`
        meeting_id,
        meeting_title,
        meeting_date_time,
        response_status,
        is_organizer
      `)
      .eq('organization_id', userData.organization_id)
      .eq('contact_id', contact.id)
      .order('meeting_date_time', { ascending: false })
      .limit(10);

    // Get enrichment history for this contact
    const { data: enrichmentHistory } = await supabaseClient
      .from('participant_enrichment_history')
      .select(`
        id,
        enrichment_type,
        enrichment_source,
        status,
        confidence_score,
        performed_at,
        cost_cents
      `)
      .eq('organization_id', userData.organization_id)
      .eq('matched_contact_id', contact.id)
      .order('performed_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      contact: {
        ...contact,
        recent_meetings: recentMeetings || [],
        enrichment_history: enrichmentHistory || []
      }
    });

  } catch (error) {
    console.error('Error in GET /api/contacts/[email]:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// PUT - Update contact by email
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const { email } = params;
    const body = await request.json();
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const decodedEmail = decodeURIComponent(email);

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

    // Prepare update data
    const updateData = {
      ...body,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.organization_id;
    delete updateData.created_at;
    delete updateData.company; // Company updates should go through separate endpoint

    // Update contact
    const { data: contact, error: updateError } = await supabaseClient
      .from('contacts')
      .update(updateData)
      .eq('organization_id', userData.organization_id)
      .ilike('email', decodedEmail)
      .select(`
        id,
        full_name,
        email,
        role_title,
        phone,
        location,
        avatar_url,
        status,
        score,
        probability,
        deal_value,
        pipeline_stage,
        source,
        tags,
        social_profiles,
        ai_insights,
        last_activity_at,
        next_action_date,
        created_at,
        updated_at,
        company:companies(id, name, domain, logo_url)
      `)
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`Failed to update contact: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      contact: contact,
      message: 'Contact updated successfully'
    });

  } catch (error) {
    console.error('Error in PUT /api/contacts/[email]:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete contact by email
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const { email } = params;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    const decodedEmail = decodeURIComponent(email);

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

    // Delete contact (this will cascade to meeting_participants via ON DELETE SET NULL)
    const { data: deletedContact, error: deleteError } = await supabaseClient
      .from('contacts')
      .delete()
      .eq('organization_id', userData.organization_id)
      .ilike('email', decodedEmail)
      .select('id, full_name, email')
      .single();

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Contact not found' },
          { status: 404 }
        );
      }
      
      throw new Error(`Failed to delete contact: ${deleteError.message}`);
    }

    return NextResponse.json({
      success: true,
      deleted_contact: deletedContact,
      message: 'Contact deleted successfully'
    });

  } catch (error) {
    console.error('Error in DELETE /api/contacts/[email]:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}