import { useState, useEffect, useCallback } from 'react';
import { TimeDuration } from '@/types/lifeTimeline';
import { differenceInDays, differenceInMonths, differenceInYears, parseISO, startOfDay, addYears, addMonths } from 'date-fns';

export const useLiveTimeDuration = (eventDate: string): TimeDuration => {
  const calculateDuration = useCallback((): TimeDuration => {
    const today = startOfDay(new Date());
    const target = startOfDay(parseISO(eventDate));
    const isPast = target < today;
    
    const start = isPast ? target : today;
    const end = isPast ? today : target;
    
    // Calculate years
    const years = differenceInYears(end, start);
    let remaining = addYears(start, years);
    
    // Calculate months after years
    const months = differenceInMonths(end, remaining);
    remaining = addMonths(remaining, months);
    
    // Calculate remaining days
    const days = differenceInDays(end, remaining);
    
    return { years, months, days, isPast };
  }, [eventDate]);

  const [duration, setDuration] = useState<TimeDuration>(calculateDuration);

  useEffect(() => {
    // Update immediately
    setDuration(calculateDuration());

    // Update every second for live ticking effect
    const interval = setInterval(() => {
      setDuration(calculateDuration());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateDuration]);

  return duration;
};

export const formatDuration = (duration: TimeDuration): string => {
  const parts: string[] = [];
  
  if (duration.years > 0) {
    parts.push(`${duration.years} ${duration.years === 1 ? 'year' : 'years'}`);
  }
  if (duration.months > 0) {
    parts.push(`${duration.months} ${duration.months === 1 ? 'month' : 'months'}`);
  }
  if (duration.days > 0 || parts.length === 0) {
    parts.push(`${duration.days} ${duration.days === 1 ? 'day' : 'days'}`);
  }
  
  return parts.join(', ');
};
