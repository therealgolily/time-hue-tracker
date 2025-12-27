import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { DayData, TimeEntry, Category, Client, EnergyLevel } from '@/types/timeTracker';
import { toast } from 'sonner';

const getDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export const useCloudTimeTracker = (userId: string | null) => {
  const [data, setData] = useState<Record<string, DayData>>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data for the user
  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch day data
      const { data: dayDataRows, error: dayError } = await supabase
        .from('day_data')
        .select('*')
        .eq('user_id', userId);

      if (dayError) throw dayError;

      // Fetch time entries
      const { data: entriesRows, error: entriesError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', userId);

      if (entriesError) throw entriesError;

      // Build the data structure
      const newData: Record<string, DayData> = {};

      // Process day data
      dayDataRows?.forEach((row) => {
        newData[row.date] = {
          date: row.date,
          wakeTime: row.wake_time ? new Date(row.wake_time) : null,
          sleepTime: row.sleep_time ? new Date(row.sleep_time) : null,
          entries: [],
        };
      });

      // Process entries
      entriesRows?.forEach((row) => {
        const dateKey = row.date;
        if (!newData[dateKey]) {
          newData[dateKey] = {
            date: dateKey,
            wakeTime: null,
            sleepTime: null,
            entries: [],
          };
        }
        newData[dateKey].entries.push({
          id: row.id,
          startTime: new Date(row.start_time),
          endTime: new Date(row.end_time),
          description: row.description,
          energyLevel: row.energy_level as EnergyLevel,
          category: row.category as Category,
          client: row.client as Client | undefined,
          customClient: row.custom_client || undefined,
        });
      });

      // Sort entries by start time
      Object.keys(newData).forEach((key) => {
        newData[key].entries.sort(
          (a, b) => a.startTime.getTime() - b.startTime.getTime()
        );
      });

      setData(newData);
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getDayData = useCallback(
    (date: Date): DayData => {
      const key = getDateKey(date);
      return (
        data[key] || {
          date: key,
          wakeTime: null,
          sleepTime: null,
          entries: [],
        }
      );
    },
    [data]
  );

  const setWakeTime = useCallback(
    async (date: Date, time: Date) => {
      if (!userId) return;

      const key = getDateKey(date);

      try {
        const { error } = await supabase.from('day_data').upsert(
          {
            user_id: userId,
            date: key,
            wake_time: time.toISOString(),
            sleep_time: data[key]?.sleepTime?.toISOString() || null,
          },
          { onConflict: 'user_id,date' }
        );

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [key]: {
            ...getDayData(date),
            wakeTime: time,
          },
        }));
        setLastSaved(new Date());
      } catch (error: any) {
        console.error('Error setting wake time:', error);
        toast.error('Failed to save wake time');
      }
    },
    [userId, data, getDayData]
  );

  const setSleepTime = useCallback(
    async (date: Date, time: Date) => {
      if (!userId) return;

      const key = getDateKey(date);

      try {
        const { error } = await supabase.from('day_data').upsert(
          {
            user_id: userId,
            date: key,
            wake_time: data[key]?.wakeTime?.toISOString() || null,
            sleep_time: time.toISOString(),
          },
          { onConflict: 'user_id,date' }
        );

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [key]: {
            ...getDayData(date),
            sleepTime: time,
          },
        }));
        setLastSaved(new Date());
      } catch (error: any) {
        console.error('Error setting sleep time:', error);
        toast.error('Failed to save sleep time');
      }
    },
    [userId, data, getDayData]
  );

  const addEntry = useCallback(
    async (date: Date, entry: Omit<TimeEntry, 'id'>) => {
      if (!userId) return;

      const key = getDateKey(date);

      try {
        const { data: newEntry, error } = await supabase
          .from('time_entries')
          .insert({
            user_id: userId,
            date: key,
            start_time: entry.startTime.toISOString(),
            end_time: entry.endTime.toISOString(),
            description: entry.description,
            energy_level: entry.energyLevel,
            category: entry.category,
            client: entry.client || null,
            custom_client: entry.customClient || null,
          })
          .select()
          .single();

        if (error) throw error;

        const fullEntry: TimeEntry = {
          id: newEntry.id,
          startTime: new Date(newEntry.start_time),
          endTime: new Date(newEntry.end_time),
          description: newEntry.description,
          energyLevel: newEntry.energy_level as EnergyLevel,
          category: newEntry.category as Category,
          client: newEntry.client as Client | undefined,
          customClient: newEntry.custom_client || undefined,
        };

        setData((prev) => ({
          ...prev,
          [key]: {
            ...getDayData(date),
            entries: [...getDayData(date).entries, fullEntry].sort(
              (a, b) => a.startTime.getTime() - b.startTime.getTime()
            ),
          },
        }));
        setLastSaved(new Date());
        toast.success('Entry saved');
      } catch (error: any) {
        console.error('Error adding entry:', error);
        toast.error('Failed to save entry');
      }
    },
    [userId, getDayData]
  );

  const deleteEntry = useCallback(
    async (date: Date, entryId: string) => {
      if (!userId) return;

      const key = getDateKey(date);

      try {
        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', entryId);

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [key]: {
            ...getDayData(date),
            entries: getDayData(date).entries.filter((e) => e.id !== entryId),
          },
        }));
        setLastSaved(new Date());
        toast.success('Entry deleted');
      } catch (error: any) {
        console.error('Error deleting entry:', error);
        toast.error('Failed to delete entry');
      }
    },
    [userId, getDayData]
  );

  const updateEntry = useCallback(
    async (date: Date, entryId: string, updates: Omit<TimeEntry, 'id'>) => {
      if (!userId) return;

      const key = getDateKey(date);

      try {
        const { error } = await supabase
          .from('time_entries')
          .update({
            start_time: updates.startTime.toISOString(),
            end_time: updates.endTime.toISOString(),
            description: updates.description,
            energy_level: updates.energyLevel,
            category: updates.category,
            client: updates.client || null,
            custom_client: updates.customClient || null,
          })
          .eq('id', entryId);

        if (error) throw error;

        const updatedEntry: TimeEntry = {
          id: entryId,
          ...updates,
        };

        setData((prev) => ({
          ...prev,
          [key]: {
            ...getDayData(date),
            entries: getDayData(date)
              .entries.map((e) => (e.id === entryId ? updatedEntry : e))
              .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()),
          },
        }));
        setLastSaved(new Date());
        toast.success('Entry updated');
      } catch (error: any) {
        console.error('Error updating entry:', error);
        toast.error('Failed to update entry');
      }
    },
    [userId, getDayData]
  );

  return {
    selectedDate,
    setSelectedDate,
    getDayData,
    setWakeTime,
    setSleepTime,
    addEntry,
    deleteEntry,
    updateEntry,
    lastSaved,
    isLoading,
  };
};
