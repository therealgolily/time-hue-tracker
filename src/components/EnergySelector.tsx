import { cn } from '@/lib/utils';
import { EnergyLevel } from '@/types/timeTracker';
import { Zap, Minus, Battery } from 'lucide-react';

interface EnergySelectorProps {
  value: EnergyLevel;
  onChange: (level: EnergyLevel) => void;
  size?: 'sm' | 'md';
}

const levels: { value: EnergyLevel; label: string; icon: typeof Zap }[] = [
  { value: 'positive', label: 'Energizing', icon: Zap },
  { value: 'neutral', label: 'Neutral', icon: Minus },
  { value: 'negative', label: 'Draining', icon: Battery },
];

export const EnergySelector = ({ value, onChange, size = 'md' }: EnergySelectorProps) => {
  return (
    <div className="flex gap-2">
      {levels.map((level) => {
        const Icon = level.icon;
        const isSelected = value === level.value;
        
        return (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className={cn(
              'flex items-center gap-2 rounded-lg transition-all duration-200',
              size === 'sm' ? 'px-3 py-2' : 'px-4 py-3',
              isSelected
                ? level.value === 'positive'
                  ? 'bg-energy-positive text-background'
                  : level.value === 'neutral'
                  ? 'bg-energy-neutral text-background'
                  : 'bg-energy-negative text-background'
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Icon className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            <span className={cn('font-medium', size === 'sm' ? 'text-sm' : 'text-base')}>
              {level.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
