import { useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarEvent } from '@/types/calendar';

interface MiniMonthProps {
  month: Date;
  events: CalendarEvent[];
  onDateClick: (date: string) => void;
  hasEventOnDate: (date: string) => boolean;
  getCategoryColorForDate: (date: string) => { bg: string; text: string } | null;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MiniMonth = ({ month, onDateClick, hasEventOnDate, getCategoryColorForDate }: MiniMonthProps) => {
  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [month]);

  return (
    <div className="border-2 border-foreground bg-background">
      {/* Month Header */}
      <div className="border-b-2 border-foreground px-3 py-2">
        <h3 className="text-sm font-bold uppercase tracking-widest">
          {format(month, 'MMMM yyyy')}
        </h3>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-foreground/20">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="p-1 text-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const isCurrentMonth = isSameMonth(day, month);
          const categoryColor = getCategoryColorForDate(dateString);
          const hasEvent = hasEventOnDate(dateString);
          const today = isToday(day);

          return (
            <button
              key={dateString}
              onClick={() => onDateClick(dateString)}
              disabled={!isCurrentMonth}
              className={cn(
                'aspect-square flex items-center justify-center text-xs font-mono transition-colors relative',
                !isCurrentMonth && 'text-muted-foreground/30 cursor-default',
                isCurrentMonth && !hasEvent && 'hover:bg-muted',
                today && !hasEvent && 'border-2 border-primary',
                today && hasEvent && 'ring-2 ring-foreground ring-inset'
              )}
              style={
                hasEvent && categoryColor
                  ? { backgroundColor: categoryColor.bg, color: categoryColor.text }
                  : undefined
              }
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
};
