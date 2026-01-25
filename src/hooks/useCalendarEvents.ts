import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, EVENT_CATEGORIES } from '@/types/calendar';

const STORAGE_KEY = 'calendar-events';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Load events from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEvents(JSON.parse(stored));
      } catch {
        console.error('Failed to parse calendar events');
      }
    }
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const addEvent = useCallback((event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => {
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  const getEventsForDate = useCallback((date: string): CalendarEvent[] => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(date);
      return checkDate >= eventStart && checkDate <= eventEnd;
    });
  }, [events]);

  const hasEventOnDate = useCallback((date: string): boolean => {
    return getEventsForDate(date).length > 0;
  }, [getEventsForDate]);

  const getCategoryColorForDate = useCallback((date: string): { bg: string; text: string } | null => {
    const eventsOnDate = getEventsForDate(date);
    if (eventsOnDate.length === 0) return null;
    
    // Priority order: blocked > financial > travel > work
    const priorityOrder = ['blocked', 'financial', 'travel', 'work'];
    const sortedEvents = [...eventsOnDate].sort((a, b) => 
      priorityOrder.indexOf(a.category) - priorityOrder.indexOf(b.category)
    );
    
    const category = EVENT_CATEGORIES.find(c => c.value === sortedEvents[0].category);
    return category ? { bg: category.color, text: category.textColor } : null;
  }, [getEventsForDate]);

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    hasEventOnDate,
    getCategoryColorForDate,
  };
};
