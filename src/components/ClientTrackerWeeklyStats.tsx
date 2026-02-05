import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks } from 'date-fns';
import { ClientDayData, TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClientTrackerWeeklyStatsProps {
  weekStart: Date;
  getDayData: (date: Date) => ClientDayData;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Color mapping for each client
const clientBgColors: Record<TrackerClient, string> = {
  'rosser-results': 'bg-violet-500',
  'carolinas': 'bg-blue-500',
  'richmond': 'bg-emerald-500',
  'memphis': 'bg-amber-500',
  'tri-cities': 'bg-rose-500',
  'birmingham': 'bg-cyan-500',
  'outside': 'bg-green-600',
  'personal': 'bg-pink-500',
  'other': 'bg-slate-500',
};

export const ClientTrackerWeeklyStats = ({ weekStart, getDayData }: ClientTrackerWeeklyStatsProps) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const weeklyStats = useMemo(() => {
    const clientMinutes: Record<TrackerClient, number> = {
      'rosser-results': 0,
      'carolinas': 0,
      'richmond': 0,
      'memphis': 0,
      'tri-cities': 0,
      'birmingham': 0,
      'outside': 0,
      'personal': 0,
      'other': 0,
    };

    days.forEach(day => {
      const dayData = getDayData(day);
      dayData.entries.forEach(entry => {
        const start = new Date(entry.startTime).getTime();
        const end = new Date(entry.endTime).getTime();
        const mins = (end - start) / 1000 / 60;
        clientMinutes[entry.trackerClient] += mins;
      });
    });

    const totalMinutes = Object.values(clientMinutes).reduce((a, b) => a + b, 0);

    return { clientMinutes, totalMinutes };
  }, [days, getDayData]);

  const activeClients = (Object.keys(weeklyStats.clientMinutes) as TrackerClient[]).filter(
    client => weeklyStats.clientMinutes[client] > 0
  );

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Weekly Summary</h3>
        <span className="text-sm text-muted-foreground">
          {format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}
        </span>
      </div>

      {activeClients.length > 0 ? (
        <>
          <div className="space-y-2">
            {activeClients.map(client => {
              const mins = weeklyStats.clientMinutes[client];
              const percentage = weeklyStats.totalMinutes > 0 ? (mins / weeklyStats.totalMinutes) * 100 : 0;
              
              return (
                <div key={client} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3 text-muted-foreground" />
                      <span className="text-foreground">{TRACKER_CLIENT_LABELS[client]}</span>
                    </div>
                    <span className="font-mono text-muted-foreground">{formatDuration(mins)}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', clientBgColors[client])}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total tracked</span>
              <span className="font-mono font-medium text-foreground">
                {formatDuration(weeklyStats.totalMinutes)}
              </span>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-4">No time tracked this week.</p>
      )}
    </div>
  );
};
