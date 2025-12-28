import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Clock, Briefcase, User, ArrowRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnergySelector } from './EnergySelector';
import { EnergyLevel, Category, Client, CLIENT_LABELS, TimeEntry } from '@/types/timeTracker';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddEntryFormProps {
  selectedDate: Date;
  entries?: TimeEntry[];
  onAddEntry: (entry: {
    startTime: Date;
    endTime: Date;
    description: string;
    energyLevel: EnergyLevel;
    category: Category;
    client?: Client;
    customClient?: string;
  }) => void;
}

export const AddEntryForm = ({ selectedDate, entries = [], onAddEntry }: AddEntryFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('neutral');
  const [category, setCategory] = useState<Category>('personal');
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [customClient, setCustomClient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime || !description.trim()) return;
    if (category === 'work' && !client) return;
    if (category === 'work' && client === 'other' && !customClient.trim()) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const start = new Date(`${dateStr}T${startTime}`);
    const end = new Date(`${dateStr}T${endTime}`);

    onAddEntry({
      startTime: start,
      endTime: end,
      description: description.trim(),
      energyLevel,
      category,
      client: category === 'work' ? client : undefined,
      customClient: category === 'work' && client === 'other' ? customClient.trim() : undefined,
    });

    // Reset form
    setStartTime('');
    setEndTime('');
    setDescription('');
    setEnergyLevel('neutral');
    setCategory('personal');
    setClient(undefined);
    setCustomClient('');
    setIsExpanded(false);
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200 flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add time entry</span>
      </button>
    );
  }

  return (
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
          placeholder="e.g., Deep work on project, Team meeting..."
          className="bg-secondary border-border"
          required
        />
      </div>

      {/* Category Selection */}
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Category</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setCategory('personal');
              setClient(undefined);
              setCustomClient('');
            }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200',
              category === 'personal'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
            )}
          >
            <User className="w-4 h-4" />
            <span className="font-medium">Personal</span>
          </button>
          <button
            type="button"
            onClick={() => setCategory('work')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200',
              category === 'work'
                ? 'border-primary bg-primary/10 text-foreground'
                : 'border-border bg-secondary text-muted-foreground hover:border-primary/50'
            )}
          >
            <Briefcase className="w-4 h-4" />
            <span className="font-medium">Work</span>
          </button>
        </div>
      </div>

      {/* Client Selection (only for work) */}
      {category === 'work' && (
        <div className="space-y-3 fade-in">
          <label className="text-sm text-muted-foreground block">Client</label>
          <Select
            value={client}
            onValueChange={(value) => setClient(value as Client)}
          >
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue placeholder="Select a client..." />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {(Object.keys(CLIENT_LABELS) as Client[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {CLIENT_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {client === 'other' && (
            <Input
              type="text"
              value={customClient}
              onChange={(e) => setCustomClient(e.target.value)}
              placeholder="Enter client name..."
              className="bg-secondary border-border"
              required
            />
          )}
        </div>
      )}

      <div>
        <label className="text-sm text-muted-foreground mb-2 block">How did it affect your energy?</label>
        <EnergySelector value={energyLevel} onChange={setEnergyLevel} />
      </div>

      <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        <Plus className="w-4 h-4 mr-2" />
        Add Entry
      </Button>
    </form>
  );
};
