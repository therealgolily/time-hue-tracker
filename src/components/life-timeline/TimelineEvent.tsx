import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { LifeEvent } from '@/types/lifeTimeline';
import { useLiveTimeDuration, formatDuration } from '@/hooks/useLiveTimeDuration';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TimelineEventProps {
  event: LifeEvent;
  onUpdate: (id: string, updates: Partial<Omit<LifeEvent, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
}

export const TimelineEvent = ({ event, onUpdate, onDelete }: TimelineEventProps) => {
  const duration = useLiveTimeDuration(event.eventDate);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(event.title);
  const [editDate, setEditDate] = useState(event.eventDate);

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(event.id, { title: editTitle.trim(), eventDate: editDate });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(event.title);
    setEditDate(event.eventDate);
    setIsEditing(false);
  };

  const formattedDate = format(parseISO(event.eventDate), 'MMMM d, yyyy');
  const isToday = duration.years === 0 && duration.months === 0 && duration.days === 0;

  return (
    <div className="relative flex gap-6 pb-8 group">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-foreground/20" />
      
      {/* Marker */}
      <div 
        className={cn(
          "relative z-10 w-6 h-6 border-2 flex-shrink-0 transition-all",
          duration.isPast 
            ? "bg-foreground border-foreground" 
            : "bg-primary border-primary",
          isToday && "ring-4 ring-primary/30"
        )}
      />
      
      {/* Content */}
      <div className="flex-1 min-w-0 -mt-1">
        {isEditing ? (
          <div className="space-y-3 border-2 border-foreground p-4 bg-background">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="border-2 border-foreground rounded-none font-medium"
              placeholder="Event title"
              autoFocus
            />
            <Input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="border-2 border-foreground rounded-none font-mono"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                className="rounded-none border-2 border-primary bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                className="rounded-none border-2 border-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-bold uppercase tracking-wide leading-tight">
                {event.title}
              </h3>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-muted transition-colors"
                  aria-label="Edit event"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(event.id)}
                  className="p-1 hover:bg-destructive/10 hover:text-destructive transition-colors"
                  aria-label="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-sm font-mono text-muted-foreground">
              {formattedDate}
            </p>
            
            <div className={cn(
              "text-base font-mono font-medium",
              duration.isPast ? "text-foreground" : "text-primary"
            )}>
              {isToday ? (
                <span className="text-primary font-bold">TODAY</span>
              ) : (
                <>
                  {formatDuration(duration)}
                  <span className="text-muted-foreground ml-2">
                    {duration.isPast ? 'ago' : 'away'}
                  </span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
