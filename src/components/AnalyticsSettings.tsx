"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Calendar,
  BarChart3,
  Users,
  Target,
  Phone,
  Mail,
  DollarSign,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

export interface AnalyticsConfig {
  refreshInterval: number;
  defaultDateRange: string;
  visibleKPIs: string[];
  exportFormat: 'csv' | 'json' | 'xlsx';
  includeSummary: boolean;
  autoRefresh: boolean;
  compactView: boolean;
}

interface AnalyticsSettingsProps {
  config: AnalyticsConfig;
  onChange: (config: AnalyticsConfig) => void;
  onClose: () => void;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  refreshInterval: 5,
  defaultDateRange: '30d',
  visibleKPIs: ['coachingROI', 'pipelineVelocity', 'teamWinRate', 'callEngagement'],
  exportFormat: 'csv',
  includeSummary: true,
  autoRefresh: true,
  compactView: false
};

const KPI_OPTIONS = [
  { id: 'coachingROI', label: 'AI Coaching ROI', icon: BarChart3 },
  { id: 'pipelineVelocity', label: 'Pipeline Velocity', icon: Activity },
  { id: 'teamWinRate', label: 'Team Win Rate', icon: Target },
  { id: 'callEngagement', label: 'Call Engagement', icon: Phone },
  { id: 'emailPerformance', label: 'Email Performance', icon: Mail },
  { id: 'revenueGrowth', label: 'Revenue Growth', icon: DollarSign },
  { id: 'teamActivity', label: 'Team Activity', icon: Users }
];

const DATE_RANGE_OPTIONS = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '14d', label: 'Last 14 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' }
];

const REFRESH_INTERVALS = [
  { value: 1, label: '1 minute' },
  { value: 5, label: '5 minutes' },
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' }
];

export function AnalyticsSettings({ config, onChange, onClose }: AnalyticsSettingsProps) {
  const [localConfig, setLocalConfig] = useState<AnalyticsConfig>(config);
  const [hasChanges, setHasChanges] = useState(false);

  const updateConfig = (updates: Partial<AnalyticsConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    setHasChanges(JSON.stringify(newConfig) !== JSON.stringify(config));
  };

  const handleSave = () => {
    onChange(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_CONFIG);
    setHasChanges(JSON.stringify(DEFAULT_CONFIG) !== JSON.stringify(config));
  };

  const toggleKPI = (kpiId: string) => {
    const newVisibleKPIs = localConfig.visibleKPIs.includes(kpiId)
      ? localConfig.visibleKPIs.filter(id => id !== kpiId)
      : [...localConfig.visibleKPIs, kpiId];
    
    updateConfig({ visibleKPIs: newVisibleKPIs });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Analytics Settings</CardTitle>
                <p className="text-sm text-gray-500">Customize your analytics dashboard</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Display Settings */}
          <div>
            <h3 className="text-sm font-medium mb-4">Display Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Default Date Range</label>
                  <p className="text-xs text-gray-500">Default time period when loading analytics</p>
                </div>
                <Select 
                  value={localConfig.defaultDateRange} 
                  onValueChange={(value) => updateConfig({ defaultDateRange: value })}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_RANGE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Compact View</label>
                  <p className="text-xs text-gray-500">Show more data in less space</p>
                </div>
                <Switch
                  checked={localConfig.compactView}
                  onCheckedChange={(checked) => updateConfig({ compactView: checked })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Visible KPIs */}
          <div>
            <h3 className="text-sm font-medium mb-4">Visible KPIs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {KPI_OPTIONS.map(kpi => {
                const Icon = kpi.icon;
                const isVisible = localConfig.visibleKPIs.includes(kpi.id);
                
                return (
                  <div
                    key={kpi.id}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                      ${isVisible 
                        ? 'bg-purple-50 border-purple-200 text-purple-700' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }
                    `}
                    onClick={() => toggleKPI(kpi.id)}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{kpi.label}</span>
                    {isVisible && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Visible
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Refresh Settings */}
          <div>
            <h3 className="text-sm font-medium mb-4">Refresh Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Auto Refresh</label>
                  <p className="text-xs text-gray-500">Automatically refresh data</p>
                </div>
                <Switch
                  checked={localConfig.autoRefresh}
                  onCheckedChange={(checked) => updateConfig({ autoRefresh: checked })}
                />
              </div>

              {localConfig.autoRefresh && (
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Refresh Interval</label>
                    <p className="text-xs text-gray-500">How often to refresh data</p>
                  </div>
                  <Select 
                    value={localConfig.refreshInterval.toString()} 
                    onValueChange={(value) => updateConfig({ refreshInterval: parseInt(value) })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REFRESH_INTERVALS.map(interval => (
                        <SelectItem key={interval.value} value={interval.value.toString()}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Export Settings */}
          <div>
            <h3 className="text-sm font-medium mb-4">Export Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Export Format</label>
                  <p className="text-xs text-gray-500">Default format for data exports</p>
                </div>
                <Select 
                  value={localConfig.exportFormat} 
                  onValueChange={(value: 'csv' | 'json' | 'xlsx') => updateConfig({ exportFormat: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium">Include Summary</label>
                  <p className="text-xs text-gray-500">Add executive summary to exports</p>
                </div>
                <Switch
                  checked={localConfig.includeSummary}
                  onCheckedChange={(checked) => updateConfig({ includeSummary: checked })}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Defaults
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}