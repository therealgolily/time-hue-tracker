import { format } from 'date-fns';
import { DayData, TimeEntry } from '@/types/timeTracker';
import { cn } from '@/lib/utils';
import { Sun, Moon, Trash2 } from 'lucide-react';

interface TimelineViewProps {
  dayData: DayData;
  onDeleteEntry: (entryId: string) => void;
}

export const TimelineView = ({ dayData, onDeleteEntry }: TimelineViewProps) => {
  const { wakeTime, sleepTime, entries } = dayData;
  
  // Build timeline items
  const timelineItems: Array<{
    type: 'wake' | 'sleep' | 'entry';
    time: Date;
    data?: TimeEntry;
  }> = [];

  if (wakeTime) {
    timelineItems.push({ type: 'wake', time: wakeTime });
  }

  entries.forEach(entry => {
    timelineItems.push({ type: 'entry', time: entry.startTime, data: entry });
  });

  if (sleepTime) {
    timelineItems.push({ type: 'sleep', time: sleepTime });
  }

  // Sort by time
  timelineItems.sort((a, b) => a.time.getTime() - b.time.getTime());

  if (timelineItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Sun className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <p className="text-center">No entries yet for this day.</p>
        <p className="text-sm text-muted-foreground/70">Start by setting your wake time!</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-4">
        {timelineItems.map((item, index) => (
          <div
            key={index}
            className="relative pl-14 fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Timeline dot */}
            <div
              className={cn(
                'absolute left-4 top-4 w-5 h-5 rounded-full flex items-center justify-center',
                item.type === 'wake' && 'bg-energy-neutral',
                item.type === 'sleep' && 'bg-primary',
                item.type === 'entry' && item.data?.energyLevel === 'positive' && 'bg-energy-positive',
                item.type === 'entry' && item.data?.energyLevel === 'neutral' && 'bg-energy-neutral',
                item.type === 'entry' && item.data?.energyLevel === 'negative' && 'bg-energy-negative'
              )}
            >
              {item.type === 'wake' && <Sun className="w-3 h-3 text-background" />}
              {item.type === 'sleep' && <Moon className="w-3 h-3 text-background" />}
            </div>

            {/* Content card */}
            <div
              className={cn(
                'p-4 rounded-xl border border-border/50 transition-all duration-200',
                item.type === 'entry' && 'timeline-entry',
                item.type === 'wake' && 'bg-energy-neutral/10 border-energy-neutral/30',
                item.type === 'sleep' && 'bg-primary/10 border-primary/30',
                item.type === 'entry' && 'bg-card hover:bg-accent/50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-mono text-sm text-muted-foreground">
                    {format(item.time, 'HH:mm')}
                    {item.type === 'entry' && item.data && (
                      <span className="text-muted-foreground/50">
                        {' → '}{format(item.data.endTime, 'HH:mm')}
                      </span>
                    )}
                  </span>
                  <p className="mt-1 font-medium text-foreground">
                    {item.type === 'wake' && '☀️ Woke up'}
                    {item.type === 'sleep' && '🌙 Went to bed'}
                    {item.type === 'entry' && item.data?.description}
                  </p>
                </div>
                
                {item.type === 'entry' && item.data && (
                  <button
                    onClick={() => onDeleteEntry(item.data!.id)}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {item.type === 'entry' && item.data && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium',
                      item.data.energyLevel === 'positive' && 'bg-energy-positive/20 text-energy-positive',
                      item.data.energyLevel === 'neutral' && 'bg-energy-neutral/20 text-energy-neutral',
                      item.data.energyLevel === 'negative' && 'bg-energy-negative/20 text-energy-negative'
                    )}
                  >
                    {item.data.energyLevel === 'positive' && '⚡ Energizing'}
                    {item.data.energyLevel === 'neutral' && '➖ Neutral'}
                    {item.data.energyLevel === 'negative' && '🔋 Draining'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
