import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Countdown } from '@/types/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingCountdown?: Countdown;
  onSave: (countdown: { title: string; targetDate: string }) => void;
  onDelete?: (id: string) => void;
}

export const CountdownModal = ({
  open,
  onOpenChange,
  existingCountdown,
  onSave,
  onDelete,
}: CountdownModalProps) => {
  const [title, setTitle] = useState('');
  const [targetDate, setTargetDate] = useState<Date | undefined>();

  useEffect(() => {
    if (existingCountdown) {
      setTitle(existingCountdown.title);
      setTargetDate(parseISO(existingCountdown.targetDate));
    } else {
      setTitle('');
      setTargetDate(undefined);
    }
  }, [existingCountdown, open]);

  const handleSave = () => {
    if (!title.trim() || !targetDate) return;
    
    onSave({
      title: title.trim(),
      targetDate: format(targetDate, 'yyyy-MM-dd'),
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (existingCountdown && onDelete) {
      onDelete(existingCountdown.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-widest">
            {existingCountdown ? 'Edit Countdown' : 'New Countdown'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="countdown-title" className="text-xs font-bold uppercase tracking-widest">
              Title
            </Label>
            <Input
              id="countdown-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you counting down to?"
              className="border-2 border-foreground"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest">Target Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-mono border-2 border-foreground',
                    !targetDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {targetDate ? format(targetDate, 'MMMM d, yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-2 border-foreground" align="start">
                <Calendar
                  mode="single"
                  selected={targetDate}
                  onSelect={setTargetDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {existingCountdown && onDelete && (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 border-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!title.trim() || !targetDate}
            className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90"
          >
            {existingCountdown ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
