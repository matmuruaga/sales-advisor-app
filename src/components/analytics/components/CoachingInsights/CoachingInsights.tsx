"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  XCircle 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CoachingInsightsProps {
  insights: any;
}

export const CoachingInsights = ({ insights }: CoachingInsightsProps) => {
  const items = useMemo(() => {
    if (!insights?.teamPerformance || insights.teamPerformance.length === 0) {
      return [
        { type: 'info', title: 'No coaching data available', action: 'Complete more calls to generate insights', priority: 'medium' }
      ];
    }

    const coachingItems: any[] = [];

    // Analyze team performance data to generate insights
    insights.teamPerformance.forEach((performance: any) => {
      const conversionRate = parseFloat(performance.conversion_rate) || 0;
      const activityVolume = parseInt(performance.activity_volume) || 0;
      const compositeScore = parseFloat(performance.composite_score) || 0;

      // Generate insights based on performance metrics
      const userName = performance.users?.full_name || 'Unknown User';
      if (conversionRate > 30) {
        coachingItems.push({
          type: 'success',
          title: `${userName}: High conversion rate ${conversionRate.toFixed(1)}%`,
          action: 'Share best practices with team',
          priority: 'high'
        });
      } else if (conversionRate < 15) {
        coachingItems.push({
          type: 'warning',
          title: `${userName}: Low conversion rate ${conversionRate.toFixed(1)}%`,
          action: 'Focus on qualification techniques',
          priority: 'high'
        });
      }

      if (activityVolume < 50) {
        coachingItems.push({
          type: 'warning',
          title: `${userName}: Low activity volume ${activityVolume} activities`,
          action: 'Increase daily activity goals',
          priority: 'medium'
        });
      }

      if (compositeScore > 0.8) {
        coachingItems.push({
          type: 'success',
          title: `Excellent performance score: ${(compositeScore * 100).toFixed(0)}%`,
          action: 'Consider for team lead role',
          priority: 'low'
        });
      }
    });

    // Add coaching opportunities from performance data
    insights.teamPerformance.forEach((performance: any) => {
      if (performance.coaching_opportunities) {
        try {
          const opportunities = Array.isArray(performance.coaching_opportunities) 
            ? performance.coaching_opportunities 
            : JSON.parse(performance.coaching_opportunities);
          
          opportunities.forEach((opportunity: any) => {
            coachingItems.push({
              type: 'info',
              title: opportunity.title || opportunity,
              action: opportunity.action || 'Schedule coaching session',
              priority: opportunity.priority || 'medium'
            });
          });
        } catch (e) {
          // Handle parsing errors
        }
      }
    });

    // Limit to 4 most important insights
    return coachingItems
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
      })
      .slice(0, 4);
  }, [insights]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'info': return Info;
      case 'error': return XCircle;
      default: return Brain;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'error': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">AI Coaching Insights</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
              <Brain className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              View All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {items.map((insight, index) => {
              const Icon = getIcon(insight.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn("p-1.5 rounded-lg", getTypeColor(insight.type))}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                        <Badge variant="outline" className={cn("text-xs", getPriorityColor(insight.priority))}>
                          {insight.priority}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{insight.action}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};