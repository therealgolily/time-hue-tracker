export interface LifeEvent {
  id: string;
  title: string;
  eventDate: string; // YYYY-MM-DD format
  createdAt: string;
}

export interface TimeDuration {
  years: number;
  months: number;
  days: number;
  isPast: boolean;
}
