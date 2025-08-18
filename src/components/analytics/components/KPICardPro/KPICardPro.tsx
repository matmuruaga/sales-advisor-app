"use client";

import { memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { KPIMetric } from '../../types/analytics';
import { COLORS } from '../../utils/colors';
import { getTrendColor } from '../../utils/formatters';

interface KPICardProProps {
  metric: KPIMetric;
  loading?: boolean;
  className?: string;
}

export const KPICardPro = memo<KPICardProProps>(({ metric, loading = false, className }) => {
  const getTrendIcon = () => {
    if (metric.trend === 'up') return <ArrowUpRight className="w-4 h-4" />;
    if (metric.trend === 'down') return <ArrowDownRight className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 h-[180px] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
        </div>

        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between mb-3">
            <p className="text-sm font-medium text-gray-600">{metric.title}</p>
            {metric.trend && (
              <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                {getTrendIcon()}
                <span className="text-xs font-medium">{metric.trendValue}</span>
              </div>
            )}
          </div>

          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {metric.value}
              </h3>
              {metric.subtitle && (
                <span className="text-sm text-gray-500">{metric.subtitle}</span>
              )}
            </div>
          </div>

          {metric.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{metric.progress}%</span>
              </div>
              <Progress value={metric.progress} className="h-2 bg-gray-100" />
            </div>
          )}

          {metric.target && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Target</span>
              <span className="text-xs font-semibold text-gray-700">{metric.target}</span>
            </div>
          )}

          {metric.sparklineData && metric.sparklineData.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
              <ResponsiveContainer width="100%" height="100%">
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

          {metric.comparison && (
            <div className="absolute top-2 right-2">
              <div className="group relative">
                <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="absolute right-0 top-5 invisible group-hover:visible bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {metric.comparison}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

KPICardPro.displayName = 'KPICardPro';