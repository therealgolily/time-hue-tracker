import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
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

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  existingEvent?: CalendarEvent;
  onSave: (event: { title: string; startDate: string; endDate: string }) => void;
  onDelete?: (id: string) => void;
}

export const EventModal = ({
  open,
  onOpenChange,
  selectedDate,
  existingEvent,
  onSave,
  onDelete,
}: EventModalProps) => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    if (existingEvent) {
      setTitle(existingEvent.title);
      setStartDate(parseISO(existingEvent.startDate));
      setEndDate(parseISO(existingEvent.endDate));
    } else {
      setTitle('');
      setStartDate(parseISO(selectedDate));
      setEndDate(parseISO(selectedDate));
    }
  }, [existingEvent, selectedDate, open]);

  const handleSave = () => {
    if (!title.trim() || !startDate || !endDate) return;
    
    onSave({
      title: title.trim(),
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (existingEvent && onDelete) {
      onDelete(existingEvent.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-2 border-foreground bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold uppercase tracking-widest">
            {existingEvent ? 'Edit Event' : 'New Event'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="border-2 border-foreground"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-mono border-2 border-foreground',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2 border-foreground" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      if (date && endDate && date > endDate) {
                        setEndDate(date);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-mono border-2 border-foreground',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-2 border-foreground" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => startDate ? date < startDate : false}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {existingEvent && onDelete && (
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
            disabled={!title.trim() || !startDate || !endDate}
            className="bg-primary text-primary-foreground border-2 border-primary hover:bg-primary/90"
          >
            {existingEvent ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
