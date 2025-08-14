import { ActionContext } from './anthropic';

export interface PromptTemplate {
  name: string;
  description: string;
  systemPrompt: string;
  userPromptBuilder: (context: ActionContext) => string;
  actionTypes: string[];
  priority: 'low' | 'medium' | 'high';
}

// Sales-specific prompt templates
export const PROMPT_TEMPLATES: Record<string, PromptTemplate> = {
  // General sales action generation
  general: {
    name: 'General Sales Action',
    description: 'Generate general sales actions from user input',
    systemPrompt: `You are an expert sales assistant specializing in CRM and sales process optimization. Generate intelligent, actionable sales tasks that help close deals and maintain relationships.

Core principles:
- Focus on revenue-generating activities
- Maintain professional communication standards
- Consider sales cycle stages and customer journey
- Prioritize based on deal value and urgency
- Include specific next steps and outcomes

Always respond in valid JSON format with the exact structure provided.`,
    userPromptBuilder: (context: ActionContext) => buildStandardUserPrompt(context),
    actionTypes: ['call', 'email', 'meeting', 'task', 'follow-up'],
    priority: 'medium'
  },

  // Prospecting and lead generation
  prospecting: {
    name: 'Prospecting & Lead Gen',
    description: 'Generate actions for new prospect outreach and lead qualification',
    systemPrompt: `You are a sales development specialist focused on prospecting and lead generation. Generate actions that help identify, qualify, and engage new potential customers.

Key focus areas:
- Lead qualification and scoring
- Initial outreach and connection building
- Research and preparation activities
- Multi-touch sequences and follow-ups
- Value proposition delivery

Prioritize actions that move prospects through the awareness and interest stages.`,
    userPromptBuilder: (context: ActionContext) => {
      const basePrompt = buildStandardUserPrompt(context);
      return `${basePrompt}\n\nContext: This is a prospecting/lead generation scenario. Focus on actions that help qualify leads, build relationships, and move prospects into the sales pipeline.`;
    },
    actionTypes: ['call', 'email', 'task', 'follow-up'],
    priority: 'high'
  },

  // Deal progression and opportunity management
  dealProgression: {
    name: 'Deal Progression',
    description: 'Generate actions for advancing existing opportunities',
    systemPrompt: `You are a sales manager specializing in deal progression and opportunity management. Generate actions that advance deals through the sales pipeline and overcome obstacles.

Focus areas:
- Stakeholder mapping and engagement
- Proposal and presentation preparation
- Objection handling and negotiation
- Decision-maker access and influence
- Closing activities and contract execution

Prioritize actions that directly impact deal closure probability and timeline.`,
    userPromptBuilder: (context: ActionContext) => {
      const basePrompt = buildStandardUserPrompt(context);
      return `${basePrompt}\n\nContext: This involves an existing sales opportunity. Focus on actions that advance the deal, address potential objections, and move toward closure.`;
    },
    actionTypes: ['meeting', 'call', 'email', 'task'],
    priority: 'high'
  },

  // Customer success and retention
  customerSuccess: {
    name: 'Customer Success',
    description: 'Generate actions for existing customer management and expansion',
    systemPrompt: `You are a customer success manager focused on retention, expansion, and relationship building. Generate actions that ensure customer satisfaction and identify growth opportunities.

Key objectives:
- Customer health monitoring and check-ins
- Upselling and cross-selling opportunities
- Issue resolution and support
- Renewal preparation and execution
- Reference and advocacy development

Prioritize long-term relationship building and revenue expansion.`,
    userPromptBuilder: (context: ActionContext) => {
      const basePrompt = buildStandardUserPrompt(context);
      return `${basePrompt}\n\nContext: This involves an existing customer relationship. Focus on retention, satisfaction, and expansion opportunities.`;
    },
    actionTypes: ['call', 'meeting', 'email', 'follow-up', 'task'],
    priority: 'medium'
  },

  // Meeting and demo preparation
  meetingPrep: {
    name: 'Meeting Preparation',
    description: 'Generate preparation tasks for sales meetings and demos',
    systemPrompt: `You are a sales operations specialist focused on meeting preparation and demo execution. Generate actions that ensure successful sales meetings and presentations.

Preparation areas:
- Agenda creation and stakeholder alignment
- Demo customization and technical setup
- Research on attendees and company context
- Materials preparation and follow-up planning
- Success criteria definition and next steps

Focus on actions that increase meeting effectiveness and conversion rates.`,
    userPromptBuilder: (context: ActionContext) => {
      const basePrompt = buildStandardUserPrompt(context);
      return `${basePrompt}\n\nContext: This involves preparing for or scheduling a sales meeting/demo. Focus on preparation tasks and meeting optimization.`;
    },
    actionTypes: ['task', 'meeting', 'email'],
    priority: 'high'
  }
};

