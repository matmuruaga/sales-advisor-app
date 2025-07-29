// src/data/enhancedMockContacts-part3.ts
import { Contact } from '@/data/mockContacts';

export const enhancedMockContactsPart3: Contact[] = [
  {
    // Base contact info
    id: '5',
    name: 'Elena Pérez',
    role: 'Head of Sales Operations',
    company: 'GlobalTech Ltd',
    email: 'elena.perez@globaltech.com',
    phone: '+1 (555) 789-0123',
    location: 'Boston, MA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    status: 'warm',
    score: 69,
    
    // Business context
    lastActivity: '3 days ago',
    lastContact: 'Feature questions',
    tags: ['Enterprise', 'Sales Ops', 'Technical Buyer'],
    revenue: '$5.8M',
    employees: '1000+',
    industry: 'Technology',
    source: 'Trade Show',
    pipeline: 'Discovery',
    probability: 50,
    value: '$65,000',
    nextAction: 'Technical demo setup',
    notes: 5,
    activities: 14,
    
    // Social profiles
    social: {
      linkedin: 'https://linkedin.com/in/elenaperez',
      twitter: '@elena_salesops'
    },
    
    // Enhanced data - Recent Posts
    recentPosts: [
      {
        id: 'p1',
        platform: 'linkedin',
        content: 'Enterprise sales operations is about finding the balance between process and flexibility. Too much process kills agility, too little creates chaos. #SalesOps #Enterprise',
        date: '2025-07-21',
        engagement: { likes: 87, comments: 23, shares: 12 },
        type: 'text',
        sentiment: 'neutral'
      },
      {
        id: 'p2',
        platform: 'linkedin',
        content: 'Evaluating new sales tools? Don\'t just look at features - consider integration complexity, training requirements, and ongoing maintenance. #SalesOps #TechStack',
        date: '2025-07-15',
        engagement: { likes: 124, comments: 34, shares: 18 },
        type: 'text',
        sentiment: 'neutral'
      },
      {
        id: 'p3',
        platform: 'linkedin',
        content: 'Attended an excellent webinar on AI in sales operations today. The potential is huge, but implementation complexity is real. Need to be strategic about adoption.',
        date: '2025-07-10',
        engagement: { likes: 156, comments: 42, shares: 24 },
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'p4',
        platform: 'twitter',
        content: 'PSA: Your sales tool is only as good as your data quality. Garbage in, garbage out applies everywhere but especially in sales ops. 📊',
        date: '2025-07-12',
        engagement: { likes: 67, comments: 18, shares: 23 },
        type: 'text',
        sentiment: 'neutral'
      }
    ],
    
    // Recent Comments
    recentComments: [
      {
        id: 'c1',
        platform: 'linkedin',
        postAuthor: 'David Wong, VP Sales at TechEnterprise',
        comment: 'Exactly! We spent 6 months on a tool implementation that should have taken 2. Due diligence on the vendor\'s support team is crucial.',
        date: '2025-07-16',
        context: 'Discussion about enterprise tool evaluation',
        sentiment: 'negative'
      },
      {
        id: 'c2',
        platform: 'linkedin',
        postAuthor: 'Jennifer Adams, RevOps Director at SoftwareCorp',
        comment: 'This resonates! We\'ve found that involving end users in the evaluation process early saves so much pain later.',
        date: '2025-07-15',
        context: 'Post about sales tool evaluation best practices',
        sentiment: 'positive'
      },
      {
        id: 'c3',
        platform: 'twitter',
        postAuthor: 'Mike Rodriguez, Sales Analyst at DataFlow',
        comment: 'So true! We spent more time cleaning data than analyzing it for the first year. Now we have strict data governance policies.',
        date: '2025-07-12',
        context: 'Discussion about data quality in sales operations',
        sentiment: 'neutral'
      }
    ],
    
    // Sentiment Analysis
    sentiment: {
      overall: 'neutral',
      aboutOurCompany: 'neutral',
      aboutOurIndustry: 'neutral',
      recentTrend: 'stable',
      confidence: 68
    },
    
    // User Trend
    userTrend: {
      activityLevel: 'medium',
      postingFrequency: 'weekly',
      engagementTrend: 'stable',
      topicsFocus: ['Sales Operations', 'Enterprise Tools', 'Process Optimization', 'Technology Integration', 'Data Management'],
      networkGrowth: 'steady'
    },
    
    // Interests
    interests: [
      'Sales Operations', 'Enterprise Technology', 'Process Optimization', 'Data Analytics',
      'CRM Administration', 'Sales Enablement', 'Team Productivity', 'Technology Integration',
      'Performance Management', 'Workflow Automation', 'Revenue Operations', 'Data Governance'
    ],
    
    // Personality Insights
    personalityInsights: {
      communicationStyle: 'formal',
      decisionMaking: 'analytical',
      riskTolerance: 'conservative',
      influence: 'medium',
      networkSize: 'medium'
    },
    
    // Professional Background
    professionalBackground: {
      experience: {
        totalYears: 14,
        currentRoleYears: 4,
        previousRoles: [
          {
            title: 'Senior Sales Operations Manager',
            company: 'EnterpriseFlow Corp',
            duration: '2017-2021',
            achievements: ['Implemented CRM for 500+ users', 'Reduced sales cycle by 20%', 'Built automated reporting system']
          },
          {
            title: 'Sales Operations Analyst',
            company: 'BigTech Solutions',
            duration: '2014-2017',
            achievements: ['Built sales reporting dashboards', 'Optimized lead routing', 'Managed data quality initiatives']
          },
          {
            title: 'Business Analyst',
            company: 'Corporate Systems Inc',
            duration: '2011-2014',
            achievements: ['Process improvement projects', 'Requirements gathering', 'System implementations']
          }
        ]
      },
      education: [
        {
          degree: 'MS Business Analytics',
          school: 'MIT Sloan',
          year: '2014'
        },
        {
          degree: 'BS Mathematics',
          school: 'Boston University',
          year: '2010'
        }
      ],
      certifications: [
        'Salesforce Advanced Administrator', 
        'HubSpot Revenue Operations', 
        'Tableau Desktop Certified', 
        'Six Sigma Black Belt'
      ],
      skills: [
        { name: 'Sales Operations', endorsements: 156, level: 'expert' },
        { name: 'CRM Administration', endorsements: 134, level: 'expert' },
        { name: 'Data Analysis', endorsements: 89, level: 'advanced' },
        { name: 'Process Optimization', endorsements: 112, level: 'advanced' },
        { name: 'Salesforce', endorsements: 178, level: 'expert' }
      ]
    },
    
    // Buying Behavior
    buyingBehavior: {
      decisionTimeframe: 'months',
      budgetAuthority: 'influencer',
      purchaseHistory: [
        { category: 'CRM Platform', timing: '2022', vendor: 'Salesforce' },
        { category: 'Sales Intelligence', timing: '2023', vendor: 'ZoomInfo' },
        { category: 'Analytics Platform', timing: '2024', vendor: 'Tableau' },
        { category: 'Email Automation', timing: '2023', vendor: 'Pardot' },
        { category: 'Call Recording', timing: '2024', vendor: 'Gong' }
      ],
      painPoints: [
        'Complex tool integrations',
        'Long implementation cycles',
        'User adoption challenges',
        'Data quality issues',
        'Vendor support inconsistencies',
        'Training and change management'
      ],
      priorities: [
        'Seamless integration',
        'Proven enterprise scalability',
        'Strong vendor support',
        'Comprehensive training',
        'Data security and compliance',
        'ROI measurement capabilities'
      ]
    },
    
    // Engagement metrics
    engagement: {
      emailOpens: 6,
      linkClicks: 4,
      callsAnswered: 1,
      socialInteractions: 3,
      contentEngagement: 45
    },
    
    // AI-generated insights
    aiInsights: {
      summary: 'Experienced sales operations professional at large enterprise. Highly analytical and process-focused. Previous experience with tool implementations, both successful and challenging. Values thorough evaluation and strong vendor relationships.',
      bestApproach: 'Lead with technical specifications and integration capabilities. Provide detailed implementation plan and support structure. Reference similar enterprise deployments. Focus on risk mitigation.',
      riskFactors: [
        'Cautious due to past implementation challenges',
        'Complex approval process at large company',
        'High expectations for vendor support',
        'May require extensive customization',
        'Budget cycles and procurement processes',
        'Multiple stakeholders in decision process'
      ],
      opportunities: [
        'Strong influence on technology decisions',
        'Budget available for right solution',
        'Understands value of good sales tools',
        'Established network in sales ops community',
        'Company actively investing in sales technology',
        'Looking to modernize current tech stack'
      ],
      nextBestAction: 'Prepare detailed technical demo focusing on enterprise features and integration capabilities. Include customer references from similar-sized companies. Provide implementation timeline and support model.'
    }
  }
];

// Combined export for easy importing
export const enhancedMockContacts = [
  // Import and combine all parts when needed
];