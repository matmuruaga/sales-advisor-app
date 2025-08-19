// src/components/examples/OptimizedAnalyticsDemo.tsx
// Example component demonstrating the optimized analytics hooks
"use client";

import React, { useState, useMemo } from 'react';
import { 
  useAnalytics, 
  usePaginatedAnalytics,
  useInfiniteAnalytics,
  useKPIMetrics,
  DateRange 
} from '@/hooks/useAnalytics';
import { 
  useActionHistory,
  useInfiniteActionHistory,
  useActionStats 
} from '@/hooks/useActions';

export function OptimizedAnalyticsDemo() {
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    to: new Date()
  });

  // 1. Basic optimized analytics with caching
  const {
    data: basicAnalytics,
    loading: basicLoading,
    refresh,
    isStale
  } = useAnalytics({
    dateRange,
    enableCache: true,
    pagination: {
      dailyMetrics: { limit: 25 },
      callAnalytics: { limit: 50 }
    }
  });

  // 2. Paginated analytics with full metadata
  const {
    data: paginatedAnalytics,
    loading: paginatedLoading
  } = usePaginatedAnalytics({
    dateRange,
    pagination: {
      callAnalytics: { 
        page: currentPage, 
        limit: 20,
        sortBy: 'engagement_score',
        sortOrder: 'desc'
      }
    }
  });

  // 3. Infinite scroll call analytics
  const {
    data: infiniteCallData,
    loading: infiniteLoading,
    hasNextPage,
    fetchNextPage,
    initialLoading
  } = useInfiniteAnalytics('call_analytics', dateRange, {
    limit: 15,
    filters: { engagement_score: { gte: 7 } } // High engagement calls only
  });

  // 4. Optimized KPIs with caching
  const { kpis, loading: kpisLoading } = useKPIMetrics(dateRange, {
    enableCache: true
  });

  // 5. Paginated action history
  const {
    history: actionHistory,
    loading: actionsLoading
  } = useActionHistory({
    page: 1,
    limit: 10,
    filters: { status: 'completed' },
    includeDetails: true
  });

  // 6. Action statistics with caching
  const { stats: actionStats } = useActionStats('week', {
    enableCache: true,
    limit: 500 // Limit for performance
  });

  const callAnalyticsPagination = paginatedAnalytics?.callAnalytics.pagination;

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Optimized Analytics Demo</h1>
        <div className="flex gap-2">
          <button
            onClick={refresh}
            disabled={basicLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {basicLoading ? 'Loading...' : 'Refresh'}
          </button>
          {isStale && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
              Data may be stale
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {kpisLoading ? (
          <div className="col-span-4 text-center">Loading KPIs...</div>
        ) : kpis ? (
          <>
            <KPICard
              title="Coaching ROI"
              value={kpis.coachingROI.value}
              trend={kpis.coachingROI.trend}
              trendValue={kpis.coachingROI.trendValue}
            />
            <KPICard
              title="Pipeline Velocity"
              value={kpis.pipelineVelocity.value}
              trend={kpis.pipelineVelocity.trend}
              trendValue={kpis.pipelineVelocity.trendValue}
            />
            <KPICard
              title="Team Win Rate"
              value={kpis.teamWinRate.value}
              trend={kpis.teamWinRate.trend}
              trendValue={kpis.teamWinRate.trendValue}
            />
            <KPICard
              title="Call Engagement"
              value={kpis.callEngagement.value}
              trend={kpis.callEngagement.trend}
              trendValue={kpis.callEngagement.trendValue}
            />
          </>
        ) : (
          <div className="col-span-4 text-center text-gray-500">No KPI data available</div>
        )}
      </div>

      {/* Paginated Call Analytics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Call Analytics (Paginated)</h2>
          {callAnalyticsPagination && (
            <span className="text-sm text-gray-500">
              Showing {((callAnalyticsPagination.currentPage - 1) * callAnalyticsPagination.pageSize) + 1} to{' '}
              {Math.min(
                callAnalyticsPagination.currentPage * callAnalyticsPagination.pageSize,
                callAnalyticsPagination.totalCount
              )} of {callAnalyticsPagination.totalCount} results
            </span>
          )}
        </div>

        {paginatedLoading ? (
          <div className="text-center py-8">Loading call analytics...</div>
        ) : paginatedAnalytics?.callAnalytics.data.length ? (
          <>
            <div className="space-y-2">
              {paginatedAnalytics.callAnalytics.data.map((call) => (
                <div key={call.id} className="p-3 border rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">Call #{call.id.slice(-6)}</div>
                    <div className="text-sm text-gray-500">
                      Duration: {call.duration_minutes}min | Engagement: {call.engagement_score}/10
                    </div>
                  </div>
                  <div className="text-sm">
                    {new Date(call.call_date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {callAnalyticsPagination && callAnalyticsPagination.totalPages > 1 && (
              <div className="flex justify-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!callAnalyticsPagination.hasPreviousPage}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {callAnalyticsPagination.currentPage} of {callAnalyticsPagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={!callAnalyticsPagination.hasNextPage}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">No call data available</div>
        )}
      </div>

      {/* Infinite Scroll Demo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">High Engagement Calls (Infinite Scroll)</h2>
        
        {initialLoading ? (
          <div className="text-center py-8">Loading initial data...</div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {infiniteCallData.map((call) => (
              <div key={call.id} className="p-3 border rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">Call #{call.id.slice(-6)}</div>
                    <div className="text-sm text-gray-500">
                      Engagement: {call.engagement_score}/10 | Sentiment: {call.sentiment_score}
                    </div>
                  </div>
                  <div className="text-sm">
                    {new Date(call.call_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            
            {hasNextPage && (
              <div className="text-center pt-4">
                <button
                  onClick={fetchNextPage}
                  disabled={infiniteLoading}
                  className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
                >
                  {infiniteLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Action Statistics</h3>
          {actionStats ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Total Actions:</span>
                <span className="font-bold">{actionStats.totalActions}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-bold text-green-600">{actionStats.successRate.toFixed(1)}%</span>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Popular Actions:</h4>
                <div className="space-y-1">
                  {actionStats.popularActions.map((action, index) => (
                    <div key={action.action} className="flex justify-between text-sm">
                      <span>{action.action}</span>
                      <span>{action.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Loading action stats...</div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Actions</h3>
          {actionsLoading ? (
            <div className="text-center">Loading actions...</div>
          ) : actionHistory?.data.length ? (
            <div className="space-y-2">
              {actionHistory.data.slice(0, 5).map((action) => (
                <div key={action.id} className="p-2 border-l-4 border-blue-500">
                  <div className="font-medium text-sm">{action.action?.title}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(action.executed_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">No actions available</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper KPI Card component
function KPICard({ 
  title, 
  value, 
  trend, 
  trendValue 
}: { 
  title: string; 
  value: string; 
  trend: 'up' | 'down' | 'stable'; 
  trendValue: string;
}) {
  const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="text-2xl font-bold mb-2">{value}</div>
      <div className={`text-sm ${trendColor}`}>
        {trendIcon} {trendValue}
      </div>
    </div>
  );
}

export default OptimizedAnalyticsDemo;