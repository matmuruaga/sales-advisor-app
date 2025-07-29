// src/types/company.ts
export interface CompanyNews {
  id: string;
  title: string;
  source: string;
  date: string;
  url: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceScore: number; // 0-100
  category: 'funding' | 'product' | 'leadership' | 'partnership' | 'acquisition' | 'general';
}

export interface CompanySocialActivity {
  platform: 'linkedin' | 'twitter' | 'instagram' | 'facebook';
  recentPosts: Array<{
    id: string;
    content: string;
    date: string;
    engagement: {
      likes: number;
      comments: number;
      shares: number;
    };
    type: 'announcement' | 'thought-leadership' | 'culture' | 'product' | 'hiring';
  }>;
  followerGrowth: 'fast' | 'steady' | 'slow' | 'declining';
  engagementRate: number; // percentage
}

export interface CompanyFinancialHealth {
  revenueGrowth: 'accelerating' | 'steady' | 'slowing' | 'declining';
  profitability: 'profitable' | 'break-even' | 'burning' | 'unknown';
  fundingStatus: 'well-funded' | 'adequate' | 'seeking' | 'distressed';
  burnRate: string;
  runway: string;
  lastFundingDate: string;
  investorSentiment: 'very-positive' | 'positive' | 'neutral' | 'cautious' | 'negative';
}

export interface CompanyMarketPosition {
  competitiveAdvantage: string[];
  marketShare: string;
  growthStage: 'startup' | 'scale-up' | 'mature' | 'declining';
  innovationIndex: 'leader' | 'fast-follower' | 'follower' | 'laggard';
  brandRecognition: 'high' | 'medium' | 'low' | 'emerging';
}

export interface CompanyTechnology {
  techStack: string[];
  digitalMaturity: 'advanced' | 'moderate' | 'basic' | 'legacy';
  aiAdoption: 'pioneer' | 'early-adopter' | 'mainstream' | 'laggard';
  cloudStrategy: 'cloud-first' | 'hybrid' | 'on-premise' | 'migrating';
  securityPosture: 'excellent' | 'good' | 'adequate' | 'concerning';
}

export interface CompanyCulture {
  workEnvironment: 'remote-first' | 'hybrid' | 'office-first';
  hiringTrend: 'aggressive' | 'steady' | 'selective' | 'frozen';
  employeeSentiment: 'very-positive' | 'positive' | 'mixed' | 'negative';
  turnoverRate: 'low' | 'average' | 'high' | 'concerning';
  glassdoorTrend: 'improving' | 'stable' | 'declining';
}

export interface BuyingSignals {
  intent: 'high' | 'medium' | 'low';
  urgency: 'immediate' | 'near-term' | 'long-term';
  budgetIndicators: Array<{
    signal: string;
    confidence: number;
    source: string;
  }>;
  decisionMakers: Array<{
    name: string;
    role: string;
    influence: 'high' | 'medium' | 'low';
  }>;
  competitiveThreat: 'none' | 'low' | 'medium' | 'high';
}

export interface EnhancedCompany {
  // Base company info
  name: string;
  logo: string;
  industry: string;
  subIndustry: string;
  website: string;
  headquarters: string;
  founded: string;
  size: string;
  revenue: string;
  
  // Financial data
  funding?: {
    total: string;
    lastRound: {
      type: string;
      amount: string;
      date: string;
      leadInvestors: string[];
    };
    rounds: Array<{
      type: string;
      amount: string;
      date: string;
    }>;
  };
  
  stockSymbol?: string;
  marketCap?: string;
  
  // Key people
  keyPeople: Array<{
    name: string;
    role: string;
    linkedIn: string;
    tenure?: string;
    backgroundSummary?: string;
  }>;
  
  // Products and competition
  products: Array<{
    name: string;
    description: string;
    launchDate?: string;
    marketPosition?: string;
  }>;
  
  competitors: string[];
  
  // Enhanced data
  recentNews: CompanyNews[];
  socialActivity: Record<string, CompanySocialActivity>;
  financialHealth: CompanyFinancialHealth;
  marketPosition: CompanyMarketPosition;
  technology: CompanyTechnology;
  culture: CompanyCulture;
  buyingSignals: BuyingSignals;
  
  // Business metrics
  businessModel: string;
  customerSegments: Array<{
    segment: string;
    percentage: number;
    averageDealSize: string;
  }>;
  
  // Relationship data
  ourRelationship: {
    status: 'prospect' | 'active' | 'churned' | 'dormant';
    stage: string;
    value: string;
    keyContacts: Array<{
      name: string;
      role: string;
      sentiment: string;
      lastInteraction: string;
    }>;
    history: Array<{
      type: string;
      date: string;
      description: string;
      value?: string;
    }>;
    nextSteps: string[];
    opportunities: string[];
    risks: string[];
  };
  
  // AI insights
  aiInsights: {
    summary: string;
    buyingProbability: number;
    bestApproach: string;
    keyRiskFactors: string[];
    expansionOpportunities: string[];
    competitiveThreats: string[];
    recommendedActions: string[];
  };
  
  // Company priorities and initiatives
  strategicPriorities: string[];
  recentInitiatives: Array<{
    name: string;
    description: string;
    timeline: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  
  // Industry context
  industryTrends: Array<{
    trend: string;
    impact: 'positive' | 'neutral' | 'negative';
    relevance: number; // 0-100
  }>;
}