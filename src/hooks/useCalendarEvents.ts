import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, EVENT_CATEGORIES } from '@/types/calendar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useCalendarEvents = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load events from database on mount
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Failed to fetch calendar events:', error);
      } else {
        setEvents(data.map(event => ({
          id: event.id,
          title: event.title,
          startDate: event.start_date,
          endDate: event.end_date,
          category: event.category as CalendarEvent['category'],
          createdAt: event.created_at,
        })));
      }
      setLoading(false);
    };

    fetchEvents();
  }, [user]);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('calendar_events')
      .insert({
        user_id: user.id,
        title: event.title,
        start_date: event.startDate,
        end_date: event.endDate,
        category: event.category,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add calendar event:', error);
      return null;
    }

    const newEvent: CalendarEvent = {
      id: data.id,
      title: data.title,
      startDate: data.start_date,
      endDate: data.end_date,
      category: data.category as CalendarEvent['category'],
      createdAt: data.created_at,
    };

    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [user]);

  const updateEvent = useCallback(async (id: string, updates: Partial<Omit<CalendarEvent, 'id' | 'createdAt'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    const { error } = await supabase
      .from('calendar_events')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update calendar event:', error);
      return;
    }

    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete calendar event:', error);
      return;
    }

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
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    hasEventOnDate,
    getCategoryColorForDate,
  };
};
