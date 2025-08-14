"use client";

import { useState, useMemo } from 'react';
import { DateRange } from './useAnalytics';

export interface DateFilterPreset {
  label: string;
  value: string;
  getRange: () => DateRange;
}

const DATE_PRESETS: DateFilterPreset[] = [
  {
    label: 'Last 7 Days',
    value: '7d',
    getRange: () => ({
      from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'Last 14 Days', 
    value: '14d',
    getRange: () => ({
      from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'Last 30 Days',
    value: '30d',
    getRange: () => ({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'Last 90 Days',
    value: '90d',
    getRange: () => ({
      from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      to: new Date()
    })
  },
  {
    label: 'This Month',
    value: 'month',
    getRange: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        from: firstDay,
        to: now
      };
    }
  },
  {
    label: 'Last Month',
    value: 'last-month',
    getRange: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0);
      return {
        from: firstDay,
        to: lastDay
      };
    }
  },
  {
    label: 'This Quarter',
    value: 'quarter',
    getRange: () => {
      const now = new Date();
      const quarter = Math.floor((now.getMonth() + 3) / 3);
      const firstDay = new Date(now.getFullYear(), (quarter - 1) * 3, 1);
      return {
        from: firstDay,
        to: now
      };
    }
  },
  {
    label: 'This Year',
    value: 'year',
    getRange: () => {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), 0, 1);
      return {
        from: firstDay,
        to: now
      };
    }
  }
];

export function useDateFilter(initialPreset: string = '30d') {
  const [selectedPreset, setSelectedPreset] = useState(initialPreset);
  const [customRange, setCustomRange] = useState<DateRange | null>(null);
  const [isCustom, setIsCustom] = useState(false);

  const dateRange = useMemo((): DateRange => {
    if (isCustom && customRange) {
      return customRange;
    }
    
    const preset = DATE_PRESETS.find(p => p.value === selectedPreset);
    return preset ? preset.getRange() : DATE_PRESETS[2].getRange(); // Default to 30 days
  }, [selectedPreset, customRange, isCustom]);

  const activePresetLabel = useMemo(() => {
    if (isCustom) {
      return 'Custom Range';
    }
    
    const preset = DATE_PRESETS.find(p => p.value === selectedPreset);
    return preset?.label || 'Last 30 Days';
  }, [selectedPreset, isCustom]);

  const setPreset = (presetValue: string) => {
    setSelectedPreset(presetValue);
    setIsCustom(false);
    setCustomRange(null);
  };

  const setCustomDateRange = (range: DateRange) => {
    setCustomRange(range);
    setIsCustom(true);
  };

  const formatDateRange = (range: DateRange) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    return `${formatDate(range.from)} - ${formatDate(range.to)}`;
  };

  return {
    dateRange,
    selectedPreset,
    isCustom,
    activePresetLabel,
    presets: DATE_PRESETS,
    setPreset,
    setCustomDateRange,
    formatDateRange
  };
}