import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LogIn, LogOut, X } from 'lucide-react';

interface ClockInOutButtonProps {
  type: 'clock-in' | 'clock-out';
  time: Date | null;
  onSetTime: () => void;
  onClearTime?: () => void;
}

export const ClockInOutButton = ({ type, time, onSetTime, onClearTime }: ClockInOutButtonProps) => {
  const isClockIn = type === 'clock-in';
  const Icon = isClockIn ? LogIn : LogOut;
  const label = isClockIn ? 'Clock In' : 'Clock Out';
  const bgColor = isClockIn ? 'bg-green-600' : 'bg-orange-600';
  const hoverColor = isClockIn ? 'hover:bg-green-700' : 'hover:bg-orange-700';

  if (time) {
    return (
      <div className={cn(
        'flex items-center justify-between p-3 border-2 border-foreground',
        bgColor, 'text-white'
      )}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">{format(time, 'h:mm a')}</span>
          {onClearTime && (
            <button
              onClick={onClearTime}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onSetTime}
      className={cn(
        'flex items-center justify-center gap-2 p-3 border-2 border-dashed border-foreground/50',
        'text-foreground/70 hover:text-foreground hover:border-foreground transition-colors'
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
    </button>
  );
};
