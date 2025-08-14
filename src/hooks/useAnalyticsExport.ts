"use client";

import { useState } from 'react';
import { AnalyticsData, DateRange } from './useAnalytics';

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json';
  includeCharts: boolean;
  includeSummary: boolean;
}

export function useAnalyticsExport() {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatDataForCSV = (data: AnalyticsData): string => {
    const rows: string[] = [];
    
    // Headers
    rows.push('Type,Date,Metric,Value,User_ID,Organization_ID');
    
    // Daily metrics
    data.dailyMetrics.forEach(metric => {
      rows.push(`Daily Metric,${metric.metric_date},Calls Made,${metric.calls_made || 0},${metric.user_id || ''},${metric.organization_id}`);
      rows.push(`Daily Metric,${metric.metric_date},Calls Connected,${metric.calls_connected || 0},${metric.user_id || ''},${metric.organization_id}`);
      rows.push(`Daily Metric,${metric.metric_date},Emails Sent,${metric.emails_sent || 0},${metric.user_id || ''},${metric.organization_id}`);
      rows.push(`Daily Metric,${metric.metric_date},Meetings Booked,${metric.meetings_booked || 0},${metric.user_id || ''},${metric.organization_id}`);
      rows.push(`Daily Metric,${metric.metric_date},Revenue Won,${metric.revenue_won || 0},${metric.user_id || ''},${metric.organization_id}`);
    });
    
    // Call analytics
    data.callAnalytics.forEach(call => {
      rows.push(`Call Analytics,${call.call_date},Duration Minutes,${call.duration_minutes},${call.user_id},${call.organization_id}`);
      rows.push(`Call Analytics,${call.call_date},Engagement Score,${call.engagement_score || 0},${call.user_id},${call.organization_id}`);
      rows.push(`Call Analytics,${call.call_date},Sentiment Score,${call.sentiment_score || 0},${call.user_id},${call.organization_id}`);
    });
    
    // User performance
    data.userPerformance.forEach(user => {
      rows.push(`User Performance,${user.period_start},Quota Attainment,${user.quota_attainment || 0},${user.user_id},${user.organization_id}`);
      rows.push(`User Performance,${user.period_start},Win Rate,${user.win_rate || 0},${user.user_id},${user.organization_id}`);
      rows.push(`User Performance,${user.period_start},Pipeline Value,${user.pipeline_value || 0},${user.user_id},${user.organization_id}`);
    });
    
    return rows.join('\n');
  };

  const generateSummaryReport = (data: AnalyticsData, dateRange: DateRange): string => {
    const fromDate = dateRange.from.toLocaleDateString();
    const toDate = dateRange.to.toLocaleDateString();
    
    const totalCalls = data.dailyMetrics.reduce((sum, m) => sum + (m.calls_made || 0), 0);
    const totalEmails = data.dailyMetrics.reduce((sum, m) => sum + (m.emails_sent || 0), 0);
    const totalMeetings = data.dailyMetrics.reduce((sum, m) => sum + (m.meetings_booked || 0), 0);
    const totalRevenue = data.dailyMetrics.reduce((sum, m) => sum + (m.revenue_won || 0), 0);
    const avgEngagement = data.callAnalytics.length > 0 
      ? data.callAnalytics.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / data.callAnalytics.length 
      : 0;
    
    const avgQuotaAttainment = data.userPerformance.length > 0
      ? data.userPerformance.reduce((sum, u) => sum + (u.quota_attainment || 0), 0) / data.userPerformance.length
      : 0;

    return `
Sales Analytics Report
Period: ${fromDate} - ${toDate}
Generated: ${new Date().toLocaleString()}

=== KEY PERFORMANCE INDICATORS ===
• Coaching ROI: ${data.kpis.coachingROI.value} (${data.kpis.coachingROI.trend} ${data.kpis.coachingROI.trendValue})
• Pipeline Velocity: ${data.kpis.pipelineVelocity.value} (${data.kpis.pipelineVelocity.trend} ${data.kpis.pipelineVelocity.trendValue})
• Team Win Rate: ${data.kpis.teamWinRate.value} (${data.kpis.teamWinRate.trend} ${data.kpis.teamWinRate.trendValue})
• Call Engagement: ${data.kpis.callEngagement.value} (${data.kpis.callEngagement.trend} ${data.kpis.callEngagement.trendValue})

=== ACTIVITY SUMMARY ===
• Total Calls Made: ${totalCalls.toLocaleString()}
• Total Emails Sent: ${totalEmails.toLocaleString()}
• Total Meetings Booked: ${totalMeetings.toLocaleString()}
• Total Revenue Won: $${totalRevenue.toLocaleString()}
• Average Call Engagement: ${avgEngagement.toFixed(1)}/10
• Average Quota Attainment: ${avgQuotaAttainment.toFixed(1)}%

=== TEAM PERFORMANCE ===
• Active Team Members: ${data.userPerformance.length}
• Total Call Analytics Records: ${data.callAnalytics.length}
• Daily Metrics Records: ${data.dailyMetrics.length}

=== TOP PERFORMERS ===
${data.userPerformance
  .sort((a, b) => (b.quota_attainment || 0) - (a.quota_attainment || 0))
  .slice(0, 5)
  .map((user, index) => 
    `${index + 1}. User ${user.user_id.slice(0, 8)}: ${user.quota_attainment?.toFixed(1) || 0}% quota attainment`
  ).join('\n')}
`;
  };

  const exportData = async (
    data: AnalyticsData, 
    dateRange: DateRange, 
    options: ExportOptions
  ) => {
    try {
      setExporting(true);
      setError(null);

      let content: string;
      let filename: string;
      let mimeType: string;

      const timestamp = new Date().toISOString().split('T')[0];

      switch (options.format) {
        case 'csv':
          content = formatDataForCSV(data);
          filename = `analytics-export-${timestamp}.csv`;
          mimeType = 'text/csv';
          break;

        case 'json':
          const exportData = {
            metadata: {
              exportDate: new Date().toISOString(),
              dateRange: {
                from: dateRange.from.toISOString(),
                to: dateRange.to.toISOString()
              },
              includeSummary: options.includeSummary
            },
            kpis: data.kpis,
            dailyMetrics: data.dailyMetrics,
            callAnalytics: data.callAnalytics,
            userPerformance: data.userPerformance,
            actionAnalytics: data.actionAnalytics,
            ...(options.includeSummary && {
              summary: {
                totalCalls: data.dailyMetrics.reduce((sum, m) => sum + (m.calls_made || 0), 0),
                totalEmails: data.dailyMetrics.reduce((sum, m) => sum + (m.emails_sent || 0), 0),
                totalRevenue: data.dailyMetrics.reduce((sum, m) => sum + (m.revenue_won || 0), 0),
                activeUsers: data.userPerformance.length
              }
            })
          };
          content = JSON.stringify(exportData, null, 2);
          filename = `analytics-export-${timestamp}.json`;
          mimeType = 'application/json';
          break;

        default:
          throw new Error('Unsupported export format');
      }

      // Add summary report if requested
      if (options.includeSummary && options.format !== 'json') {
        const summary = generateSummaryReport(data, dateRange);
        content = summary + '\n\n=== RAW DATA ===\n\n' + content;
      }

      // Create and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Export failed:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return {
    exportData,
    exporting,
    error
  };
}