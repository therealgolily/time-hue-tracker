export type EnergyLevel = 'positive' | 'neutral' | 'negative';

export type Category = 'personal' | 'work';

export type Client = 
  | 'birmingham' 
  | 'carolinas' 
  | 'tri-cities' 
  | 'memphis' 
  | 'capital-city' 
  | 'window-world' 
  | 'rosser-results'
  | 'other';

export const CLIENT_LABELS: Record<Client, string> = {
  'birmingham': 'Birmingham',
  'carolinas': 'Carolinas',
  'tri-cities': 'Tri-Cities',
  'memphis': 'Memphis',
  'capital-city': 'Capital City',
  'window-world': 'Window World',
  'rosser-results': 'Rosser Results',
  'other': 'Other',
};

export interface TimeEntry {
  id: string;
  startTime: Date;
  endTime: Date;
  description: string;
  energyLevel: EnergyLevel;
  category: Category;
  client?: Client;
  customClient?: string;
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

// For Live Mode segment tracking
export interface LiveSegment {
  startTime: Date;
  endTime: Date;
  isBreak: boolean;
}
