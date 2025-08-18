// Date Utility Functions
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  startOfQuarter, 
  endOfQuarter, 
  startOfYear, 
  endOfYear, 
  startOfWeek, 
  endOfWeek,
  isWithinInterval,
  isSameDay,
  differenceInDays,
  addDays,
  parseISO
} from 'date-fns';

export interface DatePreset {
  label: string;
  getValue: () => { from: Date; to: Date };
}

export const DATE_PRESETS: DatePreset[] = [
  { label: 'Today', getValue: () => ({ from: new Date(), to: new Date() }) },
  { label: 'Last 7 days', getValue: () => ({ from: subDays(new Date(), 6), to: new Date() }) },
  { label: 'Last 30 days', getValue: () => ({ from: subDays(new Date(), 29), to: new Date() }) },
  { label: 'Last 90 days', getValue: () => ({ from: subDays(new Date(), 89), to: new Date() }) },
  { label: 'This Week', getValue: () => ({ from: startOfWeek(new Date()), to: endOfWeek(new Date()) }) },
  { label: 'This Month', getValue: () => ({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }) },
  { label: 'This Quarter', getValue: () => ({ from: startOfQuarter(new Date()), to: endOfQuarter(new Date()) }) },
  { label: 'This Year', getValue: () => ({ from: startOfYear(new Date()), to: endOfYear(new Date()) }) }
];

export const formatDateRange = (from: Date, to: Date): string => {
  if (isSameDay(from, to)) {
    return format(from, 'MMM d, yyyy');
  }
  return `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}`;
};

export const getDaysInRange = (from: Date, to: Date): number => {
  return differenceInDays(to, from) + 1;
};

export const isDateInRange = (date: Date | string, from: Date, to: Date): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isWithinInterval(dateObj, { start: from, end: to });
};

export const generateDateRange = (from: Date, to: Date): Date[] => {
  const days = getDaysInRange(from, to);
  const dates: Date[] = [];
  
  for (let i = 0; i < days; i++) {
    dates.push(addDays(from, i));
  }
  
  return dates;
};

export const getDateRangePreset = (from: Date, to: Date): string | null => {
  for (const preset of DATE_PRESETS) {
    const range = preset.getValue();
    if (isSameDay(from, range.from) && isSameDay(to, range.to)) {
      return preset.label;
    }
  }
  return null;
};

export const parseSupabaseDateRange = (from: Date, to: Date): {
  startDate: string;
  endDate: string;
} => {
  return {
    startDate: format(from, 'yyyy-MM-dd'),
    endDate: format(to, 'yyyy-MM-dd')
  };
};