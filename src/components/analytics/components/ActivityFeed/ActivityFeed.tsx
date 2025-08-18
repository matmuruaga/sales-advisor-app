"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ChevronRight, 
  Phone, 
  Users, 
  MessageSquare, 
  DollarSign, 
  Zap 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ActivityFeedProps {
  activities: any;
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const items = useMemo(() => {
    if (!activities?.dailyMetrics || activities.dailyMetrics.length === 0) {
      return [
        { type: 'activity', title: 'No activity data available', time: 'N/A', status: 'neutral' }
      ];
    }

    // Convert daily metrics to activity feed items
    const activityItems: any[] = [];

    activities.dailyMetrics.forEach((metric: any) => {
      const date = new Date(metric.metric_date);
      const timeAgo = `${Math.abs(Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)))} days ago`;

      // Add different types of activities based on the metrics
      if (metric.calls_made > 0) {
        activityItems.push({
          type: 'call',
          title: `${metric.calls_made} calls made (${metric.calls_connected} connected)`,
          time: timeAgo,
          status: metric.calls_connected > 0 ? 'success' : 'pending'
        });
      }

      if (metric.meetings_booked > 0) {
        activityItems.push({
          type: 'meeting',
          title: `${metric.meetings_booked} meetings booked`,
          time: timeAgo,
          status: 'success'
        });
      }

      if (metric.deals_won > 0) {
        activityItems.push({
          type: 'deal',
          title: `${metric.deals_won} deals won ($${(parseFloat(metric.revenue_won) || 0).toFixed(0)}K)`,
          time: timeAgo,
          status: 'success'
        });
      }

      if (metric.emails_sent > 0) {
        activityItems.push({
          type: 'email',
          title: `${metric.emails_sent} emails sent (${metric.emails_opened} opened)`,
          time: timeAgo,
          status: metric.emails_opened > 0 ? 'success' : 'pending'
        });
      }
    });

    // Sort by most recent and limit to last 6 items
    return activityItems
      .sort((a, b) => {
        const aTime = parseInt(a.time.split(' ')[0]);
        const bTime = parseInt(b.time.split(' ')[0]);
        return aTime - bTime;
      })
      .slice(0, 6);
  }, [activities]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'meeting': return Users;
      case 'email': return MessageSquare;
      case 'deal': return DollarSign;
      default: return Zap;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <Card className="bg-white border-gray-200 shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-3">
            {items.map((activity, index) => {
              const Icon = getIcon(activity.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className={cn("p-2 rounded-lg", getStatusColor(activity.status))}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};