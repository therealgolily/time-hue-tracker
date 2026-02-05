import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { Building2, Check } from 'lucide-react';

interface MultiClientSelectorProps {
  value: TrackerClient[];
  onChange: (clients: TrackerClient[]) => void;
  size?: 'sm' | 'md';
}

const clients: TrackerClient[] = [
  'rosser-results',
  'carolinas',
  'richmond',
  'memphis',
  'tri-cities',
  'birmingham',
  'outside',
  'personal',
  'other',
];

// All clients use primary (red) color for Swiss design consistency
const clientColors: Record<TrackerClient, string> = {
  'rosser-results': 'bg-primary',
  'carolinas': 'bg-primary',
  'richmond': 'bg-primary',
  'memphis': 'bg-primary',
  'tri-cities': 'bg-primary',
  'birmingham': 'bg-primary',
  'outside': 'bg-primary',
  'personal': 'bg-primary',
  'other': 'bg-primary',
};

export const MultiClientSelector = ({ value, onChange, size = 'md' }: MultiClientSelectorProps) => {
  const toggleClient = (client: TrackerClient) => {
    if (value.includes(client)) {
      onChange(value.filter(c => c !== client));
    } else {
      onChange([...value, client]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {clients.map((client) => {
        const isSelected = value.includes(client);
        
        return (
          <button
            key={client}
            onClick={() => toggleClient(client)}
            className={cn(
              'flex items-center gap-2 rounded-lg transition-all duration-200 relative',
              size === 'sm' ? 'px-3 py-2' : 'px-4 py-3',
              isSelected
                ? `${clientColors[client]} text-white`
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Building2 className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            <span className={cn('font-medium', size === 'sm' ? 'text-sm' : 'text-base')}>
              {TRACKER_CLIENT_LABELS[client]}
            </span>
            {isSelected && (
              <Check className={cn('absolute -top-1 -right-1 p-0.5 rounded-full bg-background text-foreground', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            )}
          </button>
        );
      })}
    </div>
  );
};
