import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';
import { createClient } from '@supabase/supabase-js';

// Types for request/response
interface CreateContactRequest {
  email: string;
  fullName: string;
  roleTitle?: string;
  companyName?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  source?: string;
  tags?: string[];
  metadata?: any;
}

interface ContactResponse {
  id: string;
  full_name: string;
  email: string;
  role_title?: string;
  company?: {
    id: string;
    name: string;
  };
  status: 'hot' | 'warm' | 'cold';
  score: number;
  created_at: string;
  updated_at: string;
}

// Upsert contact function - create or update existing contact
async function upsertContact(
  supabaseClient: any,
  organizationId: string,
  contactData: CreateContactRequest
): Promise<ContactResponse> {
  const {
    email,
    fullName,
    roleTitle,
    companyName,
    phone,
    location,
    linkedinUrl,
    avatarUrl,
    source = 'manual',
    tags = [],
    metadata = {}
  } = contactData;

  try {
    // First, handle company creation/lookup if provided
    let companyId = null;
    if (companyName) {
      const { data: existingCompany } = await supabaseClient
        .from('companies')
        .select('id')
        .eq('organization_id', organizationId)
        .ilike('name', companyName)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await supabaseClient
          .from('companies')
          .insert({
            organization_id: organizationId,
            name: companyName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (companyError) {
          console.error('Failed to create company:', companyError);
        } else {
          companyId = newCompany.id;
        }
      }
    }

    // Manual SELECT-then-INSERT/UPDATE approach to handle complex unique constraint
    // First, check if contact already exists (case-insensitive email matching)
    const { data: existingContact, error: selectError } = await supabaseClient
      .from('contacts')
      .select('id')
      .eq('organization_id', organizationId)
      .ilike('email', email.toLowerCase())
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected when contact doesn't exist
      throw new Error(`Failed to check existing contact: ${selectError.message}`);
    }

    const contactDataToUpsert = {
      organization_id: organizationId,
      company_id: companyId,
      full_name: fullName,
      email: email.toLowerCase(),
      phone: phone || null,
      role_title: roleTitle || null,
      location: location || null,
      avatar_url: avatarUrl || null,
      status: 'warm' as const, // Default status
      score: Math.floor(Math.random() * 100), // Random score for now
      source: source,
      tags: tags,
      social_profiles: linkedinUrl ? { linkedin: linkedinUrl } : null,
      metadata: metadata,
      updated_at: new Date().toISOString()
    };

    let contact;

    if (existingContact) {
      // UPDATE existing contact
      const { data: updatedContact, error: updateError } = await supabaseClient
        .from('contacts')
        .update(contactDataToUpsert)
        .eq('id', existingContact.id)
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
          source,
          tags,
          social_profiles,
          created_at,
          updated_at,
          company:companies(id, name, domain, industry_id)
        `)
        .single();

      if (updateError) {
        throw new Error(`Failed to update contact: ${updateError.message}`);
      }
      contact = updatedContact;
    } else {
      // INSERT new contact
      const contactDataToInsert = {
        ...contactDataToUpsert,
        created_at: new Date().toISOString()
      };

      const { data: newContact, error: insertError } = await supabaseClient
        .from('contacts')
        .insert(contactDataToInsert)
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
          source,
          tags,
          social_profiles,
          created_at,
          updated_at,
          company:companies(id, name, domain, industry_id)
        `)
        .single();

      if (insertError) {
        throw new Error(`Failed to insert contact: ${insertError.message}`);
      }
      contact = newContact;
    }

    return contact;
  } catch (error) {
    console.error('Error in upsertContact:', error);
    throw error;
  }
}

// POST - Create or update contact
export async function POST(request: NextRequest) {
  try {
    const body: CreateContactRequest = await request.json();
    
    // Validate required fields
    if (!body.email || !body.fullName) {
      return NextResponse.json(
        { error: 'Email and fullName are required' },
        { status: 400 }
      );
    }

    // Get authenticated user and organization
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

    // Set the session token
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

    // Create or update the contact
    const contact = await upsertContact(supabaseClient, userData.organization_id, body);

    return NextResponse.json({
      success: true,
      contact: contact,
      message: 'Contact created/updated successfully'
    });

  } catch (error) {
    console.error('Error in POST /api/contacts:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// GET - List contacts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const companyId = searchParams.get('companyId') || '';

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

    // Build query
    let query = supabaseClient
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
        social_profiles,
        last_activity_at,
        next_action_date,
        created_at,
        updated_at,
        meetings_count,
        last_meeting_date,
        company:companies(id, name, domain, industry_id, logo_url)
      `)
      .eq('organization_id', userData.organization_id)
      .order('updated_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (companyId) {
      query = query.eq('company_id', companyId);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data: contacts, error: contactsError } = await query;

    if (contactsError) {
      throw new Error(`Failed to fetch contacts: ${contactsError.message}`);
    }

    // Get total count for pagination
    const { count, error: countError } = await supabaseClient
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', userData.organization_id);

    if (countError) {
      console.error('Failed to get contacts count:', countError);
    }

    return NextResponse.json({
      success: true,
      contacts: contacts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/contacts:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}