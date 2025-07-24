import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  MessageSquare,
  Phone,
  GitBranch,
} from 'lucide-react';
import { Button } from './ui/button';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onScheduleMeeting: () => void;
  onSimulateConversation: () => void;
  onGenerateCallScript: () => void;
  onViewNestedMeetings: () => void;
}

// --- DATA UPDATED TO JULY 2025 ---
const mockMeetings: Record<string, string[]> = {
  '2025-07-17': ['meeting-1', 'meeting-2'],
  '2025-07-18': ['meeting-3'],
  '2025-07-20': ['meeting-4', 'meeting-5'],
  '2025-07-22': ['meeting-6'],
  '2025-07-24': ['meeting-7'],
  '2025-07-27': ['meeting-8', 'meeting-9'],
  '2025-07-29': ['meeting-10'],
  '2025-07-31': ['meeting-11'],
};

// --- QUICK-ACTION COMPONENT WITH REFINED STYLE ---
const QuickActionButton = ({
  icon: Icon,
  label,
  gradient,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  gradient: string;
  onClick?: () => void;
}) => (
  <div
    className={`rounded-lg bg-gradient-to-br ${gradient} p-px shadow-sm hover:shadow-md transition-shadow`}
  >
    <button
      onClick={onClick} // <-- The onClick property is added here
      className="w-full h-full bg-slate-50 hover:bg-white/50 backdrop-blur-sm rounded-[7px] px-3 py-2 text-xs text-gray-700 transition-colors flex items-center"
    >
      <Icon className="w-4 h-4 mr-2" />
      <span>{label}</span>
    </button>
  </div>
);

export function Calendar({
  selectedDate,
  onDateSelect,
  onScheduleMeeting,
  onSimulateConversation,
  onGenerateCallScript,
  onViewNestedMeetings,
}: CalendarProps) {
  // --- INITIAL MONTH CHANGED TO JULY 2025 ---
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 6));

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    for (let i = startingDayOfWeek; i > 0; i--) {
      const day = new Date(year, month, 1 - i);
      days.push({ date: day, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push({ date: day, isCurrentMonth: true });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const day = new Date(year, month + 1, i);
      days.push({ date: day, isCurrentMonth: false });
    }

    return days;
  };

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

  const hasMeetings = (date: Date) =>
    mockMeetings[formatDateKey(date)]?.length > 0;

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
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
    <div className="h-full flex flex-col">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const isSelected =
              selectedDate &&
              day.date.toDateString() === selectedDate.toDateString();
            const isToday =
              day.date.toDateString() === new Date().toDateString();
            const hasMeeting = hasMeetings(day.date);

            return (
              <button
                key={index}
                onClick={() => day.isCurrentMonth && onDateSelect(day.date)}
                className={`
                  relative h-9 w-9 text-sm rounded-lg transition-colors duration-200
                  ${
                    day.isCurrentMonth
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300'
                  }
                  ${isSelected ? 'bg-gray-900 text-white hover:bg-gray-900' : ''}
                  ${isToday && !isSelected ? 'font-bold text-purple-600' : ''}
                `}
              >
                <span className="relative z-10">{day.date.getDate()}</span>
                {/* --- MINIMALIST MEETING INDICATOR --- */}
                {hasMeeting && day.isCurrentMonth && !isSelected && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-gray-400"></div>
                )}
                {hasMeeting && day.isCurrentMonth && isSelected && (
                  <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-white/50"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-grow flex flex-col justify-end pt-6">
        <div className="border-t border-gray-200/80 pt-4">
          <h4 className="text-xs text-gray-500 uppercase font-semibold mb-3">
            Quick Actions
          </h4>

          <div className="flex flex-col space-y-2">
            <QuickActionButton
              icon={CalendarIcon}
              label="Schedule Meeting"
              onClick={onScheduleMeeting}
            />
            <QuickActionButton
              icon={MessageSquare}
              label="Simulate Conversation"
              onClick={onSimulateConversation}
            />
            <QuickActionButton
              icon={Phone}
              label="Call Script"
              onClick={onGenerateCallScript}
            />
            <QuickActionButton
              icon={GitBranch}
              label="Nested Meetings"
              onClick={onViewNestedMeetings}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
