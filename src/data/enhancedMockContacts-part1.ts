// src/data/enhancedMockContacts-part1.ts
import { Contact } from '@/data/mockContacts';

export const enhancedMockContactsPart1: Contact[] = [
  {
    // Base contact info
    id: '1',
    name: 'María González',
    role: 'Chief Technology Officer',
    company: 'TechCorp Solutions',
    email: 'maria.gonzalez@techcorp.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b9a51201?w=150&h=150&fit=crop&crop=face',
    status: 'hot',
    score: 95,
    
    // Business context
    lastActivity: '2 hours ago',
    lastContact: 'Demo call scheduled',
    tags: ['Enterprise', 'AI/ML', 'Decision Maker'],
    revenue: '$2.5M',
    employees: '500-1000',
    industry: 'Technology',
    source: 'LinkedIn Outreach',
    pipeline: 'Demo Scheduled',
    probability: 85,
    value: '$45,000',
    nextAction: 'Product Demo - Tomorrow 3:00 PM',
    notes: 4,
    activities: 12,
    
    // Social profiles
    social: {
      linkedin: 'https://linkedin.com/in/mariagonzalez',
      twitter: '@mariagonzalez',
      instagram: '@maria_gonzalez_tech'
    },
    
    // Enhanced data - Recent Posts
    recentPosts: [
      {
        id: 'p1',
        platform: 'linkedin',
        content: 'Excited to see how AI is transforming enterprise data analytics. The ROI potential is incredible when implemented correctly. #AI #DataAnalytics #TechLeadership',
        date: '2025-07-25',
        engagement: { likes: 127, comments: 23, shares: 15 },
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'p2',
        platform: 'linkedin',
        content: 'Just wrapped up Q2 reviews. Our data infrastructure improvements are paying off - 40% faster query times and 25% cost reduction. Sometimes the best investments are in the foundation.',
        date: '2025-07-20',
        engagement: { likes: 89, comments: 12, shares: 8 },
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'p3',
        platform: 'instagram',
        content: 'Weekend reading: "The Data-Driven Executive" 📚 Always learning! #TechReads #ContinuousLearning',
        date: '2025-07-21',
        engagement: { likes: 45, comments: 6 },
        type: 'image',
        sentiment: 'neutral'
      }
    ],
    
    // Recent Comments
    recentComments: [
      {
        id: 'c1',
        platform: 'linkedin',
        postAuthor: 'John Smith, CEO at DataFlow',
        comment: 'Completely agree! We\'ve seen similar results with our ML implementations. The key is starting with clean, reliable data architecture.',
        date: '2025-07-24',
        context: 'Post about AI implementation challenges',
        sentiment: 'positive'
      },
      {
        id: 'c2',
        platform: 'linkedin',
        postAuthor: 'Sarah Chen, VP Engineering at CloudTech',
        comment: 'This resonates so much. We spent 6 months on infrastructure before touching ML models. Best decision we made.',
        date: '2025-07-22',
        context: 'Discussion about tech debt and ML readiness',
        sentiment: 'positive'
      }
    ],
    
    // Sentiment Analysis
    sentiment: {
      overall: 'very-positive',
      aboutOurCompany: 'positive',
      aboutOurIndustry: 'very-positive',
      recentTrend: 'improving',
      confidence: 87
    },
    
    // User Trend
    userTrend: {
      activityLevel: 'high',
      postingFrequency: 'weekly',
      engagementTrend: 'increasing',
      topicsFocus: ['AI/ML', 'Data Analytics', 'Tech Leadership', 'Enterprise Architecture'],
      networkGrowth: 'steady'
    },
    
    // Interests
    interests: [
      'Artificial Intelligence', 'Machine Learning', 'Data Analytics', 'Cloud Computing',
      'Digital Transformation', 'Tech Leadership', 'Enterprise Architecture', 'Automation',
      'Cybersecurity', 'Innovation Strategy'
    ],
    
    // Personality Insights
    personalityInsights: {
      communicationStyle: 'technical',
      decisionMaking: 'analytical',
      riskTolerance: 'moderate',
      influence: 'high',
      networkSize: 'large'
    },
    
    // Professional Background
    professionalBackground: {
      experience: {
        totalYears: 15,
        currentRoleYears: 3,
        previousRoles: [
          {
            title: 'VP of Engineering',
            company: 'CloudScale Inc',
            duration: '2018-2022',
            achievements: ['Led 50+ engineer team', 'Reduced infrastructure costs by 35%']
          },
          {
            title: 'Senior Solutions Architect',
            company: 'Enterprise Systems Corp',
            duration: '2015-2018',
            achievements: ['Designed enterprise data platform', 'Led digital transformation initiative']
          }
        ]
      },
      education: [
        {
          degree: 'MS Computer Science',
          school: 'Stanford University',
          year: '2009',
          field: 'Distributed Systems'
        },
        {
          degree: 'BS Electrical Engineering',
          school: 'UC Berkeley',
          year: '2007'
        }
      ],
      certifications: ['AWS Solutions Architect', 'Google Cloud Professional', 'Kubernetes Certified'],
      skills: [
        { name: 'Cloud Architecture', endorsements: 127, level: 'expert' },
        { name: 'Machine Learning', endorsements: 89, level: 'advanced' },
        { name: 'Data Engineering', endorsements: 156, level: 'expert' },
        { name: 'Leadership', endorsements: 203, level: 'expert' }
      ]
    },
    
    // Buying Behavior
    buyingBehavior: {
      decisionTimeframe: 'weeks',
      budgetAuthority: 'decision-maker',
      purchaseHistory: [
        { category: 'Analytics Platform', timing: '2024', vendor: 'Tableau' },
        { category: 'Cloud Infrastructure', timing: '2023', vendor: 'AWS' },
        { category: 'ML Platform', timing: '2024', vendor: 'DataBricks' }
      ],
      painPoints: [
        'Data silos across departments',
        'Manual reporting processes',
        'Lack of real-time insights',
        'High infrastructure costs'
      ],
      priorities: [
        'Cost optimization',
        'Process automation',
        'Data democratization',
        'AI/ML implementation'
      ]
    },
    
    // Engagement metrics
    engagement: {
      emailOpens: 8,
      linkClicks: 3,
      callsAnswered: 2,
      socialInteractions: 15,
      contentEngagement: 78
    },
    
    // AI-generated insights
    aiInsights: {
      summary: 'Highly engaged CTO with strong technical background and decision-making authority. Shows consistent interest in AI/ML solutions and has budget approval power. Recent posts indicate active evaluation of analytics tools.',
      bestApproach: 'Lead with technical depth and ROI metrics. Focus on implementation timeline and cost optimization. Provide detailed architectural diagrams and case studies from similar enterprises.',
      riskFactors: [
        'May be evaluating multiple vendors simultaneously',
        'High technical standards - demo must be flawless',
        'Previous bad experience with overpromising vendors'
      ],
      opportunities: [
        'Clear budget and authority',
        'Active timeline for Q4 implementation',
        'Strong network - potential for referrals',
        'Growing team - expansion potential'
      ],
      nextBestAction: 'Send technical deep-dive materials before demo. Prepare advanced Q&A and have solutions architect available.'
    }
  },
  
  {
    // Base contact info
    id: '2',
    name: 'Carlos Rodríguez',
    role: 'VP of Sales',
    company: 'InnovateAI',
    email: 'carlos@innovateai.com',
    phone: '+1 (555) 987-6543',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    status: 'warm',
    score: 78,
    
    // Business context
    lastActivity: '1 day ago',
    lastContact: 'Pricing discussion',
    tags: ['Mid-Market', 'Sales Tool', 'Budget Approved'],
    revenue: '$850K',
    employees: '100-250',
    industry: 'SaaS',
    source: 'Website Form',
    pipeline: 'Proposal Sent',
    probability: 65,
    value: '$28,000',
    nextAction: 'Follow-up call - Dec 15',
    notes: 7,
    activities: 18,
    
    // Social profiles
    social: {
      linkedin: 'https://linkedin.com/in/carlosrodriguez',
      twitter: '@carlos_sales_vp'
    },
    
    // Enhanced data - Recent Posts
    recentPosts: [
      {
        id: 'p1',
        platform: 'linkedin',
        content: 'Sales teams that invest in the right tools see 28% higher win rates. But it\'s not just about the tool - it\'s about adoption and training. #SalesOps #SalesEnabledment',
        date: '2025-07-23',
        engagement: { likes: 64, comments: 18, shares: 12 },
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'p2',
        platform: 'linkedin',
        content: 'Proud of our team hitting 112% of Q2 quota! 🎉 Success comes from having the right processes, tools, and most importantly, the right people. #SalesResults #TeamWin',
        date: '2025-07-18',
        engagement: { likes: 156, comments: 24, shares: 8 },
        type: 'text',
        sentiment: 'positive'
      },
      {
        id: 'p3',
        platform: 'twitter',
        content: 'Hot take: Most sales tools fail because they solve problems salespeople don\'t actually have. Always validate with your reps first! 🎯',
        date: '2025-07-26',
        engagement: { likes: 89, comments: 23, shares: 45 },
        type: 'text',
        sentiment: 'neutral'
      }
    ],
    
    // Recent Comments
    recentComments: [
      {
        id: 'c1',
        platform: 'linkedin',
        postAuthor: 'Lisa Wang, Sales Director at TechFlow',
        comment: 'This is so true! We spent months evaluating tools but the real game-changer was getting our reps to actually use them consistently.',
        date: '2025-07-25',
        context: 'Discussion about sales tool adoption challenges',
        sentiment: 'positive'
      },
      {
        id: 'c2',
        platform: 'linkedin',
        postAuthor: 'Mike Johnson, CEO at SalesForce Automation',
        comment: 'Great point about training! We see 3x better results when companies invest in proper onboarding for new sales tools.',
        date: '2025-07-24',
        context: 'Post about sales technology ROI',
        sentiment: 'positive'
      }
    ],
    
    // Sentiment Analysis
    sentiment: {
      overall: 'positive',
      aboutOurCompany: 'neutral',
      aboutOurIndustry: 'positive',
      recentTrend: 'stable',
      confidence: 72
    },
    
    // User Trend
    userTrend: {
      activityLevel: 'medium',
      postingFrequency: 'weekly',
      engagementTrend: 'stable',
      topicsFocus: ['Sales Operations', 'Sales Tools', 'Team Management', 'Revenue Growth'],
      networkGrowth: 'steady'
    },
    
    // Interests
    interests: [
      'Sales Operations', 'Revenue Growth', 'Sales Technology', 'Team Leadership',
      'CRM Systems', 'Sales Analytics', 'Performance Management', 'Process Optimization',
      'Customer Success', 'B2B Sales'
    ],
    
    // Personality Insights
    personalityInsights: {
      communicationStyle: 'friendly',
      decisionMaking: 'collaborative',
      riskTolerance: 'moderate',
      influence: 'medium',
      networkSize: 'large'
    },
    
    // Professional Background
    professionalBackground: {
      experience: {
        totalYears: 12,
        currentRoleYears: 2,
        previousRoles: [
          {
            title: 'Sales Director',
            company: 'GrowthTech Solutions',
            duration: '2020-2023',
            achievements: ['Grew team from 5 to 15 reps', 'Increased ARR by 150%']
          },
          {
            title: 'Senior Sales Manager',
            company: 'CloudSoft Inc',
            duration: '2017-2020',
            achievements: ['Top performer 3 years running', 'Led key enterprise accounts']
          }
        ]
      },
      education: [
        {
          degree: 'MBA',
          school: 'UT Austin McCombs',
          year: '2015',
          field: 'Marketing & Strategy'
        },
        {
          degree: 'BS Business Administration',
          school: 'Texas A&M University',
          year: '2011'
        }
      ],
      certifications: ['Salesforce Certified Administrator', 'HubSpot Sales Certification'],
      skills: [
        { name: 'Sales Management', endorsements: 89, level: 'expert' },
        { name: 'Revenue Operations', endorsements: 67, level: 'advanced' },
        { name: 'CRM Administration', endorsements: 45, level: 'advanced' },
        { name: 'Team Leadership', endorsements: 123, level: 'expert' }
      ]
    },
    
    // Buying Behavior
    buyingBehavior: {
      decisionTimeframe: 'weeks',
      budgetAuthority: 'recommender',
      purchaseHistory: [
        { category: 'CRM Platform', timing: '2023', vendor: 'HubSpot' },
        { category: 'Sales Intelligence', timing: '2024', vendor: 'ZoomInfo' },
        { category: 'Email Automation', timing: '2024', vendor: 'Outreach' }
      ],
      painPoints: [
        'Manual data entry by sales reps',
        'Inconsistent sales processes',
        'Lack of pipeline visibility',
        'Poor lead qualification'
      ],
      priorities: [
        'Improve rep productivity',
        'Better sales forecasting',
        'Streamline sales processes',
        'Increase win rates'
      ]
    },
    
    // Engagement metrics
    engagement: {
      emailOpens: 12,
      linkClicks: 7,
      callsAnswered: 3,
      socialInteractions: 8,
      contentEngagement: 65
    },
    
    // AI-generated insights
    aiInsights: {
      summary: 'Experienced sales leader with strong focus on tools and process optimization. Has budget influence but likely needs CEO approval for larger purchases. Active on social media discussing sales technology.',
      bestApproach: 'Focus on ROI and team productivity gains. Provide case studies from similar SaaS companies. Offer pilot program to reduce risk.',
      riskFactors: [
        'May need CEO approval for final decision',
        'Team adoption could be challenging',
        'Competing priorities with other tools'
      ],
      opportunities: [
        'Strong advocate for sales tools',
        'Has experience with tool implementations',
        'Growing team needs better processes',
        'Active in sales community - referral potential'
      ],
      nextBestAction: 'Share customer success stories from similar companies. Propose a small pilot with 3-5 reps to demonstrate value.'
    }
  }
];