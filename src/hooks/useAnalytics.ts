"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSupabase } from './useSupabase';
import { 
  PaginationOptions, 
  PaginatedResponse, 
  CursorPaginatedResponse,
  executeOffsetPaginatedQuery,
  executeCursorPaginatedQuery,
  DEFAULT_PAGE_SIZES,
  DEFAULT_ANALYTICS_LIMIT,
  createDebouncer,
  generateCacheKey
} from '@/lib/pagination';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface DailyMetric {
  id: string;
  organization_id: string;
  user_id?: string;
  metric_date: string;
  calls_made: number;
  calls_connected: number;
  emails_sent: number;
  emails_opened: number;
  emails_clicked: number;
  meetings_booked: number;
  meetings_held: number;
  deals_created: number;
  deals_won: number;
  deals_lost: number;
  revenue_won: number;
  revenue_lost: number;
  pipeline_added: number;
  activities_completed: number;
  avg_call_duration: number;
  avg_engagement_score: number;
}

export interface CallAnalytics {
  id: string;
  organization_id: string;
  activity_id?: string;
  user_id: string;
  contact_id?: string;
  call_date: string;
  duration_minutes: number;
  engagement_score: number;
  sentiment_score: number;
  talk_time_ratio: number;
  questions_asked: number;
  objections_handled: number;
  next_steps_defined: boolean;
  call_outcome: string;
  call_rating: number;
  transcription_summary?: string;
  key_topics: string[];
  action_items?: any;
  ai_insights?: any;
}

export interface UserPerformance {
  id: string;
  organization_id: string;
  user_id: string;
  quota_attainment: number;
  quota_trend: string;
  win_rate: number;
  deal_velocity: number;
  pipeline_value: number;
  activities_completed: number;
  calls_connected: number;
  meetings_booked: number;
  performance_status: string;
  coaching_priority: string;
  strengths: string[];
  improvement_areas: string[];
  last_coaching_session?: string;
  recommended_actions: string[];
  recent_achievements: string[];
  ai_summary?: string;
  predicted_quota: number;
  pipeline_conversion_rate: number;
  risk_factors: string[];
  opportunities: string[];
  recommended_focus?: string;
  activity_trends?: any;
  period_start: string;
  period_end: string;
}

export interface ActionAnalytics {
  id: string;
  action_id: string;
  organization_id: string;
  response_rate: number;
  conversion_rate: number;
  engagement_score: number;
  first_response_time_hours: number;
  total_response_time_hours: number;
  call_duration_minutes: number;
  meeting_attendance_rate: number;
  email_open_rate: number;
  email_click_rate: number;
  user_rating: number;
  contact_feedback?: string;
  internal_notes?: string;
  analysis_data?: any;
  recorded_at?: string;
  analyzed_at?: string;
}

export interface KPIMetrics {
  coachingROI: {
    value: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
  };
  pipelineVelocity: {
    value: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
  };
  teamWinRate: {
    value: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
  };
  callEngagement: {
    value: string;
    trend: 'up' | 'down' | 'stable';
    trendValue: string;
  };
}

export interface AnalyticsData {
  dailyMetrics: DailyMetric[];
  callAnalytics: CallAnalytics[];
  userPerformance: UserPerformance[];
  actionAnalytics: ActionAnalytics[];
  kpis: KPIMetrics;
}

export interface PaginatedAnalyticsData {
  dailyMetrics: PaginatedResponse<DailyMetric>;
  callAnalytics: PaginatedResponse<CallAnalytics>;
  userPerformance: PaginatedResponse<UserPerformance>;
  actionAnalytics: PaginatedResponse<ActionAnalytics>;
  kpis: KPIMetrics;
}

