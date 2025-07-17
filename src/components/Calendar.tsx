import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

// --- **CORRECCIÓN DE TYPESCRIPT** ---

// 1. Define the props interface for the component
interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

// 2. Use the `Record` utility type to create a strongly-typed object for mockMeetings.
//    This tells TypeScript that the keys will be strings (dates in 'YYYY-MM-DD' format)
//    and the values will be arrays of strings (meeting IDs).
const mockMeetings: Record<string, string[]> = {
  '2025-01-15': ['meeting-1', 'meeting-2'],
  '2025-01-16': ['meeting-3'],
  '2025-01-18': ['meeting-4', 'meeting-5'],
  '2025-01-20': ['meeting-6'],
  '2025-01-22': ['meeting-7'],
  '2025-01-24': ['meeting-8', 'meeting-9'],
  '2025-01-27': ['meeting-10'],
  '2025-01-29': ['meeting-11'],
};

export function Calendar({ selectedDate, onDateSelect }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0)); // Enero 2025

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Ensure getDay() returns 0 for Sunday, which is the expected start of the week.
    const startingDayOfWeek = firstDay.getDay(); 

    const days = [];
    
    // Days from the previous month to fill the first week
    for (let i = startingDayOfWeek; i > 0; i--) {
      const day = new Date(year, month, 1 - i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }

    // Days from the next month to fill the last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
        const day = new Date(year, month + 1, i);
        days.push({ date: day, isCurrentMonth: false});
    }
    
    return days;
  };

  const formatDateKey = (date: Date) => {
    // Helper to format the date as a 'YYYY-MM-DD' string key
    return date.toISOString().split('T')[0];
  };

  const hasMeetings = (date: Date) => {
    return mockMeetings[formatDateKey(date)]?.length > 0;
  };

  const getMeetingCount = (date: Date) => {
    return mockMeetings[formatDateKey(date)]?.length || 0;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="h-8 w-8 p-0 hover:bg-purple-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="h-8 w-8 p-0 hover:bg-purple-100"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="p-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
          const isToday = day.date.toDateString() === new Date().toDateString();
          const meetingCount = getMeetingCount(day.date);
          
          return (
            <button
              key={index}
              onClick={() => day.isCurrentMonth && onDateSelect(day.date)}
              className={`
                relative p-2 text-sm rounded-lg transition-all duration-200
                ${day.isCurrentMonth ? 'text-gray-800 hover:bg-purple-50' : 'text-gray-300'}
                ${isSelected ? 'bg-purple-500 text-white' : ''}
                ${isToday && !isSelected ? 'bg-blue-100 text-blue-600' : ''}
                ${hasMeetings(day.date) && day.isCurrentMonth ? 'font-medium' : ''}
              `}
            >
              <span className="relative z-10">{day.date.getDate()}</span>
              
              {meetingCount > 0 && day.isCurrentMonth && (
                <div className="absolute -top-1 -right-1 z-20">
                  <div className="w-5 h-5 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">{meetingCount}</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
