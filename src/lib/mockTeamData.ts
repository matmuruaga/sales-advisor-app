// src/lib/mockTeamData.ts
import { TeamMember } from '@/hooks/useSupabaseTeamMembers';

export const generateMockTeamMembers = (): TeamMember[] => {
  const mockMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      role: 'Account Executive',
      territory: 'North America',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 123-4567',
      performance: {
        quotaAttainment: 124,
        quotaTrend: 'up',
        winRate: 68,
        dealVelocity: 28,
        pipelineValue: 2840000,
        activitiesCompleted: 89,
        callsConnected: 156,
        meetingsBooked: 24,
        status: 'excellent'
      },
      coachingPriority: 'low',
      coachingInfo: {
        strengths: ['Strong closing skills', 'Excellent relationship building', 'Data-driven approach'],
        improvements: ['Could improve prospecting consistency', 'Time management optimization'],
        lastSession: '3 days ago',
        recommendedActions: ['Continue current trajectory', 'Share best practices with team']
      },
      activityTrends: [
        { type: 'Calls Made', value: '145', trend: 'up' },
        { type: 'Emails Sent', value: '234', trend: 'up' },
        { type: 'Meetings Booked', value: '24', trend: 'stable' },
        { type: 'Pipeline Added', value: '$450K', trend: 'up' }
      ],
      recentAchievements: ['Closed $500K deal', 'Hit 120% quota for Q4'],
      aiInsights: {
        summary: 'Top performer with consistent execution across all metrics. Strong in relationship building and closing.',
        predictedQuota: 132,
        pipelineConversion: 24.5,
        riskFactors: [],
        opportunities: ['Mentor junior reps', 'Lead enterprise deals'],
        recommendedFocus: 'Continue excellence, consider stretch goals'
      }
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Business Development Rep',
      territory: 'West Coast',
      email: 'michael.chen@company.com',
      phone: '+1 (555) 234-5678',
      performance: {
        quotaAttainment: 98,
        quotaTrend: 'up',
        winRate: 45,
        dealVelocity: 21,
        pipelineValue: 1240000,
        activitiesCompleted: 134,
        callsConnected: 203,
        meetingsBooked: 18,
        status: 'good'
      },
      coachingPriority: 'medium',
      coachingInfo: {
        strengths: ['High activity levels', 'Good prospecting skills', 'Coachable attitude'],
        improvements: ['Qualification could be tighter', 'Follow-up consistency'],
        lastSession: '1 week ago',
        recommendedActions: ['Focus on qualification process', 'Implement follow-up system']
      },
      activityTrends: [
        { type: 'Calls Made', value: '203', trend: 'up' },
        { type: 'Emails Sent', value: '345', trend: 'stable' },
        { type: 'Meetings Booked', value: '18', trend: 'down' },
        { type: 'Pipeline Added', value: '$180K', trend: 'up' }
      ],
      recentAchievements: ['98% quota attainment', 'Most calls made in team'],
      aiInsights: {
        summary: 'High-activity BDR with good fundamentals. Needs refinement in qualification and follow-up processes.',
        predictedQuota: 105,
        pipelineConversion: 18.2,
        riskFactors: ['Meeting booking trend declining'],
        opportunities: ['Improve qualification', 'Optimize follow-up timing'],
        recommendedFocus: 'Quality over quantity in prospecting'
      }
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      role: 'Account Executive',
      territory: 'Enterprise',
      email: 'emily.rodriguez@company.com',
      phone: '+1 (555) 345-6789',
      performance: {
        quotaAttainment: 76,
        quotaTrend: 'down',
        winRate: 52,
        dealVelocity: 45,
        pipelineValue: 3200000,
        activitiesCompleted: 67,
        callsConnected: 89,
        meetingsBooked: 12,
        status: 'needs-attention'
      },
      coachingPriority: 'high',
      coachingInfo: {
        strengths: ['Enterprise relationship skills', 'Technical knowledge', 'Negotiation skills'],
        improvements: ['Activity levels too low', 'Pipeline velocity', 'Closing urgency'],
        lastSession: '2 days ago',
        recommendedActions: ['Increase daily activities', 'Focus on pipeline acceleration', 'Weekly check-ins']
      },
      activityTrends: [
        { type: 'Calls Made', value: '89', trend: 'down' },
        { type: 'Emails Sent', value: '123', trend: 'down' },
        { type: 'Meetings Booked', value: '12', trend: 'stable' },
        { type: 'Pipeline Added', value: '$320K', trend: 'stable' }
      ],
      recentAchievements: ['Closed major enterprise deal'],
      aiInsights: {
        summary: 'Experienced rep struggling with activity levels and velocity. Strong enterprise skills need better execution.',
        predictedQuota: 82,
        pipelineConversion: 16.8,
        riskFactors: ['Low activity levels', 'Declining trend', 'Long deal cycles'],
        opportunities: ['Increase activity', 'Accelerate existing deals', 'Better time management'],
        recommendedFocus: 'Activity consistency and pipeline acceleration'
      }
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Business Development Rep',
      territory: 'East Coast',
      email: 'david.kim@company.com',
      phone: '+1 (555) 456-7890',
      performance: {
        quotaAttainment: 112,
        quotaTrend: 'stable',
        winRate: 58,
        dealVelocity: 19,
        pipelineValue: 980000,
        activitiesCompleted: 156,
        callsConnected: 187,
        meetingsBooked: 22,
        status: 'excellent'
      },
      coachingPriority: 'low',
      coachingInfo: {
        strengths: ['Consistent performer', 'Good qualification', 'Team player'],
        improvements: ['Could stretch goals higher', 'Leadership development'],
        lastSession: '1 week ago',
        recommendedActions: ['Consider promotion path', 'Mentor newer reps']
      },
      activityTrends: [
        { type: 'Calls Made', value: '187', trend: 'stable' },
        { type: 'Emails Sent', value: '267', trend: 'up' },
        { type: 'Meetings Booked', value: '22', trend: 'up' },
        { type: 'Pipeline Added', value: '$210K', trend: 'stable' }
      ],
      recentAchievements: ['112% quota attainment', 'Best meeting booking rate'],
      aiInsights: {
        summary: 'Solid, consistent performer ready for next level challenges. Good candidate for team lead role.',
        predictedQuota: 115,
        pipelineConversion: 22.4,
        riskFactors: [],
        opportunities: ['Leadership development', 'Stretch goals', 'Complex deal training'],
        recommendedFocus: 'Career development and team leadership'
      }
    },
    {
      id: '5',
      name: 'Jessica Taylor',
      role: 'Account Executive',
      territory: 'Mid-Market',
      email: 'jessica.taylor@company.com',
      phone: '+1 (555) 567-8901',
      performance: {
        quotaAttainment: 91,
        quotaTrend: 'up',
        winRate: 61,
        dealVelocity: 32,
        pipelineValue: 1850000,
        activitiesCompleted: 98,
        callsConnected: 124,
        meetingsBooked: 19,
        status: 'good'
      },
      coachingPriority: 'medium',
      coachingInfo: {
        strengths: ['Good win rate', 'Strong demo skills', 'Customer relationships'],
        improvements: ['Pipeline generation', 'Activity consistency'],
        lastSession: '4 days ago',
        recommendedActions: ['Focus on prospecting', 'Increase activity levels']
      },
      activityTrends: [
        { type: 'Calls Made', value: '124', trend: 'up' },
        { type: 'Emails Sent', value: '189', trend: 'up' },
        { type: 'Meetings Booked', value: '19', trend: 'stable' },
        { type: 'Pipeline Added', value: '$285K', trend: 'up' }
      ],
      recentAchievements: ['91% quota attainment', 'Highest win rate in segment'],
      aiInsights: {
        summary: 'Strong closer with excellent win rate. Needs to focus on pipeline generation to achieve full potential.',
        predictedQuota: 98,
        pipelineConversion: 19.7,
        riskFactors: ['Limited pipeline generation'],
        opportunities: ['Increase prospecting', 'Leverage referrals', 'Cross-sell existing accounts'],
        recommendedFocus: 'Pipeline generation and prospecting consistency'
      }
    }
  ];

  return mockMembers;
};

export const calculateMockTeamMetrics = (members: TeamMember[]) => {
  return {
    averageQuota: members.length > 0 
      ? members.reduce((acc, m) => acc + m.performance.quotaAttainment, 0) / members.length 
      : 0,
    totalPipeline: members.reduce((acc, m) => acc + m.performance.pipelineValue, 0),
    averageWinRate: members.length > 0 
      ? members.reduce((acc, m) => acc + m.performance.winRate, 0) / members.length 
      : 0,
    averageVelocity: members.length > 0 
      ? members.reduce((acc, m) => acc + m.performance.dealVelocity, 0) / members.length 
      : 0,
    criticalCount: members.filter(m => m.performance.status === 'needs-attention').length,
    coachingNeeded: members.filter(m => m.coachingPriority === 'high').length,
  };
};