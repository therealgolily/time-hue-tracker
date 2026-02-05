import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { cn } from '@/lib/utils';
import { Clock, Percent, Timer } from 'lucide-react';

interface MultiClientTimeAllocationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: TrackerClient[];
  startTime: string;
  endTime: string;
  description: string;
  selectedDate: Date;
  customClients: Record<TrackerClient, string>;
  onSubmit: (entries: Array<{
    startTime: Date;
    endTime: Date;
    description: string;
    trackerClient: TrackerClient;
    customClient?: string;
  }>) => void;
}

type AllocationMode = 'percentage' | 'times';

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

export const MultiClientTimeAllocation = ({
  open,
  onOpenChange,
  clients,
  startTime,
  endTime,
  description,
  selectedDate,
  customClients,
  onSubmit,
}: MultiClientTimeAllocationProps) => {
  const [mode, setMode] = useState<AllocationMode>('percentage');
  const [percentages, setPercentages] = useState<Record<TrackerClient, number>>({} as Record<TrackerClient, number>);
  const [times, setTimes] = useState<Record<TrackerClient, { start: string; end: string }>>({} as Record<TrackerClient, { start: string; end: string }>);

  // Initialize allocations when clients change
  useEffect(() => {
    if (clients.length > 0) {
      const equalPercent = Math.floor(100 / clients.length);
      const newPercentages: Record<TrackerClient, number> = {} as Record<TrackerClient, number>;
      clients.forEach((client, index) => {
        // Give remainder to last client
        newPercentages[client] = index === clients.length - 1 
          ? 100 - (equalPercent * (clients.length - 1))
          : equalPercent;
      });
      setPercentages(newPercentages);

      // Initialize times sequentially
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const start = new Date(`${dateStr}T${startTime}`);
      const end = new Date(`${dateStr}T${endTime}`);
      const totalMs = end.getTime() - start.getTime();
      const segmentMs = totalMs / clients.length;

      const newTimes: Record<TrackerClient, { start: string; end: string }> = {} as Record<TrackerClient, { start: string; end: string }>;
      let currentStart = start.getTime();
      
      clients.forEach((client, index) => {
        const segmentStart = new Date(currentStart);
        const segmentEnd = index === clients.length - 1 
          ? end 
          : new Date(currentStart + segmentMs);
        
        newTimes[client] = {
          start: format(segmentStart, 'HH:mm'),
          end: format(segmentEnd, 'HH:mm'),
        };
        currentStart = segmentEnd.getTime();
      });
      setTimes(newTimes);
    }
  }, [clients, startTime, endTime, selectedDate]);

  const totalPercentage = Object.values(percentages).reduce((a, b) => a + b, 0);
  const isValidPercentage = totalPercentage === 100;

  const handleSubmit = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    
    if (mode === 'percentage') {
      const start = new Date(`${dateStr}T${startTime}`);
      const end = new Date(`${dateStr}T${endTime}`);
      const totalMs = end.getTime() - start.getTime();
      
      let currentStart = start.getTime();
      const entries = clients.map((client, index) => {
        const segmentMs = (percentages[client] / 100) * totalMs;
        const segmentStart = new Date(currentStart);
        const segmentEnd = index === clients.length - 1 
          ? end 
          : new Date(currentStart + segmentMs);
        
        currentStart = segmentEnd.getTime();
        
        return {
          startTime: segmentStart,
          endTime: segmentEnd,
          description,
          trackerClient: client,
          customClient: client === 'other' ? customClients[client] : undefined,
        };
      });
      
      onSubmit(entries);
    } else {
      const entries = clients.map(client => ({
        startTime: new Date(`${dateStr}T${times[client].start}`),
        endTime: new Date(`${dateStr}T${times[client].end}`),
        description,
        trackerClient: client,
        customClient: client === 'other' ? customClients[client] : undefined,
      }));
      
      onSubmit(entries);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-wider">
            Allocate Time
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Total time: <span className="font-mono font-bold text-foreground">{startTime} → {endTime}</span>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setMode('percentage')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                mode === 'percentage'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
              )}
            >
              <Percent className="w-4 h-4" />
              <span className="font-medium text-sm">Percentage</span>
            </button>
            <button
              onClick={() => setMode('times')}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all',
                mode === 'times'
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
              )}
            >
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">Separate Times</span>
            </button>
          </div>

          {/* Client Allocations */}
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={cn('w-3 h-3 rounded-full', clientColors[client])} />
                  <span className="text-sm font-medium">
                    {client === 'other' && customClients[client] 
                      ? customClients[client] 
                      : TRACKER_CLIENT_LABELS[client]}
                  </span>
                </div>
                
                {mode === 'percentage' ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={percentages[client] || 0}
                      onChange={(e) => setPercentages({
                        ...percentages,
                        [client]: parseInt(e.target.value) || 0,
                      })}
                      className="w-20 font-mono text-center"
                    />
                    <span className="text-muted-foreground">%</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={cn('h-full rounded-full', clientColors[client])}
                        style={{ width: `${percentages[client] || 0}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={times[client]?.start || ''}
                        onChange={(e) => setTimes({
                          ...times,
                          [client]: { ...times[client], start: e.target.value },
                        })}
                        className="pl-10 font-mono"
                      />
                    </div>
                    <div className="relative">
                      <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="time"
                        value={times[client]?.end || ''}
                        onChange={(e) => setTimes({
                          ...times,
                          [client]: { ...times[client], end: e.target.value },
                        })}
                        className="pl-10 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {mode === 'percentage' && (
            <div className={cn(
              'text-sm font-mono text-center py-2 rounded',
              isValidPercentage ? 'text-green-600 bg-green-500/10' : 'text-destructive bg-destructive/10'
            )}>
              Total: {totalPercentage}% {isValidPercentage ? '✓' : '(must equal 100%)'}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={mode === 'percentage' && !isValidPercentage}
            className="w-full"
          >
            Create {clients.length} Entries
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
