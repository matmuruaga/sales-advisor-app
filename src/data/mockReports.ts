export interface Report {
  id: string;
  title: string;
  category: 'core-performance' | 'pipeline-analysis' | 'additional';
  description: string;
  icon: string;
  metrics: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
  }[];
  lastUpdated: string;
  status: 'live' | 'processing' | 'scheduled';
  featured?: boolean;
  tags: string[];
}

export const mockReports: Report[] = [
  // Core Performance Reports
  {
    id: 'sales-performance',
    title: 'Sales Performance Dashboard',
    category: 'core-performance',
    description: 'Real-time overview of individual and team quota attainment, win rates, and deal velocity',
    icon: 'TrendingUp',
    metrics: [
      { label: 'Team Quota', value: '89.2%', trend: 'up', trendValue: '+5.3%' },
      { label: 'Win Rate', value: '32%', trend: 'stable', trendValue: '0%' },
      { label: 'Avg Deal Size', value: '$45.2K', trend: 'up', trendValue: '+12%' },
      { label: 'Velocity', value: '28 days', trend: 'down', trendValue: '-3 days' }
    ],
    lastUpdated: '2 minutes ago',
    status: 'live',
    featured: true,
    tags: ['revenue', 'performance', 'team']
  },
  {
    id: 'ai-coaching',
    title: 'AI Coaching Effectiveness',
    category: 'core-performance',
    description: 'Impact analysis of AI coaching on rep performance and deal outcomes',
    icon: 'Sparkles',
    metrics: [
      { label: 'Coaching ROI', value: '3.2x', trend: 'up', trendValue: '+0.5x' },
      { label: 'Adoption Rate', value: '78%', trend: 'up', trendValue: '+8%' },
      { label: 'Improvement', value: '+23%', trend: 'up', trendValue: 'win rate' },
      { label: 'Time Saved', value: '4.5 hrs/week', trend: 'stable' }
    ],
    lastUpdated: '5 minutes ago',
    status: 'live',
    featured: true,
    tags: ['ai', 'coaching', 'roi']
  },
  {
    id: 'call-engagement',
    title: 'Call Engagement & Insights',
    category: 'core-performance',
    description: 'Emotional intelligence metrics, talk ratios, and buying signal detection',
    icon: 'Phone',
    metrics: [
      { label: 'Engagement Score', value: '7.8/10', trend: 'up', trendValue: '+0.5' },
      { label: 'Talk Ratio', value: '45:55', trend: 'stable' },
      { label: 'Objections Handled', value: '82%', trend: 'up', trendValue: '+7%' },
      { label: 'Follow-up Rate', value: '91%', trend: 'up', trendValue: '+3%' }
    ],
    lastUpdated: '10 minutes ago',
    status: 'live',
    tags: ['calls', 'engagement', 'emotional-intelligence']
  },

  // Pipeline Analysis Reports
  {
    id: 'pipeline-velocity',
    title: 'Pipeline Velocity & Conversion',
    category: 'pipeline-analysis',
    description: 'Stage progression analysis, conversion rates, and deal stagnation alerts',
    icon: 'BarChart3',
    metrics: [
      { label: 'Pipeline Value', value: '$2.4M', trend: 'up', trendValue: '+$320K' },
      { label: 'Stage Conversion', value: '68%', trend: 'stable' },
      { label: 'Stagnant Deals', value: '12', trend: 'down', trendValue: '-3' },
      { label: 'Forecast Accuracy', value: '87%', trend: 'up', trendValue: '+5%' }
    ],
    lastUpdated: '15 minutes ago',
    status: 'live',
    featured: true,
    tags: ['pipeline', 'forecasting', 'conversion']
  },
  {
    id: 'win-loss',
    title: 'Win/Loss Analysis',
    category: 'pipeline-analysis',
    description: 'Competitive analysis, loss reasons, and successful closing patterns',
    icon: 'Target',
    metrics: [
      { label: 'Win Rate', value: '32%', trend: 'up', trendValue: '+4%' },
      { label: 'vs Competition', value: '45%', trend: 'up', trendValue: '+8%' },
      { label: 'Top Loss Reason', value: 'Pricing', trend: 'stable' },
      { label: 'Best Practice', value: '3-call close', trend: 'stable' }
    ],
    lastUpdated: '20 minutes ago',
    status: 'live',
    tags: ['competitive', 'win-loss', 'patterns']
  },

  // Additional Reports
  {
    id: 'team-benchmarking',
    title: 'Team Performance Benchmarking',
    category: 'additional',
    description: 'Rep performance quartiles, peer comparisons, and skill development tracking',
    icon: 'Users',
    metrics: [
      { label: 'Top Performers', value: '4', trend: 'stable' },
      { label: 'Needs Coaching', value: '2', trend: 'down', trendValue: '-1' },
      { label: 'Avg Ramp Time', value: '3.2 mo', trend: 'down', trendValue: '-0.5 mo' },
      { label: 'Team NPS', value: '72', trend: 'up', trendValue: '+5' }
    ],
    lastUpdated: '30 minutes ago',
    status: 'processing',
    tags: ['team', 'benchmarking', 'talent']
  },
  {
    id: 'usage-analytics',
    title: 'Product Usage & Adoption',
    category: 'additional',
    description: 'Feature adoption rates, user engagement scores, and value realization metrics',
    icon: 'Activity',
    metrics: [
      { label: 'Active Users', value: '92%', trend: 'up', trendValue: '+3%' },
      { label: 'Feature Adoption', value: '67%', trend: 'up', trendValue: '+12%' },
      { label: 'Engagement Score', value: '8.1/10', trend: 'stable' },
      { label: 'Time in App', value: '3.4 hrs/day', trend: 'up', trendValue: '+0.3' }
    ],
    lastUpdated: '1 hour ago',
    status: 'scheduled',
    tags: ['usage', 'adoption', 'engagement']
  },
  {
    id: 'executive-summary',
    title: 'Executive Revenue Intelligence',
    category: 'additional',
    description: 'C-level dashboard with revenue attribution, productivity gains, and strategic insights',
    icon: 'Shield',
    metrics: [
      { label: 'Revenue Impact', value: '+$1.2M', trend: 'up', trendValue: '+18%' },
      { label: 'Productivity', value: '+28%', trend: 'up', trendValue: '+5%' },
      { label: 'Market Share', value: '12%', trend: 'up', trendValue: '+2%' },
      { label: 'CLV', value: '$125K', trend: 'up', trendValue: '+$15K' }
    ],
    lastUpdated: '2 hours ago',
    status: 'scheduled',
    tags: ['executive', 'revenue', 'strategic']
  },
  {
    id: 'competitive-intel',
    title: 'Competitive Intelligence',
    category: 'additional',
    description: 'Competitive mentions, win rates by competitor, and market positioning analysis',
    icon: 'Map',
    metrics: [
      { label: 'Mentions', value: '234', trend: 'up', trendValue: '+45' },
      { label: 'Win vs Comp A', value: '58%', trend: 'up', trendValue: '+8%' },
      { label: 'Win vs Comp B', value: '41%', trend: 'down', trendValue: '-3%' },
      { label: 'Differentiators', value: '5 key', trend: 'stable' }
    ],
    lastUpdated: '3 hours ago',
    status: 'processing',
    tags: ['competitive', 'intelligence', 'market']
  }
];

export const getReportsByCategory = (category: Report['category']) => {
  return mockReports.filter(report => report.category === category);
};

export const getFeaturedReports = () => {
  return mockReports.filter(report => report.featured);
};

export const searchReports = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return mockReports.filter(report => 
    report.title.toLowerCase().includes(lowercaseQuery) ||
    report.description.toLowerCase().includes(lowercaseQuery) ||
    report.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};