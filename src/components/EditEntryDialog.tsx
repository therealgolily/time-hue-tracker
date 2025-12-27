import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, Briefcase, User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnergySelector } from './EnergySelector';
import { TimeEntry, EnergyLevel, Category, Client, CLIENT_LABELS } from '@/types/timeTracker';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EditEntryDialogProps {
  entry: TimeEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (entryId: string, updates: Omit<TimeEntry, 'id'>) => void;
}

export const EditEntryDialog = ({ entry, open, onOpenChange, onSave }: EditEntryDialogProps) => {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('neutral');
  const [category, setCategory] = useState<Category>('personal');
  const [client, setClient] = useState<Client | undefined>(undefined);
  const [customClient, setCustomClient] = useState('');

  // Reset form when entry changes
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && entry) {
      setStartTime(format(entry.startTime, 'HH:mm'));
      setEndTime(format(entry.endTime, 'HH:mm'));
      setDescription(entry.description);
      setEnergyLevel(entry.energyLevel);
      setCategory(entry.category);
      setClient(entry.client);
      setCustomClient(entry.customClient || '');
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entry || !startTime || !endTime || !description.trim()) return;
    if (category === 'work' && !client) return;
    if (category === 'work' && client === 'other' && !customClient.trim()) return;

    const dateStr = format(entry.startTime, 'yyyy-MM-dd');
    const start = new Date(`${dateStr}T${startTime}`);
    const end = new Date(`${dateStr}T${endTime}`);

    onSave(entry.id, {
      startTime: start,
      endTime: end,
      description: description.trim(),
      energyLevel,
      category,
      client: category === 'work' ? client : undefined,
      customClient: category === 'work' && client === 'other' ? customClient.trim() : undefined,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Entry</DialogTitle>
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
              placeholder="e.g., Deep work on project, Team meeting..."
              className="bg-secondary border-border"
              required
            />
          </div>

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
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
