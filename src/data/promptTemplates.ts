export interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
}

export const promptTemplates: PromptTemplate[] = [
  {
    id: 'template-1',
    title: 'Schedule a follow-up demo',
    prompt: 'Schedule a 30-minute follow-up demo with María González from TechCorp for next week to discuss the integration details we talked about today.',
  },
  {
    id: 'template-2',
    title: 'Generate a proposal for ClientX',
    prompt: 'Generate a standard proposal for the ClientX - Enterprise Expansion opportunity with a deal value of $75,000 for a 12-month term.',
  },
   {
    id: 'template-3',
    title: 'Create a call script for a CTO',
    prompt: 'Create a discovery call script for a CTO, focusing on the pain points of slow onboarding and complex integrations.',
  },
];