import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ClientDayData, ClientTimeEntry, TrackerClient } from '@/types/clientTracker';
import { supabase } from '@/integrations/supabase/client';

const getDateKey = (date: Date): string => format(date, 'yyyy-MM-dd');

export const useCloudClientTracker = (userId: string | null) => {
  const [data, setData] = useState<Record<string, ClientDayData>>({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from Supabase
  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch day data
      const { data: dayDataRows, error: dayError } = await supabase
        .from('client_day_data')
        .select('*')
        .eq('user_id', userId);

      if (dayError) throw dayError;

      // Fetch time entries
      const { data: entriesRows, error: entriesError } = await supabase
        .from('client_time_entries')
        .select('*')
        .eq('user_id', userId);

      if (entriesError) throw entriesError;

      // Build local data structure
      const newData: Record<string, ClientDayData> = {};

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
          trackerClient: row.tracker_client as TrackerClient,
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
    } catch (error) {
      console.error('Error fetching client tracker data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getDayData = useCallback(
    (date: Date): ClientDayData => {
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

      const dateKey = getDateKey(date);

      try {
        const { error } = await supabase
          .from('client_day_data')
          .upsert(
            {
              user_id: userId,
              date: dateKey,
              wake_time: time.toISOString(),
            },
            { onConflict: 'user_id,date' }
          );

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            wakeTime: time,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error setting wake time:', error);
      }
    },
    [userId, getDayData]
  );

  const setSleepTime = useCallback(
    async (date: Date, time: Date) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const { error } = await supabase
          .from('client_day_data')
          .upsert(
            {
              user_id: userId,
              date: dateKey,
              sleep_time: time.toISOString(),
            },
            { onConflict: 'user_id,date' }
          );

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            sleepTime: time,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error setting sleep time:', error);
      }
    },
    [userId, getDayData]
  );

  const clearWakeTime = useCallback(
    async (date: Date) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const { error } = await supabase
          .from('client_day_data')
          .update({ wake_time: null })
          .eq('user_id', userId)
          .eq('date', dateKey);

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            wakeTime: null,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error clearing wake time:', error);
      }
    },
    [userId, getDayData]
  );

  const clearSleepTime = useCallback(
    async (date: Date) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const { error } = await supabase
          .from('client_day_data')
          .update({ sleep_time: null })
          .eq('user_id', userId)
          .eq('date', dateKey);

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            sleepTime: null,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error clearing sleep time:', error);
      }
    },
    [userId, getDayData]
  );

  const addEntry = useCallback(
    async (date: Date, entry: Omit<ClientTimeEntry, 'id'>) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const { data: insertedRow, error } = await supabase
          .from('client_time_entries')
          .insert({
            user_id: userId,
            date: dateKey,
            start_time: entry.startTime.toISOString(),
            end_time: entry.endTime.toISOString(),
            description: entry.description,
            tracker_client: entry.trackerClient,
            custom_client: entry.customClient || null,
          })
          .select()
          .single();

        if (error) throw error;

        const newEntry: ClientTimeEntry = {
          id: insertedRow.id,
          startTime: new Date(insertedRow.start_time),
          endTime: new Date(insertedRow.end_time),
          description: insertedRow.description,
          trackerClient: insertedRow.tracker_client as TrackerClient,
          customClient: insertedRow.custom_client || undefined,
        };

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            entries: [...getDayData(date).entries, newEntry].sort(
              (a, b) => a.startTime.getTime() - b.startTime.getTime()
            ),
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error adding entry:', error);
      }
    },
    [userId, getDayData]
  );

  const deleteEntry = useCallback(
    async (date: Date, entryId: string) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const { error } = await supabase
          .from('client_time_entries')
          .delete()
          .eq('id', entryId)
          .eq('user_id', userId);

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            entries: getDayData(date).entries.filter((e) => e.id !== entryId),
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    },
    [userId, getDayData]
  );

  const updateEntry = useCallback(
    async (date: Date, entryId: string, updates: Partial<ClientTimeEntry>) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const updateData: Record<string, unknown> = {};
        if (updates.startTime) updateData.start_time = updates.startTime.toISOString();
        if (updates.endTime) updateData.end_time = updates.endTime.toISOString();
        if (updates.description !== undefined) updateData.description = updates.description;
        if (updates.trackerClient !== undefined) updateData.tracker_client = updates.trackerClient;
        if (updates.customClient !== undefined) updateData.custom_client = updates.customClient || null;

        const { error } = await supabase
          .from('client_time_entries')
          .update(updateData)
          .eq('id', entryId)
          .eq('user_id', userId);

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            entries: getDayData(date).entries.map((e) =>
              e.id === entryId ? { ...e, ...updates } : e
            ),
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error updating entry:', error);
      }
    },
    [userId, getDayData]
  );

  const importEntries = useCallback(
    async (entries: { date: string; entry: Omit<ClientTimeEntry, 'id'> }[]) => {
      if (!userId || entries.length === 0) return;

      try {
        const insertData = entries.map((e) => ({
          user_id: userId,
          date: e.date,
          start_time: e.entry.startTime.toISOString(),
          end_time: e.entry.endTime.toISOString(),
          description: e.entry.description,
          tracker_client: e.entry.trackerClient,
          custom_client: e.entry.customClient || null,
        }));

        const { error } = await supabase.from('client_time_entries').insert(insertData);

        if (error) throw error;

        // Refresh data
        await fetchData();
      } catch (error) {
        console.error('Error importing entries:', error);
      }
    },
    [userId, fetchData]
  );

  return {
    selectedDate,
    setSelectedDate,
    getDayData,
    setWakeTime,
    setSleepTime,
    clearWakeTime,
    clearSleepTime,
    addEntry,
    deleteEntry,
    updateEntry,
    importEntries,
    data,
    lastSaved,
    isLoading,
  };
};
