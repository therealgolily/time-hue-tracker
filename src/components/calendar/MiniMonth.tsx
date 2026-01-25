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
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarEvent, Countdown } from '@/types/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MiniMonthProps {
  month: Date;
  events: CalendarEvent[];
  countdowns: Countdown[];
  onDateClick: (date: string) => void;
  hasEventOnDate: (date: string) => boolean;
  getCategoryColorForDate: (date: string) => { bg: string; text: string } | null;
  getCountdownForDate: (date: string) => Countdown | undefined;
  getEventsForDate: (date: string) => CalendarEvent[];
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const MiniMonth = ({ 
  month, 
  onDateClick, 
  hasEventOnDate, 
  getCategoryColorForDate,
  getCountdownForDate,
  getEventsForDate,
}: MiniMonthProps) => {
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
          const countdown = getCountdownForDate(dateString);
          const today = isToday(day);
          const eventsOnDate = getEventsForDate(dateString);

          // Build tooltip content
          const tooltipLines: string[] = [];
          if (eventsOnDate.length > 0) {
            eventsOnDate.forEach(e => tooltipLines.push(e.title));
          }
          if (countdown) {
            tooltipLines.push(`⏱ ${countdown.title}`);
          }

          const hasTooltip = tooltipLines.length > 0 && isCurrentMonth;

          const dayButton = (
            <button
              onClick={() => onDateClick(dateString)}
              disabled={!isCurrentMonth}
              className={cn(
                'aspect-square flex items-center justify-center text-xs font-mono transition-colors relative',
                !isCurrentMonth && 'text-muted-foreground/30 cursor-default',
                isCurrentMonth && !hasEvent && !countdown && 'hover:bg-muted',
                today && !hasEvent && !countdown && 'border-2 border-primary',
                today && (hasEvent || countdown) && 'ring-2 ring-foreground ring-inset'
              )}
              style={
                hasEvent && categoryColor
                  ? { backgroundColor: categoryColor.bg, color: categoryColor.text }
                  : countdown && !hasEvent
                  ? { backgroundColor: 'hsl(190 90% 45%)', color: 'hsl(0 0% 100%)' }
                  : undefined
              }
            >
              {format(day, 'd')}
              {/* Countdown Indicator */}
              {countdown && isCurrentMonth && (
                <Timer 
                  className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5" 
                  style={{ 
                    color: hasEvent && categoryColor ? categoryColor.text : 'hsl(0 0% 100%)'
                  }}
                />
              )}
            </button>
          );

          if (hasTooltip) {
            return (
              <Tooltip key={dateString} delayDuration={200}>
                <TooltipTrigger asChild>
                  {dayButton}
                </TooltipTrigger>
                <TooltipContent 
                  side="top" 
                  className="max-w-[200px] text-xs font-mono"
                >
                  {tooltipLines.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={dateString}>{dayButton}</div>;
        })}
      </div>
    </div>
  );
};