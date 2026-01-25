import { useState, useEffect, useCallback, useMemo } from 'react';
import { LifeEvent } from '@/types/lifeTimeline';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useLifeEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<LifeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('life_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (error) {
        console.error('Failed to fetch life events:', error);
        setLoading(false);
      } else {
        setEvents(data.map(event => ({
          id: event.id,
          title: event.title,
          eventDate: event.event_date,
          createdAt: event.created_at,
        })));
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const addEvent = useCallback(async (event: Omit<LifeEvent, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('life_events')
      .insert({
        user_id: user.id,
        title: event.title,
        event_date: event.eventDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add life event:', error);
      return null;
    }

    const newEvent: LifeEvent = {
      id: data.id,
      title: data.title,
      eventDate: data.event_date,
      createdAt: data.created_at,
    };

    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  }, [user]);

  const updateEvent = useCallback(async (id: string, updates: Partial<Omit<LifeEvent, 'id' | 'createdAt'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.eventDate !== undefined) dbUpdates.event_date = updates.eventDate;

    const { error } = await supabase
      .from('life_events')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update life event:', error);
      return;
    }

    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('life_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete life event:', error);
      return;
    }

    setEvents(prev => prev.filter(event => event.id !== id));
  }, []);

  // Sort events: future first (furthest to nearest), then past (newest to oldest)
  const sortedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const futureEvents = events
      .filter(e => new Date(e.eventDate) >= today)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    
    const pastEvents = events
      .filter(e => new Date(e.eventDate) < today)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    
    return [...futureEvents, ...pastEvents];
  }, [events]);

  return {
    events: sortedEvents,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
  };
};
