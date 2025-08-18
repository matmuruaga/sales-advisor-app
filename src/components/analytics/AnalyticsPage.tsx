"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Minus,
  Phone,
  MessageSquare,
  Target,
  Clock,
  Users,
  Brain,
  Zap,
  DollarSign,
  AlertCircle,
  ChevronRight,
  Filter,
  RefreshCw,
  Info,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  FunnelChart,
  Funnel,
  LabelList,
  ComposedChart
} from 'recharts';
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { format, subDays, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, isWithinInterval, isSameDay, startOfWeek, endOfWeek } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useSupabase } from "@/hooks/useSupabase";

// Import extracted components
import { StandardCard } from './components/StandardCard';
import { SentimentDashboard } from './components/SentimentDashboard';
import { KeywordsCloud } from './components/KeywordsCloud';
import { TeamPerformanceMatrix } from './components/TeamPerformanceMatrix';
import { ActivityFeed } from './components/ActivityFeed';
import { CoachingInsights } from './components/CoachingInsights';

// Types
interface DateRange {
  from: Date;
  to: Date;
}

interface KPIMetric {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  progress?: number;
  target?: string;
  comparison?: string;
  sparklineData?: number[];
}

// Professional Color Palette
const COLORS = {
  primary: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#9333EA',
  pink: '#EC4899',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};

