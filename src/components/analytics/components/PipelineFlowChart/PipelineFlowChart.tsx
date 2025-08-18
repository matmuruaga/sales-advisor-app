"use client";

import { useMemo } from 'react';
import { Phone, Target, Calendar, MessageSquare, DollarSign, TrendingUp } from "lucide-react";
import { FunnelChart, Funnel, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../../utils/colors';

interface PipelineFlowChartProps {
  data: any;
}

interface KPICapsule {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

interface BottomMetric {
  label: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const PipelineFlowChart = ({ data }: PipelineFlowChartProps) => {
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
          {percentage}%
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
          {displayValue.toLocaleString()}
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

  return { pipelineData, CustomFunnelLabel, kpiCapsules, bottomMetrics };
};