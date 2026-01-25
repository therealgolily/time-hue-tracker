import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface AddEventFormProps {
  onAdd: (event: { title: string; eventDate: string }) => Promise<unknown>;
}

export const AddEventForm = ({ onAdd }: AddEventFormProps) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    await onAdd({ title: title.trim(), eventDate: date });
    setTitle('');
    setDate('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 border-foreground p-4 bg-background">
      <h2 className="text-xs font-bold uppercase tracking-widest mb-4">Add Event</h2>
      
      <div className="space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          className="border-2 border-foreground rounded-none font-medium"
          required
        />
        
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border-2 border-foreground rounded-none font-mono"
          required
        />
        
        <Button
          type="submit"
          disabled={isSubmitting || !title.trim() || !date}
          className="w-full rounded-none border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wider"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>
    </form>
  );
};
