// src/types/contact.ts
import { TrendingUp, TrendingDown, Minus, User, MessageCircle, Heart, Share2 } from 'lucide-react';

export interface SocialPost {
  id: string;
  platform: 'linkedin' | 'instagram' | 'twitter';
  content: string;
  date: string;
  engagement: {
    likes: number;
    comments: number;
    shares?: number;
  };
  type: 'text' | 'image' | 'video' | 'article';
  url?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface SocialComment {
  id: string;
  platform: 'linkedin' | 'instagram' | 'twitter';
  postAuthor: string;
  comment: string;
  date: string;
  context: string; // What the original post was about
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface PersonalityInsights {
  communicationStyle: 'formal' | 'casual' | 'technical' | 'friendly';
  decisionMaking: 'analytical' | 'intuitive' | 'collaborative' | 'decisive';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  influence: 'high' | 'medium' | 'low';
  networkSize: 'small' | 'medium' | 'large' | 'extensive';
}

export interface ProfessionalBackground {
  experience: {
    totalYears: number;
    currentRoleYears: number;
    previousRoles: Array<{
      title: string;
      company: string;
      duration: string;
      achievements?: string[];
    }>;
  };
  education: Array<{
    degree: string;
    school: string;
    year: string;
    field?: string;
  }>;
  certifications: string[];
  skills: Array<{
    name: string;
    endorsements: number;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }>;
}

export interface BuyingBehavior {
  decisionTimeframe: 'immediate' | 'weeks' | 'months' | 'long-term';
  budgetAuthority: 'influencer' | 'recommender' | 'decision-maker' | 'budget-holder';
  purchaseHistory: Array<{
    category: string;
    timing: string;
    vendor?: string;
  }>;
  painPoints: string[];
  priorities: string[];
}

export interface SentimentAnalysis {
  overall: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative';
  aboutOurCompany: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative' | 'unknown';
  aboutOurIndustry: 'very-positive' | 'positive' | 'neutral' | 'negative' | 'very-negative';
  recentTrend: 'improving' | 'stable' | 'declining';
  confidence: number; // 0-100
}

export interface UserTrend {
  activityLevel: 'very-high' | 'high' | 'medium' | 'low' | 'very-low';
  postingFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely';
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  topicsFocus: string[];
  networkGrowth: 'fast' | 'steady' | 'slow' | 'stagnant';
}

export interface EnhancedContact {
  // Base contact info
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  status: 'hot' | 'warm' | 'cold';
  score: number;
  
  // Business context
  lastActivity: string;
  lastContact: string;
  tags: string[];
  revenue: string;
  employees: string;
  industry: string;
  source: string;
  pipeline: string;
  probability: number;
  value: string;
  nextAction: string;
  notes: number;
  activities: number;
  
  // Social profiles
  social: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
  };
  
  // Enhanced data
  recentPosts: SocialPost[];
  recentComments: SocialComment[];
  sentiment: SentimentAnalysis;
  userTrend: UserTrend;
  interests: string[];
  personalityInsights: PersonalityInsights;
  professionalBackground: ProfessionalBackground;
  buyingBehavior: BuyingBehavior;
  
  // Engagement metrics
  engagement: {
    emailOpens: number;
    linkClicks: number;
    callsAnswered: number;
    socialInteractions: number;
    contentEngagement: number;
  };
  
  // AI-generated insights
  aiInsights: {
    summary: string;
    bestApproach: string;
    riskFactors: string[];
    opportunities: string[];
    nextBestAction: string;
  };
}

export const statusConfig = {
  hot: { color: 'bg-red-100 text-red-800 border-red-200', icon: TrendingUp, label: 'Hot' },
  warm: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Minus, label: 'Warm' },
  cold: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: TrendingDown, label: 'Cold' }
};

export const sentimentColors = {
  'very-positive': 'text-green-700 bg-green-50',
  'positive': 'text-green-600 bg-green-50',
  'neutral': 'text-gray-600 bg-gray-50',
  'negative': 'text-red-600 bg-red-50',
  'very-negative': 'text-red-700 bg-red-50',
  'unknown': 'text-gray-400 bg-gray-50'
};

export const trendColors = {
  'improving': 'text-green-600',
  'stable': 'text-gray-600',
  'declining': 'text-red-600'
};