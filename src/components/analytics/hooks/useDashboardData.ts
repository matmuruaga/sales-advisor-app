"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { DateRange } from '../types/analytics';
import { DashboardData } from '../types/dashboard';
import { parseSupabaseDateRange } from '../utils/dateUtils';

export const useDashboardData = (dateRange: DateRange) => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!supabase || !dateRange.from || !dateRange.to) return;

    setLoading(true);
    setError(null);

    try {
      const { startDate: fromDate, endDate: toDate } = parseSupabaseDateRange(dateRange.from, dateRange.to);
      const fromDateTime = `${fromDate}T00:00:00`;
      const toDateTime = `${toDate}T23:59:59`;

      // Get organization ID from user metadata
      const { data: { user } } = await supabase.auth.getUser();
      const organizationId = user?.user_metadata?.organization_id;

      if (!organizationId) {
        throw new Error('Organization ID not found');
      }

      // Fetch all data in parallel
      const [
        dailyMetricsResponse,
        callIntelligenceResponse,
        aiImpactResponse,
        pipelineResponse,
        teamPerformanceResponse
      ] = await Promise.all([
        // Daily metrics with date filter
        supabase
          .from('daily_metrics')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('metric_date', fromDate)
          .lte('metric_date', toDate)
          .order('metric_date', { ascending: true }),

        // Call intelligence with date filter
        supabase
          .from('call_intelligence')
          .select('*')
          .gte('created_at', fromDateTime)
          .lte('created_at', toDateTime)
          .order('created_at', { ascending: false }),

        // AI impact metrics with date filter
        supabase
          .from('ai_impact_metrics')
          .select('*')
          .eq('organization_id', organizationId)
          .gte('date', fromDate)
          .lte('date', toDate)
          .order('date', { ascending: true }),

        // Pipeline attribution with date filter
        supabase
          .from('pipeline_attribution')
          .select('*')
          .gte('created_at', fromDateTime)
          .lte('created_at', toDateTime)
          .order('stage_order', { ascending: true }),

        // Team performance with date filter and user names
        supabase
          .from('team_performance_metrics')
          .select(`
            performance_id,
            user_id,
            total_calls,
            successful_calls,
            avg_call_duration,
            avg_sentiment_score,
            conversion_rate,
            performance_date,
            users!inner(
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('organization_id', organizationId)
          .gte('performance_date', fromDate)
          .lte('performance_date', toDate)
          .order('performance_date', { ascending: false })
      ]);

      // Process sentiment analysis from call intelligence
      const sentimentAnalysis = processCallSentiment(callIntelligenceResponse.data || []);
      
      // Process keyword analysis from call intelligence
      const keywords = processKeywords(callIntelligenceResponse.data || []);

      // Transform team performance data
      const teamPerformance = (teamPerformanceResponse.data || []).map((member: any) => ({
        agent_id: member.user_id,
        agent_name: member.users?.full_name || member.users?.email || 'Unknown',
        total_calls: member.total_calls || 0,
        conversions: member.successful_calls || 0,
        avg_duration: member.avg_call_duration || 0,
        avg_sentiment: member.avg_sentiment_score || 0,
        performance_score: calculatePerformanceScore(member)
      }));

      setData({
        dailyMetrics: dailyMetricsResponse.data || [],
        callIntelligence: callIntelligenceResponse.data || [],
        aiImpact: aiImpactResponse.data || [],
        pipelineAttribution: pipelineResponse.data || [],
        teamPerformance,
        sentimentAnalysis,
        keywords
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [supabase, dateRange]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refresh };
};

// Helper functions
function processCallSentiment(calls: any[]): any[] {
  const sentimentByDate: Record<string, any> = {};
  
  calls.forEach(call => {
    const date = new Date(call.created_at).toISOString().split('T')[0];
    if (!sentimentByDate[date]) {
      sentimentByDate[date] = {
        date,
        positive_count: 0,
        neutral_count: 0,
        negative_count: 0,
        total_score: 0,
        count: 0
      };
    }
    
    const score = call.sentiment_score || 0;
    sentimentByDate[date].total_score += score;
    sentimentByDate[date].count += 1;
    
    if (score >= 0.6) {
      sentimentByDate[date].positive_count += 1;
    } else if (score >= 0.4) {
      sentimentByDate[date].neutral_count += 1;
    } else {
      sentimentByDate[date].negative_count += 1;
    }
  });
  
  return Object.values(sentimentByDate).map(day => ({
    ...day,
    avg_score: day.count > 0 ? day.total_score / day.count : 0
  }));
}

function processKeywords(calls: any[]): any[] {
  const keywordFrequency: Record<string, any> = {};
  
  calls.forEach(call => {
    if (call.ai_insights && Array.isArray(call.ai_insights)) {
      call.ai_insights.forEach((insight: string) => {
        // Extract keywords from insights (simplified version)
        const words = insight.toLowerCase().split(/\W+/).filter(w => w.length > 4);
        words.forEach(word => {
          if (!keywordFrequency[word]) {
            keywordFrequency[word] = {
              keyword: word,
              frequency: 0,
              sentiment: 'neutral',
              impact_score: 0
            };
          }
          keywordFrequency[word].frequency += 1;
        });
      });
    }
  });
  
  return Object.values(keywordFrequency)
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20);
}

function calculatePerformanceScore(member: any): number {
  const conversionRate = member.total_calls > 0 
    ? (member.successful_calls / member.total_calls) * 100 
    : 0;
  const sentimentScore = (member.avg_sentiment_score || 0) * 20;
  const durationScore = Math.min(100, ((member.avg_call_duration || 0) / 300) * 100);
  
  return (conversionRate * 0.4) + (sentimentScore * 0.3) + (durationScore * 0.3);
}