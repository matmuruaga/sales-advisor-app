// src/hooks/useSupabaseTeamMembers.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useSupabase } from './useSupabase';
import { generateMockTeamMembers, calculateMockTeamMetrics } from '@/lib/mockTeamData';

// Interface que coincide con la estructura esperada por TeamPage
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  territory: string;
  email: string;
  phone: string;
  performance: {
    quotaAttainment: number;
    quotaTrend: 'up' | 'down' | 'stable';
    winRate: number;
    dealVelocity: number;
    pipelineValue: number;
    activitiesCompleted: number;
    callsConnected: number;
    meetingsBooked: number;
    status: 'excellent' | 'good' | 'needs-attention';
  };
  coachingPriority: 'high' | 'medium' | 'low';
  coachingInfo: {
    strengths: string[];
    improvements: string[];
    lastSession: string;
    recommendedActions: string[];
  };
  activityTrends: Array<{
    type: string;
    value: string;
    trend: 'up' | 'down' | 'stable';
  }>;
  recentAchievements?: string[];
  aiInsights: {
    summary: string;
    predictedQuota: number;
    pipelineConversion: number;
    riskFactors: string[];
    opportunities: string[];
    recommendedFocus: string;
  };
}

export const useSupabaseTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, organization } = useSupabase();

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated by trying to get session
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('Session check:', session ? 'Authenticated' : 'No session');
      
      // For development, try to fetch real data first (RLS is disabled for testing)
      // If that fails, fallback to mock data

      // Get current period dates
      const now = new Date();
      const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // First fetch users from the current organization
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('organization_id', organization.id)
        .in('role', ['rep', 'bdr', 'manager']);

      if (usersError) {
        console.error('Users query error:', usersError);
        throw usersError;
      }

      // Then fetch performance data for the current period
      const { data: performanceData, error: perfError } = await supabase
        .from('user_performance')
        .select('*')
        .eq('organization_id', organization.id)
        .lte('period_start', currentPeriodEnd.toISOString().split('T')[0])
        .gte('period_end', currentPeriodStart.toISOString().split('T')[0]);

      if (perfError) {
        console.error('Performance query error:', perfError);
        throw perfError;
      }

      // Combine the data
      const data = usersData?.map(user => {
        const performance = performanceData?.find(p => p.user_id === user.id);
        return {
          ...user,
          user_performance: performance ? [performance] : []
        };
      });

      // Transform data to match TeamMember interface
      const transformedMembers: TeamMember[] = data?.map(user => {
        const performance = user.user_performance?.[0]; // Get first (current) performance record
        
        // Parse activity trends from JSONB
        const parseActivityTrends = (trends: any) => {
          if (!trends) return [];
          
          const trendsObj = typeof trends === 'string' ? JSON.parse(trends) : trends;
          
          return Object.entries(trendsObj).map(([key, value]: [string, any]) => ({
            type: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: value.value,
            trend: value.trend
          }));
        };

        // Format last coaching session
        const formatLastSession = (date: string | null) => {
          if (!date) return 'No recent session';
          const sessionDate = new Date(date);
          const diffTime = Math.abs(Date.now() - sessionDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) return '1 day ago';
          if (diffDays < 7) return `${diffDays} days ago`;
          if (diffDays < 14) return '1 week ago';
          return `${Math.floor(diffDays / 7)} weeks ago`;
        };

        return {
          id: user.id,
          name: user.full_name,
          role: user.role === 'rep' ? 'Account Executive' : 
                user.role === 'bdr' ? 'Business Development Rep' : 
                user.role.charAt(0).toUpperCase() + user.role.slice(1),
          territory: user.territory || 'Unassigned',
          email: user.email,
          phone: '+1 (555) 000-0000', // Default phone since it's not in DB
          performance: {
            quotaAttainment: Number(performance?.quota_attainment || 0),
            quotaTrend: (performance?.quota_trend as 'up' | 'down' | 'stable') || 'stable',
            winRate: Number(performance?.win_rate || 0),
            dealVelocity: performance?.deal_velocity || 0,
            pipelineValue: Number(performance?.pipeline_value || 0),
            activitiesCompleted: performance?.activities_completed || 0,
            callsConnected: performance?.calls_connected || 0,
            meetingsBooked: performance?.meetings_booked || 0,
            status: (performance?.performance_status as 'excellent' | 'good' | 'needs-attention') || 'good'
          },
          coachingPriority: (performance?.coaching_priority as 'high' | 'medium' | 'low') || 'low',
          coachingInfo: {
            strengths: performance?.strengths || [],
            improvements: performance?.improvement_areas || [],
            lastSession: formatLastSession(performance?.last_coaching_session),
            recommendedActions: performance?.recommended_actions || []
          },
          activityTrends: parseActivityTrends(performance?.activity_trends),
          recentAchievements: performance?.recent_achievements || undefined,
          aiInsights: {
            summary: performance?.ai_summary || 'No AI insights available',
            predictedQuota: Number(performance?.predicted_quota || 0),
            pipelineConversion: Number(performance?.pipeline_conversion_rate || 0),
            riskFactors: performance?.risk_factors || [],
            opportunities: performance?.opportunities || [],
            recommendedFocus: performance?.recommended_focus || 'Continue current performance trajectory'
          }
        };
      }) || [];

      console.log('Successfully fetched team members:', transformedMembers.length);
      console.log('Sample team member data:', transformedMembers[0]);
      console.log('Users data:', usersData?.length);
      console.log('Performance data:', performanceData?.length);
      setTeamMembers(transformedMembers);
    } catch (err) {
      console.error('Error fetching team members:', err);
      
      // Fallback to mock data in case of error
      console.log('Falling back to mock data due to error');
      const mockMembers = generateMockTeamMembers();
      setTeamMembers(mockMembers);
      
      // Set error for debugging, but don't block UI since we have fallback data
      setError(`Database error (using mock data): ${err instanceof Error ? err.message : 'Failed to fetch team members'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    
    // Set up real-time subscription for performance updates
    const subscription = supabase
      .channel('team_performance_changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'user_performance' 
        }, 
        () => {
          console.log('Performance data changed, refetching...');
          fetchTeamMembers();
        }
      )
      .subscribe();

    return () => {
      console.log('🧹 Cleaning up team performance subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Calculate team aggregate metrics
  const teamMetrics = calculateMockTeamMetrics(teamMembers);

  return {
    teamMembers,
    teamMetrics,
    loading,
    error,
    refetch: fetchTeamMembers,
  };
};