"use client";

import { useMemo } from 'react';
import { Phone, Clock, Target, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ComposedChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { DateRange } from '../../types/analytics';
import { COLORS } from '../../utils/colors';
import { useCallMetrics } from './useCallMetrics';

interface CallMetricsPanelProps {
  data: any;
  dateRange: DateRange;
}

export const CallMetricsPanel = ({ data, dateRange }: CallMetricsPanelProps) => {
  const { 
    callVolumeData, 
    talkRatioData, 
    performanceMetrics, 
    qualityMetrics, 
    connectionMetrics,
    hourlyPerformance 
  } = useCallMetrics(data, dateRange);

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