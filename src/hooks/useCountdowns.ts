import { useState, useEffect, useCallback } from 'react';
import { Countdown } from '@/types/calendar';
import { differenceInDays, differenceInMonths, differenceInYears, parseISO, startOfDay, addYears, addMonths } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CountdownDuration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export const useCountdowns = () => {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load countdowns from database on mount
  useEffect(() => {
    if (!user) {
      setCountdowns([]);
      setLoading(false);
      return;
    }

    const fetchCountdowns = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('countdowns')
        .select('*')
        .order('target_date', { ascending: true });

      if (error) {
        console.error('Failed to fetch countdowns:', error);
      } else {
        setCountdowns(data.map(countdown => ({
          id: countdown.id,
          title: countdown.title,
          targetDate: countdown.target_date,
          createdAt: countdown.created_at,
        })));
      }
      setLoading(false);
    };

    fetchCountdowns();
  }, [user]);

  const addCountdown = useCallback(async (countdown: Omit<Countdown, 'id' | 'createdAt'>) => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('countdowns')
      .insert({
        user_id: user.id,
        title: countdown.title,
        target_date: countdown.targetDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add countdown:', error);
      return null;
    }

    const newCountdown: Countdown = {
      id: data.id,
      title: data.title,
      targetDate: data.target_date,
      createdAt: data.created_at,
    };

    setCountdowns(prev => [...prev, newCountdown]);
    return newCountdown;
  }, [user]);

  const updateCountdown = useCallback(async (id: string, updates: Partial<Omit<Countdown, 'id' | 'createdAt'>>) => {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.targetDate !== undefined) dbUpdates.target_date = updates.targetDate;

    const { error } = await supabase
      .from('countdowns')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Failed to update countdown:', error);
      return;
    }

    setCountdowns(prev => prev.map(countdown => 
      countdown.id === id ? { ...countdown, ...updates } : countdown
    ));
  }, []);

  const deleteCountdown = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('countdowns')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete countdown:', error);
      return;
    }

    setCountdowns(prev => prev.filter(countdown => countdown.id !== id));
  }, []);

  const getDaysRemaining = useCallback((targetDate: string): number => {
    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(targetDate));
    return differenceInDays(target, today);
  }, []);

  const getDurationRemaining = useCallback((targetDate: string): CountdownDuration => {
    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(targetDate));
    
    const totalDays = differenceInDays(target, today);
    
    if (totalDays <= 0) {
      return { years: 0, months: 0, days: totalDays, totalDays };
    }
    
    // Calculate years
    const years = differenceInYears(target, today);
    let remaining = addYears(today, years);
    
    // Calculate months after years
    const months = differenceInMonths(target, remaining);
    remaining = addMonths(remaining, months);
    
    // Calculate remaining days
    const days = differenceInDays(target, remaining);
    
    return { years, months, days, totalDays };
  }, []);

  const getCountdownStatus = useCallback((targetDate: string): 'upcoming' | 'today' | 'passed' => {
    const days = getDaysRemaining(targetDate);
    if (days > 0) return 'upcoming';
    if (days === 0) return 'today';
    return 'passed';
  }, [getDaysRemaining]);

  // Sort countdowns: today first, then upcoming by days remaining, then passed
  const sortedCountdowns = [...countdowns].sort((a, b) => {
    const statusA = getCountdownStatus(a.targetDate);
    const statusB = getCountdownStatus(b.targetDate);
    
    const statusOrder = { today: 0, upcoming: 1, passed: 2 };
    if (statusOrder[statusA] !== statusOrder[statusB]) {
      return statusOrder[statusA] - statusOrder[statusB];
    }
    
    return getDaysRemaining(a.targetDate) - getDaysRemaining(b.targetDate);
  });

  return {
    countdowns: sortedCountdowns,
    loading,
    addCountdown,
    updateCountdown,
    deleteCountdown,
    getDaysRemaining,
    getDurationRemaining,
    getCountdownStatus,
  };
};
