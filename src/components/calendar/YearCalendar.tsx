import { useMemo, useState } from 'react';
import { startOfYear, addMonths, format } from 'date-fns';
import { MiniMonth } from './MiniMonth';
import { EventModal } from './EventModal';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent, EventCategory, EVENT_CATEGORIES } from '@/types/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const YearCalendar = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const { events, addEvent, updateEvent, deleteEvent, getEventsForDate, hasEventOnDate, getCategoryColorForDate } =
    useCalendarEvents();

  const months = useMemo(() => {
    const yearStart = startOfYear(new Date(currentYear, 0, 1));
    return Array.from({ length: 12 }, (_, i) => addMonths(yearStart, i));
  }, [currentYear]);

  const handleDateClick = (date: string) => {
    const eventsOnDate = getEventsForDate(date);
    
    if (eventsOnDate.length > 0) {
      // Show existing event
      setSelectedEvent(eventsOnDate[0]);
    } else {
      setSelectedEvent(undefined);
    }
    
    setSelectedDate(date);
    setModalOpen(true);
  };

  const handleSaveEvent = (eventData: { title: string; startDate: string; endDate: string; category: EventCategory }) => {
    if (selectedEvent) {
      updateEvent(selectedEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
  };

  const handleDeleteEvent = (id: string) => {
    deleteEvent(id);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Year Navigation */}
      <div className="flex items-center justify-between border-b-2 border-foreground px-6 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentYear((y) => y - 1)}
          className="hover:bg-primary hover:text-primary-foreground border-2 border-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight">{currentYear}</h2>
          {/* Category Legend */}
          <div className="flex items-center justify-center gap-4 mt-2">
            {EVENT_CATEGORIES.map((cat) => (
              <div key={cat.value} className="flex items-center gap-1">
                <span
                  className="w-3 h-3 border border-foreground/20"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentYear((y) => y + 1)}
          className="hover:bg-primary hover:text-primary-foreground border-2 border-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Months Grid - 4x3 layout */}
      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {months.map((month) => (
            <MiniMonth
              key={format(month, 'yyyy-MM')}
              month={month}
              events={events}
              onDateClick={handleDateClick}
              hasEventOnDate={hasEventOnDate}
              getCategoryColorForDate={getCategoryColorForDate}
            />
          ))}
        </div>
      </div>

      {/* Event Modal */}
      {selectedDate && (
        <EventModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          selectedDate={selectedDate}
          existingEvent={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};
