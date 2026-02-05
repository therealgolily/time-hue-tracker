import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LogIn, LogOut, X, Clock } from 'lucide-react';

interface ClockInOutButtonProps {
  type: 'clock-in' | 'clock-out';
  time: Date | null;
  onSetTime: () => void;
  onSetNow: () => void;
  onClearTime?: () => void;
}

export const ClockInOutButton = ({ type, time, onSetTime, onSetNow, onClearTime }: ClockInOutButtonProps) => {
  const isClockIn = type === 'clock-in';
  const Icon = isClockIn ? LogIn : LogOut;
  const label = isClockIn ? 'Clock In' : 'Clock Out';

  if (time) {
    return (
      <div className="flex items-center justify-between p-3 border-2 border-foreground bg-secondary">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">{format(time, 'h:mm a')}</span>
          {onClearTime && (
            <button
              onClick={onClearTime}
              className="p-1 hover:bg-foreground/10 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={onSetTime}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-foreground/50',
          'text-foreground/70 hover:text-foreground hover:border-foreground transition-colors'
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
      </button>
      <button
        onClick={onSetNow}
        className={cn(
          'px-3 py-2 border-2 border-foreground/50',
          'text-foreground/70 hover:text-foreground hover:border-foreground hover:bg-foreground/10 transition-colors',
          'flex items-center gap-1'
        )}
      >
        <Clock className="w-3 h-3" />
        <span className="text-xs font-mono uppercase">Now</span>
      </button>
    </div>
  );
};
