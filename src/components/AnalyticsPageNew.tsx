"use client";

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  ChevronUp,
  ChevronDown,
  Phone,
  DollarSign,
  Brain,
  Zap,
  RefreshCw,
  AlertCircle,
  Loader2,
  Calendar,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";
import { DateRangePicker } from './DateRangePicker';
import { 
  useAnalytics, 
  useKPIMetrics, 
  useTeamPerformance, 
  useAnalyticsTrends,
  DateRange 
} from '../hooks/useAnalytics';
import { useDateFilter } from '../hooks/useDateFilter';
import { useAnalyticsExport } from '../hooks/useAnalyticsExport';

// KPI Card Component with loading states
const KPICard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  icon: Icon, 
  color = 'purple',
  insight,
  loading = false
}: {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: any;
  color?: 'purple' | 'indigo' | 'amber' | 'green';
  insight?: string;
  loading?: boolean;
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

  if (loading) {
    return (
      <Card className={`bg-gradient-to-br ${getColorClasses()}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className={`h-10 w-10 rounded-full`} />
          </div>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`bg-gradient-to-br ${getColorClasses()} hover:shadow-md transition-all cursor-pointer`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <div className={`p-2 rounded-full ${getIconBgColor()}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            
            {trend && trendValue && (
              <div className="flex items-center text-sm">
                {getTrendIcon()}
                <span className={`ml-1 ${
                  trend === 'up' ? 'text-green-600' : 
                  trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {trendValue}
                </span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            )}
            
            {insight && (
              <p className="text-xs text-gray-500 mt-2">{insight}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Loading Component
const LoadingState = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <KPICard
          key={i}
          title=""
          value=""
          icon={Activity}
          loading={true}
        />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

// Error Component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <Alert className="border-red-200 bg-red-50">
    <AlertCircle className="h-4 w-4 text-red-600" />
    <AlertDescription className="text-red-800">
      <div className="flex items-center justify-between">
        <span>Failed to load analytics data: {error}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="ml-2"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </AlertDescription>
  </Alert>
);

// Team Performance Component
const TeamPerformanceView = ({ dateRange }: { dateRange: DateRange }) => {
  const { teamData, loading, error } = useTeamPerformance(dateRange);

  if (loading) return <LoadingState />;
  if (error) return <div>Error loading team data: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {teamData?.map((user, index) => (
          <Card key={user.user_id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">User {index + 1}</CardTitle>
                <Badge 
                  variant={
                    user.performance_status === 'exceeding' ? 'default' :
                    user.performance_status === 'meeting' ? 'secondary' : 'destructive'
                  }
                >
                  {user.performance_status || 'Active'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Quota Attainment</p>
                  <p className="text-xl font-semibold">{user.quota_attainment?.toFixed(1) || 0}%</p>
                  <Progress value={user.quota_attainment || 0} className="mt-1" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Win Rate</p>
                  <p className="text-xl font-semibold">{user.win_rate?.toFixed(1) || 0}%</p>
                  <Progress value={user.win_rate || 0} className="mt-1" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Pipeline Value</p>
                  <p className="font-medium">${(user.pipeline_value || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Deal Velocity</p>
                  <p className="font-medium">{user.deal_velocity || 0} days</p>
                </div>
                <div>
                  <p className="text-gray-500">Calls Connected</p>
                  <p className="font-medium">{user.calls_connected || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Meetings Booked</p>
                  <p className="font-medium">{user.meetings_booked || 0}</p>
                </div>
              </div>

              {user.coaching_priority && (
                <div className="pt-2 border-t">
                  <p className="text-sm text-gray-500">Coaching Priority</p>
                  <Badge variant="outline" className="mt-1">
                    {user.coaching_priority}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Analytics Trends Component
const AnalyticsTrendsView = ({ dateRange }: { dateRange: DateRange }) => {
  const { trendsData, loading, error } = useAnalyticsTrends(dateRange);

  if (loading) return <LoadingState />;
  if (error) return <div>Error loading trends: {error}</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendsData?.slice(-7).map((day: any, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString()}</span>
                <div className="flex items-center space-x-4 text-sm">
                  <span>📞 {day.calls}</span>
                  <span>📧 {day.emails}</span>
                  <span>🤝 {day.meetings}</span>
                  <span>💰 ${day.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trendsData && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {trendsData.reduce((sum: number, day: any) => sum + day.calls, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Total Calls</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {trendsData.reduce((sum: number, day: any) => sum + day.meetings, 0)}
                    </p>
                    <p className="text-sm text-gray-500">Meetings Booked</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-purple-600">
                      ${trendsData.reduce((sum: number, day: any) => sum + day.revenue, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main Analytics Page Component
export function AnalyticsPageNew() {
  const [activeTab, setActiveTab] = useState('overview');
  const { dateRange, setCustomDateRange, activePresetLabel } = useDateFilter();
  
  // Use analytics hooks
  const { data: analyticsData, loading, error, refresh } = useAnalytics({ dateRange });
  const { kpis } = useKPIMetrics(dateRange);
  const { exportData, exporting, error: exportError } = useAnalyticsExport();

  const handleDateRangeChange = (newRange: DateRange) => {
    setCustomDateRange(newRange);
  };

  const handleExport = async () => {
    if (!analyticsData) {
      console.error('No analytics data to export');
      return;
    }

    try {
      await exportData(analyticsData, dateRange, {
        format: 'csv',
        includeCharts: false,
        includeSummary: true
      });
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="h-full w-full flex flex-col space-y-6">
      {/* Dashboard Header */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
              <p className="text-sm text-gray-500">
                Real-time insights powered by Supabase • {activePresetLabel}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DateRangePicker 
              value={dateRange}
              onChange={handleDateRangeChange}
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refresh}
              disabled={loading}
              className="hover:bg-purple-50 hover:border-purple-200"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              disabled={exporting || !analyticsData}
              className="hover:bg-indigo-50 hover:border-indigo-200"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {exporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ErrorState error={error} onRetry={refresh} />
      )}
      
      {/* Export Error State */}
      {exportError && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Export failed: {exportError}
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Summary Grid */}
      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="AI Coaching ROI"
          value={kpis?.coachingROI.value || '0.0x'}
          trend={kpis?.coachingROI.trend}
          trendValue={kpis?.coachingROI.trendValue}
          icon={Brain}
          color="purple"
          insight="Data-driven coaching insights"
          loading={loading}
        />
        <KPICard
          title="Pipeline Velocity"
          value={kpis?.pipelineVelocity.value || '0 days'}
          trend={kpis?.pipelineVelocity.trend}
          trendValue={kpis?.pipelineVelocity.trendValue}
          icon={Zap}
          color="indigo"
          insight="Average deal closure time"
          loading={loading}
        />
        <KPICard
          title="Team Win Rate"
          value={kpis?.teamWinRate.value || '0%'}
          trend={kpis?.teamWinRate.trend}
          trendValue={kpis?.teamWinRate.trendValue}
          icon={Target}
          color="green"
          insight="Conversion success rate"
          loading={loading}
        />
        <KPICard
          title="Call Engagement"
          value={kpis?.callEngagement.value || '0.0/10'}
          trend={kpis?.callEngagement.trend}
          trendValue={kpis?.callEngagement.trendValue}
          icon={Phone}
          color="amber"
          insight="AI-analyzed engagement score"
          loading={loading}
        />
      </div>

      {/* Dashboard Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100/50 mb-6">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-white data-[state=active]:text-purple-700"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="team" 
              className="data-[state=active]:bg-white data-[state=active]:text-green-700"
            >
              <Users className="w-4 h-4 mr-2" />
              Team Performance
            </TabsTrigger>
            <TabsTrigger 
              value="trends" 
              className="data-[state=active]:bg-white data-[state=active]:text-indigo-700"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="overview" className="h-full">
              {loading ? <LoadingState /> : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Metrics Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticsData?.dailyMetrics && (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Total Calls</span>
                              <span className="font-medium">
                                {analyticsData.dailyMetrics.reduce((sum, m) => sum + (m.calls_made || 0), 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Emails Sent</span>
                              <span className="font-medium">
                                {analyticsData.dailyMetrics.reduce((sum, m) => sum + (m.emails_sent || 0), 0)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Meetings Booked</span>
                              <span className="font-medium">
                                {analyticsData.dailyMetrics.reduce((sum, m) => sum + (m.meetings_booked || 0), 0)}
                              </span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-sm text-gray-500">Revenue Won</span>
                              <span className="font-medium text-green-600">
                                ${analyticsData.dailyMetrics.reduce((sum, m) => sum + (m.revenue_won || 0), 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Call Analytics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticsData?.callAnalytics && (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Total Calls</span>
                              <span className="font-medium">{analyticsData.callAnalytics.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Avg Duration</span>
                              <span className="font-medium">
                                {analyticsData.callAnalytics.length > 0
                                  ? Math.round(
                                      analyticsData.callAnalytics.reduce((sum, c) => sum + c.duration_minutes, 0) /
                                      analyticsData.callAnalytics.length
                                    )
                                  : 0} min
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Avg Engagement</span>
                              <span className="font-medium">
                                {analyticsData.callAnalytics.length > 0
                                  ? (
                                      analyticsData.callAnalytics.reduce((sum, c) => sum + (c.engagement_score || 0), 0) /
                                      analyticsData.callAnalytics.length
                                    ).toFixed(1)
                                  : '0.0'}/10
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Overview</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {analyticsData?.userPerformance && (
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Active Users</span>
                              <span className="font-medium">{analyticsData.userPerformance.length}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Avg Quota Attainment</span>
                              <span className="font-medium">
                                {analyticsData.userPerformance.length > 0
                                  ? Math.round(
                                      analyticsData.userPerformance.reduce((sum, u) => sum + (u.quota_attainment || 0), 0) /
                                      analyticsData.userPerformance.length
                                    )
                                  : 0}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-500">Avg Win Rate</span>
                              <span className="font-medium">
                                {analyticsData.userPerformance.length > 0
                                  ? Math.round(
                                      analyticsData.userPerformance.reduce((sum, u) => sum + (u.win_rate || 0), 0) /
                                      analyticsData.userPerformance.length
                                    )
                                  : 0}%
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="team" className="h-full">
              <TeamPerformanceView dateRange={dateRange} />
            </TabsContent>

            <TabsContent value="trends" className="h-full">
              <AnalyticsTrendsView dateRange={dateRange} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}