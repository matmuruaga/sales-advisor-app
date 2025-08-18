"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { cn } from '@/lib/utils';

const COLORS = {
  success: '#22C55E',
  info: '#3B82F6',
  warning: '#F59E0B',
  primary: '#8B5CF6'
};

interface SentimentDashboardProps {
  data: any;
}

export const SentimentDashboard: React.FC<SentimentDashboardProps> = ({ data }) => {
  const sentimentScale = [
    { range: [0, 2], color: '#EF4444', label: 'Very Negative' },
    { range: [2, 4], color: '#F97316', label: 'Negative' },
    { range: [4, 6], color: '#EAB308', label: 'Neutral' },
    { range: [6, 8], color: '#84CC16', label: 'Positive' },
    { range: [8, 10], color: '#22C55E', label: 'Very Positive' }
  ];

  const getSentimentColor = (score: number) => {
    const level = sentimentScale.find(s => score >= s.range[0] && score < s.range[1]);
    return level ? level.color : sentimentScale[sentimentScale.length - 1].color;
  };

  const getSentimentLabel = (score: number) => {
    const level = sentimentScale.find(s => score >= s.range[0] && score < s.range[1]);
    return level ? level.label : sentimentScale[sentimentScale.length - 1].label;
  };

  const sentimentData = useMemo(() => {
    if (!data?.callIntelligence || data.callIntelligence.length === 0) {
      return [
        { time: 'No Data', score: 5.0 }
      ];
    }

    // Group calls by date and calculate daily average sentiment
    const callsByDate: { [key: string]: number[] } = {};
    
    data.callIntelligence.forEach((call: any) => {
      const callDate = new Date(call.created_at);
      const dateKey = callDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!callsByDate[dateKey]) {
        callsByDate[dateKey] = [];
      }
      
      const sentimentScore = parseFloat(call.sentiment_score);
      if (!isNaN(sentimentScore) && sentimentScore > 0) {
        callsByDate[dateKey].push(sentimentScore);
      }
    });

    // Convert to array and calculate averages
    const sentimentTimeline = Object.entries(callsByDate)
      .map(([date, scores]) => ({
        time: date,
        score: Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)),
        callCount: scores.length
      }))
      .sort((a, b) => new Date(a.time + ', 2025').getTime() - new Date(b.time + ', 2025').getTime()) // Sort by date
      .slice(-14); // Show last 14 days

    if (sentimentTimeline.length === 0) {
      return [{ time: 'No Data', score: 5.0 }];
    }

    return sentimentTimeline;
  }, [data]);

  // Calculate average sentiment for the badge
  const avgSentiment = useMemo(() => {
    if (!data?.callIntelligence || data.callIntelligence.length === 0) return 5.0;
    
    const validScores = data.callIntelligence
      .map((call: any) => parseFloat(call.sentiment_score))
      .filter((score: number) => !isNaN(score) && score > 0);
    
    if (validScores.length === 0) return 5.0;
    
    return validScores.reduce((sum: number, score: number) => sum + score, 0) / validScores.length;
  }, [data]);

  // Generate heatmap data from real call intelligence data
  const heatmapData = useMemo(() => {
    if (!data?.callIntelligence || data.callIntelligence.length === 0) {
      // Return default neutral sentiment when no data
      return [
        { hour: '8am', Mon: 5.0, Tue: 5.0, Wed: 5.0, Thu: 5.0, Fri: 5.0 },
        { hour: '10am', Mon: 5.0, Tue: 5.0, Wed: 5.0, Thu: 5.0, Fri: 5.0 },
        { hour: '12pm', Mon: 5.0, Tue: 5.0, Wed: 5.0, Thu: 5.0, Fri: 5.0 },
        { hour: '2pm', Mon: 5.0, Tue: 5.0, Wed: 5.0, Thu: 5.0, Fri: 5.0 },
        { hour: '4pm', Mon: 5.0, Tue: 5.0, Wed: 5.0, Thu: 5.0, Fri: 5.0 }
      ];
    }

    // Group calls by day of week and hour
    const callsByDayAndHour: { [key: string]: { [key: string]: number[] } } = {};
    
    data.callIntelligence.forEach((call: any) => {
      const callDate = new Date(call.created_at);
      const dayOfWeek = callDate.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue, etc.
      const hour = callDate.getHours();
      
      // Map hour to time slots
      let timeSlot = '';
      if (hour >= 8 && hour < 10) timeSlot = '8am';
      else if (hour >= 10 && hour < 12) timeSlot = '10am';
      else if (hour >= 12 && hour < 14) timeSlot = '12pm';
      else if (hour >= 14 && hour < 16) timeSlot = '2pm';
      else if (hour >= 16 && hour < 18) timeSlot = '4pm';
      else return; // Skip calls outside business hours
      
      if (!callsByDayAndHour[timeSlot]) {
        callsByDayAndHour[timeSlot] = {};
      }
      if (!callsByDayAndHour[timeSlot][dayOfWeek]) {
        callsByDayAndHour[timeSlot][dayOfWeek] = [];
      }
      
      const sentimentScore = parseFloat(call.sentiment_score);
      if (!isNaN(sentimentScore) && sentimentScore > 0) {
        callsByDayAndHour[timeSlot][dayOfWeek].push(sentimentScore);
      }
    });

    // Calculate average sentiment for each time slot and day
    const timeSlots = ['8am', '10am', '12pm', '2pm', '4pm'];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    return timeSlots.map(timeSlot => {
      const rowData: any = { hour: timeSlot };
      
      days.forEach(day => {
        const calls = callsByDayAndHour[timeSlot]?.[day] || [];
        if (calls.length > 0) {
          // Calculate average sentiment for this time slot and day
          const avgSentiment = calls.reduce((sum, score) => sum + score, 0) / calls.length;
          rowData[day] = Number(avgSentiment.toFixed(1));
        } else {
          // Default to neutral sentiment when no calls
          rowData[day] = 5.0;
        }
      });
      
      return rowData;
    });
  }, [data]);

  return (
    <Card className="bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">Sentiment Analysis</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={cn(
                "border-2",
                avgSentiment >= 8 ? "bg-green-50 text-green-700 border-green-200" :
                avgSentiment >= 6 ? "bg-lime-50 text-lime-700 border-lime-200" :
                avgSentiment >= 4 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                avgSentiment >= 2 ? "bg-orange-50 text-orange-700 border-orange-200" :
                "bg-red-50 text-red-700 border-red-200"
              )}
            >
              {getSentimentLabel(avgSentiment)}: {avgSentiment.toFixed(1)}/10
            </Badge>
            <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={sentimentData}>
            <defs>
              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.success} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.success} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#6b7280' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: any, name: any, props: any) => [
                `${value}/10`,
                `Avg Sentiment`
              ]}
              labelFormatter={(label: any) => `${label} (${sentimentData.find(d => d.time === label)?.callCount || 0} calls)`}
            />
            <Area 
              type="monotone" 
              dataKey="score" 
              stroke={COLORS.success}
              strokeWidth={2}
              fill="url(#sentimentGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Sentiment Heatmap by Hour</h4>
          <div className="mb-3 flex items-center justify-center gap-2">
            {sentimentScale.map((level) => (
              <div key={level.label} className="flex items-center gap-1">
                <div 
                  className="w-3 h-3 rounded" 
                  style={{ backgroundColor: level.color }}
                ></div>
                <span className="text-xs text-gray-600">{level.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-1 text-xs">
            <div></div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => (
              <div key={day} className="text-center text-gray-500">{day}</div>
            ))}
            {heatmapData.map(row => (
              <React.Fragment key={row.hour}>
                <div className="text-gray-500 pr-2">{row.hour}</div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map(day => {
                  const value = row[day as keyof typeof row] as number;
                  const color = getSentimentColor(value);
                  return (
                    <div
                      key={`${row.hour}-${day}`}
                      className="aspect-square rounded-md flex items-center justify-center text-white text-xs font-medium cursor-pointer hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={`${day} ${row.hour}: ${getSentimentLabel(value)} (${value.toFixed(1)}/10)`}
                    >
                      {value.toFixed(1)}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};