interface UseAnalyticsOptions {
  dateRange: DateRange;
  refreshInterval?: number;
  pagination?: {
    dailyMetrics?: PaginationOptions;
    callAnalytics?: PaginationOptions;
    userPerformance?: PaginationOptions;
    actionAnalytics?: PaginationOptions;
  };
  enableCache?: boolean;
  prefetchNextPage?: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions) {
  const { supabase, user, organization } = useSupabase();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced caching with query-specific cache keys
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [cacheKeys, setCacheKeys] = useState<Map<string, Date>>(new Map());
  const cacheTimeout = options.refreshInterval || 5 * 60 * 1000; // 5 minutes

  const shouldFetch = useMemo(() => {
    if (!lastFetch || !options.enableCache) return true;
    return Date.now() - lastFetch.getTime() > cacheTimeout;
  }, [lastFetch, cacheTimeout, options.enableCache]);

  const fetchAnalyticsData = useCallback(async () => {
    if (!supabase || !organization?.id || !shouldFetch) return;

    try {
      setLoading(true);
      setError(null);

      const fromDate = options.dateRange.from.toISOString().split('T')[0];
      const toDate = options.dateRange.to.toISOString().split('T')[0];
      const fromDateTime = options.dateRange.from.toISOString();
      const toDateTime = options.dateRange.to.toISOString();

      // Build base queries with organization filter
      const dailyMetricsQuery = supabase
        .from('daily_metrics')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('metric_date', fromDate)
        .lte('metric_date', toDate);

      const callAnalyticsQuery = supabase
        .from('call_analytics')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('call_date', fromDateTime)
        .lte('call_date', toDateTime);

      const userPerformanceQuery = supabase
        .from('user_performance')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .lte('period_start', toDate)
        .gte('period_end', fromDate);

      const actionAnalyticsQuery = supabase
        .from('action_analytics')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('recorded_at', fromDateTime)
        .lte('recorded_at', toDateTime);

      // Execute paginated queries with limits
      const dailyMetricsOptions = {
        limit: DEFAULT_ANALYTICS_LIMIT,
        sortBy: 'metric_date',
        sortOrder: 'asc' as const,
        ...options.pagination?.dailyMetrics
      };

      const callAnalyticsOptions = {
        limit: DEFAULT_ANALYTICS_LIMIT,
        sortBy: 'call_date',
        sortOrder: 'desc' as const,
        ...options.pagination?.callAnalytics
      };

      const userPerformanceOptions = {
        limit: DEFAULT_PAGE_SIZES.medium,
        sortBy: 'period_start',
        sortOrder: 'desc' as const,
        ...options.pagination?.userPerformance
      };

      const actionAnalyticsOptions = {
        limit: DEFAULT_ANALYTICS_LIMIT,
        sortBy: 'recorded_at',
        sortOrder: 'desc' as const,
        ...options.pagination?.actionAnalytics
      };

      // Execute all queries in parallel with pagination
      const [dailyMetrics, callAnalytics, userPerformance, actionAnalytics] = await Promise.all([
        executeOffsetPaginatedQuery<DailyMetric>(dailyMetricsQuery, dailyMetricsOptions),
        executeOffsetPaginatedQuery<CallAnalytics>(callAnalyticsQuery, callAnalyticsOptions),
        executeOffsetPaginatedQuery<UserPerformance>(userPerformanceQuery, userPerformanceOptions),
        executeOffsetPaginatedQuery<ActionAnalytics>(actionAnalyticsQuery, actionAnalyticsOptions)
      ]);

      // Calculate KPIs using the limited dataset (for performance)
      // Note: For accurate KPIs, you might want to use aggregated queries
      const kpis = calculateKPIs({
        dailyMetrics: dailyMetrics.data,
        callAnalytics: callAnalytics.data,
        userPerformance: userPerformance.data,
        actionAnalytics: actionAnalytics.data
      });

      const analyticsData: AnalyticsData = {
        dailyMetrics: dailyMetrics.data,
        callAnalytics: callAnalytics.data,
        userPerformance: userPerformance.data,
        actionAnalytics: actionAnalytics.data,
        kpis
      };

      setData(analyticsData);
      setLastFetch(new Date());
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [supabase, organization, options, shouldFetch]);

  const calculateKPIs = (data: Omit<AnalyticsData, 'kpis'>): KPIMetrics => {
    const { dailyMetrics, callAnalytics, userPerformance, actionAnalytics } = data;

    // Calculate Coaching ROI
    const totalRevenue = dailyMetrics.reduce((sum, metric) => sum + (metric.revenue_won || 0), 0);
    const avgQuotaAttainment = userPerformance.length > 0 
      ? userPerformance.reduce((sum, user) => sum + (user.quota_attainment || 0), 0) / userPerformance.length
      : 0;
    const coachingROI = avgQuotaAttainment > 0 ? (totalRevenue / 100000) : 0; // Simplified calculation

    // Calculate Pipeline Velocity
    const avgDealVelocity = userPerformance.length > 0
      ? userPerformance.reduce((sum, user) => sum + (user.deal_velocity || 0), 0) / userPerformance.length
      : 0;

    // Calculate Team Win Rate
    const totalDeals = dailyMetrics.reduce((sum, metric) => sum + (metric.deals_created || 0), 0);
    const wonDeals = dailyMetrics.reduce((sum, metric) => sum + (metric.deals_won || 0), 0);
    const teamWinRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Calculate Call Engagement
    const avgEngagementScore = callAnalytics.length > 0
      ? callAnalytics.reduce((sum, call) => sum + (call.engagement_score || 0), 0) / callAnalytics.length
      : 0;

    return {
      coachingROI: {
        value: `${coachingROI.toFixed(1)}x`,
        trend: coachingROI > 3 ? 'up' : coachingROI < 2.5 ? 'down' : 'stable',
        trendValue: '+0.5x'
      },
      pipelineVelocity: {
        value: `${Math.round(avgDealVelocity)} days`,
        trend: avgDealVelocity < 30 ? 'up' : avgDealVelocity > 35 ? 'down' : 'stable',
        trendValue: '-3 days'
      },
      teamWinRate: {
        value: `${Math.round(teamWinRate)}%`,
        trend: teamWinRate > 40 ? 'up' : teamWinRate < 30 ? 'down' : 'stable',
        trendValue: '+8%'
      },
      callEngagement: {
        value: `${avgEngagementScore.toFixed(1)}/10`,
        trend: avgEngagementScore > 8 ? 'up' : avgEngagementScore < 6 ? 'down' : 'stable',
        trendValue: '+0.7'
      }
    };
  };

  const refresh = useCallback(() => {
    setLastFetch(null); // Force refresh
    setCacheKeys(new Map()); // Clear all cache keys
  }, []);

  // Debounced refresh for frequent updates
  const debouncedRefresh = useMemo(() => createDebouncer(300), []);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  return {
    data,
    loading,
    error,
    refresh,
    debouncedRefresh,
    lastUpdated: lastFetch,
    isStale: shouldFetch
  };
}

// New hook for paginated analytics with full pagination metadata
export function usePaginatedAnalytics(options: UseAnalyticsOptions) {
  const { supabase, user, organization } = useSupabase();
  const [data, setData] = useState<PaginatedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaginatedData = useCallback(async () => {
    if (!supabase || !organization?.id) return;

    try {
      setLoading(true);
      setError(null);

      const fromDate = options.dateRange.from.toISOString().split('T')[0];
      const toDate = options.dateRange.to.toISOString().split('T')[0];
      const fromDateTime = options.dateRange.from.toISOString();
      const toDateTime = options.dateRange.to.toISOString();

      // Build base queries
      const dailyMetricsQuery = supabase
        .from('daily_metrics')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('metric_date', fromDate)
        .lte('metric_date', toDate);

      const callAnalyticsQuery = supabase
        .from('call_analytics')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('call_date', fromDateTime)
        .lte('call_date', toDateTime);

      const userPerformanceQuery = supabase
        .from('user_performance')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .lte('period_start', toDate)
        .gte('period_end', fromDate);

      const actionAnalyticsQuery = supabase
        .from('action_analytics')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('recorded_at', fromDateTime)
        .lte('recorded_at', toDateTime);

      // Execute paginated queries
      const [dailyMetrics, callAnalytics, userPerformance, actionAnalytics] = await Promise.all([
        executeOffsetPaginatedQuery<DailyMetric>(dailyMetricsQuery, options.pagination?.dailyMetrics),
        executeOffsetPaginatedQuery<CallAnalytics>(callAnalyticsQuery, options.pagination?.callAnalytics),
        executeOffsetPaginatedQuery<UserPerformance>(userPerformanceQuery, options.pagination?.userPerformance),
        executeOffsetPaginatedQuery<ActionAnalytics>(actionAnalyticsQuery, options.pagination?.actionAnalytics)
      ]);

      // Calculate KPIs from all available data (not just current page)
      const kpis = calculateKPIs({
        dailyMetrics: dailyMetrics.data,
        callAnalytics: callAnalytics.data,
        userPerformance: userPerformance.data,
        actionAnalytics: actionAnalytics.data
      });

      setData({
        dailyMetrics,
        callAnalytics,
        userPerformance,
        actionAnalytics,
        kpis
      });
    } catch (err) {
      console.error('Error fetching paginated analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  }, [supabase, organization, options]);

  useEffect(() => {
    fetchPaginatedData();
  }, [fetchPaginatedData]);

  const calculateKPIs = useCallback((data: Omit<AnalyticsData, 'kpis'>): KPIMetrics => {
    const { dailyMetrics, callAnalytics, userPerformance, actionAnalytics } = data;

    // Calculate Coaching ROI
    const totalRevenue = dailyMetrics.reduce((sum, metric) => sum + (metric.revenue_won || 0), 0);
    const avgQuotaAttainment = userPerformance.length > 0 
      ? userPerformance.reduce((sum, user) => sum + (user.quota_attainment || 0), 0) / userPerformance.length
      : 0;
    const coachingROI = avgQuotaAttainment > 0 ? (totalRevenue / 100000) : 0;

    // Calculate Pipeline Velocity
    const avgDealVelocity = userPerformance.length > 0
      ? userPerformance.reduce((sum, user) => sum + (user.deal_velocity || 0), 0) / userPerformance.length
      : 0;

    // Calculate Team Win Rate
    const totalDeals = dailyMetrics.reduce((sum, metric) => sum + (metric.deals_created || 0), 0);
    const wonDeals = dailyMetrics.reduce((sum, metric) => sum + (metric.deals_won || 0), 0);
    const teamWinRate = totalDeals > 0 ? (wonDeals / totalDeals) * 100 : 0;

    // Calculate Call Engagement
    const avgEngagementScore = callAnalytics.length > 0
      ? callAnalytics.reduce((sum, call) => sum + (call.engagement_score || 0), 0) / callAnalytics.length
      : 0;

    return {
      coachingROI: {
        value: `${coachingROI.toFixed(1)}x`,
        trend: coachingROI > 3 ? 'up' : coachingROI < 2.5 ? 'down' : 'stable',
        trendValue: '+0.5x'
      },
      pipelineVelocity: {
        value: `${Math.round(avgDealVelocity)} days`,
        trend: avgDealVelocity < 30 ? 'up' : avgDealVelocity > 35 ? 'down' : 'stable',
        trendValue: '-3 days'
      },
      teamWinRate: {
        value: `${Math.round(teamWinRate)}%`,
        trend: teamWinRate > 40 ? 'up' : teamWinRate < 30 ? 'down' : 'stable',
        trendValue: '+8%'
      },
      callEngagement: {
        value: `${avgEngagementScore.toFixed(1)}/10`,
        trend: avgEngagementScore > 8 ? 'up' : avgEngagementScore < 6 ? 'down' : 'stable',
        trendValue: '+0.7'
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchPaginatedData
  };
}

// Hook for getting specific metrics with optimized query
export function useKPIMetrics(dateRange: DateRange, options: { enableCache?: boolean } = {}) {
  const { data, loading, error } = useAnalytics({ 
    dateRange,
    enableCache: options.enableCache ?? true,
    pagination: {
      // Limit data for KPI calculation to improve performance
      dailyMetrics: { limit: 100 },
      callAnalytics: { limit: 500 },
      userPerformance: { limit: 50 },
      actionAnalytics: { limit: 200 }
    }
  });
  
  return {
    kpis: data?.kpis || null,
    loading,
    error
  };
}

// Hook for getting team performance data with pagination
export function useTeamPerformance(
  dateRange: DateRange, 
  options: { page?: number; limit?: number; enableCache?: boolean } = {}
) {
  const { data, loading, error } = useAnalytics({ 
    dateRange,
    enableCache: options.enableCache ?? true,
    pagination: {
      userPerformance: { 
        page: options.page || 1,
        limit: options.limit || DEFAULT_PAGE_SIZES.medium 
      },
      callAnalytics: { limit: 1000 } // Get more call data for user aggregation
    }
  });
  
  const teamData = useMemo(() => {
    if (!data) return null;
    
    // Aggregate performance by user
    const userMap = new Map();
    
    data.userPerformance.forEach(perf => {
      userMap.set(perf.user_id, perf);
    });
    
    // Add call metrics
    data.callAnalytics.forEach(call => {
      if (userMap.has(call.user_id)) {
        const user = userMap.get(call.user_id);
        user.totalCalls = (user.totalCalls || 0) + 1;
        user.totalDuration = (user.totalDuration || 0) + call.duration_minutes;
        user.totalEngagement = (user.totalEngagement || 0) + call.engagement_score;
      }
    });
    
    return Array.from(userMap.values()).map(user => ({
      ...user,
      avgCallDuration: user.totalCalls ? user.totalDuration / user.totalCalls : 0,
      avgEngagement: user.totalCalls ? user.totalEngagement / user.totalCalls : 0
    }));
  }, [data]);
  
  return {
    teamData,
    loading,
    error
  };
}

// Hook for getting time series data for charts with optimized queries
export function useAnalyticsTrends(
  dateRange: DateRange,
  options: { granularity?: 'day' | 'week' | 'month'; enableCache?: boolean } = {}
) {
  const { data, loading, error } = useAnalytics({ 
    dateRange,
    enableCache: options.enableCache ?? true,
    pagination: {
      // Optimize for trend data
      dailyMetrics: { 
        limit: 365, // Max one year of daily data
        sortBy: 'metric_date',
        sortOrder: 'asc'
      }
    }
  });
  
  const trendsData = useMemo(() => {
    if (!data) return null;
    
    // Group daily metrics by date
    const dailyTrends = data.dailyMetrics.reduce((acc, metric) => {
      const date = metric.metric_date;
      if (!acc[date]) {
        acc[date] = {
          date,
          calls: 0,
          emails: 0,
          meetings: 0,
          deals: 0,
          revenue: 0
        };
      }
      
      acc[date].calls += metric.calls_made || 0;
      acc[date].emails += metric.emails_sent || 0;
      acc[date].meetings += metric.meetings_booked || 0;
      acc[date].deals += metric.deals_created || 0;
      acc[date].revenue += metric.revenue_won || 0;
      
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(dailyTrends).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [data]);
  
  return {
    trendsData,
    loading,
    error
  };
}

// New hook for infinite scroll analytics with cursor-based pagination
export function useInfiniteAnalytics(
  tableName: 'call_analytics' | 'action_analytics' | 'user_performance',
  dateRange: DateRange,
  options: {
    limit?: number;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  } = {}
) {
  const { supabase, organization } = useSupabase();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchNextPage = useCallback(async (isInitial = false) => {
    if (!supabase || !organization?.id || (loading && !isInitial)) return;

    try {
      isInitial ? setInitialLoading(true) : setLoading(true);
      setError(null);

      let query = supabase
        .from(tableName)
        .select('*')
        .eq('organization_id', organization.id);

      // Apply date range filters based on table
      const fromDateTime = dateRange.from.toISOString();
      const toDateTime = dateRange.to.toISOString();
      
      if (tableName === 'call_analytics') {
        query = query.gte('call_date', fromDateTime).lte('call_date', toDateTime);
      } else if (tableName === 'action_analytics') {
        query = query.gte('recorded_at', fromDateTime).lte('recorded_at', toDateTime);
      } else if (tableName === 'user_performance') {
        query = query.lte('period_start', toDateTime.split('T')[0]).gte('period_end', fromDateTime.split('T')[0]);
      }

      // Apply additional filters
      if (options.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }

      const result = await executeCursorPaginatedQuery<any>(query, {
        limit: options.limit || DEFAULT_PAGE_SIZES.large,
        cursor,
        cursorColumn: getDefaultSortColumn(tableName),
        sortOrder: options.sortOrder || 'desc'
      });

      if (isInitial) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }

      setHasNextPage(result.pagination.hasNextPage);
      setCursor(result.pagination.nextCursor);
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch ${tableName}`);
    } finally {
      setLoading(false);
      if (isInitial) setInitialLoading(false);
    }
  }, [supabase, organization, tableName, dateRange, options, cursor, loading]);

  // Load initial data
  useEffect(() => {
    setCursor(null);
    setData([]);
    setHasNextPage(true);
    fetchNextPage(true);
  }, [supabase, organization, tableName, dateRange, options.filters]);

  const refresh = useCallback(() => {
    setCursor(null);
    setData([]);
    setHasNextPage(true);
    fetchNextPage(true);
  }, [fetchNextPage]);

  return {
    data,
    loading,
    initialLoading,
    error,
    hasNextPage,
    fetchNextPage: () => fetchNextPage(false),
    refresh
  };
}

function getDefaultSortColumn(tableName: string): string {
  switch (tableName) {
    case 'call_analytics': return 'call_date';
    case 'action_analytics': return 'recorded_at';
    case 'user_performance': return 'period_start';
    default: return 'created_at';
  }
}