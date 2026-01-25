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
    <div className="metric-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="metric-label">{title}</p>
          <p
            className={cn(
              'metric-value mt-2',
              variant === 'revenue' && 'revenue-text',
              variant === 'expense' && 'expense-text'
            )}
          >
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend.value >= 0 ? 'revenue-text' : 'expense-text'
                )}
              >
                {trend.value >= 0 ? '+' : ''}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              variant === 'revenue' && 'bg-success/10',
              variant === 'expense' && 'bg-destructive/10',
              variant === 'default' && 'bg-primary/10',
              variant === 'neutral' && 'bg-muted'
            )}
          >
            <Icon
              className={cn(
                'w-6 h-6',
                variant === 'revenue' && 'text-success',
                variant === 'expense' && 'text-destructive',
                variant === 'default' && 'text-primary',
                variant === 'neutral' && 'text-muted-foreground'
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
