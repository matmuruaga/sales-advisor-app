import { useMemo } from 'react';
import { DateRange } from '../../types/analytics';
import { COLORS } from '../../utils/colors';

export const useCallMetrics = (data: any, dateRange: DateRange) => {
  return useMemo(() => {
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
  }, [data, dateRange]);
};