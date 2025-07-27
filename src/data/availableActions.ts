// src/data/availableActions.ts
import {
  Calendar,
  FilePlus,
  Phone,
  Users,
  Database,
  BarChart,
  BrainCircuit,
  Bot,
  MessageSquare,
  ShieldQuestion,
} from 'lucide-react';

export interface AvailableAction {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

export const availableActions: Record<string, AvailableAction[]> = {
  'sales-ops': [
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Find the best time and send an intelligent invite for a new meeting.',
      icon: Calendar,
    },
    {
      id: 'generate-proposal',
      title: 'Generate Proposal',
      description: 'Create a personalized sales proposal from a template using AI.',
      icon: FilePlus,
    },
    {
      id: 'generate-call-script',
      title: 'Generate Call Script',
      description: 'Build a tailored script for a call based on contact insights.',
      icon: Phone,
    },
    {
      id: 'generate-team-briefing',
      title: 'Generate Team Briefing',
      description: 'Create and distribute a pre-meeting summary for internal team members.',
      icon: Users,
    },
    {
      id: 'update-crm-opportunity',
      title: 'Update Opportunity in CRM',
      description: 'Log activities and update the stage or value of a deal in your CRM.',
      icon: Database,
    },
  ],
  'analytics': [
    {
      id: 'kpi-analysis',
      title: 'KPI Analysis',
      description: 'Analyze the key performance indicators for a specific opportunity.',
      icon: BarChart,
    },
    {
      id: 'competitive-analysis',
      title: 'Competitive Analysis',
      description: 'Generate a report comparing your solution against key competitors.',
      icon: BrainCircuit,
    },
    {
      id: 'deal-health-check',
      title: 'Deal Health Check',
      description: 'Run an AI analysis to score the health and probability of a deal.',
      icon: Bot,
    },
  ],
  'ai-simulations': [
    {
        id: 'simulate-demo',
        title: 'Simulate Demo',
        description: 'Practice a product demonstration with an AI-powered client profile.',
        icon: Bot,
    },
    {
        id: 'simulate-conversation',
        title: 'Simulate Conversation',
        description: 'Run a full sales conversation simulation to prepare for a call.',
        icon: MessageSquare,
    },
    {
        id: 'objection-handling-practice',
        title: 'Objection Handling Practice',
        description: 'Train on how to handle specific and common sales objections.',
        icon: ShieldQuestion,
    }
  ],
  'reporting': [], // Dejado vacío para futuras implementaciones
};