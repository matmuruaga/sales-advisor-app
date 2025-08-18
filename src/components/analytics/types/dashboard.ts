// Dashboard-specific Type Definitions
export interface DashboardData {
  dailyMetrics: DailyMetric[];
  callIntelligence: CallIntelligence[];
  aiImpact: AIImpactMetric[];
  pipelineAttribution: PipelineData[];
  teamPerformance: TeamPerformanceData[];
  sentimentAnalysis: SentimentAnalysis[];
  keywords: KeywordAnalysis[];
}

export interface DailyMetric {
  date: string;
  calls: number;
  conversions: number;
  avgDuration: number;
  sentiment: number;
}

export interface CallIntelligence {
  id: string;
  duration: number;
  sentiment_score: number;
  conversion_outcome: 'qualified' | 'unqualified' | 'follow_up';
  ai_insights: string[];
  created_at: string;
}

export interface AIImpactMetric {
  metric: string;
  before_ai: number;
  after_ai: number;
  improvement: number;
}

export interface PipelineData {
  stage: string;
  count: number;
  value: number;
  conversion_rate: number;
}

export interface TeamPerformanceData {
  agent_id: string;
  agent_name: string;
  total_calls: number;
  conversions: number;
  avg_duration: number;
  avg_sentiment: number;
  performance_score: number;
}

export interface SentimentAnalysis {
  date: string;
  positive_count: number;
  neutral_count: number;
  negative_count: number;
  avg_score: number;
}

export interface KeywordAnalysis {
  keyword: string;
  frequency: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact_score: number;
}

export interface DashboardFilters {
  dateRange: {
    from: Date;
    to: Date;
  };
  team?: string[];
  callType?: string[];
  outcome?: string[];
}