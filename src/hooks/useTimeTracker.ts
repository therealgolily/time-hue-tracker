import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { DayData, TimeEntry, EnergyLevel } from '@/types/timeTracker';

const STORAGE_KEY = 'energy-tracker-data';

const getDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

const loadData = (): Record<string, DayData> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      Object.keys(parsed).forEach(key => {
        const day = parsed[key];
        if (day.wakeTime) day.wakeTime = new Date(day.wakeTime);
        if (day.sleepTime) day.sleepTime = new Date(day.sleepTime);
        day.entries = day.entries.map((entry: any) => ({
          ...entry,
          startTime: new Date(entry.startTime),
          endTime: new Date(entry.endTime),
        }));
      });
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return {};
};

const saveData = (data: Record<string, DayData>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data:', e);
  }
};

export const useTimeTracker = () => {
  const [data, setData] = useState<Record<string, DayData>>(loadData);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    saveData(data);
  }, [data]);

  const getDayData = useCallback((date: Date): DayData => {
    const key = getDateKey(date);
    return data[key] || {
      date: key,
      wakeTime: null,
      sleepTime: null,
      entries: [],
    };
  }, [data]);

  const setWakeTime = useCallback((date: Date, time: Date) => {
    const key = getDateKey(date);
    setData(prev => ({
      ...prev,
      [key]: {
        ...getDayData(date),
        wakeTime: time,
      },
    }));
  }, [getDayData]);

  const setSleepTime = useCallback((date: Date, time: Date) => {
    const key = getDateKey(date);
    setData(prev => ({
      ...prev,
      [key]: {
        ...getDayData(date),
        sleepTime: time,
      },
    }));
  }, [getDayData]);

  const addEntry = useCallback((date: Date, entry: Omit<TimeEntry, 'id'>) => {
    const key = getDateKey(date);
    const newEntry: TimeEntry = {
      ...entry,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      [key]: {
        ...getDayData(date),
        entries: [...getDayData(date).entries, newEntry].sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        ),
      },
    }));
  }, [getDayData]);

  const updateEntry = useCallback((date: Date, entryId: string, updates: Partial<TimeEntry>) => {
    const key = getDateKey(date);
    setData(prev => ({
      ...prev,
      [key]: {
        ...getDayData(date),
        entries: getDayData(date).entries.map(e =>
          e.id === entryId ? { ...e, ...updates } : e
        ),
      },
    }));
  }, [getDayData]);

  const deleteEntry = useCallback((date: Date, entryId: string) => {
    const key = getDateKey(date);
    setData(prev => ({
      ...prev,
      [key]: {
        ...getDayData(date),
        entries: getDayData(date).entries.filter(e => e.id !== entryId),
      },
    }));
  }, [getDayData]);

  return {
    selectedDate,
    setSelectedDate,
    getDayData,
    setWakeTime,
    setSleepTime,
    addEntry,
    updateEntry,
    deleteEntry,
  };
};
