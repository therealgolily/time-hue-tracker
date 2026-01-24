import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientSelector } from './ClientSelector';
import { TrackerClient, ClientLiveSegment } from '@/types/clientTracker';
import { cn } from '@/lib/utils';

interface ClientTrackerLiveEntryFormProps {
  segments: ClientLiveSegment[];
  onSubmit: (entries: Array<{
    startTime: Date;
    endTime: Date;
    description: string;
    trackerClient: TrackerClient;
    customClient?: string;
  }>) => void;
  onCancel: () => void;
}

export const ClientTrackerLiveEntryForm = ({ segments, onSubmit, onCancel }: ClientTrackerLiveEntryFormProps) => {
  const [description, setDescription] = useState('');
  const [trackerClient, setTrackerClient] = useState<TrackerClient>('rosser-results');
  const [customClient, setCustomClient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;
    if (trackerClient === 'other' && !customClient.trim()) return;

    // Create entries for each segment
    const entries = segments.map(segment => ({
      startTime: segment.startTime,
      endTime: segment.endTime,
      description: segment.isBreak ? 'Break' : description.trim(),
      trackerClient,
      customClient: trackerClient === 'other' ? customClient.trim() : undefined,
    }));

    onSubmit(entries);
  };

  // Calculate total duration
  const totalSeconds = segments.reduce((acc, seg) => {
    return acc + Math.round((seg.endTime.getTime() - seg.startTime.getTime()) / 1000);
  }, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  const workSegments = segments.filter(s => !s.isBreak);
  const breakSegments = segments.filter(s => s.isBreak);

  const firstStart = segments.length > 0 ? segments[0].startTime : new Date();
  const lastEnd = segments.length > 0 ? segments[segments.length - 1].endTime : new Date();

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center p-6 overflow-auto">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Log Your Activity</h2>
          <div className="text-muted-foreground">
            <p className="font-mono">
              {format(firstStart, 'h:mm a')} → {format(lastEnd, 'h:mm a')}
            </p>
            <p className="text-sm mt-1">{durationStr} total</p>
          </div>
        </div>

        {/* Segment summary */}
        {segments.length > 1 && (
          <div className="glass-card p-4 space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Session breakdown:</p>
            <div className="space-y-1 text-sm">
              {segments.map((segment, idx) => {
                const segMins = Math.round((segment.endTime.getTime() - segment.startTime.getTime()) / 1000 / 60);
                return (
                  <div key={idx} className="flex items-center gap-2">
                    {segment.isBreak ? (
                      <Coffee className="w-3 h-3 text-energy-neutral" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                    <span className="font-mono text-muted-foreground">
                      {format(segment.startTime, 'h:mm a')} - {format(segment.endTime, 'h:mm a')}
                    </span>
                    <span className="text-muted-foreground/60">({segMins}m)</span>
                    {segment.isBreak && <span className="text-energy-neutral text-xs">break</span>}
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-border text-xs text-muted-foreground/60">
              {workSegments.length} work segment{workSegments.length !== 1 ? 's' : ''}, {breakSegments.length} break{breakSegments.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">What did you do?</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Client meeting, Project work..."
              className="bg-secondary border-border"
              autoFocus
              required
            />
            {breakSegments.length > 0 && (
              <p className="text-xs text-muted-foreground/60 mt-1">
                Break segments will be labeled as "Break"
              </p>
            )}
          </div>

          {/* Client Selection */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Client</label>
            <ClientSelector value={trackerClient} onChange={setTrackerClient} />
          </div>

          {/* Custom Client Input */}
          {trackerClient === 'other' && (
            <div className="fade-in">
              <Input
                type="text"
                value={customClient}
                onChange={(e) => setCustomClient(e.target.value)}
                placeholder="Enter client name..."
                className="bg-secondary border-border"
                required
              />
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-border text-muted-foreground hover:text-foreground"
          >
            Discard
          </Button>
          <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Save {segments.length > 1 ? `${segments.length} Entries` : 'Entry'}
          </Button>
        </div>
      </form>
    </div>
  );
};
