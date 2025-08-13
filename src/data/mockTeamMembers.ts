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

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Senior Account Executive',
    territory: 'West Coast - Enterprise',
    email: 'sarah.chen@company.com',
    phone: '+1 (555) 234-5678',
    performance: {
      quotaAttainment: 127,
      quotaTrend: 'up',
      winRate: 68,
      dealVelocity: 28,
      pipelineValue: 850000,
      activitiesCompleted: 342,
      callsConnected: 156,
      meetingsBooked: 48,
      status: 'excellent'
    },
    coachingPriority: 'low',
    coachingInfo: {
      strengths: [
        'Excellent discovery skills',
        'Strong relationship building',
        'Consistent follow-up process',
        'High conversion on demos'
      ],
      improvements: [
        'Could delegate more administrative tasks',
        'Opportunity to mentor junior team members'
      ],
      lastSession: '3 days ago - Discussed scaling strategies',
      recommendedActions: [
        'Consider leading a team workshop on discovery techniques',
        'Document best practices for team playbook'
      ]
    },
    activityTrends: [
      { type: 'Calls per day', value: '12', trend: 'up' },
      { type: 'Email response rate', value: '45%', trend: 'stable' },
      { type: 'Meeting conversion', value: '31%', trend: 'up' }
    ],
    recentAchievements: [
      'Closed largest deal in Q3 ($250K)',
      'Achieved 150% of monthly quota',
      'Perfect customer satisfaction score'
    ],
    aiInsights: {
      summary: 'Sarah is performing exceptionally well with consistent overachievement. Her deal velocity is 20% faster than team average. Strong candidate for leadership development.',
      predictedQuota: 135,
      pipelineConversion: 72,
      riskFactors: [
        'May experience burnout if pace continues',
        'Limited time for strategic account planning'
      ],
      opportunities: [
        'Ready for enterprise account expansion',
        'Could take on mentorship role',
        'Potential for upselling in existing accounts'
      ],
      recommendedFocus: 'Focus on strategic account growth and team leadership development while maintaining current performance levels.'
    }
  },
  {
    id: '2',
    name: 'Michael Torres',
    role: 'Account Executive',
    territory: 'Midwest - Mid-Market',
    email: 'michael.torres@company.com',
    phone: '+1 (555) 345-6789',
    performance: {
      quotaAttainment: 89,
      quotaTrend: 'stable',
      winRate: 52,
      dealVelocity: 35,
      pipelineValue: 420000,
      activitiesCompleted: 298,
      callsConnected: 134,
      meetingsBooked: 32,
      status: 'good'
    },
    coachingPriority: 'medium',
    coachingInfo: {
      strengths: [
        'Good prospecting skills',
        'Strong product knowledge',
        'Improving objection handling'
      ],
      improvements: [
        'Needs to improve closing techniques',
        'Follow-up timing could be more consistent',
        'Discovery questions need more depth'
      ],
      lastSession: '1 week ago - Worked on closing strategies',
      recommendedActions: [
        'Shadow top performers on closing calls',
        'Practice discovery role-plays weekly',
        'Implement structured follow-up system'
      ]
    },
    activityTrends: [
      { type: 'Calls per day', value: '10', trend: 'stable' },
      { type: 'Email response rate', value: '38%', trend: 'down' },
      { type: 'Meeting conversion', value: '24%', trend: 'stable' }
    ],
    aiInsights: {
      summary: 'Michael shows steady performance with room for improvement in closing skills. His pipeline is healthy but conversion rates could be optimized.',
      predictedQuota: 95,
      pipelineConversion: 55,
      riskFactors: [
        'Email engagement declining',
        'Longer deal cycles than average',
        'Need stronger value proposition delivery'
      ],
      opportunities: [
        'Pipeline value suggests potential for quota achievement',
        'Recent training showing early positive results',
        'Strong rapport with technical buyers'
      ],
      recommendedFocus: 'Intensify closing skills training and implement daily practice sessions. Focus on shortening deal cycles through better discovery.'
    }
  },
  {
    id: '3',
    name: 'Lisa Anderson',
    role: 'Senior Account Executive',
    territory: 'East Coast - Enterprise',
    email: 'lisa.anderson@company.com',
    phone: '+1 (555) 456-7890',
    performance: {
      quotaAttainment: 143,
      quotaTrend: 'up',
      winRate: 71,
      dealVelocity: 25,
      pipelineValue: 1200000,
      activitiesCompleted: 387,
      callsConnected: 178,
      meetingsBooked: 56,
      status: 'excellent'
    },
    coachingPriority: 'low',
    coachingInfo: {
      strengths: [
        'Exceptional negotiation skills',
        'Strategic account planning',
        'Executive relationship building',
        'Complex deal navigation'
      ],
      improvements: [
        'Could share more insights with team',
        'Opportunity to contribute to sales strategy'
      ],
      lastSession: '2 weeks ago - Strategic account review',
      recommendedActions: [
        'Lead monthly best practices session',
        'Contribute to sales playbook development',
        'Consider team lead position'
      ]
    },
    activityTrends: [
      { type: 'Calls per day', value: '14', trend: 'up' },
      { type: 'Email response rate', value: '52%', trend: 'up' },
      { type: 'Meeting conversion', value: '36%', trend: 'up' }
    ],
    recentAchievements: [
      'Secured multi-year enterprise contract',
      'Highest win rate on team',
      'Expanded 3 strategic accounts'
    ],
    aiInsights: {
      summary: 'Lisa is a top performer with exceptional results across all metrics. Her deal velocity and win rate are best in class. Ready for expanded responsibilities.',
      predictedQuota: 148,
      pipelineConversion: 75,
      riskFactors: [
        'May be recruited by competitors',
        'Limited bandwidth for new opportunities'
      ],
      opportunities: [
        'Perfect candidate for enterprise team lead',
        'Could mentor multiple team members',
        'Strategic account expansion potential'
      ],
      recommendedFocus: 'Leverage Lisa\'s expertise for team development while ensuring retention through career advancement opportunities.'
    }
  },
  {
    id: '4',
    name: 'Tom Williams',
    role: 'Account Executive',
    territory: 'Southwest - SMB',
    email: 'tom.williams@company.com',
    phone: '+1 (555) 567-8901',
    performance: {
      quotaAttainment: 67,
      quotaTrend: 'down',
      winRate: 41,
      dealVelocity: 42,
      pipelineValue: 280000,
      activitiesCompleted: 256,
      callsConnected: 98,
      meetingsBooked: 22,
      status: 'needs-attention'
    },
    coachingPriority: 'high',
    coachingInfo: {
      strengths: [
        'Persistent and hardworking',
        'Good rapport with SMB buyers',
        'Willing to learn and improve'
      ],
      improvements: [
        'Needs significant improvement in discovery',
        'Qualification criteria too loose',
        'Struggling with competitive positioning',
        'Time management needs work'
      ],
      lastSession: '2 days ago - Emergency performance review',
      recommendedActions: [
        'Daily check-ins for next 2 weeks',
        'Assign senior buddy for shadowing',
        'Focus on fundamentals training',
        'Review and refine ideal customer profile'
      ]
    },
    activityTrends: [
      { type: 'Calls per day', value: '8', trend: 'down' },
      { type: 'Email response rate', value: '28%', trend: 'down' },
      { type: 'Meeting conversion', value: '18%', trend: 'down' }
    ],
    aiInsights: {
      summary: 'Tom is struggling and needs immediate intervention. All key metrics are trending downward. High risk of missing quota significantly.',
      predictedQuota: 72,
      pipelineConversion: 43,
      riskFactors: [
        'Confidence appears to be declining',
        'Poor qualification leading to wasted efforts',
        'May miss quota by 30%+ without intervention',
        'Showing signs of disengagement'
      ],
      opportunities: [
        'Still showing willingness to improve',
        'Has good relationships with some accounts',
        'SMB territory has untapped potential'
      ],
      recommendedFocus: 'Implement intensive coaching program immediately. Focus on basics: qualification, discovery, and time management. Consider territory adjustment if no improvement in 30 days.'
    }
  },
  {
    id: '5',
    name: 'Jennifer Park',
    role: 'Account Executive',
    territory: 'Southeast - Mid-Market',
    email: 'jennifer.park@company.com',
    phone: '+1 (555) 678-9012',
    performance: {
      quotaAttainment: 108,
      quotaTrend: 'up',
      winRate: 59,
      dealVelocity: 31,
      pipelineValue: 520000,
      activitiesCompleted: 312,
      callsConnected: 142,
      meetingsBooked: 38,
      status: 'good'
    },
    coachingPriority: 'medium',
    coachingInfo: {
      strengths: [
        'Excellent activity levels',
        'Good email communication',
        'Strong technical product knowledge',
        'Improving consistently'
      ],
      improvements: [
        'Could improve executive presence',
        'Needs to work on handling pricing objections',
        'Opportunity to increase average deal size'
      ],
      lastSession: '5 days ago - Reviewed pricing strategies',
      recommendedActions: [
        'Executive communication workshop',
        'Practice value-based selling techniques',
        'Focus on upselling and cross-selling'
      ]
    },
    activityTrends: [
      { type: 'Calls per day', value: '11', trend: 'up' },
      { type: 'Email response rate', value: '42%', trend: 'stable' },
      { type: 'Meeting conversion', value: '27%', trend: 'up' }
    ],
    recentAchievements: [
      'First rep to hit quota this quarter',
      'Improved win rate by 15%'
    ],
    aiInsights: {
      summary: 'Jennifer is on a positive trajectory with consistent improvement. She\'s reliable and coachable, with potential to become a top performer.',
      predictedQuota: 112,
      pipelineConversion: 62,
      riskFactors: [
        'Average deal size below team average',
        'Some hesitation in executive meetings'
      ],
      opportunities: [
        'Ready for larger deal training',
        'Could handle more complex accounts',
        'Showing leadership potential'
      ],
      recommendedFocus: 'Continue current coaching trajectory with emphasis on deal expansion strategies and executive engagement skills.'
    }
  },
  {
    id: '6',
    name: 'David Martinez',
    role: 'Account Executive',
    territory: 'Northeast - SMB',
    email: 'david.martinez@company.com',
    phone: '+1 (555) 789-0123',
    performance: {
      quotaAttainment: 95,
      quotaTrend: 'stable',
      winRate: 55,
      dealVelocity: 33,
      pipelineValue: 380000,
      activitiesCompleted: 289,
      callsConnected: 125,
      meetingsBooked: 30,
      status: 'good'
    },
    coachingPriority: 'low',
    coachingInfo: {
      strengths: [
        'Consistent performer',
        'Good relationship management',
        'Strong work ethic',
        'Reliable team player'
      ],
      improvements: [
        'Could be more proactive in prospecting',
        'Opportunity to take on larger deals'
      ],
      lastSession: '1 week ago - Quarterly review',
      recommendedActions: [
        'Advanced prospecting techniques training',
        'Shadow enterprise team for exposure'
      ]
    },
    activityTrends: [
      { type: 'Calls per day', value: '9', trend: 'stable' },
      { type: 'Email response rate', value: '40%', trend: 'stable' },
      { type: 'Meeting conversion', value: '24%', trend: 'stable' }
    ],
    aiInsights: {
      summary: 'David is a steady, reliable performer who consistently comes close to quota. With some adjustments, he could easily exceed targets.',
      predictedQuota: 98,
      pipelineConversion: 58,
      riskFactors: [
        'May become complacent without new challenges',
        'Not maximizing territory potential'
      ],
      opportunities: [
        'Untapped prospects in territory',
        'Ready for stretch assignments',
        'Could mentor new hires'
      ],
      recommendedFocus: 'Challenge David with stretch goals and new account targets. Provide advanced training to help break through to next performance level.'
    }
  }
];