import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const mockContacts = [
  {
    id: '1',
    name: 'María González',
    role: 'Chief Technology Officer',
    company: 'TechCorp Solutions',
    email: 'maria.gonzalez@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a51201?w=150&h=150&fit=crop&crop=face',
    status: 'hot',
    score: 95,
    lastActivity: '2 hours ago',
    lastContact: 'Demo call scheduled',
    tags: ['Enterprise', 'AI/ML', 'Decision Maker'],
    revenue: '$2.5M',
    employees: '500-1000',
    industry: 'Technology',
    source: 'LinkedIn Outreach',
    pipeline: 'Demo Scheduled',
    probability: 85,
    value: '$45,000',
    nextAction: 'Product Demo - Tomorrow 3:00 PM',
    notes: 4,
    activities: 12,
    social: {
      linkedin: 'https://linkedin.com/in/mariagonzalez',
      twitter: '@mariagonzalez'
    },
    engagement: {
      emailOpens: 8,
      linkClicks: 3,
      callsAnswered: 2
    }
  },
  {
    id: '2',
    name: 'Carlos Rodríguez',
    role: 'VP of Sales',
    company: 'InnovateAI',
    email: 'carlos@innovateai.com',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'warm',
    score: 78,
    lastActivity: '1 day ago',
    lastContact: 'Pricing discussion',
    tags: ['Mid-Market', 'Sales Tool', 'Budget Approved'],
    revenue: '$850K',
    employees: '100-250',
    industry: 'SaaS',
    source: 'Website Form',
    pipeline: 'Proposal Sent',
    probability: 65,
    value: '$28,000',
    nextAction: 'Follow-up call - Dec 15',
    notes: 7,
    activities: 18,
    social: {
      linkedin: 'https://linkedin.com/in/carlosrodriguez'
    },
    engagement: {
      emailOpens: 12,
      linkClicks: 7,
      callsAnswered: 3
    }
  },
  {
    id: '3',
    name: 'Ana López',
    role: 'Director of Operations',
    company: 'DataSolutions Inc',
    email: 'ana.lopez@datasolutions.com',
    phone: '+1 (555) 456-7890',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'cold',
    score: 42,
    lastActivity: '1 week ago',
    lastContact: 'Initial outreach',
    tags: ['SMB', 'Data Analytics', 'First Contact'],
    revenue: '$300K',
    employees: '25-50',
    industry: 'Data Services',
    source: 'Cold Email',
    pipeline: 'Prospecting',
    probability: 25,
    value: '$12,000',
    nextAction: 'Research company needs',
    notes: 2,
    activities: 5,
    social: {
      linkedin: 'https://linkedin.com/in/analopez',
      twitter: '@analopez_data'
    },
    engagement: {
      emailOpens: 3,
      linkClicks: 1,
      callsAnswered: 0
    }
  },
  {
    id: '4',
    name: 'Roberto Chen',
    role: 'Chief Executive Officer',
    company: 'StartupXYZ',
    email: 'roberto@startupxyz.com',
    phone: '+1 (555) 321-9876',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'hot',
    score: 92,
    lastActivity: '30 minutes ago',
    lastContact: 'Contract negotiation',
    tags: ['Startup', 'Fast Growth', 'Ready to Buy'],
    revenue: '$1.2M',
    employees: '50-100',
    industry: 'Fintech',
    source: 'Referral',
    pipeline: 'Negotiation',
    probability: 90,
    value: '$35,000',
    nextAction: 'Contract review - Today 4:00 PM',
    notes: 9,
    activities: 23,
    social: {
      linkedin: 'https://linkedin.com/in/robertochen',
      twitter: '@robertochen'
    },
    engagement: {
      emailOpens: 15,
      linkClicks: 8,
      callsAnswered: 4
    }
  },
  {
    id: '5',
    name: 'Elena Pérez',
    role: 'Head of Sales Operations',
    company: 'GlobalTech Ltd',
    email: 'elena.perez@globaltech.com',
    phone: '+1 (555) 789-0123',
    location: 'Boston, MA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    status: 'warm',
    score: 69,
    lastActivity: '3 days ago',
    lastContact: 'Feature questions',
    tags: ['Enterprise', 'Sales Ops', 'Technical Buyer'],
    revenue: '$5.8M',
    employees: '1000+',
    industry: 'Technology',
    source: 'Trade Show',
    pipeline: 'Discovery',
    probability: 50,
    value: '$65,000',
    nextAction: 'Technical demo setup',
    notes: 5,
    activities: 14,
    social: {
      linkedin: 'https://linkedin.com/in/elenaperez'
    },
    engagement: {
      emailOpens: 6,
      linkClicks: 4,
      callsAnswered: 1
    }
  }
];

export const statusConfig = {
  hot: { color: 'bg-red-100 text-red-800 border-red-200', icon: TrendingUp, label: 'Hot' },
  warm: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Minus, label: 'Warm' },
  cold: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingDown, label: 'Cold' }
};

export type Contact = typeof mockContacts[0];