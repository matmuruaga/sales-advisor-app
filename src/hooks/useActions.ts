// src/hooks/useActions.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabase, Database } from './useSupabase';
import { 
  PaginationOptions, 
  PaginatedResponse, 
  CursorPaginatedResponse,
  executeOffsetPaginatedQuery,
  executeCursorPaginatedQuery,
  DEFAULT_PAGE_SIZES,
  createDebouncer 
} from '@/lib/pagination';

type ActionCategory = Database['public']['Tables']['action_categories']['Row'];
type AvailableAction = Database['public']['Tables']['available_actions']['Row'];
type ActionHistory = Database['public']['Tables']['action_history']['Row'] & {
  action?: AvailableAction;
  executed_by_user?: Database['public']['Tables']['users']['Row'];
  target_contact?: Database['public']['Tables']['contacts']['Row'];
  target_company?: Database['public']['Tables']['companies']['Row'];
};

export const useActionCategories = () => {
  const [categories, setCategories] = useState<ActionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('action_categories')
          .select('*')
          .order('name');

        if (error) throw error;

        setCategories(data || []);
      } catch (err) {
        console.error('Error fetching action categories:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch action categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

export const useAvailableActions = (categoryId?: string) => {
  const [actions, setActions] = useState<AvailableAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActions = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('available_actions')
          .select('*')
          .eq('is_active', true);

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query.order('title');

        if (error) throw error;

        setActions(data || []);
      } catch (err) {
        console.error('Error fetching available actions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch available actions');
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [categoryId]);

  return { actions, loading, error };
};

// Enhanced hook with pagination support
export const useActionHistory = (options: PaginationOptions & {
  includeDetails?: boolean;
  filters?: {
    status?: string;
    actionId?: string;
    userId?: string;
  };
} = {}) => {
  const { supabase: sb, organization } = useSupabase();
  const [history, setHistory] = useState<PaginatedResponse<ActionHistory> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    if (!sb || !organization?.id) return;

    try {
      setLoading(true);
      setError(null);

      let query = sb
        .from('action_history')
        .select(
          options.includeDetails !== false 
            ? `
              *,
              action:available_actions(*),
              executed_by_user:users(id, full_name, email),
              target_contact:contacts(id, full_name, email),
              target_company:companies(id, name)
            `
            : '*',
          { count: 'exact' }
        )
        .eq('organization_id', organization.id);

      // Apply filters
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }
      if (options.filters?.actionId) {
        query = query.eq('action_id', options.filters.actionId);
      }
      if (options.filters?.userId) {
        query = query.eq('executed_by', options.filters.userId);
      }

      const paginationOptions = {
        page: options.page || 1,
        limit: options.limit || DEFAULT_PAGE_SIZES.large,
        sortBy: options.sortBy || 'executed_at',
        sortOrder: options.sortOrder || 'desc' as const
      };

      const result = await executeOffsetPaginatedQuery<ActionHistory>(query, paginationOptions);
      setHistory(result);
    } catch (err) {
      console.error('Error fetching action history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch action history');
    } finally {
      setLoading(false);
    }
  }, [sb, organization, options]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const executeAction = useCallback(async (
    actionId: string,
    targetContactId?: string,
    targetCompanyId?: string,
    additionalData?: Record<string, any>
  ) => {
    if (!sb || !organization?.id) return { success: false, error: 'Not authenticated' };

    try {
      // In a real implementation, this would trigger the actual action execution
      // For now, we'll just log the action to history
      const { data, error } = await sb
        .from('action_history')
        .insert({
          action_id: actionId,
          organization_id: organization.id,
          target_contact_id: targetContactId,
          target_company_id: targetCompanyId,
          status: 'completed',
          summary: 'Action executed successfully',
          result_details: additionalData || {},
          executed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Refresh history with current pagination
      await fetchHistory();

      return { success: true, data };
    } catch (err) {
      console.error('Error executing action:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to execute action' };
    }
  }, [sb, organization, fetchHistory]);

  // Real-time subscription for action history (optimized)
  useEffect(() => {
    if (!sb || !organization?.id) return;

    const subscription = sb
      .channel('action_history_changes')
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'action_history',
          filter: `organization_id=eq.${organization.id}`
        },
        () => {
          // Debounced refresh to avoid too frequent updates
          const debouncedRefresh = createDebouncer(500);
          debouncedRefresh(fetchHistory);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [sb, organization, fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    executeAction,
  };
};

// Optimized hook for action statistics with caching and limits
export const useActionStats = (
  timeframe: 'day' | 'week' | 'month' = 'week',
  options: { enableCache?: boolean; limit?: number } = {}
) => {
  const { supabase: sb, organization } = useSupabase();
  const [stats, setStats] = useState<{
    totalActions: number;
    completedActions: number;
    failedActions: number;
    successRate: number;
    popularActions: Array<{ action: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  
  const cacheTimeout = 2 * 60 * 1000; // 2 minutes cache

  const shouldFetch = !options.enableCache || !lastFetch || 
    (Date.now() - lastFetch.getTime() > cacheTimeout);

  const fetchStats = useCallback(async () => {
    if (!sb || !organization?.id || !shouldFetch) return;

    try {
      setLoading(true);

      // Calculate date range
      const now = new Date();
      let startDate: Date;

      switch (timeframe) {
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
      }

      // Use aggregation-friendly query with limit
      const { data, error } = await sb
        .from('action_history')
        .select('status, action:available_actions(title)', { count: 'exact' })
        .eq('organization_id', organization.id)
        .gte('executed_at', startDate.toISOString())
        .order('executed_at', { ascending: false })
        .limit(options.limit || 1000); // Limit to recent 1000 actions for performance

      if (error) throw error;

      const totalActions = data?.length || 0;
      const completedActions = data?.filter(a => a.status === 'completed').length || 0;
      const failedActions = data?.filter(a => a.status === 'failed').length || 0;
      const successRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

      // Calculate popular actions
      const actionCounts: Record<string, number> = {};
      data?.forEach(item => {
        const actionTitle = item.action?.title || 'Unknown';
        actionCounts[actionTitle] = (actionCounts[actionTitle] || 0) + 1;
      });

      const popularActions = Object.entries(actionCounts)
        .map(([action, count]) => ({ action, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalActions,
        completedActions,
        failedActions,
        successRate,
        popularActions,
      });
      
      if (options.enableCache) {
        setLastFetch(new Date());
      }
    } catch (err) {
      console.error('Error fetching action stats:', err);
    } finally {
      setLoading(false);
    }
  }, [sb, organization, timeframe, shouldFetch, options]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, refetch: fetchStats };
};

// New hook for infinite scroll action history
export const useInfiniteActionHistory = (
  options: {
    limit?: number;
    filters?: {
      status?: string;
      actionId?: string;
    };
  } = {}
) => {
  const { supabase: sb, organization } = useSupabase();
  const [data, setData] = useState<ActionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchNextPage = useCallback(async (isInitial = false) => {
    if (!sb || !organization?.id || (loading && !isInitial)) return;

    try {
      isInitial ? setInitialLoading(true) : setLoading(true);
      setError(null);

      let query = sb
        .from('action_history')
        .select(`
          *,
          action:available_actions(*),
          executed_by_user:users(id, full_name, email),
          target_contact:contacts(id, full_name, email),
          target_company:companies(id, name)
        `)
        .eq('organization_id', organization.id);

      // Apply filters
      if (options.filters?.status) {
        query = query.eq('status', options.filters.status);
      }
      if (options.filters?.actionId) {
        query = query.eq('action_id', options.filters.actionId);
      }

      const result = await executeCursorPaginatedQuery<ActionHistory>(query, {
        limit: options.limit || DEFAULT_PAGE_SIZES.large,
        cursor,
        cursorColumn: 'executed_at',
        sortOrder: 'desc'
      });

      if (isInitial) {
        setData(result.data);
      } else {
        setData(prev => [...prev, ...result.data]);
      }

      setHasNextPage(result.pagination.hasNextPage);
      setCursor(result.pagination.nextCursor);
    } catch (err) {
      console.error('Error fetching action history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch action history');
    } finally {
      setLoading(false);
      if (isInitial) setInitialLoading(false);
    }
  }, [sb, organization, options, cursor, loading]);

  // Load initial data
  useEffect(() => {
    setCursor(null);
    setData([]);
    setHasNextPage(true);
    fetchNextPage(true);
  }, [sb, organization, options.filters]);

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
};