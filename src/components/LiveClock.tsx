import { useLiveClock } from '@/hooks/useLiveClock';
import { format } from 'date-fns';

export const LiveClock = () => {
  const time = useLiveClock();

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div className="w-2 h-2 bg-primary pulse-live" />
      </div>
      <div className="font-mono text-sm font-medium tracking-tight">
        {format(time, 'HH:mm:ss')}
      </div>
    </div>
  );
};