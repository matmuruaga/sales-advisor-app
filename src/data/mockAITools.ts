// src/data/mockAITools.ts

import { 
  Brain, 
  MessageSquare, 
  FileText, 
  Calendar, 
  BarChart3, 
  Users, 
  Target, 
  Lightbulb,
  Zap,
  Bot,
  TrendingUp,
  Search,
  Mail,
  Phone,
  Video,
  PenTool,
  Settings,
  Star,
  Clock,
  Activity
} from 'lucide-react';

export interface AITool {
  id: string;
  name: string;
  description: string;
  category: 'conversation' | 'analysis' | 'automation' | 'content' | 'training';
  icon: any;
  status: 'active' | 'beta' | 'coming-soon';
  usageCount: number;
  lastUsed?: string;
  accuracy?: number;
  features: string[];
  timesSaved?: string;
  successRate?: number;
  isPopular?: boolean;
  isNew?: boolean;
}

export const mockAITools: AITool[] = [
  {
    id: '1',
    name: 'Real-Time Call Coach',
    description: 'AI-powered coaching during live sales calls with emotion detection and real-time suggestions',
    category: 'conversation',
    icon: Brain,
    status: 'active',
    usageCount: 156,
    lastUsed: '2 hours ago',
    accuracy: 94,
    features: ['Emotion Detection', 'Live Suggestions', 'Talk-Listen Ratio', 'Objection Handling'],
    timesSaved: '12 hours/week',
    successRate: 85,
    isPopular: true
  },
  {
    id: '2',
    name: 'Smart Call Summarizer',
    description: 'Automatically generates detailed call summaries with key insights and next steps',
    category: 'analysis',
    icon: FileText,
    status: 'active',
    usageCount: 89,
    lastUsed: '30 minutes ago',
    accuracy: 97,
    features: ['Auto Transcription', 'Key Points', 'Action Items', 'Sentiment Analysis'],
    timesSaved: '8 hours/week',
    successRate: 92
  },
  {
    id: '3',
    name: 'Lead Scoring Engine',
    description: 'Advanced AI algorithm that scores leads based on behavior, engagement, and profile data',
    category: 'analysis',
    icon: Target,
    status: 'active',
    usageCount: 234,
    lastUsed: '1 hour ago',
    accuracy: 89,
    features: ['Behavioral Analysis', 'Engagement Tracking', 'Predictive Scoring', 'Intent Detection'],
    timesSaved: '15 hours/week',
    successRate: 78,
    isPopular: true
  },
  {
    id: '4',
    name: 'Email Sequence Generator',
    description: 'Creates personalized email sequences based on prospect data and interaction history',
    category: 'content',
    icon: Mail,
    status: 'active',
    usageCount: 67,
    lastUsed: '3 hours ago',
    accuracy: 91,
    features: ['Personalization', 'A/B Testing', 'Follow-up Automation', 'Template Library'],
    timesSaved: '6 hours/week',
    successRate: 73
  },
  {
    id: '5',
    name: 'Meeting Scheduler AI',
    description: 'Intelligent meeting scheduling that considers time zones, preferences, and availability',
    category: 'automation',
    icon: Calendar,
    status: 'active',
    usageCount: 145,
    lastUsed: '5 hours ago',
    accuracy: 96,
    features: ['Smart Scheduling', 'Time Zone Detection', 'Calendar Integration', 'Conflict Resolution'],
    timesSaved: '4 hours/week',
    successRate: 88
  },
  {
    id: '6',
    name: 'Objection Handler',
    description: 'AI-powered tool that provides real-time responses to common sales objections',
    category: 'conversation',
    icon: MessageSquare,
    status: 'beta',
    usageCount: 23,
    lastUsed: '1 day ago',
    accuracy: 87,
    features: ['Objection Detection', 'Smart Responses', 'Learning Engine', 'Success Tracking'],
    timesSaved: '3 hours/week',
    successRate: 81,
    isNew: true
  },
  {
    id: '7',
    name: 'Competitive Intelligence',
    description: 'Analyzes competitor mentions and provides strategic talking points',
    category: 'analysis',
    icon: Search,
    status: 'active',
    usageCount: 78,
    lastUsed: '6 hours ago',
    accuracy: 92,
    features: ['Competitor Tracking', 'Battle Cards', 'Market Analysis', 'Positioning Tips'],
    timesSaved: '5 hours/week',
    successRate: 79
  },
  {
    id: '8',
    name: 'Sales Simulator',
    description: 'Practice sales scenarios with AI-powered role-playing and feedback',
    category: 'training',
    icon: Users,
    status: 'active',
    usageCount: 45,
    lastUsed: '2 days ago',
    accuracy: 88,
    features: ['Role Playing', 'Scenario Training', 'Performance Analytics', 'Skill Development'],
    timesSaved: '10 hours/week',
    successRate: 86
  },
  {
    id: '9',
    name: 'Proposal Generator',
    description: 'Creates customized proposals based on client needs and conversation history',
    category: 'content',
    icon: PenTool,
    status: 'beta',
    usageCount: 34,
    lastUsed: '4 hours ago',
    accuracy: 90,
    features: ['Auto Generation', 'Client Customization', 'Template Management', 'Version Control'],
    timesSaved: '7 hours/week',
    successRate: 84,
    isNew: true
  },
  {
    id: '10',
    name: 'Performance Analytics',
    description: 'Deep insights into your sales performance with AI-powered recommendations',
    category: 'analysis',
    icon: BarChart3,
    status: 'active',
    usageCount: 112,
    lastUsed: '1 hour ago',
    accuracy: 95,
    features: ['Performance Tracking', 'Trend Analysis', 'Goal Setting', 'Improvement Suggestions'],
    timesSaved: '8 hours/week',
    successRate: 91,
    isPopular: true
  },
  {
    id: '11',
    name: 'Voice Tone Analyzer',
    description: 'Analyzes speech patterns and tone to optimize communication effectiveness',
    category: 'conversation',
    icon: Bot,
    status: 'coming-soon',
    usageCount: 0,
    accuracy: 0,
    features: ['Tone Detection', 'Speech Analysis', 'Communication Tips', 'Real-time Feedback'],
    timesSaved: 'TBD',
    successRate: 0
  },
  {
    id: '12',
    name: 'CRM Auto-Updater',
    description: 'Automatically updates CRM with call notes, next steps, and deal progression',
    category: 'automation',
    icon: Settings,
    status: 'coming-soon',
    usageCount: 0,
    accuracy: 0,
    features: ['Auto Sync', 'Data Enrichment', 'Field Mapping', 'Workflow Integration'],
    timesSaved: 'TBD',
    successRate: 0
  }
];

export const categoryConfig = {
  conversation: { 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    label: 'Conversation',
    icon: MessageSquare 
  },
  analysis: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    label: 'Analysis',
    icon: BarChart3 
  },
  automation: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    label: 'Automation',
    icon: Zap 
  },
  content: { 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    label: 'Content',
    icon: PenTool 
  },
  training: { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    label: 'Training',
    icon: Users 
  }
};

export const statusConfig = {
  active: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    label: 'Active',
    icon: Activity 
  },
  beta: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    label: 'Beta',
    icon: Clock 
  },
  'coming-soon': { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    label: 'Coming Soon',
    icon: Clock 
  }
};

export type AIToolCategory = keyof typeof categoryConfig;
export type AIToolStatus = keyof typeof statusConfig;