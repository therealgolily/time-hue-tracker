import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
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
    <div className="glass-card p-4 slide-up">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousWeek}
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <span className="font-medium text-foreground">
          {format(weekStart, 'MMMM yyyy')}
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextWeek}
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2">
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
                'flex flex-col items-center gap-1 p-3 rounded-lg transition-all duration-200 relative',
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent text-muted-foreground hover:text-foreground',
                isToday && !isSelected && 'ring-1 ring-primary/50'
              )}
            >
              <span className="text-xs uppercase font-medium">
                {format(day, 'EEE')}
              </span>
              <span className={cn(
                'text-lg font-semibold',
                isSelected ? 'text-primary-foreground' : 'text-foreground'
              )}>
                {format(day, 'd')}
              </span>
              {/* Entry indicator dot */}
              {(hasEntries || hasWakeOrSleep) && (
                <div className="flex gap-0.5">
                  {hasEntries && (
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    )} />
                  )}
                  {hasWakeOrSleep && !hasEntries && (
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
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
