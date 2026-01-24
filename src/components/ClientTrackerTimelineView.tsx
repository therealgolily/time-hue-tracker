import { useState } from 'react';
import { format } from 'date-fns';
import { ClientDayData, ClientTimeEntry, TRACKER_CLIENT_LABELS, TrackerClient } from '@/types/clientTracker';
import { cn } from '@/lib/utils';
import { Sun, Moon, Trash2, Building2, Pencil } from 'lucide-react';
import { ClientTrackerEditEntryDialog } from './ClientTrackerEditEntryDialog';

interface ClientTrackerTimelineViewProps {
  dayData: ClientDayData;
  onDeleteEntry: (entryId: string) => void;
  onUpdateEntry: (entryId: string, updates: Omit<ClientTimeEntry, 'id'>) => void;
  onDeleteWakeTime: () => void;
  onDeleteSleepTime: () => void;
}

// Color mapping for each client
const clientColors: Record<TrackerClient, string> = {
  'rosser-results': 'bg-violet-500',
  'carolinas': 'bg-blue-500',
  'richmond': 'bg-emerald-500',
  'memphis': 'bg-amber-500',
  'tri-cities': 'bg-rose-500',
  'birmingham': 'bg-cyan-500',
  'other': 'bg-slate-500',
};

const clientBgColors: Record<TrackerClient, string> = {
  'rosser-results': 'bg-violet-500/20 text-violet-500',
  'carolinas': 'bg-blue-500/20 text-blue-500',
  'richmond': 'bg-emerald-500/20 text-emerald-500',
  'memphis': 'bg-amber-500/20 text-amber-500',
  'tri-cities': 'bg-rose-500/20 text-rose-500',
  'birmingham': 'bg-cyan-500/20 text-cyan-500',
  'other': 'bg-slate-500/20 text-slate-500',
};

export const ClientTrackerTimelineView = ({ dayData, onDeleteEntry, onUpdateEntry, onDeleteWakeTime, onDeleteSleepTime }: ClientTrackerTimelineViewProps) => {
  const [editingEntry, setEditingEntry] = useState<ClientTimeEntry | null>(null);
  const { wakeTime, sleepTime, entries } = dayData;
  
  // Build timeline items
  const timelineItems: Array<{
    type: 'wake' | 'sleep' | 'entry';
    time: Date;
    data?: ClientTimeEntry;
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
                item.type === 'entry' && item.data && clientColors[item.data.trackerClient]
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
                    {format(item.time, 'h:mm a')}
                    {item.type === 'entry' && item.data && (
                      <span className="text-muted-foreground/50">
                        {' → '}{format(item.data.endTime, 'h:mm a')}
                      </span>
                    )}
                  </span>
                  <p className="mt-1 font-medium text-foreground">
                    {item.type === 'wake' && '☀️ Woke up'}
                    {item.type === 'sleep' && '🌙 Went to bed'}
                    {item.type === 'entry' && item.data?.description}
                  </p>
                </div>
                
                {item.type === 'wake' && (
                  <button
                    onClick={onDeleteWakeTime}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {item.type === 'sleep' && (
                  <button
                    onClick={onDeleteSleepTime}
                    className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {item.type === 'entry' && item.data && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingEntry(item.data!)}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteEntry(item.data!.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {item.type === 'entry' && item.data && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Client badge */}
                  <span
                    className={cn(
                      'text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1',
                      clientBgColors[item.data.trackerClient]
                    )}
                  >
                    <Building2 className="w-3 h-3" />
                    {item.data.trackerClient === 'other' && item.data.customClient
                      ? item.data.customClient
                      : TRACKER_CLIENT_LABELS[item.data.trackerClient]}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ClientTrackerEditEntryDialog
        entry={editingEntry}
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        onSave={onUpdateEntry}
      />
    </div>
  );
};
