import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientSelector } from './ClientSelector';
import { ClientTimeEntry, TrackerClient } from '@/types/clientTracker';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface ClientTrackerEditEntryDialogProps {
  entry: ClientTimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entryId: string, updates: Omit<ClientTimeEntry, 'id'>) => void;
}

export const ClientTrackerEditEntryDialog = ({ entry, open, onOpenChange, onSave }: ClientTrackerEditEntryDialogProps) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [trackerClient, setTrackerClient] = useState<TrackerClient>('rosser-results');
  const [customClient, setCustomClient] = useState('');

  // Initialize form when entry changes or dialog opens
  useEffect(() => {
    if (open && entry) {
      setStartTime(format(entry.startTime, 'HH:mm'));
      setEndTime(format(entry.endTime, 'HH:mm'));
      setDescription(entry.description);
      setTrackerClient(entry.trackerClient);
      setCustomClient(entry.customClient || '');
    }
  }, [open, entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entry || !startTime || !endTime || !description.trim()) return;
    if (trackerClient === 'other' && !customClient.trim()) return;

    const dateStr = format(entry.startTime, 'yyyy-MM-dd');
    const start = new Date(`${dateStr}T${startTime}`);
    const end = new Date(`${dateStr}T${endTime}`);

    onSave(entry.id, {
      startTime: start,
      endTime: end,
      description: description.trim(),
      trackerClient,
      customClient: trackerClient === 'other' ? customClient.trim() : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Entry</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Modify any field below and save your changes.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Start time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10 bg-secondary border-border font-mono"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">End time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-10 bg-secondary border-border font-mono"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">What did you do?</label>
            <Input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Client meeting, Project work..."
              className="bg-secondary border-border"
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Client</label>
            <ClientSelector value={trackerClient} onChange={setTrackerClient} size="sm" />
          </div>

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

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
