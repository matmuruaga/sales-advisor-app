import Anthropic from '@anthropic-ai/sdk';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export interface Contact {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
}

export interface ActionContext {
  mentions: Array<{
    id: string;
    type: 'contact' | 'user';
    name: string;
    email?: string;
    company?: string;
  }>;
  variables: Array<{
    key: string;
    value: string;
    type: 'date' | 'link' | 'text';
  }>;
  userPrompt: string;
  contacts: Contact[];
  templates: string[];
}

export interface GeneratedAction {
  title: string;
  description: string;
  type: 'call' | 'email' | 'meeting' | 'task' | 'follow-up';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  assignedTo?: string;
  contacts: string[];
  metadata: {
    aiGenerated: true;
    confidence: number;
    model: string;
    promptVersion: string;
  };
}

export interface AnthropicResponse {
  action: GeneratedAction;
  reasoning: string;
}

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequestsPerMinute: 50,
  requests: new Map<string, number[]>(),
};

export function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  const key = `${userId}-${minute}`;
  
  const requests = RATE_LIMIT.requests.get(key) || [];
  
  if (requests.length >= RATE_LIMIT.maxRequestsPerMinute) {
    return false;
  }
  
  requests.push(now);
  RATE_LIMIT.requests.set(key, requests);
  
  // Cleanup old entries
  for (const [k] of RATE_LIMIT.requests.entries()) {
    const keyMinute = parseInt(k.split('-')[1]);
    if (keyMinute < minute - 1) {
      RATE_LIMIT.requests.delete(k);
    }
  }
  
  return true;
}

export async function generateActionWithClaude(
  context: ActionContext,
  userId: string
): Promise<AnthropicResponse> {
  // Check rate limit
  if (!checkRateLimit(userId)) {
    throw new Error('Rate limit exceeded. Please wait before making another request.');
  }

  // Validate API key
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      temperature: 0.3,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: buildUserPrompt(context)
        }
      ]
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude');
    }

    const parsed = parseClaudeResponse(content.text);
    return parsed;
  } catch (error) {
    console.error('Error calling Anthropic API:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Invalid Anthropic API key');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('API rate limit exceeded');
      }
      if (error.message.includes('quota')) {
        throw new Error('API quota exceeded');
      }
    }
    
    throw new Error('Failed to generate action with Claude API');
  }
}

function buildSystemPrompt(): string {
  return `You are an AI assistant specialized in sales and customer relationship management. Your role is to analyze user input and generate intelligent, actionable sales tasks.

Key capabilities:
- Understand sales context and terminology
- Generate appropriate action types (calls, emails, meetings, tasks, follow-ups)
- Set realistic priorities and timelines
- Include relevant contact information
- Provide clear, actionable descriptions

Action types and when to use them:
- "call": For phone conversations, follow-ups, discovery calls
- "email": For written communication, proposals, documentation
- "meeting": For demos, presentations, negotiations, in-person meetings
- "task": For internal work, research, preparation
- "follow-up": For checking status, nurturing, staying in touch

Priority levels:
- "high": Urgent deals, hot prospects, time-sensitive opportunities
- "medium": Regular pipeline activities, scheduled follow-ups
- "low": Nurturing activities, research tasks

Always respond with valid JSON in this exact format:
{
  "action": {
    "title": "Clear, specific title",
    "description": "Detailed description with context and next steps",
    "type": "call|email|meeting|task|follow-up",
    "priority": "low|medium|high", 
    "dueDate": "YYYY-MM-DD or null",
    "assignedTo": "contact_id or null",
    "contacts": ["contact_id1", "contact_id2"],
    "metadata": {
      "aiGenerated": true,
      "confidence": 0.0-1.0,
      "model": "claude-3-5-sonnet-20241022",
      "promptVersion": "1.0"
    }
  },
  "reasoning": "Brief explanation of why this action was generated"
}`;
}

function buildUserPrompt(context: ActionContext): string {
  const mentionsText = context.mentions.length > 0 
    ? `\nMentioned contacts/users: ${context.mentions.map(m => `${m.name} (${m.type}${m.company ? `, ${m.company}` : ''})`).join(', ')}`
    : '';

  const variablesText = context.variables.length > 0
    ? `\nVariables used: ${context.variables.map(v => `${v.key} = ${v.value}`).join(', ')}`
    : '';

  const contactsContext = context.contacts.length > 0
    ? `\nAvailable contacts context: ${context.contacts.map(c => `${c.name} (${c.email}${c.company ? `, ${c.company}` : ''}${c.role ? `, ${c.role}` : ''})`).join('; ')}`
    : '';

  return `User prompt: "${context.userPrompt}"${mentionsText}${variablesText}${contactsContext}

Generate an appropriate sales action based on this input. Consider:
1. The intent behind the user's request
2. The contacts mentioned or available
3. The variables and their resolved values
4. Sales best practices and timing
5. The urgency and importance of the action

Provide a confidence score based on how clear the user's intent is and how well the generated action matches that intent.`;
}

function parseClaudeResponse(responseText: string): AnthropicResponse {
  try {
    // Clean the response - remove any markdown or extra formatting
    const cleanedResponse = responseText
      .replace(/```json\n?/, '')
      .replace(/```\n?$/, '')
      .trim();

    const parsed = JSON.parse(cleanedResponse);

    // Validate the response structure
    if (!parsed.action || !parsed.reasoning) {
      throw new Error('Invalid response structure');
    }

    const action = parsed.action;
    
    // Validate required fields
    if (!action.title || !action.description || !action.type || !action.priority) {
      throw new Error('Missing required action fields');
    }

    // Validate enum values
    const validTypes = ['call', 'email', 'meeting', 'task', 'follow-up'];
    const validPriorities = ['low', 'medium', 'high'];
    
    if (!validTypes.includes(action.type)) {
      throw new Error(`Invalid action type: ${action.type}`);
    }
    
    if (!validPriorities.includes(action.priority)) {
      throw new Error(`Invalid priority: ${action.priority}`);
    }

    // Ensure metadata has required structure
    if (!action.metadata) {
      action.metadata = {
        aiGenerated: true,
        confidence: 0.8,
        model: 'claude-3-5-sonnet-20241022',
        promptVersion: '1.0'
      };
    }

    return {
      action: action as GeneratedAction,
      reasoning: parsed.reasoning
    };
  } catch (error) {
    console.error('Error parsing Claude response:', error);
    console.error('Raw response:', responseText);
    throw new Error('Failed to parse Claude response. Please try again.');
  }
}

// Export the client for direct use if needed
export { anthropic };