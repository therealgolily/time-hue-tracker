import { useState } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
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
}

export const TimePickerDialog = ({
  open,
  onOpenChange,
  title,
  selectedDate,
  onConfirm,
}: TimePickerDialogProps) => {
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));

  const handleConfirm = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const dateTime = new Date(`${dateStr}T${time}`);
    onConfirm(dateTime);
    onOpenChange(false);
  };

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
