import { format, parse } from 'date-fns';
import { TimeEntry, EnergyLevel, Category, Client, CLIENT_LABELS } from '@/types/timeTracker';

export const CSV_HEADERS = [
  'date',
  'start_time',
  'end_time',
  'description',
  'energy_level',
  'category',
  'client',
  'custom_client',
];

export const generateCSVTemplate = (): string => {
  const headerRow = CSV_HEADERS.join(',');
  const exampleRow = '2025-01-15,09:00,10:30,Example task description,positive,work,birmingham,';
  const instructions = [
    '# CSV Template for Time Entries',
    '# date: YYYY-MM-DD format',
    '# start_time/end_time: HH:MM format (24-hour)',
    '# energy_level: positive, neutral, or negative',
    '# category: personal or work',
    `# client: ${Object.keys(CLIENT_LABELS).join(', ')} (only for work category)`,
    '# custom_client: Only needed if client is "other"',
    '#',
  ];
  
  return [...instructions, headerRow, exampleRow].join('\n');
};

export const exportEntriesToCSV = (entries: { date: string; entry: TimeEntry }[]): string => {
  const headerRow = CSV_HEADERS.join(',');
  
  const dataRows = entries.map(({ date, entry }) => {
    const values = [
      date,
      format(entry.startTime, 'HH:mm'),
      format(entry.endTime, 'HH:mm'),
      `"${entry.description.replace(/"/g, '""')}"`,
      entry.energyLevel,
      entry.category,
      entry.client || '',
      entry.customClient || '',
    ];
    return values.join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

interface ParsedEntry {
  date: string;
  startTime: Date;
  endTime: Date;
  description: string;
  energyLevel: EnergyLevel;
  category: Category;
  client?: Client;
  customClient?: string;
}

export const parseCSV = (csvContent: string): { entries: ParsedEntry[]; errors: string[] } => {
  const lines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const errors: string[] = [];
  const entries: ParsedEntry[] = [];

  if (lines.length < 2) {
    errors.push('CSV must have at least a header row and one data row');
    return { entries, errors };
  }

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const values = parseCSVLine(line);
      
      if (values.length < 5) {
        errors.push(`Row ${i + 1}: Not enough columns`);
        continue;
      }

      const [dateStr, startTimeStr, endTimeStr, description, energyLevel, category, client, customClient] = values;

      // Validate date
      const dateMatch = dateStr?.match(/^\d{4}-\d{2}-\d{2}$/);
      if (!dateMatch) {
        errors.push(`Row ${i + 1}: Invalid date format (use YYYY-MM-DD)`);
        continue;
      }

      // Validate times
      const timeRegex = /^\d{1,2}:\d{2}$/;
      if (!startTimeStr?.match(timeRegex) || !endTimeStr?.match(timeRegex)) {
        errors.push(`Row ${i + 1}: Invalid time format (use HH:MM)`);
        continue;
      }

      // Validate energy level
      if (!['positive', 'neutral', 'negative'].includes(energyLevel)) {
        errors.push(`Row ${i + 1}: Invalid energy level (use positive, neutral, or negative)`);
        continue;
      }

      // Validate category
      if (!['personal', 'work'].includes(category)) {
        errors.push(`Row ${i + 1}: Invalid category (use personal or work)`);
        continue;
      }

      // Validate client for work category
      const validClients = Object.keys(CLIENT_LABELS);
      if (category === 'work' && client && !validClients.includes(client)) {
        errors.push(`Row ${i + 1}: Invalid client`);
        continue;
      }

      // Parse dates
      const startTime = parse(`${dateStr} ${startTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());
      const endTime = parse(`${dateStr} ${endTimeStr}`, 'yyyy-MM-dd HH:mm', new Date());

      entries.push({
        date: dateStr,
        startTime,
        endTime,
        description: description?.trim() || 'No description',
        energyLevel: energyLevel as EnergyLevel,
        category: category as Category,
        client: category === 'work' && client ? (client as Client) : undefined,
        customClient: category === 'work' && client === 'other' ? customClient?.trim() : undefined,
      });
    } catch (err) {
      errors.push(`Row ${i + 1}: Failed to parse`);
    }
  }

  return { entries, errors };
};

// Handle quoted fields with commas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
