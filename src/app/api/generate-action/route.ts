import { NextRequest, NextResponse } from 'next/server';
import { generateActionWithClaude, ActionContext, Contact } from '@/lib/anthropic';
import { selectPromptTemplate, resolveVariables } from '@/lib/promptTemplates';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userPrompt, userId, mentions = [], contacts = [], templates = [] } = body;

    // Validate required fields
    if (!userPrompt || typeof userPrompt !== 'string') {
      return NextResponse.json(
        { error: 'User prompt is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required and must be a string' },
        { status: 400 }
      );
    }

    // Validate API key exists
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    // Resolve variables in the prompt
    const resolvedVariables = resolveVariables(userPrompt);

    // Get additional contact context from Supabase if mentions include contact IDs
    let enrichedContacts: Contact[] = [...contacts];
    
    if (mentions.length > 0) {
      const contactIds = mentions
        .filter(m => m.type === 'contact' && m.id)
        .map(m => m.id);

      if (contactIds.length > 0) {
        const { data: contactsData, error } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email, company, title, notes')
          .in('id', contactIds);

        if (!error && contactsData) {
          const supabaseContacts: Contact[] = contactsData.map(c => ({
            id: c.id,
            name: `${c.first_name} ${c.last_name}`.trim(),
            email: c.email || '',
            company: c.company || undefined,
            role: c.title || undefined,
            notes: c.notes || undefined
          }));
          
          enrichedContacts = [...enrichedContacts, ...supabaseContacts];
        }
      }
    }

    // Build context for Claude
    const context: ActionContext = {
      userPrompt,
      mentions,
      variables: resolvedVariables,
      contacts: enrichedContacts,
      templates
    };

    // Select appropriate prompt template
    const template = selectPromptTemplate(userPrompt);

    // Generate action with Claude
    const response = await generateActionWithClaude(context, userId);

    // Save the generated action to Supabase
    const actionToSave = {
      ...response.action,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'pending',
      // Map our structure to the expected Supabase schema
      action_type: response.action.type,
      due_date: response.action.dueDate || null,
      assigned_to: response.action.assignedTo || null,
      // Store additional AI metadata
      ai_metadata: {
        ...response.action.metadata,
        reasoning: response.reasoning,
        template_used: template.name,
        resolved_variables: resolvedVariables,
        mentions: mentions
      }
    };

    const { data: savedAction, error: saveError } = await supabase
      .from('actions')
      .insert([actionToSave])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving action to Supabase:', saveError);
      // Still return the generated action even if saving fails
      return NextResponse.json({
        success: true,
        action: response.action,
        reasoning: response.reasoning,
        warning: 'Action generated but not saved to database'
      });
    }

    // Return successful response with saved action
    return NextResponse.json({
      success: true,
      action: {
        ...response.action,
        id: savedAction.id,
        status: 'pending',
        created_at: savedAction.created_at
      },
      reasoning: response.reasoning,
      templateUsed: template.name,
      resolvedVariables: resolvedVariables
    });

  } catch (error) {
    console.error('Error in /api/generate-action:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please wait before making another request.' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid or missing Anthropic API key' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'API quota exceeded' },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred while generating the action' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS if needed
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET endpoint for testing API availability
export async function GET() {
  return NextResponse.json({
    message: 'Generate Action API is available',
    version: '1.0',
    status: 'ready',
    anthropicConfigured: !!process.env.ANTHROPIC_API_KEY,
    supabaseConfigured: !!process.env.NEXT_PUBLIC_SUPABASE_URL
  });
}