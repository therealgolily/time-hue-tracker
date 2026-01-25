import { LifeEvent } from '@/types/lifeTimeline';
import { TimelineEvent } from './TimelineEvent';
import { AddEventForm } from './AddEventForm';
import { useLifeEvents } from '@/hooks/useLifeEvents';
import { Loader2 } from 'lucide-react';

export const LifeTimeline = () => {
  const { events, loading, addEvent, updateEvent, deleteEvent } = useLifeEvents();

  // Count future vs past events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureCount = events.filter(e => new Date(e.eventDate) >= today).length;
  const pastCount = events.filter(e => new Date(e.eventDate) < today).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Add Event Form */}
      <div className="mb-8">
        <AddEventForm onAdd={addEvent} />
      </div>

      {/* Stats */}
      <div className="flex gap-6 mb-6 text-xs font-mono uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary" />
          <span>{futureCount} Future</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-foreground" />
          <span>{pastCount} Past</span>
        </div>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-foreground/20">
          <p className="text-muted-foreground font-mono text-sm">
            No events yet. Add your first life event above.
          </p>
        </div>
      ) : (
        <div className="relative">
          {events.map((event) => (
            <TimelineEvent
              key={event.id}
              event={event}
              onUpdate={updateEvent}
              onDelete={deleteEvent}
            />
          ))}
        </div>
      )}
    </div>
  );
};
