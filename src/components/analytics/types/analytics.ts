// Analytics Type Definitions
export interface DateRange {
  from: Date;
  to: Date;
}

export interface KPIMetric {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
  target?: string;
  comparison?: string;
  sparklineData?: number[];
}

export interface CallMetric {
  id: string;
  date: Date;
  duration: number;
  sentiment_score: number;
  conversion_outcome: 'qualified' | 'unqualified' | 'follow_up';
  ai_insights?: string[];
  agent_name?: string;
  customer_name?: string;
  tags?: string[];
}

export interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  performance: number;
  calls: number;
  conversions: number;
  avgDuration: number;
  sentiment: number;
}

export interface PipelineStage {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

export interface KeywordData {
  text: string;
  value: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface ActivityItem {
  id: string;
  type: 'call' | 'conversion' | 'insight' | 'alert';
  title: string;
  description: string;
  timestamp: Date;
  icon?: any;
  color?: string;
}

export interface SentimentData {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
  overall: number;
}

export interface CoachingInsight {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  metrics?: {
    impact: number;
    confidence: number;
  };
}