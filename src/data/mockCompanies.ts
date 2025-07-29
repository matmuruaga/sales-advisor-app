import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const mockCompanies = {
  'TechCorp Solutions': {
    name: 'TechCorp Solutions',
    logo: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=150&h=150&fit=crop&crop=face',
    industry: 'Technology',
    subIndustry: 'Enterprise Software',
    website: 'https://www.techcorpsolutions.com',
    headquarters: 'San Francisco, CA',
    founded: '2008',
    size: '500-1000 employees',
    revenue: '$75M - $150M annually',
    funding: {
      total: '$65M',
      lastRound: {
        type: 'Series C',
        amount: '$30M',
        date: '2023-04-15',
        leadInvestors: ['Accel Partners', 'Sequoia Capital']
      },
      rounds: [
        { type: 'Seed', amount: '$2M', date: '2008-06-01' },
        { type: 'Series A', amount: '$8M', date: '2010-08-12' },
        { type: 'Series B', amount: '$25M', date: '2018-11-30' }
      ]
    },
    stockSymbol: 'Private',
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/techcorp-solutions',
      twitter: '@TechCorpHQ',
      facebook: 'https://facebook.com/techcorpsolutions',
      instagram: 'https://instagram.com/techcorpsolutions'
    },
    keyPeople: [
      { name: 'Jonathan Reynolds', role: 'CEO', linkedIn: 'https://linkedin.com/in/jonathan-reynolds' },
      { name: 'María González', role: 'CTO', linkedIn: 'https://linkedin.com/in/mariagonzalez' },
      { name: 'Sarah Chen', role: 'CFO', linkedIn: 'https://linkedin.com/in/sarah-chen' }
    ],
    products: [
      { name: 'TechCorp Analytics', description: 'Enterprise data analytics platform' },
      { name: 'CloudSecure', description: 'Cloud security and compliance solution' },
      { name: 'DataFlowPro', description: 'Data integration and ETL tools' }
    ],
    competitors: ['Palantir', 'Snowflake', 'Databricks', 'Cloudera'],
    recentNews: [
      {
        title: 'TechCorp Solutions Expands European Presence with New Office in Berlin',
        date: '2025-05-12',
        source: 'TechCrunch'
      },
      {
        title: 'TechCorp Launches AI-Powered Analytics Module',
        date: '2025-03-18',
        source: 'VentureBeat'
      },
      {
        title: 'TechCorp Solutions Named in Gartner Magic Quadrant for Data Analytics',
        date: '2025-01-22',
        source: 'BusinessWire'
      }
    ],
    financialData: {
      growthRate: '32% YoY',
      margins: {
        gross: '72%',
        operating: '18%',
        net: '14%'
      },
      burn: '$1.2M monthly',
      runway: '28 months',
      valuation: '$850M (estimated)'
    },
    companyDescription: 'TechCorp Solutions is a leading provider of enterprise data analytics and cloud security solutions. The company specializes in helping large organizations manage, secure, and extract value from their data assets through a suite of SaaS products. Founded in 2008, TechCorp has established itself as an innovator in the space, with particular strength in regulated industries including finance, healthcare, and government.',
    culture: {
      valuesStatement: 'Innovation, Security, Customer Success, Transparency',
      benefits: ['Unlimited PTO', 'Remote-first', 'Annual company retreats', 'Learning stipend'],
      glassdoorRating: 4.6,
      diversityInitiatives: true
    },
    businessModel: 'SaaS subscription with tiered pricing based on data volume and features. Enterprise contracts average $250K-$500K annually with 90% renewal rates.',
    complianceCertifications: ['SOC 2 Type II', 'GDPR Compliant', 'ISO 27001', 'HIPAA Compliant'],
    partnerships: ['AWS Premier Partner', 'Microsoft Gold Partner', 'Snowflake Partner'],
    customerSegments: ['Enterprise (60%)', 'Mid-market (30%)', 'Government (10%)'],
    customerReferences: [
      {
        name: 'Global Financial Corp',
        quote: 'TechCorp helped us reduce data processing costs by 40% while improving security posture.',
        contact: 'James Wilson, CIO'
      },
      {
        name: 'HealthTech Systems',
        quote: 'The implementation was smooth and we saw ROI within 4 months.',
        contact: 'Priya Sharma, Data Director'
      }
    ],
    marketPosition: {
      strengths: ['Strong security features', 'Intuitive UI', 'Enterprise-grade support'],
      challenges: ['Increasing competition', 'High customer acquisition costs']
    },
    techStack: ['Kubernetes', 'Python', 'React', 'PostgreSQL', 'TensorFlow'],
    officeLocations: ['San Francisco (HQ)', 'New York', 'London', 'Singapore', 'Berlin (new)'],
    salesCycles: {
      average: '90 days',
      stages: {
        discovery: '15-20 days',
        technical: '20-30 days',
        procurement: '40-60 days'
      }
    },
    ourRelationship: {
      currentStage: 'Implementation',
      contractValue: '$285,000/year',
      renewalDate: '2026-02-15',
      keyContacts: [
        { name: 'María González', role: 'Executive Sponsor', sentiment: 'Very Positive' },
        { name: 'Alex Rivera', role: 'Technical Lead', sentiment: 'Positive' }
      ],
      successMetrics: ['Deployment across 4 business units', '30% reduction in data processing time'],
      expansionOpportunity: '$150,000 potential upsell in Q3'
    },
    companyPriorities: [
      'EU market expansion',
      'AI/ML capability enhancement',
      'SOC 3 compliance certification',
      'IPO preparation for 2027'
    ]
  },
  'InnovateAI': {
    name: 'InnovateAI',
    logo: 'https://images.unsplash.com/photo-1643477415841-2c2991d48a39?w=150&h=150&fit=crop&crop=face',
    industry: 'SaaS',
    subIndustry: 'Artificial Intelligence',
    website: 'https://www.innovateai.com',
    headquarters: 'Austin, TX',
    founded: '2018',
    size: '100-250 employees',
    revenue: '$15M - $30M annually',
    funding: {
      total: '$42M',
      lastRound: {
        type: 'Series B',
        amount: '$25M',
        date: '2024-01-10',
        leadInvestors: ['Andreessen Horowitz', 'Lightspeed Venture Partners']
      },
      rounds: [
        { type: 'Seed', amount: '$3M', date: '2018-09-15' },
        { type: 'Series A', amount: '$14M', date: '2021-03-22' }
      ]
    },
    stockSymbol: 'Private',
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/innovate-ai',
      twitter: '@InnovateAI',
      facebook: 'https://facebook.com/InnovateAI',
      instagram: 'https://instagram.com/innovate_ai'
    },
    keyPeople: [
      { name: 'Sophia Lee', role: 'CEO & Co-founder', linkedIn: 'https://linkedin.com/in/sophia-lee' },
      { name: 'Carlos Rodríguez', role: 'VP of Sales', linkedIn: 'https://linkedin.com/in/carlosrodriguez' },
      { name: 'David Zhang', role: 'CTO & Co-founder', linkedIn: 'https://linkedin.com/in/david-zhang' }
    ],
    products: [
      { name: 'AI Sales Copilot', description: 'AI assistant for sales teams' },
      { name: 'ConversionIQ', description: 'Conversation intelligence platform' },
      { name: 'LeadPredict', description: 'Predictive lead scoring and qualification' }
    ],
    competitors: ['Gong.io', 'Chorus.ai', 'SalesLoft', 'Outreach'],
    recentNews: [
      {
        title: 'InnovateAI Closes $25M Series B to Expand AI Sales Platform',
        date: '2024-01-12',
        source: 'TechCrunch'
      },
      {
        title: 'InnovateAI Named to Forbes AI 50 List',
        date: '2024-04-30',
        source: 'Forbes'
      },
      {
        title: 'InnovateAI Launches GPT-4 Powered Sales Coaching Features',
        date: '2025-02-15',
        source: 'VentureBeat'
      }
    ],
    financialData: {
      growthRate: '115% YoY',
      margins: {
        gross: '82%',
        operating: '10%',
        net: '6%'
      },
      burn: '$900K monthly',
      runway: '24 months',
      valuation: '$320M (last round)'
    },
    companyDescription: 'InnovateAI is a rapidly growing AI-powered sales enablement platform helping revenue teams close more deals through conversation intelligence and AI coaching. The company's suite of tools analyze sales calls, provide real-time coaching, and generate personalized follow-ups to improve sales performance.',
    culture: {
      valuesStatement: 'Innovation, Customer Obsession, Team Collaboration, Integrity',
      benefits: ['Flexible work environment', 'Equity for all employees', 'Mental health days', 'Home office stipend'],
      glassdoorRating: 4.8,
      diversityInitiatives: true
    },
    businessModel: 'SaaS with tiered subscription model based on number of users and features. Average contract value of $45K with 96% net retention rate.',
    complianceCertifications: ['SOC 2 Type I', 'GDPR Compliant', 'CCPA Compliant'],
    partnerships: ['Salesforce ISV Partner', 'HubSpot Integration Partner', 'Zoom Marketplace Partner'],
    customerSegments: ['Mid-market (65%)', 'Enterprise (25%)', 'SMB (10%)'],
    customerReferences: [
      {
        name: 'GrowthForce Software',
        quote: 'InnovateAI helped our sales team increase close rates by 28% in just three months.',
        contact: 'Michael Chen, VP Sales'
      },
      {
        name: 'NexGen Solutions',
        quote: 'The AI coaching has transformed our onboarding. New reps reach quota 45% faster.',
        contact: 'Aisha Johnson, Director of Sales Enablement'
      }
    ],
    marketPosition: {
      strengths: ['Advanced AI technology', 'User-friendly interface', 'Quick time-to-value'],
      challenges: ['Enterprise penetration', 'Competition from established players']
    },
    techStack: ['Python', 'React', 'AWS', 'TensorFlow', 'MongoDB'],
    officeLocations: ['Austin (HQ)', 'San Francisco', 'New York', 'London'],
    salesCycles: {
      average: '45 days',
      stages: {
        discovery: '10-15 days',
        technical: '15-20 days',
        procurement: '15-25 days'
      }
    },
    ourRelationship: {
      currentStage: 'Evaluation',
      potentialValue: '$75,000/year',
      decisionDate: '2025-08-30',
      keyContacts: [
        { name: 'Carlos Rodríguez', role: 'Main Contact', sentiment: 'Warm' },
        { name: 'Lisa Park', role: 'Technical Evaluator', sentiment: 'Neutral' }
      ],
      successMetrics: ['POC with sales development team', 'Integration with current CRM'],
      competitiveSituation: 'Also evaluating Gong.io and SalesLoft'
    },
    companyPriorities: [
      'Enterprise market expansion',
      'GPT-4 integration across product suite',
      'International growth in EMEA',
      'Customer success scaling'
    ]
  },
  'DataSolutions Inc': {
    name: 'DataSolutions Inc',
    logo: 'https://images.unsplash.com/photo-1573164713712-03790a178651?w=150&h=150&fit=crop&crop=face',
    industry: 'Data Services',
    subIndustry: 'Data Analytics & Management',
    website: 'https://www.datasolutionsinc.com',
    headquarters: 'New York, NY',
    founded: '2010',
    size: '25-50 employees',
    revenue: '$5M - $10M annually',
    funding: {
      total: '$8.5M',
      lastRound: {
        type: 'Series A',
        amount: '$7M',
        date: '2022-11-08',
        leadInvestors: ['FirstMark Capital', 'Data Collective']
      },
      rounds: [
        { type: 'Seed', amount: '$1.5M', date: '2020-03-05' }
      ]
    },
    stockSymbol: 'Private',
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/datasolutions-inc',
      twitter: '@DataSolutionsHQ',
      github: 'https://github.com/datasolutions'
    },
    keyPeople: [
      { name: 'Robert Johnson', role: 'CEO', linkedIn: 'https://linkedin.com/in/robert-johnson' },
      { name: 'Ana López', role: 'Director of Operations', linkedIn: 'https://linkedin.com/in/analopez' },
      { name: 'Kevin Wu', role: 'Chief Data Scientist', linkedIn: 'https://linkedin.com/in/kevin-wu' }
    ],
    products: [
      { name: 'DataClean', description: 'Data cleaning and preparation platform' },
      { name: 'AnalyticsHub', description: 'Self-service analytics dashboard' },
      { name: 'DataGovernance Suite', description: 'Enterprise data governance tools' }
    ],
    competitors: ['Alteryx', 'Trifacta', 'Talend', 'Informatica'],
    recentNews: [
      {
        title: 'DataSolutions Inc Partners with Microsoft for Azure Integration',
        date: '2025-04-20',
        source: 'ZDNet'
      },
      {
        title: 'DataSolutions Adds ML Capabilities to DataClean Platform',
        date: '2024-12-03',
        source: 'InfoWorld'
      }
    ],
    financialData: {
      growthRate: '45% YoY',
      margins: {
        gross: '68%',
        operating: '5%',
        net: '2%'
      },
      burn: '$350K monthly',
      runway: '18 months',
      valuation: '$35M (estimated)'
    },
    companyDescription: 'DataSolutions Inc provides specialized data management and analytics tools for small and medium businesses. The company focuses on making advanced data capabilities accessible to organizations without dedicated data science teams, offering intuitive self-service platforms for data preparation, analytics, and governance.',
    culture: {
      valuesStatement: 'Simplicity, Accessibility, Accuracy, Customer Focus',
      benefits: ['Hybrid work model', '401k matching', 'Professional development fund'],
      glassdoorRating: 4.2,
      diversityInitiatives: true
    },
    businessModel: 'Dual model with SaaS subscriptions (70% of revenue) and professional services (30%). Average deal size of $30K annually.',
    complianceCertifications: ['SOC 2 Type I', 'GDPR Compliant'],
    partnerships: ['Microsoft Silver Partner', 'AWS Select Partner', 'Snowflake Partner'],
    customerSegments: ['SMB (55%)', 'Mid-market (40%)', 'Enterprise (5%)'],
    customerReferences: [
      {
        name: 'Regional Healthcare Network',
        quote: 'DataSolutions helped us make sense of our patient data without hiring a specialized team.',
        contact: 'Thomas Reed, IT Director'
      }
    ],
    marketPosition: {
      strengths: ['User-friendly interface', 'Affordable pricing', 'Strong customer support'],
      challenges: ['Limited brand recognition', 'Feature gaps compared to enterprise solutions']
    },
    techStack: ['Python', 'React', 'PostgreSQL', 'Docker', 'AWS'],
    officeLocations: ['New York (HQ)', 'Chicago'],
    salesCycles: {
      average: '60 days',
      stages: {
        discovery: '15 days',
        technical: '25 days',
        procurement: '20 days'
      }
    },
    ourRelationship: {
      currentStage: 'Prospecting',
      estimatedValue: '$25,000/year',
      nextSteps: 'Schedule discovery call with Ana López',
      insights: 'Company recently struggled with data migration project; good timing for our solution'
    },
    companyPriorities: [
      'Expanding customer base in healthcare vertical',
      'Enhancing ML capabilities',
      'Improving data visualization tools',
      'Building out partner ecosystem'
    ]
  },
  'StartupXYZ': {
    name: 'StartupXYZ',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop&crop=face',
    industry: 'Fintech',
    subIndustry: 'Payment Processing',
    website: 'https://www.startupxyz.com',
    headquarters: 'Seattle, WA',
    founded: '2020',
    size: '50-100 employees',
    revenue: '$3M - $8M annually',
    funding: {
      total: '$18M',
      lastRound: {
        type: 'Series A',
        amount: '$15M',
        date: '2024-05-17',
        leadInvestors: ['Founders Fund', 'Ribbit Capital']
      },
      rounds: [
        { type: 'Pre-seed', amount: '$500K', date: '2020-08-30' },
        { type: 'Seed', amount: '$2.5M', date: '2022-11-15' }
      ]
    },
    stockSymbol: 'Private',
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/startupxyz',
      twitter: '@StartupXYZ',
      instagram: 'https://instagram.com/startupxyz',
      tiktok: '@startupxyz'
    },
    keyPeople: [
      { name: 'Roberto Chen', role: 'CEO', linkedIn: 'https://linkedin.com/in/robertochen' },
      { name: 'Aisha Martinez', role: 'COO', linkedIn: 'https://linkedin.com/in/aisha-martinez' },
      { name: 'Marcus Kim', role: 'CTO', linkedIn: 'https://linkedin.com/in/marcus-kim' }
    ],
    products: [
      { name: 'PayFlow', description: 'Cross-border payment platform' },
      { name: 'MerchantPortal', description: 'Merchant dashboard and analytics' },
      { name: 'XYZWallet', description: 'Consumer digital wallet' }
    ],
    competitors: ['Stripe', 'Adyen', 'Rapyd', 'Airwallex'],
    recentNews: [
      {
        title: 'StartupXYZ Raises $15M to Expand Cross-Border Payment Platform',
        date: '2024-05-20',
        source: 'FinTech Insider'
      },
      {
        title: 'StartupXYZ Launches in Five New Markets Across Southeast Asia',
        date: '2025-03-10',
        source: 'TechCrunch'
      },
      {
        title: 'StartupXYZ Partners with Major Ecommerce Platform for Integrated Payments',
        date: '2025-06-01',
        source: 'PYMNTS.com'
      }
    ],
    financialData: {
      growthRate: '210% YoY',
      margins: {
        gross: '3.5% (payment volume)',
        operating: '-15%',
        net: '-20%'
      },
      burn: '$800K monthly',
      runway: '16 months',
      valuation: '$120M (last round)'
    },
    companyDescription: 'StartupXYZ is a rapidly growing fintech company revolutionizing cross-border payments for SMBs and online merchants. The platform enables businesses to accept payments in 135+ currencies with competitive FX rates, instant settlement options, and a suite of merchant tools for reconciliation and reporting.',
    culture: {
      valuesStatement: 'Speed, Transparency, Global Mindset, Customer Empowerment',
      benefits: ['Fully remote', 'Unlimited vacation', 'Learning stipend', 'Quarterly team retreats'],
      glassdoorRating: 4.7,
      diversityInitiatives: true
    },
    businessModel: 'Transaction fee model (0.5-2.5% + fixed fee per transaction) plus FX spread on currency conversions. Average merchant processes $40K monthly.',
    complianceCertifications: ['PCI DSS Level 1', 'SOC 2 Type I', 'GDPR Compliant'],
    partnerships: ['Shopify Plus Partner', 'WooCommerce Extension', 'BigCommerce Partner'],
    customerSegments: ['SMB ecommerce (70%)', 'Digital services (20%)', 'Marketplaces (10%)'],
    customerReferences: [
      {
        name: 'GlobalGoods Marketplace',
        quote: 'StartupXYZ reduced our payment processing costs by 35% and increased our cross-border conversion rate.',
        contact: 'Emily Tan, CFO'
      }
    ],
    marketPosition: {
      strengths: ['Lower fees than incumbents', 'Developer-friendly API', 'Fast onboarding'],
      challenges: ['Brand recognition', 'Regulatory complexity across markets']
    },
    techStack: ['Node.js', 'React', 'MongoDB', 'AWS', 'Kubernetes'],
    officeLocations: ['Seattle (HQ)', 'Singapore', 'London', 'Mexico City'],
    salesCycles: {
      average: '30 days',
      stages: {
        discovery: '7 days',
        technical: '14 days',
        integration: '9 days'
      }
    },
    ourRelationship: {
      currentStage: 'Contract Negotiation',
      potentialValue: '$95,000/year',
      closeProbability: '90%',
      keyContacts: [
        { name: 'Roberto Chen', role: 'Decision Maker', sentiment: 'Very Positive' },
        { name: 'Tina Lee', role: 'Procurement', sentiment: 'Neutral' }
      ],
      nextSteps: 'Final contract review scheduled for tomorrow'
    },
    companyPriorities: [
      'Geographic expansion to Latin America',
      'Enhance fraud prevention capabilities',
      'Launch SMB lending product',
      'Achieve regulatory approval in EU markets'
    ]
  },
  'GlobalTech Ltd': {
    name: 'GlobalTech Ltd',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&h=150&fit=crop&crop=face',
    industry: 'Technology',
    subIndustry: 'Enterprise Hardware & Software',
    website: 'https://www.globaltechltd.com',
    headquarters: 'Boston, MA',
    founded: '1995',
    size: '1000+ employees',
    revenue: '$750M - $1B annually',
    funding: {
      type: 'Public',
      IPO: {
        date: '2010-06-15',
        initialValuation: '$1.2B'
      }
    },
    stockSymbol: 'NASDAQ: GLTC',
    marketCap: '$3.8B',
    socialProfiles: {
      linkedin: 'https://linkedin.com/company/globaltech-ltd',
      twitter: '@GlobalTechLtd',
      facebook: 'https://facebook.com/GlobalTechLtd',
      youtube: 'https://youtube.com/GlobalTechLtd'
    },
    keyPeople: [
      { name: 'Richard Morgan', role: 'CEO', linkedIn: 'https://linkedin.com/in/richard-morgan' },
      { name: 'Elena Pérez', role: 'Head of Sales Operations', linkedIn: 'https://linkedin.com/in/elenaperez' },
      { name: 'Hiroshi Tanaka', role: 'CTO', linkedIn: 'https://linkedin.com/in/hiroshi-tanaka' }
    ],
    products: [
      { name: 'Enterprise Cloud Suite', description: 'Comprehensive enterprise cloud solution' },
      { name: 'SecureNet', description: 'Network security infrastructure' },
      { name: 'GlobalTech Analytics', description: 'Business intelligence platform' },
      { name: 'IoT Management Platform', description: 'Enterprise IoT device management' }
    ],
    competitors: ['IBM', 'Oracle', 'Microsoft', 'Cisco'],
    recentNews: [
      {
        title: 'GlobalTech Ltd Acquires AI Security Startup for $95M',
        date: '2025-03-15',
        source: 'Wall Street Journal'
      },
      {
        title: 'GlobalTech Announces New Enterprise IoT Platform',
        date: '2024-11-08',
        source: 'Forbes'
      },
      {
        title: 'GlobalTech Reports Record Q1 Earnings, Beating Analyst Expectations',
        date: '2025-04-30',
        source: 'Bloomberg'
      }
    ],
    financialData: {
      quarterlyEarnings: {
        revenue: '$235M (Q1 2025)',
        growthRate: '12% YoY',
        EPS: '$0.87 (beat by $0.12)'
      },
      margins: {
        gross: '68%',
        operating: '22%',
        net: '16%'
      },
      dividendYield: '1.2%',
      debtToEquity: '0.35'
    },
    companyDescription: 'GlobalTech Ltd is a leading provider of enterprise technology solutions, spanning cloud infrastructure, security, analytics, and IoT management. With a 30-year history of innovation, the company serves Fortune 500 clients worldwide, with particular strength in financial services, healthcare, and manufacturing sectors. GlobalTech is known for its robust, scalable solutions and comprehensive customer support.',
    culture: {
      valuesStatement: 'Innovation, Excellence, Integrity, Customer Commitment',
      employeeReviews: {
        glassdoor: 3.8,
        indeed: 4.0
      },
      diversityStats: {
        womenInLeadership: '38%',
        minorityRepresentation: '42%'
      }
    },
    businessModel: 'Mixed model combining hardware sales, software licensing, subscription services, and professional services. Long-term enterprise contracts averaging 3-5 years.',
    complianceCertifications: ['ISO 27001', 'SOC 2 Type II', 'GDPR Compliant', 'FedRAMP', 'HIPAA Compliant'],
    partnerships: [
      { name: 'Microsoft', type: 'Technology Integration' },
      { name: 'AWS', type: 'Cloud Services Partner' },
      { name: 'Accenture', type: 'Implementation Partner' }
    ],
    customerSegments: ['Enterprise (80%)', 'Government (15%)', 'Mid-market (5%)'],
    customerReferences: [
      {
        name: 'Multinational Bank',
        quote: 'GlobalTechs security solutions have been the backbone of our digital transformation.',
        contact: 'James Williams, CISO'
      },
      {
        name: 'National Healthcare Network',
        quote: 'We ve relied on GlobalTech for 15 years across our 200+ facilities.',
        contact: 'Dr. Sarah Johnson, CIO'
      }
    ],
    acquisitions: [
      { company: 'SecureAI Systems', amount: '$95M', date: '2025-03-01' },
      { company: 'CloudOps Software', amount: '$120M', date: '2023-09-15' },
      { company: 'DataMetrics Inc', amount: '$65M', date: '2021-07-22' }
    ],
    researchDevelopment: {
      spending: '15% of revenue',
      focusAreas: ['Quantum Computing', 'Advanced AI Security', 'Edge Computing'],
      patents: 328
    },
    marketPosition: {
      strengths: ['Established enterprise relationships', 'Comprehensive product ecosystem', 'Strong services organization'],
      challenges: ['Competition from cloud-native startups', 'Reputation for legacy systems']
    },
    sustainability: {
      carbonNeutralTarget: '2030',
      renewableEnergyUse: '65% of operations',
      sustainabilityReport: 'https://www.globaltechltd.com/sustainability'
    },
    officeLocations: [
      'Boston (HQ)', 'San Francisco', 'New York', 'London', 'Tokyo', 
      'Singapore', 'Sydney', 'Berlin', 'Paris', 'Dubai', 'Mumbai'
    ],
    salesProcess: {
      averageCycle: '180 days',
      decisionMakers: 'CIO, CTO, CISO, Procurement',
      approvalLevels: 3
    },
    ourRelationship: {
      status: 'Active Customer',
      annualContract: '$450,000',
      products: ['SecureNet', 'Analytics Platform'],
      accountHealth: 'Strong',
      expansionOpportunity: 'IoT Management Platform - $200,000 additional ARR',
      keyContacts: [
        { name: 'Elena Pérez', role: 'Primary', sentiment: 'Very Positive' },
        { name: 'Thomas Wong', role: 'Technical Advisor', sentiment: 'Positive' },
        { name: 'Jennifer Smith', role: 'Procurement', sentiment: 'Neutral' }
      ],
      history: [
        { type: 'Renewal', date: '2024-06-15', value: '$425,000' },
        { type: 'Initial Contract', date: '2021-06-10', value: '$350,000' }
      ]
    },
    investorRelations: {
      nextEarningsCall: '2025-08-15',
      analystRating: 'Overweight',
      priceTargets: {
        average: '$78.50',
        high: '$92.00',
        low: '$65.00'
      },
      majorShareholders: [
        { name: 'Vanguard Group', stake: '8.2%' },
        { name: 'BlackRock', stake: '7.1%' },
        { name: 'State Street', stake: '4.3%' }
      ]
    }
  }
};