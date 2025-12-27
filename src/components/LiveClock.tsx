import { useLiveClock } from '@/hooks/useLiveClock';
import { format } from 'date-fns';

export const LiveClock = () => {
  const time = useLiveClock();

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-energy-positive pulse-live" />
      </div>
      <div className="font-mono text-2xl font-medium tracking-tight text-foreground">
        {format(time, 'h:mm:ss a')}
      </div>
    </div>
  );
};
