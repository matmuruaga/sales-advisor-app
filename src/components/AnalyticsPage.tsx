"use client";

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  Calendar,
  Filter,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Phone,
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Brain,
  Zap,
  MessageSquare,
  TrendingDown,
  Info,
  Search,
  X,
  Heart,
  Smile,
  Frown,
  Meh,
  Hash,
  Eye,
  Lightbulb,
  ThumbsUp,
  Activity,
  PieChart,
  BarChart4,
  Cloud,
  Gauge,
  ArrowRight,
  TrendingDown as TrendingDownIcon
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";

// KPI Card Component
const KPICard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon: Icon, 
  color = 'purple',
  insight 
}: {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: any;
  color?: 'purple' | 'indigo' | 'amber' | 'green';
  insight?: string;
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'purple': return 'from-purple-50 to-white border-purple-100';
      case 'indigo': return 'from-indigo-50 to-white border-indigo-100';
      case 'amber': return 'from-amber-50 to-white border-amber-100';
      case 'green': return 'from-green-50 to-white border-green-100';
      default: return 'from-gray-50 to-white border-gray-100';
    }
  };

  const getIconBgColor = () => {
    switch (color) {
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'indigo': return 'bg-indigo-100 text-indigo-600';
      case 'amber': return 'bg-amber-100 text-amber-600';
      case 'green': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <ChevronUp className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ChevronDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-gradient-to-br ${getColorClasses()} hover:shadow-md transition-all cursor-pointer`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${getIconBgColor()}`}>
              <Icon className="w-4 h-4" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            {trendValue && (
              <div className="flex items-center space-x-1 text-sm">
                {getTrendIcon()}
                <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'}>
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {insight && (
            <p className="text-xs text-gray-500 mt-1">{insight}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Filter Bar Component
const FilterBar = ({ filters, setFilters }: any) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filterOptions = {
    team: ['All Teams', 'Enterprise', 'SMB', 'Mid-Market'],
    stage: ['All Stages', 'Discovery', 'Demo', 'Proposal', 'Negotiation', 'Closed'],
    aiInteraction: ['All Levels', 'High', 'Medium', 'Low'],
    timeRange: ['7 Days', '30 Days', '90 Days', 'YTD']
  };

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-xl p-4 shadow-sm border border-gray-200/50">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        {Object.entries(filterOptions).map(([key, options]) => (
          <select
            key={key}
            value={filters[key] || options[0]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ))}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-9 h-8 w-48 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {Object.keys(filters).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({})}
              className="text-xs"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// New Tab Card Design System
const TabCard = ({ title, children, action, variant = 'default' }: {
  title: string;
  children: React.ReactNode;
  action?: string;
  variant?: 'default' | 'metric' | 'insight' | 'chart';
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'metric':
        return 'bg-gradient-to-br from-gray-50 to-white border-gray-200/80 hover:shadow-lg transition-all duration-300';
      case 'insight':
        return 'bg-white border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300';
      case 'chart':
        return 'bg-gradient-to-br from-white to-gray-50/50 border-gray-200/70 shadow-sm hover:shadow-lg transition-all duration-300';
      default:
        return 'bg-white/90 backdrop-blur-sm border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300';
    }
  };

  return (
    <Card className={getVariantStyles()}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-gray-800">{title}</CardTitle>
          {action && (
            <Button variant="ghost" size="sm" className="text-xs text-gray-600 hover:text-gray-800 hover:bg-gray-100">
              {action}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

// Metric Card for Tab Content
const TabMetricCard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon: Icon, 
  insight,
  accentColor = 'gray'
}: {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: any;
  insight?: string;
  accentColor?: 'gray' | 'blue' | 'purple' | 'green' | 'amber';
}) => {
  const getAccentColor = () => {
    switch (accentColor) {
      case 'blue': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'purple': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'amber': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
      className="bg-gradient-to-br from-gray-50 to-white border border-gray-200/80 rounded-xl p-4 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg border ${getAccentColor()}`}>
          <Icon className="w-4 h-4" />
        </div>
        {trendValue && (
          <div className="flex items-center space-x-1">
            {trend === 'up' && <ChevronUp className="w-3 h-3 text-emerald-500" />}
            {trend === 'down' && <ChevronDown className="w-3 h-3 text-red-500" />}
            <span className={`text-xs font-medium ${getTrendColor()}`}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {insight && (
          <p className="text-xs text-gray-500">{insight}</p>
        )}
      </div>
    </motion.div>
  );
};

// Insight Card with Icon
const InsightCard = ({ 
  icon: Icon, 
  title, 
  description, 
  variant = 'neutral',
  action
}: {
  icon: any;
  title: string;
  description: string;
  variant?: 'neutral' | 'success' | 'warning' | 'info';
  action?: string;
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/50 text-emerald-600';
      case 'warning':
        return 'border-amber-200 bg-amber-50/50 text-amber-600';
      case 'info':
        return 'border-blue-200 bg-blue-50/50 text-blue-600';
      default:
        return 'border-gray-200 bg-gray-50/50 text-gray-600';
    }
  };

  return (
    <div className={`rounded-xl p-4 border ${getVariantStyles()}`}>
      <div className="flex items-start space-x-3">
        <Icon className="w-5 h-5 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-800">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
          {action && (
            <Button variant="ghost" size="sm" className="text-xs mt-2 p-0 h-auto font-medium">
              {action} →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Legacy Chart Component (keeping for compatibility)
const ChartCard = ({ title, children, action }: any) => {
  return (
    <TabCard title={title} action={action} variant="chart">
      {children}
    </TabCard>
  );
};

// Mock data for charts
const mockCoachingData = {
  adoptionRate: [
    { month: 'Jan', rate: 65 },
    { month: 'Feb', rate: 72 },
    { month: 'Mar', rate: 78 },
    { month: 'Apr', rate: 82 },
    { month: 'May', rate: 85 },
    { month: 'Jun', rate: 87 }
  ],
  performanceImpact: {
    before: { winRate: 28, dealVelocity: 45, avgDealSize: 35000 },
    after: { winRate: 42, dealVelocity: 32, avgDealSize: 48000 }
  },
  topics: [
    { name: 'Objection Handling', usage: 89, effectiveness: 92 },
    { name: 'Discovery Questions', usage: 76, effectiveness: 88 },
    { name: 'Closing Techniques', usage: 82, effectiveness: 85 },
    { name: 'Value Articulation', usage: 71, effectiveness: 90 }
  ]
};

export function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState('coaching');
  const [filters, setFilters] = useState({});
  const [timeRange, setTimeRange] = useState('30 Days');

  // Calculate dynamic KPIs based on filters
  const kpiData = useMemo(() => ({
    coachingROI: { value: '3.2x', trend: 'up', trendValue: '+0.5x' },
    pipelineVelocity: { value: '28 days', trend: 'down', trendValue: '-3 days' },
    teamWinRate: { value: '42%', trend: 'up', trendValue: '+8%' },
    callEngagement: { value: '8.2/10', trend: 'up', trendValue: '+0.7' }
  }), [filters]);

  return (
    <div className="h-full w-full flex flex-col space-y-4">
      {/* Dashboard Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500">AI-powered insights for sales excellence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hover:bg-purple-50 hover:border-purple-200">
              <Calendar className="w-4 h-4 mr-2" />
              {timeRange}
            </Button>
            <Button variant="outline" size="sm" className="hover:bg-indigo-50 hover:border-indigo-200">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex-shrink-0">
        <FilterBar filters={filters} setFilters={setFilters} />
      </div>

      {/* KPI Summary Grid */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="AI Coaching ROI"
          value={kpiData.coachingROI.value}
          trend={kpiData.coachingROI.trend as any}
          trendValue={kpiData.coachingROI.trendValue}
          icon={Brain}
          color="purple"
          insight="Top quartile performance"
        />
        <KPICard
          title="Pipeline Velocity"
          value={kpiData.pipelineVelocity.value}
          trend={kpiData.pipelineVelocity.trend as any}
          trendValue={kpiData.pipelineVelocity.trendValue}
          icon={Zap}
          color="indigo"
          insight="25% faster than baseline"
        />
        <KPICard
          title="Team Win Rate"
          value={kpiData.teamWinRate.value}
          trend={kpiData.teamWinRate.trend as any}
          trendValue={kpiData.teamWinRate.trendValue}
          icon={Target}
          color="green"
          insight="Above industry average"
        />
        <KPICard
          title="Call Engagement"
          value={kpiData.callEngagement.value}
          trend={kpiData.callEngagement.trend as any}
          trendValue={kpiData.callEngagement.trendValue}
          icon={Phone}
          color="amber"
          insight="Emotional intelligence improving"
        />
      </div>

      {/* Dashboard Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-5 bg-gray-100/50 mb-4">
            <TabsTrigger value="coaching" className="data-[state=active]:bg-white data-[state=active]:text-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Coaching
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">
              <DollarSign className="w-4 h-4 mr-2" />
              Pipeline Intel
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white data-[state=active]:text-green-700">
              <Users className="w-4 h-4 mr-2" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger value="calls" className="data-[state=active]:bg-white data-[state=active]:text-amber-700">
              <Phone className="w-4 h-4 mr-2" />
              Call Intelligence
            </TabsTrigger>
            <TabsTrigger value="executive" className="data-[state=active]:bg-white data-[state=active]:text-gray-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Executive View
            </TabsTrigger>
          </TabsList>

          {/* AI Coaching Tab Content */}
          <TabsContent value="coaching" className="flex-1 overflow-y-auto space-y-4 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Adoption Rate Chart */}
              <TabCard title="AI Coaching Adoption Rate" action="View Details" variant="chart">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Current Adoption</span>
                    <span className="font-semibold text-purple-700">87.3%</span>
                  </div>
                  <Progress value={87.3} className="h-2 [&>div]:bg-purple-500" />
                  
                  {/* Simple bar chart visualization */}
                  <div className="flex items-end justify-between h-32 mt-4">
                    {mockCoachingData.adoptionRate.map((item, index) => (
                      <div key={item.month} className="flex flex-col items-center flex-1">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${item.rate}%` }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t-md mx-0.5"
                        />
                        <span className="text-xs text-gray-500 mt-1">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabCard>

              {/* Performance Impact */}
              <TabCard title="Performance Impact" action="Compare Periods" variant="chart">
                <div className="space-y-4">
                  {Object.entries({
                    'Win Rate': { 
                      before: mockCoachingData.performanceImpact.before.winRate,
                      after: mockCoachingData.performanceImpact.after.winRate,
                      unit: '%'
                    },
                    'Deal Velocity': {
                      before: mockCoachingData.performanceImpact.before.dealVelocity,
                      after: mockCoachingData.performanceImpact.after.dealVelocity,
                      unit: ' days',
                      inverse: true
                    },
                    'Avg Deal Size': {
                      before: mockCoachingData.performanceImpact.before.avgDealSize / 1000,
                      after: mockCoachingData.performanceImpact.after.avgDealSize / 1000,
                      unit: 'K',
                      prefix: '$'
                    }
                  }).map(([metric, data]) => {
                    const improvement = data.inverse 
                      ? ((data.before - data.after) / data.before * 100).toFixed(1)
                      : ((data.after - data.before) / data.before * 100).toFixed(1);
                    
                    return (
                      <div key={metric} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{metric}</span>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            +{improvement}%
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">Before AI</div>
                            <div className="h-6 bg-gray-200 rounded flex items-center px-2">
                              <span className="text-xs font-medium">
                                {data.prefix}{data.before}{data.unit}
                              </span>
                            </div>
                          </div>
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 mb-1">After AI</div>
                            <div className="h-6 bg-purple-100 rounded flex items-center px-2">
                              <span className="text-xs font-medium text-purple-700">
                                {data.prefix}{data.after}{data.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </TabCard>
            </div>

            {/* Coaching Topics Effectiveness */}
            <TabCard title="Coaching Topics Effectiveness" variant="chart">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mockCoachingData.topics.map((topic) => (
                  <motion.div
                    key={topic.name}
                    whileHover={{ scale: 1.02 }}
                    className="p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200"
                  >
                    <h4 className="text-sm font-medium text-gray-700 mb-3">{topic.name}</h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Usage</span>
                          <span>{topic.usage}%</span>
                        </div>
                        <Progress value={topic.usage} className="h-1.5 [&>div]:bg-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Effectiveness</span>
                          <span>{topic.effectiveness}%</span>
                        </div>
                        <Progress value={topic.effectiveness} className="h-1.5 [&>div]:bg-green-400" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </TabCard>

            {/* AI Insights Panel */}
            <TabCard title="AI Insights & Recommendations" variant="insight">
              <div className="space-y-3">
                <InsightCard
                  icon={CheckCircle}
                  title="High Performer Pattern Detected"
                  description="Reps using AI suggestions for discovery questions show 35% higher close rates"
                  variant="success"
                />
                <InsightCard
                  icon={AlertCircle}
                  title="Coaching Opportunity"
                  description="3 team members haven't engaged with objection handling training this week"
                  variant="warning"
                />
                <InsightCard
                  icon={TrendingUp}
                  title="Momentum Building"
                  description="Team adoption rate increased 12% this month - on track for 95% by quarter end"
                  variant="info"
                />
              </div>
            </TabCard>
          </TabsContent>

          {/* Pipeline Intelligence Tab - Enhanced */}
          <TabsContent value="pipeline" className="flex-1 overflow-y-auto space-y-4 mt-0">
            {/* Main Pipeline Intelligence Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <TabMetricCard
                title="Deal Velocity"
                value="28 days"
                trend="down"
                trendValue="-5 days"
                icon={Zap}
                accentColor="blue"
                insight="25% faster than baseline"
              />
              <TabMetricCard
                title="Health Score"
                value="84/100"
                trend="up"
                trendValue="+6 pts"
                icon={Heart}
                accentColor="green"
                insight="AI risk assessment"
              />
              <TabMetricCard
                title="Win Probability"
                value="68%"
                trend="up"
                trendValue="+12%"
                icon={Target}
                accentColor="purple"
                insight="ML prediction model"
              />
              <TabMetricCard
                title="Pipeline Coverage"
                value="3.2x"
                trend="up"
                trendValue="+0.4x"
                icon={BarChart3}
                accentColor="amber"
                insight="Target: 3.0x minimum"
              />
              <TabMetricCard
                title="Forecast Confidence"
                value="87%"
                trend="up"
                trendValue="+5%"
                icon={Brain}
                accentColor="gray"
                insight="High accuracy quarter"
              />
            </div>

            {/* Deal Health Scoring Section */}
            <TabCard title="Deal Health Analysis" variant="chart" action="View Risk Details">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {/* Health Score Distribution */}
                    <div className="grid grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-green-700">24</div>
                        <div className="text-xs text-green-600">Healthy (80-100)</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                        <AlertCircle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-amber-700">12</div>
                        <div className="text-xs text-amber-600">Caution (60-79)</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                        <X className="w-5 h-5 text-red-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-red-700">8</div>
                        <div className="text-xs text-red-600">At Risk (40-59)</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                        <TrendingDown className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-gray-700">3</div>
                        <div className="text-xs text-gray-600">Critical (&lt;40)</div>
                      </div>
                    </div>

                    {/* Health Factors Breakdown */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Top Health Factors</h4>
                      {[
                        { factor: 'Champion Engagement', score: 92, impact: 'high', trend: 'up' },
                        { factor: 'Budget Authority', score: 78, impact: 'high', trend: 'stable' },
                        { factor: 'Timeline Urgency', score: 85, impact: 'medium', trend: 'up' },
                        { factor: 'Technical Fit', score: 89, impact: 'medium', trend: 'stable' },
                        { factor: 'Competitive Position', score: 76, impact: 'high', trend: 'down' }
                      ].map((factor) => (
                        <div key={factor.factor} className="flex items-center space-x-3">
                          <div className="w-32 text-xs text-gray-600 truncate">{factor.factor}</div>
                          <div className="flex-1 relative">
                            <div className="h-2 bg-gray-200 rounded">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${factor.score}%` }}
                                className={`h-2 rounded ${
                                  factor.score >= 85 ? 'bg-green-500' :
                                  factor.score >= 70 ? 'bg-amber-500' : 'bg-red-500'
                                }`}
                              />
                            </div>
                          </div>
                          <div className="w-8 text-xs font-medium text-right">{factor.score}</div>
                          <div className="w-4">
                            {factor.trend === 'up' && <ChevronUp className="w-3 h-3 text-green-500" />}
                            {factor.trend === 'down' && <ChevronDown className="w-3 h-3 text-red-500" />}
                            {factor.trend === 'stable' && <div className="w-3 h-3" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Recovery Recommendations</h4>
                    <div className="space-y-3">
                      <InsightCard
                        icon={Lightbulb}
                        title="Champion Risk"
                        description="3 deals need immediate champion re-engagement"
                        variant="warning"
                        action="View Actions"
                      />
                      <InsightCard
                        icon={Clock}
                        title="Stalled Pipeline"
                        description="5 deals stalled >30 days, schedule urgency calls"
                        variant="info"
                        action="Create Tasks"
                      />
                      <InsightCard
                        icon={Target}
                        title="Win-Back Opportunity"
                        description="$840K in recoverable pipeline value"
                        variant="success"
                        action="Build Plan"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>

            {/* Predictive Analytics & Competitive Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TabCard title="Predictive Analytics" variant="chart" action="View Model">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">$1.9M</div>
                    <div className="text-sm text-purple-600">Expected Close Value</div>
                    <div className="text-xs text-gray-500 mt-1">Next 90 days</div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Stage Progression Probability</h4>
                    {[
                      { stage: 'Discovery → Demo', probability: 78, deals: 12 },
                      { stage: 'Demo → Proposal', probability: 62, deals: 8 },
                      { stage: 'Proposal → Negotiation', probability: 85, deals: 15 },
                      { stage: 'Negotiation → Closed Won', probability: 74, deals: 9 }
                    ].map((stage) => (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 text-xs">{stage.stage}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{stage.deals} deals</span>
                            <span className="font-medium text-purple-600">{stage.probability}%</span>
                          </div>
                        </div>
                        <Progress value={stage.probability} className="h-1.5 [&>div]:bg-purple-500" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Model Accuracy</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        91.2%
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Based on 1,200+ historical deals</div>
                  </div>
                </div>
              </TabCard>

              <TabCard title="Competitive Intelligence" variant="chart" action="Battle Cards">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xl font-bold text-green-600">68%</div>
                      <div className="text-xs text-green-700">Win Rate vs All</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xl font-bold text-blue-600">42</div>
                      <div className="text-xs text-blue-700">Competitive Deals</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Win/Loss by Competitor</h4>
                    {[
                      { competitor: 'Competitor A', wins: 8, losses: 3, winRate: 73 },
                      { competitor: 'Competitor B', wins: 5, losses: 4, winRate: 56 },
                      { competitor: 'Competitor C', wins: 12, losses: 2, winRate: 86 },
                      { competitor: 'Legacy Systems', wins: 7, losses: 1, winRate: 88 }
                    ].map((comp) => (
                      <div key={comp.competitor} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 text-xs">{comp.competitor}</span>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-green-600">{comp.wins}W</span>
                            <span className="text-red-600">{comp.losses}L</span>
                            <span className="font-medium">{comp.winRate}%</span>
                          </div>
                        </div>
                        <Progress value={comp.winRate} className="h-1.5 [&>div]:bg-indigo-500" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      <strong>Key Advantage:</strong> Technical superiority drives 34% higher win rate
                    </div>
                  </div>
                </div>
              </TabCard>
            </div>

            {/* Pipeline Quality & Deal Flow */}
            <TabCard title="Pipeline Quality Metrics" variant="chart" action="Quality Report">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Qualification Distribution</h4>
                  <div className="space-y-2">
                    {[
                      { level: 'Fully Qualified', count: 34, percentage: 72 },
                      { level: 'Partially Qualified', count: 18, percentage: 38 },
                      { level: 'Unqualified', count: 5, percentage: 11 }
                    ].map((qual) => (
                      <div key={qual.level} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{qual.level}</span>
                          <span className="font-medium">{qual.count}</span>
                        </div>
                        <Progress value={qual.percentage} className="h-1" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Stalled Deal Analysis</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-lg font-bold text-amber-700">12</div>
                      <div className="text-xs text-amber-600">Deals Stalled &gt;30 days</div>
                      <div className="text-xs text-gray-500 mt-1">$680K total value</div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg stall time</span>
                        <span>47 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recovery rate</span>
                        <span className="text-green-600">68%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Velocity Trends</h4>
                  <div className="relative h-24 bg-gradient-to-r from-gray-50 to-white rounded-lg p-2 border">
                    <div className="flex items-end h-full">
                      {Array.from({ length: 8 }, (_, i) => {
                        const velocity = 32 - (i * 2) + Math.random() * 6;
                        return (
                          <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${Math.max(20, 100 - velocity)}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`flex-1 mx-0.5 rounded-t ${
                              velocity < 30 ? 'bg-green-400' :
                              velocity < 40 ? 'bg-amber-400' : 'bg-red-400'
                            }`}
                            title={`${velocity.toFixed(0)} days avg velocity`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-center text-gray-500">
                    Velocity improving: -5 days avg
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">AI Impact</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Pipeline Health</span>
                      </div>
                      <div className="space-y-1 text-xs text-purple-600">
                        <div>• 23% better qualification</div>
                        <div>• 31% faster progression</div>
                        <div>• 18% higher close rates</div>
                        <div>• 42% fewer stalled deals</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>
          </TabsContent>

          {/* Team Performance Tab - Enhanced */}
          <TabsContent value="team" className="flex-1 overflow-y-auto space-y-4 mt-0">
            {/* Main Team Performance Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <TabMetricCard
                title="Performance Trend"
                value="7.8/10"
                trend="up"
                trendValue="+0.6"
                icon={TrendingUp}
                accentColor="blue"
                insight="Above benchmark"
              />
              <TabMetricCard
                title="Peer Benchmark"
                value="112%"
                trend="up"
                trendValue="+18%"
                icon={Users}
                accentColor="green"
                insight="vs industry average"
              />
              <TabMetricCard
                title="Coaching ROI"
                value="3.4x"
                trend="up"
                trendValue="+0.8x"
                icon={Brain}
                accentColor="purple"
                insight="Skills development impact"
              />
              <TabMetricCard
                title="Team Synergy"
                value="82%"
                trend="up"
                trendValue="+7%"
                icon={Hash}
                accentColor="amber"
                insight="Collaboration score"
              />
              <TabMetricCard
                title="Skill Progression"
                value="91%"
                trend="up"
                trendValue="+12%"
                icon={Gauge}
                accentColor="gray"
                insight="Development velocity"
              />
            </div>

            {/* Performance Intelligence & Coaching Opportunities */}
            <TabCard title="Performance Intelligence Dashboard" variant="chart" action="View Details">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {/* Performance Trend Analysis */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Individual Performance Trends</h4>
                      {[
                        { name: 'Sarah Chen', current: 142, prev: 128, improvement: 14, trend: 'accelerating' },
                        { name: 'Marcus Rodriguez', current: 128, prev: 118, improvement: 10, trend: 'steady' },
                        { name: 'Emily Zhang', current: 115, prev: 109, improvement: 6, trend: 'steady' },
                        { name: 'David Kim', current: 98, prev: 85, improvement: 13, trend: 'accelerating' },
                        { name: 'Mike Johnson', current: 62, prev: 71, improvement: -9, trend: 'declining' }
                      ].map((rep, index) => (
                        <motion.div
                          key={rep.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                              rep.current >= 120 ? 'bg-green-500' :
                              rep.current >= 100 ? 'bg-blue-500' :
                              rep.current >= 80 ? 'bg-amber-500' : 'bg-red-500'
                            }`}>
                              {rep.name.split(' ')[0].charAt(0)}{rep.name.split(' ')[1].charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{rep.name}</div>
                              <div className="text-xs text-gray-500">
                                {rep.current}% quota • 
                                <span className={`ml-1 ${rep.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {rep.improvement >= 0 ? '+' : ''}{rep.improvement}% month
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={`text-xs ${
                              rep.trend === 'accelerating' ? 'bg-green-50 text-green-700 border-green-200' :
                              rep.trend === 'steady' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {rep.trend}
                            </Badge>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Coaching Opportunities</h4>
                    <div className="space-y-3">
                      <InsightCard
                        icon={Lightbulb}
                        title="Skill Gap Alert"
                        description="3 team members need objection handling training"
                        variant="warning"
                        action="Schedule Training"
                      />
                      <InsightCard
                        icon={Users}
                        title="Peer Mentoring"
                        description="Sarah → Mike pairing shows 23% improvement potential"
                        variant="info"
                        action="Setup Pairing"
                      />
                      <InsightCard
                        icon={Target}
                        title="Performance Boost"
                        description="David on track for 15% quota increase next quarter"
                        variant="success"
                        action="Goal Adjustment"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>

            {/* Activity Effectiveness & Collaboration Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TabCard title="Activity Effectiveness Analysis" variant="chart" action="Optimize Mix">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-blue-700">8.2</div>
                      <div className="text-xs text-blue-600">Activity Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <Target className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-green-700">73%</div>
                      <div className="text-xs text-green-600">Conversion Rate</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Activity-to-Outcome Correlation</h4>
                    {[
                      { activity: 'Discovery Calls', effectiveness: 92, optimal: 'High', current: 'Optimal' },
                      { activity: 'Demo Presentations', effectiveness: 87, optimal: 'High', current: 'Good' },
                      { activity: 'Follow-up Emails', effectiveness: 64, optimal: 'Medium', current: 'Average' },
                      { activity: 'Social Selling', effectiveness: 78, optimal: 'Medium', current: 'Good' }
                    ].map((activity) => (
                      <div key={activity.activity} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 text-xs">{activity.activity}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${
                              activity.current === 'Optimal' ? 'bg-green-50 text-green-700 border-green-200' :
                              activity.current === 'Good' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {activity.current}
                            </Badge>
                            <span className="font-medium text-xs">{activity.effectiveness}%</span>
                          </div>
                        </div>
                        <Progress value={activity.effectiveness} className="h-1.5 [&>div]:bg-blue-500" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      <strong>Optimization:</strong> Increase discovery calls by 20% for maximum impact
                    </div>
                  </div>
                </div>
              </TabCard>

              <TabCard title="Team Collaboration Metrics" variant="chart" action="Network Analysis">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">82%</div>
                    <div className="text-sm text-purple-600">Team Synergy Score</div>
                    <div className="text-xs text-gray-500 mt-1">Cross-team effectiveness</div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Collaboration Impact</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Knowledge Sharing</span>
                        <span className="font-medium text-purple-600">89%</span>
                      </div>
                      <Progress value={89} className="h-2 [&>div]:bg-purple-500" />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Peer Support</span>
                        <span className="font-medium text-green-600">76%</span>
                      </div>
                      <Progress value={76} className="h-2 [&>div]:bg-green-500" />

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Cross-Selling</span>
                        <span className="font-medium text-blue-600">64%</span>
                      </div>
                      <Progress value={64} className="h-2 [&>div]:bg-blue-500" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Top Collaborators</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Sarah ↔ Marcus</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          High Impact
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span>Emily ↔ David</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Growing
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabCard>
            </div>

            {/* Development Tracking & Skill Progression */}
            <TabCard title="Development Tracking & Learning Analytics" variant="chart" action="Learning Paths">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Skill Progression</h4>
                  <div className="space-y-3">
                    {[
                      { skill: 'Discovery', current: 85, target: 90, progress: 94 },
                      { skill: 'Objection Handling', current: 72, target: 85, progress: 56 },
                      { skill: 'Closing', current: 68, target: 80, progress: 45 },
                      { skill: 'Relationship Building', current: 91, target: 95, progress: 76 }
                    ].map((skill) => (
                      <div key={skill.skill} className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">{skill.skill}</span>
                          <span className="font-medium">{skill.current}→{skill.target}</span>
                        </div>
                        <div className="relative">
                          <Progress value={skill.progress} className="h-1.5 [&>div]:bg-purple-500" />
                          <div className="text-xs text-gray-500 mt-1">{skill.progress}% to target</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Certification Status</h4>
                  <div className="space-y-2">
                    {[
                      { cert: 'Sales Methodology', status: 'Complete', date: '2024-03' },
                      { cert: 'Product Expert', status: 'Complete', date: '2024-02' },
                      { cert: 'Advanced Negotiation', status: 'In Progress', date: '2024-04' },
                      { cert: 'Leadership Track', status: 'Planned', date: '2024-05' }
                    ].map((cert) => (
                      <div key={cert.cert} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <span className="text-gray-700 font-medium">{cert.cert}</span>
                        <Badge variant="outline" className={
                          cert.status === 'Complete' ? 'bg-green-50 text-green-700 border-green-200' :
                          cert.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }>
                          {cert.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Learning Engagement</h4>
                  <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-xl font-bold text-green-700">94%</div>
                    <div className="text-xs text-green-600">Course Completion</div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg time per session</span>
                      <span className="font-medium">28 min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sessions per week</span>
                      <span className="font-medium">4.2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Knowledge retention</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">AI-Driven Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">Development Focus</span>
                      </div>
                      <div className="space-y-1 text-xs text-purple-600">
                        <div>• Prioritize objection handling</div>
                        <div>• Advanced closing techniques</div>
                        <div>• Industry specialization</div>
                        <div>• Leadership readiness</div>
                      </div>
                    </div>

                    <div className="text-center p-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
                      <div className="text-lg font-bold text-gray-700">6.2</div>
                      <div className="text-xs text-gray-600">Months to next level</div>
                      <div className="text-xs text-gray-500">predicted timeline</div>
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>
          </TabsContent>

          {/* Call Intelligence Tab - Enhanced */}
          <TabsContent value="calls" className="flex-1 overflow-y-auto space-y-4 mt-0">
            {/* Main Call Intelligence Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <TabMetricCard
                title="Engagement Score"
                value="8.2/10"
                trend="up"
                trendValue="+0.7"
                icon={Activity}
                accentColor="blue"
                insight="Above benchmark"
              />
              <TabMetricCard
                title="EQ Score"
                value="7.8/10"
                trend="up"
                trendValue="+0.3"
                icon={Brain}
                accentColor="purple"
                insight="Emotional intelligence"
              />
              <TabMetricCard
                title="Persuasion Index"
                value="82%"
                trend="up"
                trendValue="+5%"
                icon={Target}
                accentColor="green"
                insight="Influence growing"
              />
              <TabMetricCard
                title="Talk Ratio"
                value="42:58"
                trend="stable"
                trendValue="Optimal"
                icon={MessageSquare}
                accentColor="amber"
                insight="Balanced conversation"
              />
              <TabMetricCard
                title="Critical Moments"
                value="4.2"
                trend="up"
                trendValue="+0.8"
                icon={Sparkles}
                accentColor="purple"
                insight="Key turning points"
              />
            </div>

            {/* Sentiment Analysis Section */}
            <TabCard title="Sentiment Analysis" variant="chart" action="View Timeline">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {/* Sentiment Timeline */}
                    <div className="relative h-32 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border">
                      <div className="absolute inset-0 p-4">
                        <div className="flex items-end h-full space-x-1">
                          {Array.from({ length: 24 }, (_, i) => {
                            const sentiment = Math.sin(i * 0.3) * 30 + 50 + Math.random() * 20;
                            const isPositive = sentiment > 60;
                            const isNeutral = sentiment >= 40 && sentiment <= 60;
                            return (
                              <motion.div
                                key={i}
                                initial={{ height: 0 }}
                                animate={{ height: `${sentiment}%` }}
                                transition={{ delay: i * 0.03, duration: 0.4 }}
                                className={`flex-1 rounded-t ${
                                  isPositive ? 'bg-emerald-400' : 
                                  isNeutral ? 'bg-amber-300' : 'bg-red-400'
                                }`}
                                title={`${sentiment.toFixed(0)}% sentiment at minute ${i * 2}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-gray-500">
                        <span>0min</span>
                        <span>25min</span>
                        <span>50min</span>
                      </div>
                    </div>

                    {/* Sentiment Breakdown */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <Smile className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-emerald-700">68%</div>
                        <div className="text-xs text-emerald-600">Positive</div>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <Meh className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-amber-700">24%</div>
                        <div className="text-xs text-amber-600">Neutral</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <Frown className="w-5 h-5 text-red-600 mx-auto mb-1" />
                        <div className="text-lg font-bold text-red-700">8%</div>
                        <div className="text-xs text-red-600">Negative</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Critical Moments</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">12:34</span>
                        </div>
                        <p className="text-xs text-gray-700">Positive response to value proposition</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">23:15</span>
                        </div>
                        <p className="text-xs text-gray-700">Price objection raised</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-gray-600">41:22</span>
                        </div>
                        <p className="text-xs text-gray-700">Successful objection handling</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>

            {/* Keywords & Topics */}
            <TabCard title="Keywords & Topics Analysis" variant="chart" action="Export Keywords">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Topic Distribution</h4>
                  <div className="space-y-3">
                    {[
                      { topic: 'Product Features', mentions: 34, relevance: 92, color: 'bg-blue-500' },
                      { topic: 'Pricing', mentions: 18, relevance: 85, color: 'bg-purple-500' },
                      { topic: 'Implementation', mentions: 23, relevance: 78, color: 'bg-green-500' },
                      { topic: 'Competition', mentions: 12, relevance: 71, color: 'bg-amber-500' },
                      { topic: 'Timeline', mentions: 15, relevance: 88, color: 'bg-indigo-500' }
                    ].map((topic) => (
                      <div key={topic.topic} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${topic.color} rounded`}></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{topic.topic}</span>
                            <span className="text-gray-500">{topic.mentions} mentions</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${topic.relevance}%` }}
                              className={`h-1.5 ${topic.color} rounded-full`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Key Terms Cloud</h4>
                  <div className="p-4 bg-gray-50 rounded-lg border min-h-[200px] flex flex-wrap items-center justify-center gap-2">
                    {[
                      { word: 'ROI', size: 'text-2xl', weight: 'font-bold', color: 'text-blue-600' },
                      { word: 'scalability', size: 'text-lg', weight: 'font-semibold', color: 'text-purple-600' },
                      { word: 'integration', size: 'text-xl', weight: 'font-bold', color: 'text-green-600' },
                      { word: 'budget', size: 'text-lg', weight: 'font-semibold', color: 'text-amber-600' },
                      { word: 'timeline', size: 'text-base', weight: 'font-medium', color: 'text-gray-600' },
                      { word: 'efficiency', size: 'text-xl', weight: 'font-bold', color: 'text-indigo-600' },
                      { word: 'security', size: 'text-lg', weight: 'font-semibold', color: 'text-red-600' },
                      { word: 'support', size: 'text-base', weight: 'font-medium', color: 'text-gray-500' },
                      { word: 'performance', size: 'text-lg', weight: 'font-semibold', color: 'text-blue-500' }
                    ].map((item, index) => (
                      <motion.span
                        key={item.word}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`${item.size} ${item.weight} ${item.color} cursor-pointer hover:opacity-70 transition-opacity`}
                      >
                        {item.word}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </TabCard>

            {/* Behavioral Insights */}
            <TabCard title="Behavioral Insights" variant="insight" action="View Patterns">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Engagement Signals</h4>
                  <div className="space-y-3">
                    <InsightCard
                      icon={Eye}
                      title="Active Listening"
                      description="Strong verbal acknowledgments and follow-up questions detected"
                      variant="success"
                    />
                    <InsightCard
                      icon={Activity}
                      title="Energy Level"
                      description="Consistent enthusiasm throughout the conversation"
                      variant="info"
                    />
                    <InsightCard
                      icon={MessageSquare}
                      title="Interruption Pattern"
                      description="Minimal interruptions, respectful conversation flow"
                      variant="success"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Speech Patterns</h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Speech Pace</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Optimal
                        </Badge>
                      </div>
                      <Progress value={78} className="h-2 [&>div]:bg-green-500" />
                      <div className="text-xs text-gray-500 mt-1">145 words/minute</div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Vocal Confidence</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          High
                        </Badge>
                      </div>
                      <Progress value={85} className="h-2 [&>div]:bg-blue-500" />
                      <div className="text-xs text-gray-500 mt-1">Steady tone, clear articulation</div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Question Quality</span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Excellent
                        </Badge>
                      </div>
                      <Progress value={92} className="h-2 [&>div]:bg-purple-500" />
                      <div className="text-xs text-gray-500 mt-1">Open-ended, discovery-focused</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Gestures & Body Language</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <ThumbsUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-800">Positive Gestures</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        • 18 nodding instances
                        • 12 forward lean moments
                        • Open posture throughout
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-medium text-gray-800">Areas to Watch</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        • 3 moments of crossed arms
                        • Fidgeting during price discussion
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>

            {/* Improvement Opportunities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TabCard title="Improvement Opportunities" variant="insight" action="Create Action Plan">
                <div className="space-y-4">
                  <InsightCard
                    icon={Lightbulb}
                    title="Discovery Enhancement"
                    description="Add 2-3 more pain point questions early in the call to deepen discovery"
                    variant="warning"
                    action="View Suggestions"
                  />
                  <InsightCard
                    icon={Target}
                    title="Value Articulation"
                    description="Connect features more directly to specific business outcomes mentioned"
                    variant="info"
                    action="Practice Scripts"
                  />
                  <InsightCard
                    icon={Clock}
                    title="Closing Technique"
                    description="Ask for commitment earlier - opportunity missed at 35min mark"
                    variant="warning"
                    action="Review Timing"
                  />
                </div>
              </TabCard>

              <TabCard title="Advanced Analytics" variant="metric" action="Deep Dive">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <Gauge className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-purple-700">8.4/10</div>
                      <div className="text-xs text-purple-600">EQ Score</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <BarChart4 className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-xl font-bold text-blue-700">7.9/10</div>
                      <div className="text-xs text-blue-600">Persuasion Index</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700">Rapport Building</span>
                        <span className="text-sm font-medium text-green-600">Excellent</span>
                      </div>
                      <Progress value={88} className="h-2 [&>div]:bg-green-500" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700">Objection Readiness</span>
                        <span className="text-sm font-medium text-blue-600">Strong</span>
                      </div>
                      <Progress value={76} className="h-2 [&>div]:bg-blue-500" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-700">Close Preparation</span>
                        <span className="text-sm font-medium text-amber-600">Good</span>
                      </div>
                      <Progress value={72} className="h-2 [&>div]:bg-amber-500" />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Win Probability</span>
                      <span className="text-lg font-bold text-green-600">74%</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Based on conversation analysis</div>
                  </div>
                </div>
              </TabCard>
            </div>
          </TabsContent>

          {/* Executive View Tab - Enhanced */}
          <TabsContent value="executive" className="flex-1 overflow-y-auto space-y-4 mt-0">
            {/* Main Executive Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <TabMetricCard
                title="Strategic Health"
                value="92/100"
                trend="up"
                trendValue="+8 pts"
                icon={Gauge}
                accentColor="blue"
                insight="Market position strong"
              />
              <TabMetricCard
                title="Customer CLV"
                value="$185K"
                trend="up"
                trendValue="+23%"
                icon={Heart}
                accentColor="green"
                insight="Expanding relationships"
              />
              <TabMetricCard
                title="Revenue Quality"
                value="87%"
                trend="up"
                trendValue="+12%"
                icon={DollarSign}
                accentColor="purple"
                insight="Recurring revenue mix"
              />
              <TabMetricCard
                title="Churn Risk"
                value="3.2%"
                trend="down"
                trendValue="-1.8%"
                icon={AlertCircle}
                accentColor="amber"
                insight="AI early warning"
              />
              <TabMetricCard
                title="Sales Efficiency"
                value="2.8x"
                trend="up"
                trendValue="+0.6x"
                icon={Zap}
                accentColor="gray"
                insight="Process optimization"
              />
            </div>

            {/* Strategic Health & Customer Intelligence */}
            <TabCard title="Strategic Health & Market Position Dashboard" variant="chart" action="Deep Dive">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {/* Market Share Trends */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Market Share Evolution</h4>
                      <div className="relative h-32 bg-gradient-to-r from-gray-50 to-white rounded-lg p-4 border">
                        <div className="absolute inset-0 p-4">
                          <div className="flex items-end h-full space-x-2">
                            {Array.from({ length: 12 }, (_, i) => {
                              const marketShare = 8 + (i * 0.8) + Math.random() * 2;
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${Math.min(90, marketShare * 8)}%` }}
                                  transition={{ delay: i * 0.05, duration: 0.4 }}
                                  className={`flex-1 rounded-t ${
                                    marketShare > 12 ? 'bg-green-400' :
                                    marketShare > 10 ? 'bg-blue-400' : 'bg-purple-400'
                                  }`}
                                  title={`${marketShare.toFixed(1)}% market share - Month ${i + 1}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-4 right-4 flex justify-between text-xs text-gray-500">
                          <span>Jan</span>
                          <span>Jun</span>
                          <span>Dec</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 text-center">
                        Market share grew from 8.2% to 14.7% YoY (+79% growth)
                      </div>
                    </div>

                    {/* Competitive Position Index */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700">Competitive Position Metrics</h4>
                      {[
                        { metric: 'Product Innovation', score: 94, benchmark: 78, trend: 'up' },
                        { metric: 'Customer Satisfaction', score: 91, benchmark: 82, trend: 'up' },
                        { metric: 'Market Presence', score: 76, benchmark: 85, trend: 'up' },
                        { metric: 'Technology Leadership', score: 88, benchmark: 71, trend: 'stable' },
                        { metric: 'Partner Ecosystem', score: 82, benchmark: 79, trend: 'up' }
                      ].map((item) => (
                        <div key={item.metric} className="flex items-center space-x-3">
                          <div className="w-36 text-xs text-gray-600 truncate">{item.metric}</div>
                          <div className="flex-1 relative">
                            <div className="h-2 bg-gray-200 rounded">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.score}%` }}
                                className={`h-2 rounded ${
                                  item.score > item.benchmark ? 'bg-green-500' :
                                  item.score > (item.benchmark - 5) ? 'bg-blue-500' : 'bg-amber-500'
                                }`}
                              />
                            </div>
                            <div className="absolute -top-1 left-0 h-4 w-0.5 bg-gray-400" style={{ left: `${item.benchmark}%` }} />
                          </div>
                          <div className="w-12 text-xs font-medium text-right">
                            {item.score}
                            {item.trend === 'up' && <ChevronUp className="w-3 h-3 text-green-500 inline ml-1" />}
                            {item.trend === 'down' && <ChevronDown className="w-3 h-3 text-red-500 inline ml-1" />}
                          </div>
                        </div>
                      ))}
                      <div className="text-xs text-gray-500 mt-2">
                        Gray line indicates industry benchmark • Scores above benchmark in green
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Strategic Initiative Progress</h4>
                    <div className="space-y-3">
                      <InsightCard
                        icon={Target}
                        title="Market Expansion"
                        description="EU market entry ahead of schedule, 12% penetration achieved"
                        variant="success"
                        action="View Roadmap"
                      />
                      <InsightCard
                        icon={Brain}
                        title="AI Integration"
                        description="Phase 2 complete, 34% efficiency gain across teams"
                        variant="info"
                        action="Phase 3 Plan"
                      />
                      <InsightCard
                        icon={Users}
                        title="Partner Network"
                        description="3 new tier-1 partnerships, 28% channel growth"
                        variant="success"
                        action="Expand Network"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>

            {/* Revenue Intelligence & Risk-Opportunity Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <TabCard title="Revenue Intelligence Multi-Dimensional View" variant="chart" action="Forecast Model">
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">$4.7M</div>
                    <div className="text-sm text-green-600">Multi-Dimensional Forecast</div>
                    <div className="text-xs text-gray-500 mt-1">Next quarter confidence: 94%</div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Revenue Composition Analysis</h4>
                    {[
                      { category: 'Recurring Revenue', amount: 2800, percentage: 68, growth: 23 },
                      { category: 'New Business', amount: 980, percentage: 24, growth: 34 },
                      { category: 'Expansion Revenue', amount: 320, percentage: 8, growth: 45 }
                    ].map((revenue) => (
                      <div key={revenue.category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-700 text-xs">{revenue.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">${revenue.amount}K</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              +{revenue.growth}%
                            </Badge>
                          </div>
                        </div>
                        <Progress value={revenue.percentage} className="h-2 [&>div]:bg-green-500" />
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Revenue Quality Score</span>
                      <span className="font-medium text-green-600">87%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Predictability Index</span>
                      <span className="font-medium text-purple-600">91%</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      High predictability driven by 68% recurring revenue mix
                    </div>
                  </div>
                </div>
              </TabCard>

              <TabCard title="Risk & Opportunity Matrix" variant="chart" action="Action Plans">
                <div className="space-y-4">
                  {/* Risk Assessment */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Top Strategic Risks</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-700">Competitive Threat</span>
                          </div>
                          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300 text-xs">
                            High Impact
                          </Badge>
                        </div>
                        <p className="text-xs text-red-600 mb-2">New market entrant targeting our key accounts</p>
                        <div className="text-xs text-gray-600">
                          <strong>Mitigation:</strong> Accelerate product roadmap, strengthen relationships
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <TrendingDown className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-700">Talent Retention</span>
                          </div>
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-300 text-xs">
                            Medium Risk
                          </Badge>
                        </div>
                        <p className="text-xs text-amber-600 mb-2">Key sales talent at risk in Q2 budget season</p>
                        <div className="text-xs text-gray-600">
                          <strong>Mitigation:</strong> Enhanced retention packages, career pathing
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Opportunity Assessment */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700">Untapped Opportunities</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Lightbulb className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">Market Expansion</span>
                          </div>
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                            $1.8M Potential
                          </Badge>
                        </div>
                        <p className="text-xs text-green-600">APAC region shows 85% growth potential with existing product</p>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Cloud className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-700">Product Extension</span>
                          </div>
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                            $950K ARR
                          </Badge>
                        </div>
                        <p className="text-xs text-blue-600">AI-powered analytics module requested by 67% of enterprise clients</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabCard>
            </div>

            {/* Operational Excellence & Customer Intelligence */}
            <TabCard title="Operational Excellence & Customer Intelligence Center" variant="chart" action="Optimization Report">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Sales Efficiency Metrics</h4>
                  <div className="space-y-3">
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="text-xl font-bold text-purple-700">2.8x</div>
                      <div className="text-xs text-purple-600">Efficiency Ratio</div>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300 text-xs mt-1">
                        vs 2.1x industry
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cost per acquisition</span>
                        <span className="font-medium text-green-600">$8.2K</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sales cycle length</span>
                        <span className="font-medium">32 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rep productivity</span>
                        <span className="font-medium text-purple-600">142%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Customer Lifecycle Value</h4>
                  <div className="space-y-3">
                    {[
                      { segment: 'Enterprise', clv: 285, churn: 2.1, expansion: 34 },
                      { segment: 'Mid-Market', clv: 145, churn: 4.2, expansion: 18 },
                      { segment: 'SMB', clv: 67, churn: 8.5, expansion: 12 }
                    ].map((segment) => (
                      <div key={segment.segment} className="p-2 bg-gray-50 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700">{segment.segment}</span>
                          <span className="text-xs font-bold text-green-600">${segment.clv}K CLV</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Churn: </span>
                            <span className="font-medium">{segment.churn}%</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Expand: </span>
                            <span className="font-medium text-blue-600">{segment.expansion}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Process Optimization</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-xl font-bold text-blue-700">91%</div>
                      <div className="text-xs text-blue-600">Process Efficiency</div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { process: 'Lead Qualification', efficiency: 89, status: 'optimized' },
                        { process: 'Proposal Generation', efficiency: 76, status: 'improving' },
                        { process: 'Contract Processing', efficiency: 94, status: 'optimal' }
                      ].map((proc) => (
                        <div key={proc.process} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">{proc.process}</span>
                            <Badge variant="outline" className={`text-xs ${
                              proc.status === 'optimal' ? 'bg-green-50 text-green-700 border-green-200' :
                              proc.status === 'optimized' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {proc.efficiency}%
                            </Badge>
                          </div>
                          <Progress value={proc.efficiency} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">AI-Driven Executive Insights</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Brain className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700">Strategic Recommendations</span>
                      </div>
                      <div className="space-y-1 text-xs text-green-600">
                        <div>• Double down on enterprise segment</div>
                        <div>• Accelerate APAC expansion</div>
                        <div>• Invest in AI-powered features</div>
                        <div>• Strengthen partner ecosystem</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-center p-2 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                        <div className="text-lg font-bold text-purple-700">$12.8M</div>
                        <div className="text-xs text-gray-600">Projected annual impact</div>
                        <div className="text-xs text-gray-500">AI optimization</div>
                      </div>

                      <div className="text-center p-2 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                        <div className="text-lg font-bold text-green-700">67%</div>
                        <div className="text-xs text-gray-600">Market share potential</div>
                        <div className="text-xs text-gray-500">next 24 months</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}