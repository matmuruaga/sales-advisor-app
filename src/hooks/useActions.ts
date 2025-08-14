// src/hooks/useActions.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabase, Database } from './useSupabase';

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

export const useActionHistory = (limit: number = 50) => {
  const [history, setHistory] = useState<ActionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('action_history')
        .select(`
          *,
          action:available_actions(*),
          executed_by_user:users(*),
          target_contact:contacts(id, full_name, email),
          target_company:companies(id, name)
        `)
        .order('executed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching action history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch action history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [limit]);

  const executeAction = async (
    actionId: string,
    targetContactId?: string,
    targetCompanyId?: string,
    additionalData?: Record<string, any>
  ) => {
    try {
      // In a real implementation, this would trigger the actual action execution
      // For now, we'll just log the action to history
      const { data, error } = await supabase
        .from('action_history')
        .insert({
          action_id: actionId,
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

      // Refresh history
      await fetchHistory();

      return { success: true, data };
    } catch (err) {
      console.error('Error executing action:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to execute action' };
    }
  };

  // Real-time subscription for action history
  useEffect(() => {
    const subscription = supabase
      .channel('action_history_changes')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'action_history' },
        () => {
          fetchHistory(); // Refresh on new actions
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    executeAction,
  };
};

// Hook for action statistics
export const useActionStats = (timeframe: 'day' | 'week' | 'month' = 'week') => {
  const [stats, setStats] = useState<{
    totalActions: number;
    completedActions: number;
    failedActions: number;
    successRate: number;
    popularActions: Array<{ action: string; count: number }>;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
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

        const { data, error } = await supabase
          .from('action_history')
          .select('status, action:available_actions(title)')
          .gte('executed_at', startDate.toISOString());

        if (error) throw error;

        const totalActions = data.length;
        const completedActions = data.filter(a => a.status === 'completed').length;
        const failedActions = data.filter(a => a.status === 'failed').length;
        const successRate = totalActions > 0 ? (completedActions / totalActions) * 100 : 0;

        // Calculate popular actions
        const actionCounts: Record<string, number> = {};
        data.forEach(item => {
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
      } catch (err) {
        console.error('Error fetching action stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [timeframe]);

  return { stats, loading };
};