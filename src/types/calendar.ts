export interface CalendarEvent {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD format
  endDate: string; // YYYY-MM-DD format
  createdAt: string;
}

export interface CalendarState {
  events: CalendarEvent[];
}
