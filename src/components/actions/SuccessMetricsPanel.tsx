// src/components/actions/SuccessMetricsPanel.tsx
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Calendar,
  Users,
  Zap,
  Award,
  Activity,
  ArrowUp,
  ArrowDown,
  Minus,
  Filter
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface MetricCard {
  id: string;
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ElementType;
  color: string;
  description: string;
  target?: string;
  targetProgress?: number;
}

interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

export function SuccessMetricsPanel() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  // Mock metrics data
  const keyMetrics: MetricCard[] = [
    {
      id: 'success-rate',
      title: 'Action Success Rate',
      value: '89.2%',
      change: 12.5,
      changeType: 'increase',
      icon: Target,
      color: 'green',
      description: 'Actions completed successfully vs total attempts',
      target: '85%',
      targetProgress: 105
    },
    {
      id: 'time-saved',
      title: 'Time Saved This Week',
      value: '3.2 hours',
      change: 24.8,
      changeType: 'increase',
      icon: Clock,
      color: 'blue',
      description: 'AI automation reduced manual work time',
      target: '4 hours',
      targetProgress: 80
    },
    {
      id: 'actions-completed',
      title: 'Actions Completed',
      value: '147',
      change: -5.2,
      changeType: 'decrease',
      icon: CheckCircle2,
      color: 'purple',
      description: 'Total actions completed this period',
      target: '150',
      targetProgress: 98
    },
    {
      id: 'avg-response-time',
      title: 'Avg Response Time',
      value: '2.3 hours',
      change: -15.7,
      changeType: 'increase', // Decrease in time is good
      icon: Activity,
      color: 'orange',
      description: 'Average time from action creation to completion',
      target: '2 hours',
      targetProgress: 87
    }
  ];

  const performanceInsights = [
    {
      id: 'best-day',
      title: 'Best Performance Day',
      value: 'Tuesday',
      description: '94% success rate, 15% above average',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 'top-action-type',
      title: 'Top Performing Action Type',
      value: 'Follow-up Calls',
      description: '96% success rate, saves 45 min per action',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'improvement-area',
      title: 'Biggest Improvement Opportunity',
      value: 'Proposal Generation',
      description: 'Only 67% success rate, 23% below average',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'ai-impact',
      title: 'AI Assistant Impact',
      value: '+42% Efficiency',
      description: 'Actions with AI suggestions perform significantly better',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Mock time series data for charts
  const chartData: TimeSeriesData[] = [
    { date: '2025-01-07', value: 82, label: 'Mon' },
    { date: '2025-01-08', value: 94, label: 'Tue' },
    { date: '2025-01-09', value: 87, label: 'Wed' },
    { date: '2025-01-10', value: 91, label: 'Thu' },
    { date: '2025-01-11', value: 85, label: 'Fri' },
    { date: '2025-01-12', value: 88, label: 'Sat' },
    { date: '2025-01-13', value: 92, label: 'Sun' }
  ];

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase': return ArrowUp;
      case 'decrease': return ArrowDown;
      default: return Minus;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getMetricColor = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-100 text-green-600';
      case 'blue': return 'bg-blue-100 text-blue-600';
      case 'purple': return 'bg-purple-100 text-purple-600';
      case 'orange': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 dark:bg-white/5 backdrop-blur-md rounded-3xl p-6 shadow-lg shadow-black/5 ring-1 ring-black/5 dark:ring-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Success Metrics & Analytics</h3>
              <p className="text-sm text-gray-500">Track performance and identify optimization opportunities</p>
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex items-center gap-2 border border-gray-200/80 rounded-full p-1 bg-white/50 backdrop-blur-sm">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Performance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => {
            const ChangeIcon = getChangeIcon(metric.changeType);
            return (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
                className="cursor-pointer group"
              >
                <div className="p-4 rounded-xl bg-white/50 border border-gray-200/50 hover:bg-white/70 hover:border-gray-300/50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg ${getMetricColor(metric.color)}`}>
                      <metric.icon className="h-4 w-4" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${getChangeColor(metric.changeType)}`}>
                      <ChangeIcon className="h-3 w-3" />
                      <span>{Math.abs(metric.change)}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                    <div className="text-sm font-medium text-gray-700">{metric.title}</div>
                    <div className="text-xs text-gray-500">{metric.description}</div>
                  </div>

                  {/* Target Progress */}
                  {metric.target && metric.targetProgress && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Target: {metric.target}</span>
                        <span>{metric.targetProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            metric.targetProgress >= 100 ? 'bg-green-500' : 
                            metric.targetProgress >= 75 ? 'bg-blue-500' : 'bg-orange-500'
                          }`}
                          style={{ width: `${Math.min(100, metric.targetProgress)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-6">
          <h4 className="font-semibold text-gray-900">Success Rate Trend</h4>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            +5.2% vs last week
          </Badge>
        </div>

        {/* Simple Bar Chart */}
        <div className="flex items-end justify-between h-32 gap-2">
          {chartData.map((data, index) => (
            <div key={data.date} className="flex flex-col items-center flex-1">
              <div 
                className={`w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t transition-all duration-500 hover:from-purple-700 hover:to-purple-500 cursor-pointer ${
                  data.value === maxValue ? 'shadow-lg' : ''
                }`}
                style={{ height: `${(data.value / maxValue) * 100}%` }}
                title={`${data.label}: ${data.value}%`}
              />
              <div className="text-xs text-gray-500 mt-2">{data.label}</div>
              <div className="text-xs font-medium text-gray-700">{data.value}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceInsights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white/70 backdrop-blur-md rounded-2xl p-6 shadow-lg ring-1 ring-black/5"
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full ${insight.bgColor}`}>
                <insight.icon className={`h-5 w-5 ${insight.color}`} />
              </div>
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900 mb-1">{insight.title}</h5>
                <div className="text-lg font-bold text-gray-800 mb-2">{insight.value}</div>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Recommendations */}
      <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 backdrop-blur-md rounded-2xl p-6 shadow-lg ring-1 ring-purple-200/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-full">
            <Zap className="h-5 w-5 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900">AI Performance Recommendations</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/50 rounded-xl border border-purple-200/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-medium text-gray-900">Optimize Timing</span>
            </div>
            <p className="text-sm text-gray-600">
              Schedule calls between 2-4 PM on Tuesdays and Wednesdays for 18% higher success rates
            </p>
          </div>

          <div className="p-4 bg-white/50 rounded-xl border border-purple-200/30">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-900">Template Usage</span>
            </div>
            <p className="text-sm text-gray-600">
              Use "Follow-up - High Priority" template for 15% better conversion on hot leads
            </p>
          </div>

          <div className="p-4 bg-white/50 rounded-xl border border-purple-200/30">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-orange-600" />
              <span className="font-medium text-gray-900">Personalization</span>
            </div>
            <p className="text-sm text-gray-600">
              Actions with company research have 34% higher success rates than generic ones
            </p>
          </div>

          <div className="p-4 bg-white/50 rounded-xl border border-purple-200/30">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="font-medium text-gray-900">Follow-up Cadence</span>
            </div>
            <p className="text-sm text-gray-600">
              Follow up within 24 hours for 26% better response rates on initial outreach
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-purple-200/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Performance analysis based on 2,847 actions across 45 days
            </div>
            <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
              View Detailed Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}