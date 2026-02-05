export type TrackerClient = 
  | 'rosser-results'
  | 'carolinas' 
  | 'richmond'
  | 'memphis'
  | 'tri-cities'
  | 'birmingham'
  | 'outside'
  | 'personal'
  | 'other';

export const TRACKER_CLIENT_LABELS: Record<TrackerClient, string> = {
  'rosser-results': 'Rosser Results',
  'carolinas': 'Carolinas',
  'richmond': 'Richmond',
  'memphis': 'Memphis',
  'tri-cities': 'Tri-Cities',
  'birmingham': 'Birmingham',
  'outside': 'Outside',
  'personal': 'Personal',
  'other': 'Other',
};

export interface ClientTimeEntry {
  id: string;
  startTime: Date;
  endTime: Date;
  description: string;
  trackerClient: TrackerClient;
  customClient?: string;
}

export interface ClientDayData {
  date: string; // YYYY-MM-DD format
  wakeTime: Date | null;
  sleepTime: Date | null;
  clockInTime: Date | null;
  clockOutTime: Date | null;
  entries: ClientTimeEntry[];
}

export interface ClientLiveSegment {
  startTime: Date;
  endTime: Date;
  isBreak: boolean;
}
