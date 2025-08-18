// Business Metrics Calculations
import { DailyMetric, CallIntelligence, AIImpactMetric, TeamPerformanceData } from '../types/dashboard';

export const calculateTotalCalls = (metrics: DailyMetric[]): number => {
  return metrics.reduce((sum, metric) => sum + metric.calls, 0);
};

export const calculateConversionRate = (calls: CallIntelligence[]): number => {
  if (calls.length === 0) return 0;
  const qualified = calls.filter(call => call.conversion_outcome === 'qualified').length;
  return (qualified / calls.length) * 100;
};

export const calculateAvgDuration = (calls: CallIntelligence[]): number => {
  if (calls.length === 0) return 0;
  const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0);
  return totalDuration / calls.length;
};

export const calculateAvgSentiment = (calls: CallIntelligence[]): number => {
  if (calls.length === 0) return 0;
  const totalSentiment = calls.reduce((sum, call) => sum + call.sentiment_score, 0);
  return totalSentiment / calls.length;
};

export const calculateAIImpact = (metrics: AIImpactMetric[]): number => {
  if (metrics.length === 0) return 0;
  const totalImprovement = metrics.reduce((sum, metric) => sum + metric.improvement, 0);
  return totalImprovement / metrics.length;
};

export const calculateTeamPerformanceScore = (member: TeamPerformanceData): number => {
  const conversionRate = member.total_calls > 0 ? (member.conversions / member.total_calls) * 100 : 0;
  const sentimentScore = member.avg_sentiment * 20; // Convert to 0-100 scale
  const durationScore = Math.min(100, (member.avg_duration / 300) * 100); // Assume 5 min is optimal
  
  // Weighted average: 40% conversion, 30% sentiment, 30% duration
  return (conversionRate * 0.4) + (sentimentScore * 0.3) + (durationScore * 0.3);
};

export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

export const calculateTrend = (data: number[]): 'up' | 'down' | 'neutral' => {
  if (data.length < 2) return 'neutral';
  
  const recentAvg = data.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, data.length);
  const previousAvg = data.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, data.length - 3);
  
  const change = ((recentAvg - previousAvg) / previousAvg) * 100;
  
  if (change > 5) return 'up';
  if (change < -5) return 'down';
  return 'neutral';
};

export const generateSparklineData = (metrics: DailyMetric[], field: keyof DailyMetric): number[] => {
  return metrics.map(metric => {
    const value = metric[field];
    return typeof value === 'number' ? value : 0;
  });
};

export const calculateMetricChange = (current: number, previous: number): {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
} => {
  const change = current - previous;
  const percentage = previous !== 0 ? (change / previous) * 100 : 0;
  
  return {
    value: change,
    percentage,
    trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  };
};