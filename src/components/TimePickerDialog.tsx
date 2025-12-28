import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Clock, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TimePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  selectedDate: Date;
  onConfirm: (time: Date) => void;
  wakeTime?: Date | null; // For sleep time detection
  isSleepTime?: boolean;
}

export const TimePickerDialog = ({
  open,
  onOpenChange,
  title,
  selectedDate,
  onConfirm,
  wakeTime,
  isSleepTime = false,
}: TimePickerDialogProps) => {
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));

  // Detect if selected time is past midnight (earlier than wake time)
  const isPastMidnight = (): boolean => {
    if (!isSleepTime || !wakeTime) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const wakeHours = wakeTime.getHours();
    const wakeMinutes = wakeTime.getMinutes();
    
    // If sleep time is earlier than wake time, it's past midnight
    // e.g., wake at 07:00, sleep at 01:00 → past midnight
    const sleepMinutesFromMidnight = hours * 60 + minutes;
    const wakeMinutesFromMidnight = wakeHours * 60 + wakeMinutes;
    
    return sleepMinutesFromMidnight < wakeMinutesFromMidnight;
  };

  const handleConfirm = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let dateTime = new Date(`${dateStr}T${time}`);
    
    // If past midnight detected, add a day to the date
    if (isPastMidnight()) {
      dateTime = addDays(dateTime, 1);
    }
    
    onConfirm(dateTime);
    onOpenChange(false);
  };

  const pastMidnight = isPastMidnight();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-12 h-14 text-2xl font-mono bg-secondary border-border text-center"
            />
          </div>
          
          {pastMidnight && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">
                This will be recorded as {format(addDays(selectedDate, 1), 'MMM d')} (past midnight)
              </span>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};