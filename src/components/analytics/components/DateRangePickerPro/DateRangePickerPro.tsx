"use client";

import { useState } from 'react';
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format, isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { DateRange } from '../../types/analytics';
import { DATE_PRESETS } from '../../utils/dateUtils';

interface DateRangePickerProProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePickerPro = ({ value, onChange }: DateRangePickerProProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  const [tempRange, setTempRange] = useState<{ from?: Date; to?: Date }>({
    from: value.from,
    to: value.to
  });

  const handlePresetClick = (preset: any) => {
    const range = preset.getValue();
    setTempRange(range);
  };

  const handleApply = () => {
    if (tempRange.from && tempRange.to) {
      onChange({ from: tempRange.from, to: tempRange.to });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setTempRange({ from: value.from, to: value.to });
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className={cn(
            "h-9 px-4 text-sm font-normal justify-start text-left",
            "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300",
            "transition-all duration-200"
          )}
        >
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          <span className="text-gray-700">
            {value.from && value.to ? (
              `${format(value.from, "MMM d, yyyy")} - ${format(value.to, "MMM d, yyyy")}`
            ) : (
              "Select date range"
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white shadow-xl border border-gray-200" align="start">
        <div className="flex">
          {/* Presets Sidebar */}
          <div className="w-48 border-r border-gray-100 p-3 bg-gray-50">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Quick Select</p>
            <div className="space-y-1">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                    "hover:bg-white hover:shadow-sm",
                    tempRange.from && tempRange.to && 
                    isSameDay(tempRange.from, preset.getValue().from) && 
                    isSameDay(tempRange.to, preset.getValue().to)
                      ? "bg-indigo-50 text-indigo-700 font-medium"
                      : "text-gray-700"
                  )}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Calendar */}
          <div className="p-3">
            <DayPicker
              mode="range"
              selected={tempRange}
              onSelect={setTempRange}
              month={month}
              onMonthChange={setMonth}
              numberOfMonths={2}
              showOutsideDays
              className="rdp-custom"
              classNames={{
                months: "flex space-x-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-gray-900",
                nav: "space-x-1 flex items-center",
                nav_button: cn(
                  "h-7 w-7 bg-transparent p-0 hover:bg-gray-100 rounded-md",
                  "inline-flex items-center justify-center text-gray-600"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: cn(
                  "relative h-9 w-9 text-center text-sm p-0",
                  "focus-within:relative focus-within:z-20"
                ),
                day: cn(
                  "h-9 w-9 p-0 font-normal rounded-md",
                  "hover:bg-gray-100 hover:text-gray-900",
                  "focus:bg-gray-100 focus:text-gray-900"
                ),
                day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white focus:bg-indigo-700 focus:text-white",
                day_today: "bg-gray-100 text-gray-900 font-semibold",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-400 opacity-50",
                day_range_middle: "bg-indigo-50 text-indigo-900 rounded-none",
                day_hidden: "invisible",
              }}
            />
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                {tempRange.from && tempRange.to && (
                  <span>{Math.round((tempRange.to.getTime() - tempRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1} days selected</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="text-gray-600 border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  disabled={!tempRange.from || !tempRange.to}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};