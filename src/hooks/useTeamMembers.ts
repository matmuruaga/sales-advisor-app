// src/hooks/useTeamMembers.ts
import { useState, useEffect } from 'react';
import { useSupabase, Database } from './useSupabase';
import { getTeamMembers } from '@/lib/userQueries';

type User = Database['public']['Tables']['users']['Row'];
type UserPerformance = Database['public']['Tables']['user_performance']['Row'];

type TeamMemberWithPerformance = User & {
  performance?: UserPerformance;
  contacts_count?: number;
  pipeline_value?: number;
};

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { supabase, user, organization } = useSupabase();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check organization context for RLS
      if (!organization?.id) {
        setError('No organization context available');
        return;
      }

      // Get current period dates
      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // RLS-READY: Fetch users with their performance data using helper
      const users = await getTeamMembers(supabase, organization.id);
      
      if (!users || users.length === 0) {
        console.log('No team members found for organization:', organization.id);
      }

      // Fetch performance data for current period - RLS ready
      const { data: performance, error: perfError } = await supabase
        .from('user_performance')
        .select('*')
        .eq('organization_id', organization.id)
        .gte('period_start', currentPeriodStart.toISOString().split('T')[0])
        .lte('period_end', currentPeriodEnd.toISOString().split('T')[0]);

      if (perfError) throw perfError;

      // Get contact counts and pipeline values
      const { data: contactStats, error: contactsError } = await supabase
        .from('contacts')
        .select('assigned_user_id, deal_value')
        .not('assigned_user_id', 'is', null);

      if (contactsError) throw contactsError;

      // Combine data
      const teamMembersWithPerformance = users.map(user => {
        const userPerformance = performance.find(p => p.user_id === user.id);
        const userContacts = contactStats.filter(c => c.assigned_user_id === user.id);
        const contactsCount = userContacts.length;
        const pipelineValue = userContacts.reduce((sum, c) => sum + (c.deal_value || 0), 0);

        return {
          ...user,
          performance: userPerformance,
          contacts_count: contactsCount,
          pipeline_value: pipelineValue,
        };
      });

      setTeamMembers(teamMembersWithPerformance);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const updateUserPerformance = async (
    userId: string,
    performanceData: Partial<Database['public']['Tables']['user_performance']['Insert']>
  ) => {
    try {
      if (!organization?.id) {
        return { success: false, error: 'No organization context available' };
      }

      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { error } = await supabase
        .from('user_performance')
        .upsert({
          user_id: userId,
          organization_id: organization.id,
          period_start: currentPeriodStart.toISOString().split('T')[0],
          period_end: currentPeriodEnd.toISOString().split('T')[0],
          ...performanceData,
        });

      if (error) throw error;

      await fetchTeamMembers();
      return { success: true };
    } catch (err) {
      console.error('Error updating user performance:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update performance' };
    }
  };

  return {
    teamMembers,
    loading,
    error,
    refetch: fetchTeamMembers,
    updateUserPerformance,
  };
};

// Hook for getting team performance statistics
export const useTeamStats = () => {
  const [stats, setStats] = useState<{
    totalReps: number;
    avgQuotaAttainment: number;
    topPerformers: number;
    needsCoaching: number;
    totalPipelineValue: number;
    avgWinRate: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase, organization } = useSupabase();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        if (!organization?.id) {
          console.error('No organization context for team stats');
          return;
        }

        const now = new Date();
        const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const { data, error } = await supabase
          .from('user_performance')
          .select('quota_attainment, win_rate, pipeline_value, performance_status')
          .eq('organization_id', organization.id)
          .gte('period_start', currentPeriodStart.toISOString().split('T')[0])
          .lte('period_end', currentPeriodEnd.toISOString().split('T')[0]);

        if (error) throw error;

        const totalReps = data.length;
        const avgQuotaAttainment = data.reduce((sum, p) => sum + (p.quota_attainment || 0), 0) / totalReps;
        const topPerformers = data.filter(p => p.performance_status === 'excellent').length;
        const needsCoaching = data.filter(p => p.performance_status === 'needs-attention').length;
        const totalPipelineValue = data.reduce((sum, p) => sum + (p.pipeline_value || 0), 0);
        const avgWinRate = data.reduce((sum, p) => sum + (p.win_rate || 0), 0) / totalReps;

        setStats({
          totalReps,
          avgQuotaAttainment,
          topPerformers,
          needsCoaching,
          totalPipelineValue,
          avgWinRate,
        });
      } catch (err) {
        console.error('Error fetching team stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
};