// Variable resolvers for common sales variables
export const VARIABLE_RESOLVERS: Record<string, (context?: any) => string> = {
  // Time-based variables
  'today': () => new Date().toISOString().split('T')[0],
  'tomorrow': () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  },
  'next week': () => {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split('T')[0];
  },
  'next month': () => {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toISOString().split('T')[0];
  },
  'end of quarter': () => {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const endOfQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
    return endOfQuarter.toISOString().split('T')[0];
  },

  // Context-based variables
  'my calendar': () => 'https://calendar.google.com', // This would be dynamic in production
  'meeting room': () => 'Conference Room A', // This would come from booking system
  'product demo': () => 'https://demo.salesadvisor.app',
  'pricing': () => 'https://salesadvisor.app/pricing',
  'proposal template': () => 'https://docs.salesadvisor.app/templates/proposal',
  'case study': () => 'https://salesadvisor.app/case-studies',
  'roi calculator': () => 'https://salesadvisor.app/roi-calculator',
  'trial signup': () => 'https://salesadvisor.app/trial',
  'contact form': () => 'https://salesadvisor.app/contact',
  'support': () => 'support@salesadvisor.app'
};

// Utility functions
function buildStandardUserPrompt(context: ActionContext): string {
  const mentionsText = context.mentions.length > 0 
    ? `\nMentioned contacts: ${context.mentions.map(m => 
        `${m.name} (${m.type}${m.company ? ` at ${m.company}` : ''}${m.email ? ` - ${m.email}` : ''})`
      ).join(', ')}`
    : '';

  const variablesText = context.variables.length > 0
    ? `\nResolved variables: ${context.variables.map(v => `[${v.key}] = ${v.value}`).join(', ')}`
    : '';

  const contactsContext = context.contacts.length > 0
    ? `\nAvailable contacts: ${context.contacts.slice(0, 10).map(c => 
        `${c.name} (${c.email}${c.company ? ` at ${c.company}` : ''}${c.role ? `, ${c.role}` : ''})`
      ).join('; ')}${context.contacts.length > 10 ? ` and ${context.contacts.length - 10} more...` : ''}`
    : '';

  return `User request: "${context.userPrompt}"${mentionsText}${variablesText}${contactsContext}

Generate a specific, actionable sales task that addresses this request. Consider the sales context, mentioned contacts, and resolved variables to create the most appropriate action.`;
}

export function resolveVariables(text: string, context?: any): Array<{key: string; value: string; type: 'date' | 'link' | 'text'}> {
  const variables: Array<{key: string; value: string; type: 'date' | 'link' | 'text'}> = [];
  
  // Find all variables in [brackets]
  const variableMatches = text.match(/\[([^\]]+)\]/g);
  
  if (variableMatches) {
    for (const match of variableMatches) {
      const key = match.slice(1, -1); // Remove brackets
      const resolver = VARIABLE_RESOLVERS[key.toLowerCase()];
      
      if (resolver) {
        const value = resolver(context);
        const type = getVariableType(key, value);
        variables.push({ key, value, type });
      }
    }
  }
  
  return variables;
}

function getVariableType(key: string, value: string): 'date' | 'link' | 'text' {
  // Check if it's a date
  if (value.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return 'date';
  }
  
  // Check if it's a URL
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return 'link';
  }
  
  return 'text';
}

export function selectPromptTemplate(userPrompt: string): PromptTemplate {
  const prompt = userPrompt.toLowerCase();
  
  // Keywords for different template types
  const keywords = {
    prospecting: ['prospect', 'lead', 'new', 'outreach', 'cold', 'qualify', 'research'],
    dealProgression: ['deal', 'opportunity', 'proposal', 'negotiate', 'close', 'contract', 'quote'],
    customerSuccess: ['customer', 'client', 'upsell', 'renewal', 'expansion', 'check-in', 'satisfaction'],
    meetingPrep: ['meeting', 'demo', 'presentation', 'prepare', 'agenda', 'setup']
  };
  
  // Count keyword matches for each template
  const scores = Object.entries(keywords).map(([template, words]) => {
    const matches = words.filter(word => prompt.includes(word)).length;
    return { template, matches };
  });
  
  // Find the template with the highest score
  const bestMatch = scores.reduce((best, current) => 
    current.matches > best.matches ? current : best
  );
  
  // Use specific template if there's a clear match, otherwise use general
  if (bestMatch.matches > 0) {
    return PROMPT_TEMPLATES[bestMatch.template];
  }
  
  return PROMPT_TEMPLATES.general;
}