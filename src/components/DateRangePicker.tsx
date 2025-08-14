"use client";

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { useDateFilter } from '../hooks/useDateFilter';
import { DateRange } from '../hooks/useAnalytics';
import { cn } from '../lib/utils';

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const {
    dateRange,
    selectedPreset,
    isCustom,
    activePresetLabel,
    presets,
    setPreset,
    setCustomDateRange,
    formatDateRange
  } = useDateFilter();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({});

  const currentRange = value || dateRange;
  const displayLabel = isCustom && value ? 'Custom Range' : activePresetLabel;

  const handlePresetSelect = (presetValue: string) => {
    setPreset(presetValue);
    const preset = presets.find(p => p.value === presetValue);
    if (preset) {
      const range = preset.getRange();
      onChange?.(range);
    }
  };

  const handleCustomRangeSelect = (range: { from?: Date; to?: Date }) => {
    setTempRange(range);
    
    if (range.from && range.to) {
      const dateRange: DateRange = {
        from: range.from,
        to: range.to
      };
      setCustomDateRange(dateRange);
      onChange?.(dateRange);
      setCalendarOpen(false);
      setTempRange({});
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="hover:bg-purple-50 hover:border-purple-200 min-w-[160px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">{displayLabel}</span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" className="w-56">
          {presets.map((preset) => (
            <DropdownMenuItem
              key={preset.value}
              onClick={() => handlePresetSelect(preset.value)}
              className={cn(
                "cursor-pointer",
                selectedPreset === preset.value && !isCustom && "bg-purple-50 text-purple-700"
              )}
            >
              {preset.label}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className={cn(
                  "cursor-pointer",
                  isCustom && "bg-purple-50 text-purple-700"
                )}
              >
                Custom Range...
              </DropdownMenuItem>
            </PopoverTrigger>
            
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                selected={tempRange}
                onSelect={handleCustomRangeSelect}
                numberOfMonths={2}
                disabled={(date) => 
                  date > new Date() || date < new Date("2020-01-01")
                }
              />
            </PopoverContent>
          </Popover>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Display current date range */}
      <div className="text-sm text-gray-500 hidden sm:block">
        {formatDateRange(currentRange)}
      </div>
    </div>
  );
}