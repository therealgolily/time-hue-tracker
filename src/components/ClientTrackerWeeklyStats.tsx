import { useState, useMemo } from 'react';
import { format, startOfWeek, addDays, subDays, startOfMonth, startOfYear } from 'date-fns';
import { ClientDayData, TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { cn } from '@/lib/utils';
import { Building2, AlertCircle, ChevronDown } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ClientTrackerWeeklyStatsProps {
  weekStart: Date;
  getDayData: (date: Date) => ClientDayData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type TimePeriod = 'week' | 'last7' | 'last30' | 'mtd' | 'ytd';

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

const getDateRange = (period: TimePeriod, weekStart: Date): { start: Date; end: Date; label: string } => {
  const today = new Date();
  
  switch (period) {
    case 'week':
      return {
        start: weekStart,
        end: addDays(weekStart, 6),
        label: `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d')}`
      };
    case 'last7':
      return {
        start: subDays(today, 6),
        end: today,
        label: 'Last 7 Days'
      };
    case 'last30':
      return {
        start: subDays(today, 29),
        end: today,
        label: 'Last 30 Days'
      };
    case 'mtd':
      return {
        start: startOfMonth(today),
        end: today,
        label: format(today, 'MMMM yyyy')
      };
    case 'ytd':
      return {
        start: startOfYear(today),
        end: today,
        label: `YTD ${format(today, 'yyyy')}`
      };
  }
};

export const ClientTrackerWeeklyStats = ({ weekStart, getDayData, open = true, onOpenChange }: ClientTrackerWeeklyStatsProps) => {
  const [period, setPeriod] = useState<TimePeriod>('week');
  
  const { start, end, label } = getDateRange(period, weekStart);

  const stats = useMemo(() => {
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
    
    let totalUnloggedWorkMinutes = 0;
    let totalWorkingMinutes = 0;

    // Iterate through all days in the range
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    for (let i = 0; i < dayCount; i++) {
      const day = addDays(start, i);
      const dayData = getDayData(day);
      
      // Calculate logged time per client
      dayData.entries.forEach(entry => {
        const entryStart = new Date(entry.startTime).getTime();
        const entryEnd = new Date(entry.endTime).getTime();
        const mins = (entryEnd - entryStart) / 1000 / 60;
        clientMinutes[entry.trackerClient] += mins;
      });
      
      // Calculate unlogged work time
      if (dayData.clockInTime && dayData.clockOutTime) {
        const clockIn = new Date(dayData.clockInTime).getTime();
        const clockOut = new Date(dayData.clockOutTime).getTime();
        const workMins = (clockOut - clockIn) / 1000 / 60;
        totalWorkingMinutes += workMins;
        
        // Calculate logged during work hours
        let loggedDuringWork = 0;
        dayData.entries.forEach(entry => {
          const entryStart = new Date(entry.startTime).getTime();
          const entryEnd = new Date(entry.endTime).getTime();
          const overlapStart = Math.max(entryStart, clockIn);
          const overlapEnd = Math.min(entryEnd, clockOut);
          if (overlapEnd > overlapStart) {
            loggedDuringWork += (overlapEnd - overlapStart) / 1000 / 60;
          }
        });
        
        totalUnloggedWorkMinutes += Math.max(0, workMins - loggedDuringWork);
      }
    }

    const totalMinutes = Object.values(clientMinutes).reduce((a, b) => a + b, 0);

    return { clientMinutes, totalMinutes, totalUnloggedWorkMinutes, totalWorkingMinutes };
  }, [start, end, getDayData]);

  const activeClients = (Object.keys(stats.clientMinutes) as TrackerClient[]).filter(
    client => stats.clientMinutes[client] > 0
  );

  const periodLabels: Record<TimePeriod, string> = {
    week: 'Week',
    last7: '7 Days',
    last30: '30 Days',
    mtd: 'MTD',
    ytd: 'YTD',
  };

  return (
    <Collapsible open={open} onOpenChange={onOpenChange}>
      <div className="glass-card">
        <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Summary</h3>
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="px-4 pb-4 space-y-4">
          <Tabs value={period} onValueChange={(v) => setPeriod(v as TimePeriod)} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-8">
              {(Object.keys(periodLabels) as TimePeriod[]).map((p) => (
                <TabsTrigger 
                  key={p} 
                  value={p} 
                  className="text-xs px-2 py-1"
                >
                  {periodLabels[p]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeClients.length > 0 || stats.totalUnloggedWorkMinutes > 0 ? (
            <>
              <div className="space-y-2">
                {activeClients.map(client => {
                  const mins = stats.clientMinutes[client];
                  const percentage = stats.totalMinutes > 0 ? (mins / stats.totalMinutes) * 100 : 0;
                  
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
                
                {stats.totalUnloggedWorkMinutes > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3 h-3 text-destructive" />
                        <span className="text-destructive">Unlogged Work Time</span>
                      </div>
                      <span className="font-mono text-destructive">{formatDuration(stats.totalUnloggedWorkMinutes)}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-destructive"
                        style={{ width: `${stats.totalWorkingMinutes > 0 ? (stats.totalUnloggedWorkMinutes / stats.totalWorkingMinutes) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total tracked</span>
                  <span className="font-mono font-medium text-foreground">
                    {formatDuration(stats.totalMinutes)}
                  </span>
                </div>
                {stats.totalWorkingMinutes > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total clocked work</span>
                    <span className="font-mono font-medium text-foreground">
                      {formatDuration(stats.totalWorkingMinutes)}
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No time tracked for this period.</p>
          )}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
