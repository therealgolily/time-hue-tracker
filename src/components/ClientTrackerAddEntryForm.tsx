import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Clock, ArrowRight, Timer, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ClientSelector } from './ClientSelector';
import { MultiClientSelector } from './MultiClientSelector';
import { MultiClientTimeAllocation } from './MultiClientTimeAllocation';
import { TrackerClient, TRACKER_CLIENT_LABELS, ClientTimeEntry } from '@/types/clientTracker';
import { cn } from '@/lib/utils';

interface ClientTrackerAddEntryFormProps {
  selectedDate: Date;
  entries?: ClientTimeEntry[];
  onAddEntry: (entry: {
    startTime: Date;
    endTime: Date;
    description: string;
    trackerClient: TrackerClient;
    customClient?: string;
  }) => void;
  className?: string;
}

export const ClientTrackerAddEntryForm = ({ selectedDate, entries = [], onAddEntry, className }: ClientTrackerAddEntryFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [isMultiClient, setIsMultiClient] = useState(false);
  const [trackerClient, setTrackerClient] = useState<TrackerClient>('rosser-results');
  const [selectedClients, setSelectedClients] = useState<TrackerClient[]>([]);
  const [customClient, setCustomClient] = useState('');
  const [customClients, setCustomClients] = useState<Record<TrackerClient, string>>({} as Record<TrackerClient, string>);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime || !description.trim()) return;
    
    if (isMultiClient) {
      if (selectedClients.length === 0) return;
      if (selectedClients.includes('other') && !customClients['other']?.trim()) return;
      
      // Show allocation dialog for multiple clients
      if (selectedClients.length > 1) {
        setShowAllocationDialog(true);
        return;
      }
      
      // Single client selected in multi-client mode
      const client = selectedClients[0];
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const start = new Date(`${dateStr}T${startTime}`);
      const end = new Date(`${dateStr}T${endTime}`);

      onAddEntry({
        startTime: start,
        endTime: end,
        description: description.trim(),
        trackerClient: client,
        customClient: client === 'other' ? customClients['other']?.trim() : undefined,
      });
    } else {
      if (trackerClient === 'other' && !customClient.trim()) return;

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const start = new Date(`${dateStr}T${startTime}`);
      const end = new Date(`${dateStr}T${endTime}`);

      onAddEntry({
        startTime: start,
        endTime: end,
        description: description.trim(),
        trackerClient,
        customClient: trackerClient === 'other' ? customClient.trim() : undefined,
      });
    }

    // Reset form
    resetForm();
  };

  const handleMultiClientSubmit = (entries: Array<{
    startTime: Date;
    endTime: Date;
    description: string;
    trackerClient: TrackerClient;
    customClient?: string;
  }>) => {
    entries.forEach(entry => onAddEntry(entry));
    resetForm();
  };

  const resetForm = () => {
    setStartTime('');
    setEndTime('');
    setDescription('');
    setTrackerClient('rosser-results');
    setSelectedClients([]);
    setCustomClient('');
    setCustomClients({} as Record<TrackerClient, string>);
    setIsExpanded(false);
    setIsMultiClient(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground",
          className
        )}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add time entry</span>
      </button>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4 slide-up">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-foreground">New Entry</h3>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Start time</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pl-10 pr-20 bg-secondary border-border font-mono"
                required
              />
              {entries.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    const sortedEntries = [...entries].sort(
                      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
                    );
                    const lastEntry = sortedEntries[0];
                    if (lastEntry) {
                      setStartTime(format(new Date(lastEntry.endTime), 'HH:mm'));
                    }
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                  title="Set to last entry's end time"
                >
                  <ArrowRight className="w-3 h-3" />
                  Last
                </button>
              )}
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
                className="pl-10 pr-16 bg-secondary border-border font-mono"
                required
              />
              <button
                type="button"
                onClick={() => setEndTime(format(new Date(), 'HH:mm'))}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                title="Set to current time"
              >
                <Timer className="w-3 h-3" />
                Now
              </button>
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

        {/* Client Selection Mode Toggle */}
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <button
            type="button"
            onClick={() => setIsMultiClient(false)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
              !isMultiClient
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            Single Client
          </button>
          <button
            type="button"
            onClick={() => setIsMultiClient(true)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1',
              isMultiClient
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            )}
          >
            <Users className="w-3 h-3" />
            Multiple Clients
          </button>
        </div>

        {/* Client Selection */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            {isMultiClient ? 'Select Clients' : 'Client'}
          </label>
          {isMultiClient ? (
            <MultiClientSelector 
              value={selectedClients} 
              onChange={setSelectedClients} 
            />
          ) : (
            <ClientSelector value={trackerClient} onChange={setTrackerClient} />
          )}
        </div>

        {/* Custom Client Input for single client mode */}
        {!isMultiClient && trackerClient === 'other' && (
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

        {/* Custom Client Input for multi-client mode when 'other' is selected */}
        {isMultiClient && selectedClients.includes('other') && (
          <div className="fade-in">
            <label className="text-sm text-muted-foreground mb-2 block">Custom Client Name</label>
            <Input
              type="text"
              value={customClients['other'] || ''}
              onChange={(e) => setCustomClients({ ...customClients, other: e.target.value })}
              placeholder="Enter client name for 'Other'..."
              className="bg-secondary border-border"
              required
            />
          </div>
        )}

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" />
          {isMultiClient && selectedClients.length > 1 ? 'Allocate Time' : 'Add Entry'}
        </Button>
      </form>

      <MultiClientTimeAllocation
        open={showAllocationDialog}
        onOpenChange={setShowAllocationDialog}
        clients={selectedClients}
        startTime={startTime}
        endTime={endTime}
        description={description}
        selectedDate={selectedDate}
        customClients={customClients}
        onSubmit={handleMultiClientSubmit}
      />
    </>
  );
};
