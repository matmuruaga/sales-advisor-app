import { QuickActionType } from "@/components/Calendar";

export interface QuickTemplate {
  title: string;
  prompt: string;
}

export const quickActionTemplates: Record<QuickActionType, QuickTemplate[]> = {
  schedule: [
    { title: 'Schedule a follow-up demo', prompt: 'Schedule a 30-min follow-up demo with @[María González] for next week.' },
    { title: 'Schedule an internal sync', prompt: 'Schedule an internal sync with @[Jessica Smith] to prepare for the TechCorp call.' },
  ],
  simulate: [
    { title: 'Practice pricing objections', prompt: 'I want to practice handling pricing objections with a skeptical CTO profile from an enterprise company like @[TechCorp].' },
    { title: 'Simulate a discovery call', prompt: 'Simulate a discovery call with a new lead from the fintech industry.' },
  ],
  call: [
    { title: 'Script for a cold call', prompt: 'Generate a cold call script for a new prospect in the travel industry, focusing on the pain point of high operational costs.' },
  ],
  nested: [
    { title: 'Analyze TechCorp meetings', prompt: 'Show me the meeting history and timeline for the @[TechCorp] opportunity.' },
  ],
};