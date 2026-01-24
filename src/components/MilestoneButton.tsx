import { Sun, Moon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MilestoneButtonProps {
  type: 'wake' | 'sleep';
  time: Date | null;
  onSetTime: () => void;
}

export const MilestoneButton = ({ type, time, onSetTime }: MilestoneButtonProps) => {
  const isWake = type === 'wake';
  
  return (
    <button
      onClick={onSetTime}
      className={cn(
        'flex items-center gap-4 p-4 transition-colors duration-200',
        'border-2 border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary',
        time && 'bg-secondary'
      )}
    >
      <div className="w-10 h-10 border-2 border-current flex items-center justify-center">
        {isWake ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-mono uppercase tracking-widest">
          {isWake ? 'Wake' : 'Sleep'}
        </span>
        {time ? (
          <span className="font-mono text-xl font-bold">
            {format(time, 'HH:mm')}
          </span>
        ) : (
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Set time
          </span>
        )}
      </div>
    </button>
  );
};