"use client";

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KPICapsule {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'gray';
}

export interface BottomMetric {
  label: string;
  value: string | number;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface StandardCardProps {
  title: string;
  subtitle?: string;
  kpiCapsules: KPICapsule[];
  children: React.ReactNode;
  bottomMetrics: BottomMetric[];
  onViewDetails?: () => void;
  className?: string;
}

const getCapsuleColor = (color: string = 'gray') => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  return colors[color as keyof typeof colors] || colors.gray;
};

const getTrendIcon = (trend: string) => {
  if (trend === 'up') return '↗';
  if (trend === 'down') return '↘';
  return '';
};

export const StandardCard: React.FC<StandardCardProps> = ({
  title,
  subtitle,
  kpiCapsules,
  children,
  bottomMetrics,
  onViewDetails,
  className
}) => {
  return (
    <Card className={cn("bg-white border-gray-200 shadow-sm", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            
            {kpiCapsules.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {kpiCapsules.map((capsule, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className={cn(
                      "px-3 py-1 text-xs font-medium border rounded-full",
                      getCapsuleColor(capsule.color)
                    )}
                  >
                    {capsule.label}: {capsule.value}
                    {capsule.trend && (
                      <span className="ml-1 text-xs">
                        {getTrendIcon(capsule.trend)}
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {onViewDetails && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewDetails}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            >
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        {/* Main content area - fixed height */}
        <div className="h-[280px] mb-6">
          {children}
        </div>
        
        {/* Bottom metrics */}
        {bottomMetrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            {bottomMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <IconComponent className="h-4 w-4 text-gray-500" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-600 truncate">{metric.label}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-medium text-gray-900">{metric.value}</p>
                      {metric.trend && metric.trendValue && (
                        <span className={cn(
                          "text-xs",
                          metric.trend === 'up' ? 'text-green-600' : 
                          metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        )}>
                          {getTrendIcon(metric.trend)} {metric.trendValue}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};