// Enhanced Date Range Picker with Working Calendar
const DateRangePickerPro = ({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
    from: value.from,
    to: value.to
  });

  const presets = [
    { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
    { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
    { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
    { label: 'Last 90 days', getValue: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
    { label: 'This Week', getValue: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
    { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
    { label: 'This Quarter', getValue: () => ({ from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) }) },
    { label: 'This Year', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) }
  ];

  const handlePresetClick = (preset: any) => {
    const range = preset.getValue();
    setTempRange(range);
  };

  const handleApply = () => {
    if (tempRange.from && tempRange.to) {
      onChange({ from: tempRange.from, to: tempRange.to });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempRange({ from: value.from, to: value.to });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-9 px-4 text-sm font-normal justify-start text-left",
            "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300",
            "transition-all duration-200"
          )}
        >
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            {value.from && value.to ? (
              `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`
            ) : (
              "Select date range"
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white shadow-xl border border-gray-200" align="start">
        <div className="flex">
          {/* Presets Sidebar */}
          <div className="w-48 border-r border-gray-100 p-3 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Quick Select</p>
            <div className="space-y-1">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    "hover:bg-white hover:shadow-sm",
                    tempRange.from && tempRange.to && 
                    isSameDay(tempRange.from, preset.getValue().from) && 
                    isSameDay(tempRange.to, preset.getValue().to)
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-700"
                  )}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Calendar */}
          <div className="p-3">
            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={setTempRange}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={2}
              showOutsideDays
              className="rdp-custom"
              classNames={{
                months: "flex space-x-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 hover:bg-gray-100 rounded-md",
                  "inline-flex items-center justify-center text-gray-600"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative h-9 w-9 text-center text-sm p-0",
                  "focus-within:relative focus-within:z-20"
                ),
                day: cn(
                  "h-9 w-9 p-0 font-normal rounded-md",
                  "hover:bg-gray-100 hover:text-gray-900",
                  "focus:bg-gray-100 focus:text-gray-900"
                ),
                day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-700 focus:text-white",
                day_today: "bg-gray-100 text-gray-900 font-semibold",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-400 opacity-50",
                day_range_middle: "bg-indigo-50 text-indigo-900 rounded-none",
                day_hidden: "invisible",
              }}
            />
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {tempRange.from && tempRange.to && (
                  <span>{Math.round((tempRange.to.getTime() - tempRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-600 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!tempRange.from || !tempRange.to}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Professional KPI Card with Sparkline
const KPICardPro = ({ metric, loading = false }: { metric: KPIMetric; loading?: boolean }) => {
  const getTrendIcon = () => {
    if (metric.trend === 'up') return <ArrowUpRight className="w-4 h-4" />;
    if (metric.trend === 'down') return <ArrowDownRight className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (metric.trend === 'up') return 'text-green-600';
    if (metric.trend === 'down') return 'text-red-500';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm h-[180px]">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="h-[180px]"
    >
      <Card 
      className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all min-h-[200px]"
      role="article"
      aria-label={`KPI: ${metric.title}`}
    >
        <CardContent className="p-6 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 
                className="text-xs font-semibold text-gray-500 uppercase tracking-wider line-clamp-2 max-w-full pr-2"
                style={{ fontSize: 'clamp(0.6rem, 1.5vw, 0.75rem)' }}
                title={metric.title}
              >
                {metric.title}
              </h3>
              {metric.trend && (
                <div className={cn("flex items-center", getTrendColor())}>
                  {getTrendIcon()}
                </div>
              )}
            </div>
            
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {metric.value}
              </span>
              {metric.subtitle && (
                <span className="text-sm text-gray-500">{metric.subtitle}</span>
              )}
            </div>
          
            {metric.trendValue && (
              <div className={cn("text-xs", getTrendColor())}>
                {metric.trendValue}
              </div>
            )}
            
            {metric.comparison && (
              <div className="text-xs text-gray-500 mt-1">
                {metric.comparison}
              </div>
            )}
          </div>
          
          <div>
            {metric.progress !== undefined && (
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{metric.progress}% of target</span>
                  <span>{metric.target}</span>
                </div>
                <Progress value={metric.progress} className="h-1.5" />
              </div>
            )}
            
            {metric.sparklineData && (
              <div className="mt-2">
                <ResponsiveContainer width="100%" height={30}>
                  <LineChart data={metric.sparklineData.map((v, i) => ({ value: v }))}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={COLORS.primary}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// StandardCard and related types are now imported from ./components/StandardCard

// Pipeline Flow Chart Component
const PipelineFlowChart = ({ data }: { data: any }) => {
  const pipelineData = useMemo(() => {
    if (!data?.dailyMetrics || data.dailyMetrics.length === 0) {
      return [
        { 
          name: 'Calls', 
          value: 0, 
          fill: COLORS.primary,
          icon: Phone,
          percentage: 100,
          conversionRate: 0,
          color: COLORS.primary
        },
        { 
          name: 'Qualified', 
          value: 0, 
          fill: COLORS.info,
          icon: Target,
          percentage: 0,
          conversionRate: 0,
          color: COLORS.info
        },
        { 
          name: 'Meetings', 
          value: 0, 
          fill: COLORS.success,
          icon: Calendar,
          percentage: 0,
          conversionRate: 0,
          color: COLORS.success
        },
        { 
          name: 'Deals', 
          value: 0, 
          fill: COLORS.warning,
          icon: MessageSquare,
          percentage: 0,
          conversionRate: 0,
          color: COLORS.warning
        },
        { 
          name: 'Won', 
          value: 0, 
          fill: COLORS.purple,
          icon: DollarSign,
          percentage: 0,
          conversionRate: 0,
          color: COLORS.purple
        }
      ];
    }

    const metrics = data.dailyMetrics;
    
    // Calculate totals from the filtered period
    const totalCalls = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.calls_made) || 0), 0);
    const totalQualified = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.qualified_leads) || 0), 0);
    const totalMeetings = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.meetings_booked) || 0), 0);
    const totalDealsCreated = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.deals_created) || 0), 0);
    const totalDealsWon = metrics.reduce((sum: number, m: any) => sum + (parseInt(m.deals_won) || 0), 0);

    const stages = [
      { 
        name: 'Calls', 
        value: totalCalls, 
        fill: COLORS.primary,
        icon: Phone,
        color: COLORS.primary
      },
      { 
        name: 'Qualified', 
        value: totalQualified, 
        fill: COLORS.info,
        icon: Target,
        color: COLORS.info
      },
      { 
        name: 'Meetings', 
        value: totalMeetings, 
        fill: COLORS.success,
        icon: Calendar,
        color: COLORS.success
      },
      { 
        name: 'Deals', 
        value: totalDealsCreated, 
        fill: COLORS.warning,
        icon: MessageSquare,
        color: COLORS.warning
      },
      { 
        name: 'Won', 
        value: totalDealsWon, 
        fill: COLORS.purple,
        icon: DollarSign,
        color: COLORS.purple
      }
    ];

    // Calculate percentages and conversion rates
    return stages.map((stage, index) => ({
      ...stage,
      percentage: totalCalls > 0 ? Math.round((stage.value / totalCalls) * 100) : 0,
      conversionRate: index > 0 && stages[index - 1].value > 0 
        ? Math.round((stage.value / stages[index - 1].value) * 100)
        : 100
    }));
  }, [data]);

  // Custom label component for the funnel with prominent percentages
  const CustomFunnelLabel = (props: any) => {
    const { x, y, width, height, payload, value } = props;
    
    // Handle both direct value and payload.value scenarios
    const displayValue = value || (payload && payload.value) || 0;
    const displayName = payload ? payload.name : '';
    const percentage = payload ? payload.percentage : 0;
    
    if (!x || !y || !width || !height || !payload) return null;
    
    return (
      <g>
        {/* Stage name - top left */}
        <text 
          x={x + 20} 
          y={y + height / 2 - 8} 
          fill="white" 
          textAnchor="start" 
          fontSize="11" 
          fontWeight="600"
          opacity="0.95"
        >
          {displayName}
        </text>
        
        {/* Prominent percentage - center */}
        <text 
          x={x + width / 2} 
          y={y + height / 2 + 4} 
          fill="white" 
          textAnchor="middle" 
          fontSize="18" 
          fontWeight="700"
        >
          {percentage.toFixed(2)}%
        </text>
        
        {/* Actual value on the right side */}
        <text 
          x={x + width - 20} 
          y={y + height / 2 + 4} 
          fill="white" 
          textAnchor="end" 
          fontSize="14" 
          opacity="0.9"
          fontWeight="500"
        >
          {(displayValue / 1000).toFixed(4)}
        </text>
      </g>
    );
  };

  // Calculate KPI values
  const totalCalls = pipelineData[0]?.value || 0;
  const overallConversion = pipelineData.length > 0 && pipelineData[0].value > 0 
    ? Math.round((pipelineData[pipelineData.length - 1].value / pipelineData[0].value) * 100) 
    : 0;

  // Calculate bottom metrics
  const callToQualified = pipelineData.length >= 2 && pipelineData[0].value > 0
    ? Math.round((pipelineData[1].value / pipelineData[0].value) * 100)
    : 0;
  
  const meetingRate = pipelineData.length >= 3 && pipelineData[1].value > 0
    ? Math.round((pipelineData[2].value / pipelineData[1].value) * 100)
    : 0;
    
  const dealCloseRate = pipelineData.length >= 5 && pipelineData[3].value > 0
    ? Math.round((pipelineData[4].value / pipelineData[3].value) * 100)
    : 0;

  const kpiCapsules: KPICapsule[] = [
    { label: 'Conversion', value: `${overallConversion}%`, color: 'blue', trend: overallConversion > 20 ? 'up' : 'down' },
    { label: 'Total Calls', value: totalCalls, color: 'green' }
  ];

  const bottomMetrics: BottomMetric[] = [
    { label: 'Call-to-Qualified', value: `${callToQualified}%`, icon: Target, trend: callToQualified > 30 ? 'up' : 'down' },
    { label: 'Meeting Rate', value: `${meetingRate}%`, icon: Calendar, trend: meetingRate > 15 ? 'up' : 'neutral' },
    { label: 'Deal Close Rate', value: `${dealCloseRate}%`, icon: DollarSign, trend: dealCloseRate > 10 ? 'up' : 'down' },
    { label: 'Pipeline Value', value: `$${Math.round(pipelineData[3]?.value * 5000 / 1000)}K`, icon: TrendingUp }
  ];

  return (
    <StandardCard
      title="Pipeline Flow"
      subtitle="From daily activity metrics"
      kpiCapsules={kpiCapsules}
      bottomMetrics={bottomMetrics}
      onViewDetails={() => {}}
    >
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart 
          margin={{ top: 15, right: 30, bottom: 15, left: 30 }}
          aria-label="Sales pipeline funnel showing conversion rates across stages"
        >
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            content={({ active, payload }) => {
              if (active && payload && payload[0]) {
                const data = payload[0].payload;
                return (
                  <div className="p-3 bg-white rounded-lg shadow-lg border border-gray-200">
                    <p className="font-semibold text-gray-900">{data.name}</p>
                    <p className="text-sm text-gray-600">Count: {data.value.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Of Total: {data.percentage}%</p>
                    {data.conversionRate < 100 && (
                      <p className="text-sm font-medium text-indigo-600">
                        Conversion: {data.conversionRate}%
                      </p>
                    )}
                  </div>
                );
              }
              return null;
            }}
          />
          <Funnel
            dataKey="value"
            data={pipelineData}
            isAnimationActive
          >
            <LabelList content={CustomFunnelLabel} position="center" />
            {pipelineData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </StandardCard>
  );
};

// Sentiment Analysis Dashboard
// SentimentDashboard component removed - now imported

// Call Metrics Panel - Comprehensive Redesign
const CallMetricsPanel = ({ data, dateRange }: { data: any; dateRange: DateRange }) => {
  const { 
    callVolumeData, 
    talkRatioData, 
    performanceMetrics, 
    qualityMetrics, 
    connectionMetrics,
    hourlyPerformance 
  } = useMemo(() => {
    if (!data?.callIntelligence || data.callIntelligence.length === 0) {
      return {
        callVolumeData: Array.from({ length: 7 }, (_, i) => ({
          time: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          calls: 0,
          connected: 0
        })),
        talkRatioData: [
          { name: 'Customer', value: 60, fill: COLORS.success },
          { name: 'BDR', value: 40, fill: COLORS.info }
        ],
        performanceMetrics: {
          totalCalls: 0,
          connectedCalls: 0,
          avgDuration: 0,
          connectionRate: 0,
          avgQuestions: 0,
          objectionRate: 0,
          nextStepsRate: 0,
          callQualityScore: 0
        },
        qualityMetrics: {
          engagementScore: 0,
          sentimentScore: 0,
          conversionRate: 0,
          followUpRate: 0
        },
        connectionMetrics: {
          peakHour: 'N/A',
          bestDay: 'N/A',
          avgCallsPerDay: 0
        },
        hourlyPerformance: Array.from({ length: 24 }, (_, i) => ({ hour: i, calls: 0 }))
      };
    }

    const calls = data.callIntelligence;
    // Consider calls "connected" if they last more than 30 seconds (meaningful conversation)
    const validCalls = calls.filter((call: any) => call.call_duration_total > 30);
    
    // Call volume trends by day (last 7 days)
    const callsByDate: { [key: string]: { total: number, connected: number } } = {};
    
    calls.forEach((call: any) => {
      const callDate = new Date(call.created_at);
      const dateKey = callDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!callsByDate[dateKey]) {
        callsByDate[dateKey] = { total: 0, connected: 0 };
      }
      
      callsByDate[dateKey].total++;
      // Use same 30-second threshold for consistency
      if (call.call_duration_total > 30) {
        callsByDate[dateKey].connected++;
      }
    });

    // Calculate date range days (max 30)
    const daysDiff = Math.min(30, Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const daysToShow = Math.min(daysDiff, 30);
    
    const callVolumeByDate = Array.from({ length: daysToShow }, (_, i) => {
      const date = new Date(dateRange.to);
      date.setDate(date.getDate() - (daysToShow - 1 - i));
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        time: dateKey,
        calls: callsByDate[dateKey]?.total || 0,
        connected: callsByDate[dateKey]?.connected || 0
      };
    });

    // Talk time ratio calculation
    const avgCustomerTalk = validCalls.length > 0 ? 
      validCalls.reduce((sum: number, call: any) => sum + (parseInt(call.talk_time_customer) || 0), 0) / validCalls.length : 0;
    const avgBdrTalk = validCalls.length > 0 ? 
      validCalls.reduce((sum: number, call: any) => sum + (parseInt(call.talk_time_bdr) || 0), 0) / validCalls.length : 0;
    
    const totalTalk = avgCustomerTalk + avgBdrTalk;
    const customerRatio = totalTalk > 0 ? Math.round((avgCustomerTalk / totalTalk) * 100) : 60;
    const bdrRatio = 100 - customerRatio;

    const talkRatioData = [
      { name: 'Customer', value: customerRatio, fill: COLORS.success },
      { name: 'BDR', value: bdrRatio, fill: COLORS.info }
    ];

    // Performance metrics
    const totalCalls = calls.length;
    const connectedCalls = validCalls.length;
    const connectionRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;
    
    const avgDuration = validCalls.length > 0 ? 
      Math.round(validCalls.reduce((sum: number, call: any) => sum + (parseInt(call.call_duration_total) || 0), 0) / validCalls.length / 60) : 0;
    
    const avgQuestions = validCalls.length > 0 ? 
      Math.round(validCalls.reduce((sum: number, call: any) => sum + (parseInt(call.questions_asked) || 0), 0) / validCalls.length) : 0;
    
    const objectionRate = validCalls.length > 0 ? 
      Math.round(validCalls.reduce((sum: number, call: any) => sum + (parseFloat(call.objection_handling_rate) || 0), 0) / validCalls.length) : 0;
    
    const nextStepsRate = validCalls.length > 0 ? 
      Math.round((validCalls.filter((call: any) => call.next_steps_defined).length / validCalls.length) * 100) : 0;

    // Quality metrics
    const avgEngagement = validCalls.length > 0 ?
      Math.round((validCalls.reduce((sum: number, call: any) => sum + (parseFloat(call.engagement_score) || 0), 0) / validCalls.length) * 10) / 10 : 0;
    
    const avgSentiment = validCalls.length > 0 ?
      Math.round((validCalls.reduce((sum: number, call: any) => sum + (parseFloat(call.sentiment_score) || 0), 0) / validCalls.length) * 10) / 10 : 0;

    const callQualityScore = Math.round((avgEngagement + avgSentiment) / 2 * 10);

    // Best performing times
    const callsByHour: { [key: number]: number } = {};
    const callsByDay: { [key: string]: number } = {};
    
    calls.forEach((call: any) => {
      const callDate = new Date(call.created_at);
      const hour = callDate.getHours();
      const day = callDate.toLocaleDateString('en-US', { weekday: 'long' });
      
      callsByHour[hour] = (callsByHour[hour] || 0) + 1;
      callsByDay[day] = (callsByDay[day] || 0) + 1;
    });

    const peakHour = Object.entries(callsByHour).length > 0 ? 
      Object.entries(callsByHour).reduce((a, b) => callsByHour[parseInt(a[0])] > callsByHour[parseInt(b[0])] ? a : b)[0] + ':00' : 'N/A';
    
    const bestDayFull = Object.entries(callsByDay).length > 0 ?
      Object.entries(callsByDay).reduce((a, b) => callsByDay[a[0]] > callsByDay[b[0]] ? a : b)[0] : 'N/A';
    const bestDay = bestDayFull !== 'N/A' ? bestDayFull.substring(0, 3) : 'N/A';

    const avgCallsPerDay = callVolumeByDate.length > 0 ? 
      Math.round(callVolumeByDate.reduce((sum, day) => sum + day.calls, 0) / callVolumeByDate.length) : 0;

    // Hourly performance data for mini chart
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      calls: callsByHour[hour] || 0
    }));

    return {
      callVolumeData: callVolumeByDate,
      talkRatioData,
      performanceMetrics: {
        totalCalls,
        connectedCalls,
        avgDuration,
        connectionRate,
        avgQuestions,
        objectionRate,
        nextStepsRate,
        callQualityScore
      },
      qualityMetrics: {
        engagementScore: avgEngagement,
        sentimentScore: avgSentiment,
        conversionRate: nextStepsRate,
        followUpRate: objectionRate
      },
      connectionMetrics: {
        peakHour,
        bestDay,
        avgCallsPerDay
      },
      hourlyPerformance: hourlyData
    };
  }, [data]);

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">Call Analytics</CardTitle>
            <div className="text-xs text-gray-500">Intelligence from analyzed calls</div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs",
                performanceMetrics.connectionRate >= 80 ? "bg-green-50 text-green-700 border-green-200" :
                performanceMetrics.connectionRate >= 60 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                "bg-red-50 text-red-700 border-red-200"
              )}
            >
              {performanceMetrics.connectionRate}% Connected
            </Badge>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Call Volume Trend */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Call Volume Trend ({callVolumeData.length} Days)</h4>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                <span>Total Calls</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={80}>
            <ComposedChart data={callVolumeData}>
              <Bar dataKey="calls" fill={COLORS.primary} radius={[2, 2, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="connected" 
                stroke={COLORS.success} 
                strokeWidth={2}
                dot={{ fill: COLORS.success, r: 3 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-indigo-100 rounded-lg mx-auto mb-2">
              <Phone className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{performanceMetrics.connectedCalls}</div>
            <div className="text-xs text-gray-500">Connected Calls</div>
            <div className="text-xs text-indigo-600 font-medium">{performanceMetrics.totalCalls} total attempted</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg mx-auto mb-2">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{performanceMetrics.avgDuration}m</div>
            <div className="text-xs text-gray-500">Avg Duration</div>
            <div className="text-xs text-green-600 font-medium">
              {performanceMetrics.avgDuration > 15 ? '↗ Above target' : 
               performanceMetrics.avgDuration > 10 ? '→ On target' : '↘ Below target'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{performanceMetrics.callQualityScore}%</div>
            <div className="text-xs text-gray-500">Quality Score</div>
            <div className="text-xs text-purple-600 font-medium">
              Engagement + Sentiment
            </div>
          </div>
        </div>

        {/* Talk Time Ratio & Performance Metrics */}
        <div className="grid grid-cols-2 gap-6">
          {/* Talk Time Ratio */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Talk Time Ratio</h4>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={talkRatioData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {talkRatioData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-3 mt-2">
              {talkRatioData.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fill }}></div>
                  <span className="text-xs text-gray-600">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500 mb-1">Questions/Call</div>
              <div className="text-lg font-bold text-gray-900">{performanceMetrics.avgQuestions}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500 mb-1">Next Steps</div>
              <div className="text-lg font-bold text-gray-900">{performanceMetrics.nextStepsRate}%</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500 mb-1">Peak Hour</div>
              <div className="text-sm font-bold text-gray-900">{connectionMetrics.peakHour}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-500 mb-1">Best Day</div>
              <div className="text-sm font-bold text-gray-900">{connectionMetrics.bestDay}</div>
            </div>
          </div>
        </div>

        {/* Quality Indicators */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Call Quality Indicators</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Engagement Score</span>
                <span>{qualityMetrics.engagementScore}/10</span>
              </div>
              <Progress 
                value={qualityMetrics.engagementScore * 10} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Sentiment Score</span>
                <span>{qualityMetrics.sentimentScore}/10</span>
              </div>
              <Progress 
                value={qualityMetrics.sentimentScore * 10} 
                className="h-2"
              />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

// Keywords Cloud Component
// KeywordsCloud component removed - now imported

// Team Performance Matrix
// TeamPerformanceMatrix component removed - now imported

// Activity Feed Component
// ActivityFeed component removed - now imported

// Coaching Insights Component
// CoachingInsights component removed - now imported

// Main Dashboard Component
export function AnalyticsPageNew() {
  // Set default date range to match available data (last 30 days of data)
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date('2025-07-15'),
    to: new Date('2025-08-14')
  });
  
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dashboard data with date filters
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!supabase) return;
      
      setLoading(true);
      try {
        // Use a default organization if none is set in localStorage
        const organizationId = localStorage.getItem('organizationId') || '47fba630-b113-4fe9-b68f-947d79c09fb2';
        
        // Format dates properly for Supabase queries
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        const fromDateTime = `${fromDate}T00:00:00.000Z`;
        const toDateTime = `${toDate}T23:59:59.999Z`;

        console.log('Fetching dashboard data for date range:', {
          organizationId,
          fromDate,
          toDate,
          fromDateTime,
          toDateTime
        });

        // Fetch data in parallel from multiple tables with date filters
        const [
          dailyMetricsResult,
          callIntelligenceResult,
          aiImpactResult,
          pipelineAttributionResult,
          teamPerformanceResult
        ] = await Promise.all([
          // Daily metrics with date filter
          supabase
            .from('daily_metrics')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('metric_date', fromDate)
            .lte('metric_date', toDate)
            .order('metric_date', { ascending: true }),

          // Call intelligence with date filter
          supabase
            .from('call_intelligence')
            .select('*')
            .gte('created_at', fromDateTime)
            .lte('created_at', toDateTime)
            .order('created_at', { ascending: false }),

          // AI impact metrics with date filter
          supabase
            .from('ai_impact_metrics')
            .select('*')
            .eq('organization_id', organizationId)
            .gte('date', fromDate)
            .lte('date', toDate)
            .order('date', { ascending: true }),

          // Pipeline attribution with date filter
          supabase
            .from('pipeline_attribution')
            .select('*')
            .gte('created_at', fromDateTime)
            .lte('created_at', toDateTime)
            .order('created_at', { ascending: false }),

          // Team performance with date filter and user names
          supabase
            .from('team_performance_metrics')
            .select(`
              performance_id,
              user_id,
              date,
              organization_id,
              conversion_rate,
              activity_volume,
              composite_score,
              pipeline_contribution,
              ranking_position,
              percentile,
              coaching_opportunities,
              users!inner (
                id,
                full_name,
                email,
                role
              )
            `)
            .eq('organization_id', organizationId)
            .gte('date', fromDate)
            .lte('date', toDate)
            .order('date', { ascending: true })
        ]);

        // Check for errors in each result
        if (dailyMetricsResult.error) {
          console.error('Error fetching daily metrics:', dailyMetricsResult.error);
        }
        if (callIntelligenceResult.error) {
          console.error('Error fetching call intelligence:', callIntelligenceResult.error);
        }
        if (aiImpactResult.error) {
          console.error('Error fetching AI impact:', aiImpactResult.error);
        }
        if (pipelineAttributionResult.error) {
          console.error('Error fetching pipeline attribution:', pipelineAttributionResult.error);
        }
        if (teamPerformanceResult.error) {
          console.error('Error fetching team performance:', teamPerformanceResult.error);
        }

        // Process and aggregate the data
        const processedData = {
          dailyMetrics: dailyMetricsResult.data || [],
          callIntelligence: callIntelligenceResult.data || [],
          aiImpact: aiImpactResult.data || [],
          pipelineAttribution: pipelineAttributionResult.data || [],
          teamPerformance: teamPerformanceResult.data || []
        };

        console.log('Dashboard data fetched:', {
          dateRange: { from: fromDate, to: toDate },
          dailyMetrics: processedData.dailyMetrics.length,
          callIntelligence: processedData.callIntelligence.length,
          aiImpact: processedData.aiImpact.length,
          pipelineAttribution: processedData.pipelineAttribution.length,
          teamPerformance: processedData.teamPerformance.length,
          sampleDailyMetric: processedData.dailyMetrics[0],
          sampleCallIntelligence: processedData.callIntelligence[0]
        });

        setDashboardData(processedData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dateRange, supabase, refreshKey]);

  // Calculate KPI Metrics from real data
  const kpiMetrics: KPIMetric[] = useMemo(() => {
    if (!dashboardData) {
      return [
        {
          title: 'Pipeline Contribution',
          value: '$0',
          trend: 'neutral',
          trendValue: 'Loading...',
          sparklineData: []
        },
        {
          title: 'Revenue Attribution',
          value: '$0',
          subtitle: 'Loading...',
          progress: 0,
          target: '$0'
        },
        {
          title: 'Cost Per Qualified Lead',
          value: '$0',
          trend: 'neutral',
          comparison: 'Loading...'
        },
        {
          title: 'Sales Accepted Opportunities',
          value: '0',
          subtitle: 'Loading...',
          sparklineData: []
        },
        {
          title: 'Opportunity Win Rate',
          value: '0%',
          trend: 'neutral',
          trendValue: 'Loading...',
          comparison: 'Loading...'
        }
      ];
    }

    const { dailyMetrics, aiImpact, pipelineAttribution } = dashboardData;

    // Calculate Pipeline Contribution
    const totalPipelineAdded = dailyMetrics.reduce((sum: number, metric: any) => 
      sum + (parseFloat(metric.pipeline_added) || 0), 0);

    // Calculate Revenue Attribution
    const totalRevenueWon = dailyMetrics.reduce((sum: number, metric: any) => 
      sum + (parseFloat(metric.revenue_won) || 0), 0);

    // Calculate average monthly target for progress calculation
    const avgMonthlyTarget = dailyMetrics.length > 0 ? 
      dailyMetrics.reduce((sum: number, metric: any) => 
        sum + (parseFloat(metric.monthly_revenue_target) || 0), 0) / dailyMetrics.length : 500000;

    // Calculate ROI from AI Impact metrics
    const avgROI = aiImpact.length > 0 ?
      aiImpact.reduce((sum: number, metric: any) => 
        sum + (parseFloat(metric.roi_percentage) || 0), 0) / aiImpact.length : 0;

    // Calculate Cost Per Qualified Lead
    const totalCosts = dailyMetrics.reduce((sum: number, metric: any) => 
      sum + (parseFloat(metric.ai_sdr_cost) || 0), 0);
    const totalQualifiedLeads = dailyMetrics.reduce((sum: number, metric: any) => 
      sum + (parseInt(metric.qualified_leads) || 0), 0);
    const costPerLead = totalQualifiedLeads > 0 ? totalCosts / totalQualifiedLeads : 0;

    // Calculate Sales Accepted Opportunities
    const totalSAL = dailyMetrics.reduce((sum: number, metric: any) => 
      sum + (parseInt(metric.sales_accepted_leads) || 0), 0);
    const acceptanceRate = totalQualifiedLeads > 0 ? 
      (totalSAL / totalQualifiedLeads) * 100 : 0;

    // Calculate Win Rate
    const totalDealsWon = dailyMetrics.reduce((sum: number, metric: any) => 
      sum + (parseInt(metric.deals_won) || 0), 0);
    const totalDealsCreated = dailyMetrics.reduce((sum: number, metric: any) => 
      sum + (parseInt(metric.deals_created) || 0), 0);
    const winRate = totalDealsCreated > 0 ? (totalDealsWon / totalDealsCreated) * 100 : 0;

    // Generate sparkline data for pipeline (last 10 data points)
    const pipelineSparkline = dailyMetrics
      .sort((a: any, b: any) => new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime())
      .slice(-10)
      .map((metric: any) => parseFloat(metric.pipeline_added) || 0);

    return [
      {
        title: 'Pipeline Contribution',
        value: `$${(totalPipelineAdded / 1000).toFixed(0)}K`,
        trend: totalPipelineAdded > 0 ? 'up' : 'neutral',
        trendValue: `${dailyMetrics.length} days of data`,
        sparklineData: pipelineSparkline
      },
      {
        title: 'Revenue Attribution',
        value: `$${(totalRevenueWon / 1000).toFixed(0)}K`,
        subtitle: `${((totalRevenueWon / avgMonthlyTarget) * 100).toFixed(0)}% of target`,
        progress: Math.min(100, (totalRevenueWon / avgMonthlyTarget) * 100),
        target: `$${(avgMonthlyTarget / 1000).toFixed(0)}K`
      },
      {
        title: 'Cost Per Qualified Lead',
        value: `$${costPerLead.toFixed(0)}`,
        trend: costPerLead < 50 ? 'up' : costPerLead < 100 ? 'neutral' : 'down',
        comparison: 'vs $87 industry avg'
      },
      {
        title: 'Sales Accepted Opportunities',
        value: totalSAL.toString(),
        subtitle: `${acceptanceRate.toFixed(1)}% of ${totalQualifiedLeads} qualified leads`,
        sparklineData: dailyMetrics
          .sort((a: any, b: any) => new Date(a.metric_date).getTime() - new Date(b.metric_date).getTime())
          .slice(-10)
          .map((metric: any) => parseInt(metric.sales_accepted_leads) || 0)
      },
      {
        title: 'Opportunity Win Rate',
        value: `${winRate.toFixed(0)}%`,
        trend: winRate > 20 ? 'up' : winRate > 15 ? 'neutral' : 'down',
        trendValue: `${totalDealsWon}/${totalDealsCreated} deals`,
        comparison: 'Industry avg: 18%'
      }
    ];
  }, [dashboardData]);

  return (
    <div className="h-screen overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Intelligence Dashboard</h1>
              <p className="text-sm text-gray-500">AI-Powered Analytics for BDRs & Managers</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <DateRangePickerPro value={dateRange} onChange={setDateRange} />
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9"
              onClick={() => setRefreshKey(prev => prev + 1)}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-6 space-y-8 pb-16" role="main" aria-label="Analytics Dashboard">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {kpiMetrics.map((metric, index) => (
            <KPICardPro key={index} metric={metric} loading={loading} />
          ))}
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PipelineFlowChart data={dashboardData} />
          <SentimentDashboard data={dashboardData} />
          <CallMetricsPanel data={dashboardData} dateRange={dateRange} />
        </div>

        {/* Secondary Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KeywordsCloud data={dashboardData} />
          <TeamPerformanceMatrix data={dashboardData} loading={loading} />
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityFeed activities={dashboardData} />
          <CoachingInsights insights={dashboardData} />
        </div>
      </main>
    </div>
  );
}

export default AnalyticsPageNew;