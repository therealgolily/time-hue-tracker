import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'revenue' | 'expense' | 'neutral';
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: MetricCardProps) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  return (
    <div className="border-2 border-foreground bg-background p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p
            className={cn(
              'text-2xl font-bold mt-2 tabular-nums',
              variant === 'revenue' && 'text-foreground',
              variant === 'expense' && 'text-primary',
              variant === 'neutral' && 'text-muted-foreground'
            )}
          >
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-xs font-mono text-muted-foreground mt-1 uppercase">
              {subtitle}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-sm font-bold tabular-nums',
                  trend.value >= 0 ? 'text-foreground' : 'text-primary'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs font-mono text-muted-foreground uppercase">
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'w-10 h-10 border-2 border-foreground flex items-center justify-center flex-shrink-0',
              variant === 'revenue' && 'bg-foreground text-background',
              variant === 'expense' && 'bg-primary text-primary-foreground',
              variant === 'default' && 'bg-background',
              variant === 'neutral' && 'bg-muted'
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
};