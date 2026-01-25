import { useState, useEffect, useCallback } from 'react';
import { Countdown } from '@/types/calendar';
import { differenceInDays, differenceInMonths, differenceInYears, parseISO, startOfDay, addYears, addMonths } from 'date-fns';

const STORAGE_KEY = 'calendar-countdowns';

export interface CountdownDuration {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export const useCountdowns = () => {
  const [countdowns, setCountdowns] = useState<Countdown[]>([]);

  // Load countdowns from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCountdowns(JSON.parse(stored));
      } catch {
        console.error('Failed to parse countdowns');
      }
    }
  }, []);

  // Save countdowns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(countdowns));
  }, [countdowns]);

  const addCountdown = useCallback((countdown: Omit<Countdown, 'id' | 'createdAt'>) => {
    const newCountdown: Countdown = {
      ...countdown,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setCountdowns(prev => [...prev, newCountdown]);
    return newCountdown;
  }, []);

  const updateCountdown = useCallback((id: string, updates: Partial<Omit<Countdown, 'id' | 'createdAt'>>) => {
    setCountdowns(prev => prev.map(countdown => 
      countdown.id === id ? { ...countdown, ...updates } : countdown
    ));
  }, []);

  const deleteCountdown = useCallback((id: string) => {
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
    addCountdown,
    updateCountdown,
    deleteCountdown,
    getDaysRemaining,
    getDurationRemaining,
    getCountdownStatus,
  };
};
