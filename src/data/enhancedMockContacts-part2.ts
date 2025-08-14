// src/data/enhancedMockContacts-part2.ts
import { Contact } from '@/data/mockContacts';

export const enhancedMockContactsPart2: Contact[] = [
  {
    // Base contact info
    id: '3',
    name: 'Ana López',
    role: 'Director of Operations',
    company: 'DataSolutions Inc',
    email: 'ana.lopez@datasolutions.com',
    phone: '+1 (555) 456-7890',
    location: 'New York, NY',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    status: 'cold',
    score: 42,
    
    // Business context
    lastActivity: '1 week ago',
    lastContact: 'Initial outreach',
    tags: ['SMB', 'Data Analytics', 'First Contact'],
    revenue: '$300K',
    employees: '25-50',
    industry: 'Data Services',
    source: 'Cold Email',
    pipeline: 'Prospecting',
    probability: 25,
    value: '$12,000',
    nextAction: 'Research company needs',
    notes: 2,
    activities: 5,
    
    // Social profiles
    social: {
      linkedin: 'https://linkedin.com/in/analopez',
      twitter: '@analopez_data',
      instagram: '@ana_datalife'
    },
    
    // Enhanced data - Recent Posts
    recentPosts: [
      {
        id: 'p1',
        platform: 'linkedin',
        content: 'Small companies face unique data challenges. We can\'t afford enterprise solutions but we still need insights to compete. Looking for creative solutions! #SmallBusiness #DataAnalytics',
        date: '2025-07-20',
        engagement: { likes: 23, comments: 8, shares: 3 },
        type: 'text',
        sentiment: 'neutral'
      },
      {
        id: 'p2',
        platform: 'instagram',
        content: 'Another late night working on Q2 reports 📊 Coffee is my best friend right now ☕ #DataLife #SmallBusinessOwner',
        date: '2025-07-22',
        engagement: { likes: 34, comments: 5 },
        type: 'image',
        sentiment: 'negative'
      },
      {
        id: 'p3',
        platform: 'twitter',
        content: 'When you spend 3 hours manually creating a report that should take 10 minutes 😩 There has to be a better way! #DataStruggles #SMBLife',
        date: '2025-07-18',
        engagement: { likes: 12, comments: 4, shares: 2 },
        type: 'text',
        sentiment: 'negative'
      }
    ],
    
    // Recent Comments
    recentComments: [
      {
        id: 'c1',
        platform: 'linkedin',
        postAuthor: 'Robert Kim, Founder at StartupMetrics',
        comment: 'Have you tried any self-service BI tools? We had good luck with some of the newer platforms designed for smaller teams.',
        date: '2025-07-19',
        context: 'Discussion about affordable analytics solutions',
        sentiment: 'neutral'
      },
      {
        id: 'c2',
        platform: 'twitter',
        postAuthor: 'Jenny Walsh, Operations at SmallCorp',
        comment: 'Same here! I\'ve been looking at some automation tools but everything seems designed for big companies with big budgets.',
        date: '2025-07-18',
        context: 'Tweet about manual reporting struggles',
        sentiment: 'negative'
      }
    ],
    
    // Sentiment Analysis
    sentiment: {
      overall: 'neutral',
      aboutOurCompany: 'unknown',
      aboutOurIndustry: 'neutral',
      recentTrend: 'stable',
      confidence: 45
    },
    
    // User Trend
    userTrend: {
      activityLevel: 'low',
      postingFrequency: 'monthly',
      engagementTrend: 'stable',
      topicsFocus: ['Data Analytics', 'Small Business', 'Operations', 'Efficiency'],
      networkGrowth: 'slow'
    },
    
    // Interests
    interests: [
      'Data Analytics', 'Business Intelligence', 'Process Optimization', 'Small Business Growth',
      'Operational Efficiency', 'Cost Management', 'Automation', 'Reporting Tools',
      'Excel Alternatives', 'SMB Technology'
    ],
    
    // Personality Insights
    personalityInsights: {
      communicationStyle: 'formal',
      decisionMaking: 'analytical',
      riskTolerance: 'conservative',
      influence: 'medium',
      networkSize: 'small'
    },
    
    // Professional Background
    professionalBackground: {
      experience: {
        totalYears: 8,
        currentRoleYears: 2,
        previousRoles: [
          {
            title: 'Operations Manager',
            company: 'Regional Services Corp',
            duration: '2019-2023',
            achievements: ['Streamlined reporting processes', 'Reduced operational costs by 15%']
          },
          {
            title: 'Business Analyst',
            company: 'NYC Consulting Group',
            duration: '2017-2019',
            achievements: ['Built financial models', 'Automated monthly reporting']
          }
        ]
      },
      education: [
        {
          degree: 'MS Operations Research',
          school: 'Columbia University',
          year: '2016'
        },
        {
          degree: 'BS Industrial Engineering',
          school: 'NYU',
          year: '2014'
        }
      ],
      certifications: ['Six Sigma Green Belt', 'Project Management Professional', 'Google Analytics'],
      skills: [
        { name: 'Operations Management', endorsements: 34, level: 'advanced' },
        { name: 'Process Improvement', endorsements: 28, level: 'advanced' },
        { name: 'Data Analysis', endorsements: 19, level: 'intermediate' },
        { name: 'Excel/Spreadsheets', endorsements: 42, level: 'expert' }
      ]
    },
    
    // Buying Behavior
    buyingBehavior: {
      decisionTimeframe: 'months',
      budgetAuthority: 'influencer',
      purchaseHistory: [
        { category: 'Accounting Software', timing: '2023', vendor: 'QuickBooks' },
        { category: 'Project Management', timing: '2024', vendor: 'Asana' },
        { category: 'Survey Tool', timing: '2024', vendor: 'SurveyMonkey' }
      ],
      painPoints: [
        'Manual reporting takes too much time',
        'Limited budget for enterprise tools',
        'Need better data visualization',
        'Struggling with data integration',
        'Excel limitations for complex analysis'
      ],
      priorities: [
        'Cost-effective solutions',
        'Easy implementation',
        'User-friendly interface',
        'Quick ROI',
        'Minimal training required'
      ]
    },
    
    // Engagement metrics
    engagement: {
      emailOpens: 3,
      linkClicks: 1,
      callsAnswered: 0,
      socialInteractions: 2,
      contentEngagement: 15
    },
    
    // AI-generated insights
    aiInsights: {
      summary: 'Mid-level operations professional at small company with limited budget. Shows clear frustration with manual processes and is actively seeking solutions. Strong analytical background but cost-conscious.',
      bestApproach: 'Lead with cost-effectiveness and ROI. Offer free trial or freemium option. Focus on ease of use and quick implementation. Emphasize time savings.',
      riskFactors: [
        'Very budget-conscious',
        'Limited decision-making authority',
        'May prefer DIY solutions',
        'Small network for references',
        'Could delay decision due to other priorities'
      ],
      opportunities: [
        'Clear pain points with current processes',
        'Growing company may have increasing needs',
        'Open to exploring new solutions',
        'Values efficiency improvements',
        'Strong analytical skills mean she\'ll appreciate good ROI'
      ],
      nextBestAction: 'Send educational content about affordable data solutions for SMBs. Offer a free consultation and demo of time-saving features.'
    }
  },
  
  {
    // Base contact info
    id: '4',
    name: 'Roberto Chen',
    role: 'Chief Executive Officer',
    company: 'StartupXYZ',
    email: 'roberto@startupxyz.com',
    phone: '+1 (555) 321-9876',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'hot',
    score: 92,
    
    // Business context
    lastActivity: '30 minutes ago',
    lastContact: 'Contract negotiation',
    tags: ['Startup', 'Fast Growth', 'Ready to Buy'],
    revenue: '$1.2M',
    employees: '50-100',
    industry: 'Fintech',
    source: 'Referral',
    pipeline: 'Negotiation',
    probability: 90,
    value: '$35,000',
    nextAction: 'Contract review - Today 4:00 PM',
    notes: 9,
    activities: 23,
    
    // Social profiles
    social: {
      linkedin: 'https://linkedin.com/in/robertochen',
      twitter: '@robertochen',
      instagram: '@roberto_startup_life'
    },
    
    // Enhanced data - Recent Posts
    recentPosts: [
      {
        id: 'p1',
        platform: 'linkedin',
        content: 'Just closed our Series A! 🚀 $15M to accelerate our cross-border payments platform. Huge thanks to our investors and team. Now the real work begins! #StartupLife #Fintech #SeriesA',
        date: '2025-07-28',
        engagement: { likes: 284, comments: 67, shares: 42 },
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'p2',
        platform: 'linkedin',
        content: 'Building in fintech means being obsessed with compliance, security, and user experience. It\'s not easy, but it\'s necessary to earn trust. #Fintech #Startup #Trust',
        date: '2025-07-24',
        engagement: { likes: 156, comments: 28, shares: 15 },
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'p3',
        platform: 'twitter',
        content: 'Hot take: Most startups fail because they try to build everything in-house. Buy vs build decisions matter more than perfect code. 🛠️',
        date: '2025-07-26',
        engagement: { likes: 234, comments: 89, shares: 156 },
        type: 'text',
        sentiment: 'neutral'
      },
      {
        id: 'p4',
        platform: 'instagram',
        content: 'Team dinner celebrating our Series A! 🎉 Grateful for this amazing crew. Next stop: global expansion! 🌍',
        date: '2025-07-29',
        engagement: { likes: 127, comments: 23 },
        type: 'image',
        sentiment: 'positive'
      }
    ],
    
    // Recent Comments
    recentComments: [
      {
        id: 'c1',
        platform: 'linkedin',
        postAuthor: 'Sarah Kim, Partner at TechVC',
        comment: 'Congrats Roberto! Your team\'s execution has been incredible. Excited to be part of this journey.',
        date: '2025-07-28',
        context: 'Celebration post about Series A funding',
        sentiment: 'positive'
      },
      {
        id: 'c2',
        platform: 'linkedin',
        postAuthor: 'Marcus Johnson, CTO at PaymentPro',
        comment: 'So true! We learned this the hard way. Focus on your core differentiator and partner for everything else.',
        date: '2025-07-26',
        context: 'Discussion about build vs buy decisions',
        sentiment: 'positive'
      },
      {
        id: 'c3',
        platform: 'twitter',
        postAuthor: 'Alex Rivera, Founder at FinanceApp',
        comment: 'This! We wasted 6 months building an internal tool that we could have bought for $50/month. Learn from our mistakes 😅',
        date: '2025-07-26',
        context: 'Thread about startup resource allocation',
        sentiment: 'positive'
      }
    ],
    
    // Sentiment Analysis
    sentiment: {
      overall: 'positive',
      aboutOurCompany: 'positive',
      aboutOurIndustry: 'positive',
      recentTrend: 'improving',
      confidence: 94
    },
    
    // User Trend
    userTrend: {
      activityLevel: 'very-high',
      postingFrequency: 'daily',
      engagementTrend: 'increasing',
      topicsFocus: ['Startup Growth', 'Fintech', 'Leadership', 'Fundraising', 'Build vs Buy'],
      networkGrowth: 'fast'
    },
    
    // Interests
    interests: [
      'Fintech Innovation', 'Startup Growth', 'Cross-border Payments', 'Team Building',
      'Venture Capital', 'Product Strategy', 'Market Expansion', 'Compliance',
      'User Experience', 'Technology Partnerships', 'International Business', 'Scaling Operations'
    ],
    
    // Personality Insights
    personalityInsights: {
      communicationStyle: 'casual',
      decisionMaking: 'decisive',
      riskTolerance: 'aggressive',
      influence: 'high',
      networkSize: 'extensive'
    },
    
    // Professional Background
    professionalBackground: {
      experience: {
        totalYears: 10,
        currentRoleYears: 5,
        previousRoles: [
          {
            title: 'VP Product',
            company: 'PayFlow Systems',
            duration: '2018-2020',
            achievements: ['Led product from 0 to $5M ARR', 'Built payments infrastructure']
          },
          {
            title: 'Senior Product Manager',
            company: 'FinanceApp Inc',
            duration: '2015-2018',
            achievements: ['Launched mobile payment features', 'Grew user base by 300%']
          },
          {
            title: 'Product Manager',
            company: 'TechStart Solutions',
            duration: '2013-2015',
            achievements: ['First PM hire', 'Built initial product roadmap']
          }
        ]
      },
      education: [
        {
          degree: 'MBA',
          school: 'Wharton School',
          year: '2015',
          field: 'Finance & Entrepreneurship'
        },
        {
          degree: 'BS Computer Science',
          school: 'UC Berkeley',
          year: '2011'
        }
      ],
      certifications: ['Y Combinator Alumni', 'Techstars Mentor', 'AWS Cloud Practitioner'],
      skills: [
        { name: 'Product Strategy', endorsements: 167, level: 'expert' },
        { name: 'Startup Leadership', endorsements: 234, level: 'expert' },
        { name: 'Fintech', endorsements: 89, level: 'expert' },
        { name: 'Fundraising', endorsements: 156, level: 'advanced' }
      ]
    },
    
    // Buying Behavior
    buyingBehavior: {
      decisionTimeframe: 'immediate',
      budgetAuthority: 'budget-holder',
      purchaseHistory: [
        { category: 'Analytics Platform', timing: '2024', vendor: 'Mixpanel' },
        { category: 'Customer Support', timing: '2024', vendor: 'Intercom' },
        { category: 'DevOps Tools', timing: '2025', vendor: 'DataDog' },
        { category: 'HR Platform', timing: '2025', vendor: 'BambooHR' },
        { category: 'Accounting Software', timing: '2023', vendor: 'NetSuite' }
      ],
      painPoints: [
        'Need better operational visibility',
        'Manual processes slowing growth',
        'Compliance reporting complexity',
        'Team scaling challenges',
        'Data scattered across multiple tools'
      ],
      priorities: [
        'Rapid scaling support',
        'Operational efficiency',
        'Risk management',
        'Team productivity',
        'Regulatory compliance'
      ]
    },
    
    // Engagement metrics
    engagement: {
      emailOpens: 15,
      linkClicks: 8,
      callsAnswered: 4,
      socialInteractions: 25,
      contentEngagement: 92
    },
    
    // AI-generated insights
    aiInsights: {
      summary: 'High-energy CEO of fast-growing fintech startup. Recently raised Series A and actively scaling. Has full budget authority and makes quick decisions. Strong advocate for buy vs build philosophy.',
      bestApproach: 'Move fast with clear value proposition. Focus on scalability and time-to-value. Be prepared for quick decision-making. Emphasize how solution supports rapid growth.',
      riskFactors: [
        'May change priorities quickly',
        'High expectations for immediate results',
        'Could be overextended with current growth',
        'Multiple competing initiatives for attention'
      ],
      opportunities: [
        'Full decision-making authority',
        'Well-funded with growth mandate',
        'Strong network for referrals',
        'Philosophy aligned with buying solutions',
        'Active on social media - potential case study'
      ],
      nextBestAction: 'Present implementation timeline and success metrics. Have contract ready for immediate signing if approved. Emphasize quick deployment.'
    }
  }
];