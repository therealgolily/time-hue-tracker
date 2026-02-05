import { ClientDayData, TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { Building2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ClientTrackerDaySummaryProps {
  dayData: ClientDayData;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

// Color mapping for each client
const clientBgColors: Record<TrackerClient, string> = {
  'rosser-results': 'bg-violet-500/20 text-violet-500',
  'carolinas': 'bg-blue-500/20 text-blue-500',
  'richmond': 'bg-emerald-500/20 text-emerald-500',
  'memphis': 'bg-amber-500/20 text-amber-500',
  'tri-cities': 'bg-rose-500/20 text-rose-500',
  'birmingham': 'bg-cyan-500/20 text-cyan-500',
  'outside': 'bg-green-600/20 text-green-600',
  'personal': 'bg-pink-500/20 text-pink-500',
  'other': 'bg-slate-500/20 text-slate-500',
};

export const ClientTrackerDaySummary = ({ dayData }: ClientTrackerDaySummaryProps) => {
  const { wakeTime, sleepTime, entries } = dayData;

  // Calculate time per client
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

  entries.forEach(entry => {
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.endTime).getTime();
    const mins = (end - start) / 1000 / 60;
    clientMinutes[entry.trackerClient] += mins;
  });

  // Calculate total accounted time
  const accountedMinutes = Object.values(clientMinutes).reduce((a, b) => a + b, 0);

  // Calculate awake time (if both wake and sleep are set)
  let awakeMinutes = 0;
  let unaccountedMinutes = 0;
  
  if (wakeTime && sleepTime) {
    const wake = new Date(wakeTime).getTime();
    const sleep = new Date(sleepTime).getTime();
    awakeMinutes = (sleep - wake) / 1000 / 60;
    unaccountedMinutes = Math.max(0, awakeMinutes - accountedMinutes);
  }

  // Calculate working hours (clock in to clock out)
  let workingMinutes = 0;
  let unloggedWorkMinutes = 0;
  
  if (dayData.clockInTime && dayData.clockOutTime) {
    const clockIn = new Date(dayData.clockInTime).getTime();
    const clockOut = new Date(dayData.clockOutTime).getTime();
    workingMinutes = (clockOut - clockIn) / 1000 / 60;
    
    // Calculate time logged during work hours
    let loggedDuringWork = 0;
    entries.forEach(entry => {
      const entryStart = new Date(entry.startTime).getTime();
      const entryEnd = new Date(entry.endTime).getTime();
      
      // Find overlap between entry and work period
      const overlapStart = Math.max(entryStart, clockIn);
      const overlapEnd = Math.min(entryEnd, clockOut);
      
      if (overlapEnd > overlapStart) {
        loggedDuringWork += (overlapEnd - overlapStart) / 1000 / 60;
      }
    });
    
    unloggedWorkMinutes = Math.max(0, workingMinutes - loggedDuringWork);
  }

  const hasData = wakeTime || sleepTime || entries.length > 0 || dayData.clockInTime || dayData.clockOutTime;

  if (!hasData) {
    return null;
  }

  // Filter to only show clients with time
  const activeClients = (Object.keys(clientMinutes) as TrackerClient[]).filter(
    client => clientMinutes[client] > 0
  );

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Day Summary</h3>
      
      {activeClients.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activeClients.map((client) => (
            <div
              key={client}
              className={cn(
                'flex flex-col items-center justify-center p-3 rounded-lg',
                clientBgColors[client]
              )}
            >
              <Building2 className="w-4 h-4 mb-1" />
              <span className="text-lg font-semibold font-mono">
                {formatDuration(Math.round(clientMinutes[client]))}
              </span>
              <span className="text-xs opacity-80 text-center">{TRACKER_CLIENT_LABELS[client]}</span>
            </div>
          ))}
          {unaccountedMinutes > 0 && (
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-muted text-muted-foreground">
              <HelpCircle className="w-4 h-4 mb-1" />
              <span className="text-lg font-semibold font-mono">
                {formatDuration(Math.round(unaccountedMinutes))}
              </span>
              <span className="text-xs opacity-80">Unaccounted</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No time tracked yet.</p>
      )}

      {workingMinutes > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Working hours (clocked)</span>
            <span className="font-mono font-medium text-foreground">
              {formatDuration(Math.round(workingMinutes))}
            </span>
          </div>
          {unloggedWorkMinutes > 0 && (
            <div className="flex justify-between text-sm mt-1">
              <span className="text-destructive">Unlogged work time</span>
              <span className="font-mono font-medium text-destructive">
                {formatDuration(Math.round(unloggedWorkMinutes))}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Work time logged</span>
            <span className="font-mono font-medium text-foreground">
              {workingMinutes > 0 
                ? `${Math.round(((workingMinutes - unloggedWorkMinutes) / workingMinutes) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      )}

      {wakeTime && sleepTime && (
        <div className={workingMinutes > 0 ? "pt-2" : "pt-2 border-t border-border"}>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total awake time</span>
            <span className="font-mono font-medium text-foreground">
              {formatDuration(Math.round(awakeMinutes))}
            </span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-muted-foreground">Accounted for</span>
            <span className="font-mono font-medium text-foreground">
              {awakeMinutes > 0 
                ? `${Math.round((accountedMinutes / awakeMinutes) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
