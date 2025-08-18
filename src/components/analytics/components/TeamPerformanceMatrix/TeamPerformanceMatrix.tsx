"use client";

import { useMemo } from 'react';
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { COLORS } from '../../utils/colors';

interface TeamPerformanceMatrixProps {
  data: any;
  loading?: boolean;
}

export const TeamPerformanceMatrix = ({ data, loading }: TeamPerformanceMatrixProps) => {
  const teamData = useMemo(() => {
    if (loading) {
      return []; // Return empty during loading
    }

    if (!data?.teamPerformance || data.teamPerformance.length === 0) {
      return [
        { name: 'No Team Data Available', conversion: 0, activity: 0, roi: 0, x: 0, y: 0 }
      ];
    }

    // Group performance data by user and calculate averages
    const userPerformance = data.teamPerformance.reduce((acc: any, metric: any) => {
      const userId = metric.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          name: metric.users?.full_name || `Unknown User`, // Use actual full name from joined users table
          conversions: [],
          activities: [],
          scores: []
        };
      }
      
      acc[userId].conversions.push(parseFloat(metric.conversion_rate) || 0);
      acc[userId].activities.push(parseInt(metric.activity_volume) || 0);
      acc[userId].scores.push(parseFloat(metric.composite_score) || 0);
      
      return acc;
    }, {});

    // Calculate averages and format for chart
    return Object.values(userPerformance).map((user: any) => {
      const avgConversion = user.conversions.reduce((sum: number, val: number) => sum + val, 0) / user.conversions.length;
      const avgActivity = user.activities.reduce((sum: number, val: number) => sum + val, 0) / user.activities.length;
      const avgScore = user.scores.reduce((sum: number, val: number) => sum + val, 0) / user.scores.length;
      
      return {
        name: user.name,
        conversion: Math.round(avgConversion),
        activity: Math.round(avgActivity),
        roi: Math.round(avgScore * 100), // Convert score to percentage
        x: Math.round(avgActivity),
        y: Math.round(avgConversion)
      };
    }).slice(0, 6); // Limit to 6 users for readability
  }, [data]);

  if (loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Team Performance Matrix</CardTitle>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
              Loading...
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <div className="animate-pulse space-y-4 w-full">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Team Performance Matrix</CardTitle>
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="x" 
              name="Activity Volume" 
              unit="" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              label={{ value: 'Activity Volume', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              dataKey="y" 
              name="Conversion Rate" 
              unit="%" 
              tick={{ fontSize: 11, fill: '#6b7280' }}
              label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Team Members" data={teamData} fill={COLORS.primary}>
              {teamData.map((entry: any, index: number) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.roi > 400 ? COLORS.success : entry.roi > 350 ? COLORS.warning : COLORS.danger}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Top Performers</h4>
            <Badge variant="outline" className="text-xs">ROI Based</Badge>
          </div>
          <div className="space-y-2">
            {teamData.slice(0, 3).map((member: any, index: number) => (
              <div key={member.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                    index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-orange-500"
                  )}>
                    {index + 1}
                  </div>
                  <span className="text-sm text-gray-700">{member.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500">{member.conversion}% CR</span>
                  <span className="text-xs font-semibold text-green-600">{member.roi}% ROI</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};