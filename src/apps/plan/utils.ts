import { TaskStatus } from './types';

export const STATUS_COLORS: Record<TaskStatus, { bar: string; text: string; border: string }> = {
  done:     { bar: '#2D6A4F', text: '#fff',     border: '#1B4332' },
  pending:  { bar: '#E76F51', text: '#fff',     border: '#C1440E' },
  delayed:  { bar: '#E9C46A', text: '#3D2B00',  border: '#B78A00' },
  critical: { bar: '#C1121F', text: '#fff',     border: '#780000' },
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  done: 'Done',
  pending: 'Pending',
  delayed: 'Delayed',
  critical: 'Critical',
};

/** Returns ISO date string (YYYY-MM-DD) for a date */
export const toISO = (d: Date) => d.toISOString().split('T')[0];

/** Start of ISO week containing d (Monday) */
export const weekStart = (d: Date) => {
  const copy = new Date(d);
  const day = copy.getDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1 - day);
  copy.setDate(copy.getDate() + diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Add N weeks to date */
export const addWeeks = (d: Date, n: number) => {
  const c = new Date(d); c.setDate(c.getDate() + n * 7); return c;
};

/** Add N months to date */
export const addMonths = (d: Date, n: number) => {
  const c = new Date(d); c.setMonth(c.getMonth() + n); return c;
};

/** Get month start */
export const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);

/** Days difference */
export const daysDiff = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / 86400000);

/** Week number of year */
export const weekNumber = (d: Date) => {
  const jan1 = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7);
};

/** Quarter from month index 0-11 */
export const quarterOf = (month: number) => Math.floor(month / 3) + 1;
