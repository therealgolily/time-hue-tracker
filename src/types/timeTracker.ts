export type EnergyLevel = 'positive' | 'neutral' | 'negative';

export interface TimeEntry {
  id: string;
  startTime: Date;
  endTime: Date;
  description: string;
  energyLevel: EnergyLevel;
}

export interface DayData {
  date: string; // YYYY-MM-DD format
  wakeTime: Date | null;
  sleepTime: Date | null;
  entries: TimeEntry[];
}

export interface WeekData {
  startDate: Date;
  days: DayData[];
}
