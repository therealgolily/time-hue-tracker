import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnergySelector } from './EnergySelector';
import { EnergyLevel } from '@/types/timeTracker';
import { cn } from '@/lib/utils';

interface AddEntryFormProps {
  selectedDate: Date;
  onAddEntry: (entry: {
    startTime: Date;
    endTime: Date;
    description: string;
    energyLevel: EnergyLevel;
  }) => void;
}

export const AddEntryForm = ({ selectedDate, onAddEntry }: AddEntryFormProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>('neutral');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startTime || !endTime || !description.trim()) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const start = new Date(`${dateStr}T${startTime}`);
    const end = new Date(`${dateStr}T${endTime}`);

    onAddEntry({
      startTime: start,
      endTime: end,
      description: description.trim(),
      energyLevel,
    });

    // Reset form
    setStartTime('');
    setEndTime('');
    setDescription('');
    setEnergyLevel('neutral');
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
