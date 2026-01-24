import { format, addDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DayData } from '@/types/timeTracker';

interface WeekNavigatorProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  weekStart: Date;
  getDayData?: (date: Date) => DayData;
}

export const WeekNavigator = ({
  selectedDate,
  onSelectDate,
  onPreviousWeek,
  onNextWeek,
  weekStart,
  getDayData,
}: WeekNavigatorProps) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  return (
    <div className="border-2 border-foreground p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousWeek}
          className="hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="text-sm font-bold uppercase tracking-widest">
          {format(weekStart, 'MMMM yyyy')}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextWeek}
          className="hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, today);
          const dayData = getDayData?.(day);
          const hasEntries = dayData && dayData.entries.length > 0;
          const hasWakeOrSleep = dayData && (dayData.wakeTime || dayData.sleepTime);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 transition-colors duration-200 relative',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-foreground hover:text-background',
                isToday && !isSelected && 'border-2 border-primary'
              )}
            >
              <span className="text-[10px] font-mono uppercase tracking-widest">
                {format(day, 'EEE')}
              </span>
              <span className="text-lg font-bold">
                {format(day, 'd')}
              </span>
              {/* Entry indicator */}
              {(hasEntries || hasWakeOrSleep) && (
                <div className="flex gap-0.5">
                  {hasEntries && (
                    <div className={cn(
                      'w-1.5 h-1.5',
                      isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    )} />
                  )}
                  {hasWakeOrSleep && !hasEntries && (
                    <div className={cn(
                      'w-1.5 h-1.5',
                      isSelected ? 'bg-primary-foreground/50' : 'bg-muted-foreground'
                    )} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};