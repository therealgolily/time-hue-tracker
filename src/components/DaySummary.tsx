import { DayData } from '@/types/timeTracker';
import { Briefcase, User, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DaySummaryProps {
  dayData: DayData;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

export const DaySummary = ({ dayData }: DaySummaryProps) => {
  const { wakeTime, sleepTime, entries } = dayData;

  // Calculate total work time
  const workMinutes = entries
    .filter(e => e.category === 'work')
    .reduce((acc, entry) => {
      const start = new Date(entry.startTime).getTime();
      const end = new Date(entry.endTime).getTime();
      return acc + (end - start) / 1000 / 60;
    }, 0);

  // Calculate total personal time
  const personalMinutes = entries
    .filter(e => e.category === 'personal')
    .reduce((acc, entry) => {
      const start = new Date(entry.startTime).getTime();
      const end = new Date(entry.endTime).getTime();
      return acc + (end - start) / 1000 / 60;
    }, 0);

  // Calculate total accounted time
  const accountedMinutes = workMinutes + personalMinutes;

  // Calculate awake time (if both wake and sleep are set)
  let awakeMinutes = 0;
  let unaccountedMinutes = 0;
  
  if (wakeTime && sleepTime) {
    const wake = new Date(wakeTime).getTime();
    const sleep = new Date(sleepTime).getTime();
    awakeMinutes = (sleep - wake) / 1000 / 60;
    unaccountedMinutes = Math.max(0, awakeMinutes - accountedMinutes);
  }

  const hasData = wakeTime || sleepTime || entries.length > 0;

  if (!hasData) {
    return null;
  }

  const stats = [
    {
      label: 'Work',
      minutes: workMinutes,
      icon: Briefcase,
      colorClass: 'text-accent-foreground bg-accent',
    },
    {
      label: 'Personal',
      minutes: personalMinutes,
      icon: User,
      colorClass: 'text-primary bg-primary/20',
    },
    {
      label: 'Unaccounted',
      minutes: unaccountedMinutes,
      icon: HelpCircle,
      colorClass: 'text-muted-foreground bg-muted',
    },
  ];

  return (
    <div className="glass-card p-4 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Day Summary</h3>
      
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              'flex flex-col items-center justify-center p-3 rounded-lg',
              stat.colorClass
            )}
          >
            <stat.icon className="w-4 h-4 mb-1" />
            <span className="text-lg font-semibold font-mono">
              {formatDuration(Math.round(stat.minutes))}
            </span>
            <span className="text-xs opacity-80">{stat.label}</span>
          </div>
        ))}
      </div>

      {wakeTime && sleepTime && (
        <div className="pt-2 border-t border-border">
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
