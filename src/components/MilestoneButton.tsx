import { Sun, Moon, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        'flex items-center gap-3 p-4 rounded-xl transition-all duration-300',
        'border border-border/50 hover:border-border',
        time 
          ? 'bg-secondary/50' 
          : 'bg-card hover:bg-accent'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        isWake 
          ? 'bg-energy-neutral/20 text-energy-neutral' 
          : 'bg-primary/20 text-primary'
      )}>
        {isWake ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-sm text-muted-foreground">
          {isWake ? 'Woke up' : 'Went to bed'}
        </span>
        {time ? (
          <span className="font-mono text-lg font-medium text-foreground">
            {format(time, 'HH:mm')}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/70 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Set time
          </span>
        )}
      </div>
    </button>
  );
};
