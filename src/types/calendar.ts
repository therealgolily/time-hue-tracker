export type EventCategory = 'work' | 'travel' | 'financial' | 'blocked';

export const EVENT_CATEGORIES: { value: EventCategory; label: string; color: string; textColor: string }[] = [
  { value: 'work', label: 'Work', color: 'hsl(0 0% 0%)', textColor: 'hsl(0 0% 100%)' },
  { value: 'travel', label: 'Travel', color: 'hsl(50 100% 50%)', textColor: 'hsl(0 0% 0%)' },
  { value: 'financial', label: 'Financial', color: 'hsl(142 70% 45%)', textColor: 'hsl(0 0% 100%)' },
  { value: 'blocked', label: 'Blocked', color: 'hsl(0 100% 50%)', textColor: 'hsl(0 0% 100%)' },
];

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  category: EventCategory;
  createdAt: string;
}

export interface CalendarState {
  events: CalendarEvent[];
}
