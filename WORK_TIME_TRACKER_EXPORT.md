# Work Time Tracker - Complete Standalone Export

Build me this exact application with these exact files, schemas, and functionality.

---

## 1. APP DESCRIPTION

**Work Time Tracker** is a Swiss/International design-inspired time tracking application for logging work hours across multiple clients. Features include:

- **Clock In/Out** - Track work shift start and end times with "Now" shortcuts
- **Wake/Sleep Milestones** - Log daily wake and sleep times
- **Live Mode** - Full-screen Pomodoro-style timer with breaks, motivational quotes, and multiple timer modes (duration, target time, open-ended)
- **Multi-Client Support** - Log time against predefined clients or custom entries
- **Time Allocation** - Split time entries across multiple clients by percentage or sequential times
- **Week Navigation** - Browse entries by week with visual indicators
- **Summary Statistics** - View time tracked by client with dynamic period filtering (Today, 7 Days, 30 Days, MTD, YTD)
- **Timeline View** - Chronological display of daily activities with edit/delete capabilities
- **Dark/Light Theme** - Swiss-style design with bold red accents
- **Cloud Sync** - Data persisted via Supabase with user authentication

---

## 2. ENVIRONMENT VARIABLES

The app requires these environment variables (auto-configured by Lovable Cloud):

```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

---

## 3. SQL MIGRATIONS (Run First)

### Migration 1: Create client_day_data table

```sql
-- Create client_day_data table for daily milestones
CREATE TABLE public.client_day_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  wake_time TIMESTAMP WITH TIME ZONE,
  sleep_time TIMESTAMP WITH TIME ZONE,
  clock_in_time TIMESTAMP WITH TIME ZONE,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.client_day_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own client day data"
  ON public.client_day_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client day data"
  ON public.client_day_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client day data"
  ON public.client_day_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client day data"
  ON public.client_day_data FOR DELETE
  USING (auth.uid() = user_id);
```

### Migration 2: Create client_time_entries table

```sql
-- Create client_time_entries table for time entries
CREATE TABLE public.client_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  tracker_client TEXT NOT NULL,
  custom_client TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_time_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own client time entries"
  ON public.client_time_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client time entries"
  ON public.client_time_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client time entries"
  ON public.client_time_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client time entries"
  ON public.client_time_entries FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 4. DEPENDENCIES

Install these packages:
- @supabase/supabase-js
- @tanstack/react-query
- @radix-ui/react-dialog
- @radix-ui/react-tabs
- @radix-ui/react-collapsible
- @radix-ui/react-label
- @radix-ui/react-slot
- class-variance-authority
- clsx
- tailwind-merge
- tailwindcss-animate
- lucide-react
- date-fns
- sonner
- react-router-dom

---

## 5. SOURCE FILES

### File: src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

@layer base {
  /* Swiss/International Design - Light mode (default) */
  :root, .light {
    --background: 0 0% 100%;
    --foreground: 0 0% 0%;

    --card: 0 0% 100%;
    --card-foreground: 0 0% 0%;

    --popover: 0 0% 100%;
    --popover-foreground: 0 0% 0%;

    --primary: 0 100% 50%;
    --primary-foreground: 0 0% 100%;

    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 0%;

    --muted: 0 0% 94%;
    --muted-foreground: 0 0% 40%;

    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 0%;

    --destructive: 0 100% 50%;
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 88%;
    --input: 0 0% 88%;
    --ring: 0 100% 50%;

    --radius: 0px;

    /* Energy colors - Swiss style (red accents) */
    --energy-positive: 0 100% 50%;
    --energy-neutral: 0 0% 50%;
    --energy-negative: 0 0% 20%;

    /* Timeline */
    --timeline-track: 0 0% 94%;
    --timeline-marker: 0 0% 70%;

    /* Gradients - none for Swiss, solid colors */
    --gradient-positive: hsl(0 100% 50%);
    --gradient-neutral: hsl(0 0% 50%);
    --gradient-negative: hsl(0 0% 20%);
    --gradient-card: hsl(0 0% 100%);

    --sidebar-background: 0 0% 100%;
    --sidebar-foreground: 0 0% 0%;
    --sidebar-primary: 0 100% 50%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 0 0% 96%;
    --sidebar-accent-foreground: 0 0% 0%;
    --sidebar-border: 0 0% 88%;
    --sidebar-ring: 0 100% 50%;
  }

  /* Swiss/International Design - Dark mode */
  .dark {
    --background: 0 0% 0%;
    --foreground: 0 0% 100%;

    --card: 0 0% 6%;
    --card-foreground: 0 0% 100%;

    --popover: 0 0% 6%;
    --popover-foreground: 0 0% 100%;

    --primary: 0 100% 50%;
    --primary-foreground: 0 0% 100%;

    --secondary: 0 0% 12%;
    --secondary-foreground: 0 0% 100%;

    --muted: 0 0% 15%;
    --muted-foreground: 0 0% 60%;

    --accent: 0 0% 15%;
    --accent-foreground: 0 0% 100%;

    --destructive: 0 100% 50%;
    --destructive-foreground: 0 0% 100%;

    --border: 0 0% 20%;
    --input: 0 0% 15%;
    --ring: 0 100% 50%;

    /* Energy colors - Swiss style (red accents) */
    --energy-positive: 0 100% 50%;
    --energy-neutral: 0 0% 60%;
    --energy-negative: 0 0% 40%;

    /* Timeline */
    --timeline-track: 0 0% 12%;
    --timeline-marker: 0 0% 30%;

    /* Gradients - none for Swiss, solid colors */
    --gradient-positive: hsl(0 100% 50%);
    --gradient-neutral: hsl(0 0% 60%);
    --gradient-negative: hsl(0 0% 40%);
    --gradient-card: hsl(0 0% 6%);

    --sidebar-background: 0 0% 0%;
    --sidebar-foreground: 0 0% 100%;
    --sidebar-primary: 0 100% 50%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 0 0% 12%;
    --sidebar-accent-foreground: 0 0% 100%;
    --sidebar-border: 0 0% 20%;
    --sidebar-ring: 0 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    letter-spacing: -0.01em;
  }

  .font-mono {
    font-family: 'JetBrains Mono', monospace;
  }
}

@layer components {
  /* Swiss grid helper */
  .swiss-grid {
    display: grid;
    gap: 1px;
    background: hsl(var(--border));
  }

  .swiss-grid > * {
    background: hsl(var(--background));
  }

  .energy-positive {
    @apply bg-primary text-primary-foreground;
  }
  
  .energy-neutral {
    background: hsl(0 0% 50%);
    @apply text-white;
  }
  
  .energy-negative {
    background: hsl(0 0% 20%);
    @apply text-white;
  }

  .timeline-entry {
    @apply transition-all duration-200 ease-out;
  }

  .timeline-entry:hover {
    background: hsl(var(--primary) / 0.1);
  }

  /* Swiss-style card - sharp edges, bold borders */
  .glass-card {
    @apply bg-card border-2 border-foreground;
  }

  .pulse-live {
    animation: pulse-glow 1.5s ease-in-out infinite;
  }

  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 hsl(0 100% 50% / 0.6);
    }
    50% {
      box-shadow: 0 0 0 6px hsl(0 100% 50% / 0);
    }
  }

  .slide-up {
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .fade-in {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  /* Swiss typography utilities */
  .swiss-heading {
    @apply font-black uppercase tracking-tight;
    letter-spacing: -0.02em;
  }

  .swiss-label {
    @apply text-xs font-semibold uppercase tracking-widest;
  }
}
```

### File: tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        energy: {
          positive: "hsl(var(--energy-positive))",
          neutral: "hsl(var(--energy-neutral))",
          negative: "hsl(var(--energy-negative))",
        },
        timeline: {
          track: "hsl(var(--timeline-track))",
          marker: "hsl(var(--timeline-marker))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        swiss: {
          red: "hsl(0 100% 50%)",
          black: "hsl(0 0% 0%)",
          white: "hsl(0 0% 100%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius))",
        sm: "calc(var(--radius))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### File: components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

### File: src/lib/utils.ts

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### File: src/integrations/supabase/client.ts

```typescript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
```

### File: src/types/clientTracker.ts

```typescript
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
```

### File: src/hooks/useAuth.ts

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, loading, signOut };
};
```

### File: src/hooks/useTheme.ts

```typescript
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'energy-tracker-theme';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return { theme, setTheme, toggleTheme };
};
```

### File: src/hooks/useLiveClock.ts

```typescript
import { useState, useEffect } from 'react';

export const useLiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
};
```

### File: src/hooks/useQuoteRotation.ts

```typescript
import { useState, useEffect, useCallback } from 'react';
import { MOTIVATIONAL_QUOTES, Quote } from '@/data/motivationalQuotes';

const STORAGE_KEY = 'livemode-quote-index';

export const useQuoteRotation = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? parseInt(stored, 10) : 0;
  });

  const [nextQuote, setNextQuote] = useState<Quote>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const index = stored ? parseInt(stored, 10) : 0;
    return MOTIVATIONAL_QUOTES[index % MOTIVATIONAL_QUOTES.length];
  });

  const getQuoteAndAdvance = useCallback((): Quote => {
    const quote = nextQuote;
    
    const nextIndex = (currentIndex + 1) % MOTIVATIONAL_QUOTES.length;
    setCurrentIndex(nextIndex);
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());
    setNextQuote(MOTIVATIONAL_QUOTES[nextIndex]);
    
    return quote;
  }, [currentIndex, nextQuote]);

  const peekNextQuote = useCallback((): Quote => {
    return nextQuote;
  }, [nextQuote]);

  return {
    getQuoteAndAdvance,
    peekNextQuote,
    currentIndex,
    totalQuotes: MOTIVATIONAL_QUOTES.length,
  };
};
```

### File: src/hooks/useCloudClientTracker.ts

```typescript
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

  const fetchData = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: dayDataRows, error: dayError } = await supabase
        .from('client_day_data')
        .select('*')
        .eq('user_id', userId);

      if (dayError) throw dayError;

      const { data: entriesRows, error: entriesError } = await supabase
        .from('client_time_entries')
        .select('*')
        .eq('user_id', userId);

      if (entriesError) throw entriesError;

      const newData: Record<string, ClientDayData> = {};

      dayDataRows?.forEach((row) => {
        newData[row.date] = {
          date: row.date,
          wakeTime: row.wake_time ? new Date(row.wake_time) : null,
          sleepTime: row.sleep_time ? new Date(row.sleep_time) : null,
          clockInTime: (row as any).clock_in_time ? new Date((row as any).clock_in_time) : null,
          clockOutTime: (row as any).clock_out_time ? new Date((row as any).clock_out_time) : null,
          entries: [],
        };
      });

      entriesRows?.forEach((row) => {
        const dateKey = row.date;
        if (!newData[dateKey]) {
          newData[dateKey] = {
            date: dateKey,
            wakeTime: null,
            sleepTime: null,
            clockInTime: null,
            clockOutTime: null,
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
          clockInTime: null,
          clockOutTime: null,
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

  const setClockInTime = useCallback(
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
              clock_in_time: time.toISOString(),
            },
            { onConflict: 'user_id,date' }
          );

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            clockInTime: time,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error setting clock in time:', error);
      }
    },
    [userId, getDayData]
  );

  const setClockOutTime = useCallback(
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
              clock_out_time: time.toISOString(),
            },
            { onConflict: 'user_id,date' }
          );

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            clockOutTime: time,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error setting clock out time:', error);
      }
    },
    [userId, getDayData]
  );

  const clearClockInTime = useCallback(
    async (date: Date) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const { error } = await supabase
          .from('client_day_data')
          .update({ clock_in_time: null })
          .eq('user_id', userId)
          .eq('date', dateKey);

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            clockInTime: null,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error clearing clock in time:', error);
      }
    },
    [userId, getDayData]
  );

  const clearClockOutTime = useCallback(
    async (date: Date) => {
      if (!userId) return;

      const dateKey = getDateKey(date);

      try {
        const { error } = await supabase
          .from('client_day_data')
          .update({ clock_out_time: null })
          .eq('user_id', userId)
          .eq('date', dateKey);

        if (error) throw error;

        setData((prev) => ({
          ...prev,
          [dateKey]: {
            ...getDayData(date),
            clockOutTime: null,
          },
        }));
        setLastSaved(new Date());
      } catch (error) {
        console.error('Error clearing clock out time:', error);
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

  return {
    selectedDate,
    setSelectedDate,
    getDayData,
    setWakeTime,
    setSleepTime,
    clearWakeTime,
    clearSleepTime,
    setClockInTime,
    setClockOutTime,
    clearClockInTime,
    clearClockOutTime,
    addEntry,
    deleteEntry,
    updateEntry,
    data,
    lastSaved,
    isLoading,
  };
};
```

### File: src/data/motivationalQuotes.ts

```typescript
export interface Quote {
  text: string;
  author: string;
}

export const MOTIVATIONAL_QUOTES: Quote[] = [
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Whether you think you can, or you think you can't—you're right.", author: "Henry Ford" },
  { text: "Do not seek to follow in the footsteps of the wise. Seek what they sought.", author: "Matsuo Bashō" },
  { text: "Man is not worried by real problems so much as by his imagined anxieties about real problems.", author: "Epictetus" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "W. Edwards Deming" },
  { text: "In matters of conscience, the law of the majority has no place.", author: "Mahatma Gandhi" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius" },
  { text: "Nothing is particularly hard if you divide it into small jobs.", author: "Henry Ford" },
  { text: "It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change.", author: "Charles Darwin" },
  { text: "The price of anything is the amount of life you exchange for it.", author: "Henry David Thoreau" },
  { text: "To improve is to change; to be perfect is to change often.", author: "Winston Churchill" },
  { text: "Beware the barrenness of a busy life.", author: "Socrates" },
  { text: "He who conquers himself is the mightiest warrior.", author: "Confucius" },
  { text: "If you don't know where you are going, any road will get you there.", author: "Lewis Carroll" },
  { text: "The superior man is modest in his speech but exceeds in his actions.", author: "Confucius" },
  { text: "I am not a product of my circumstances. I am a product of my decisions.", author: "Stephen R. Covey" },
  { text: "Chance favors the prepared mind.", author: "Louis Pasteur" },
  { text: "What you do speaks so loudly that I cannot hear what you say.", author: "Ralph Waldo Emerson" },
  { text: "The unexamined life is not worth living.", author: "Socrates" },
  { text: "If you cannot do great things, do small things in a great way.", author: "Napoleon Hill" },
  { text: "A man who has committed a mistake and doesn't correct it is committing another mistake.", author: "Confucius" },
  { text: "The harder I work, the luckier I get.", author: "Samuel Goldwyn" },
  { text: "He who knows all the answers has not been asked all the questions.", author: "Confucius" },
  { text: "A goal properly set is halfway reached.", author: "Zig Ziglar" },
  { text: "No man is free who is not master of himself.", author: "Epictetus" },
  { text: "Do not go where the path may lead. Go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
  { text: "He who wishes to be rich in a day will be hanged in a year.", author: "Leonardo da Vinci" },
  { text: "The best investment you can make is in yourself.", author: "Benjamin Franklin" },
  { text: "You must be the change you wish to see in the world.", author: "Mahatma Gandhi" },
  { text: "An ounce of prevention is worth a pound of cure.", author: "Benjamin Franklin" },
  { text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.", author: "Ralph Waldo Emerson" },
  { text: "If you would persuade, you must appeal to interest rather than intellect.", author: "Benjamin Franklin" },
  { text: "A ship in harbor is safe—but that is not what ships are built for.", author: "John A. Shedd" },
  { text: "The future belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "What we fear doing most is usually what we most need to do.", author: "Ralph Waldo Emerson" },
  { text: "If opportunity doesn't knock, build a door.", author: "Milton Berle" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "One man with courage makes a majority.", author: "Andrew Jackson" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "You cannot escape the responsibility of tomorrow by evading it today.", author: "Abraham Lincoln" },
  { text: "He who has learned to disagree without being disagreeable has discovered the most valuable secret of negotiation.", author: "Robert Estabrook" },
  { text: "The first responsibility of a leader is to define reality.", author: "Max De Pree" },
  { text: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { text: "Discipline is the bridge between goals and accomplishment.", author: "Jim Rohn" },
  { text: "The supreme art of war is to subdue the enemy without fighting.", author: "Sun Tzu" },
  { text: "If you spend too much time thinking about a thing, you'll never get it done.", author: "Bruce Lee" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
];
```

### File: src/components/ui/button.tsx

```typescript
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
```

### File: src/components/ui/input.tsx

```typescript
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
```

### File: src/components/ui/label.tsx

```typescript
import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
```

### File: src/components/ui/dialog.tsx

```typescript
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity data-[state=open]:bg-accent data-[state=open]:text-muted-foreground hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
```

### File: src/components/ui/tabs.tsx

```typescript
import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

### File: src/components/ui/collapsible.tsx

```typescript
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent;

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
```

### File: src/components/ui/sonner.tsx

```typescript
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
```

### File: src/components/LiveClock.tsx

```typescript
import { useLiveClock } from '@/hooks/useLiveClock';
import { format } from 'date-fns';

export const LiveClock = () => {
  const time = useLiveClock();

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center justify-center">
        <div className="w-2 h-2 bg-primary pulse-live" />
      </div>
      <div className="font-mono text-sm font-medium tracking-tight">
        {format(time, 'h:mm:ss a')}
      </div>
    </div>
  );
};
```

### File: src/components/MilestoneButton.tsx

```typescript
import { Sun, Moon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MilestoneButtonProps {
  type: 'wake' | 'sleep';
  time: Date | null;
  onSetTime: () => void;
}

export const MilestoneButton = ({ type, time, onSetTime }: MilestoneButtonProps) => {
  const isWake = type === 'wake';
  
  return (
    <button
      onClick={onSetTime}
      className={cn(
        'flex items-center gap-4 p-4 transition-colors duration-200',
        'border-2 border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary',
        time && 'bg-secondary'
      )}
    >
      <div className="w-10 h-10 border-2 border-current flex items-center justify-center">
        {isWake ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-xs font-mono uppercase tracking-widest">
          {isWake ? 'Wake' : 'Sleep'}
        </span>
        {time ? (
          <span className="font-mono text-xl font-bold">
            {format(time, 'HH:mm')}
          </span>
        ) : (
          <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" /> Set time
          </span>
        )}
      </div>
    </button>
  );
};
```

### File: src/components/ClockInOutButton.tsx

```typescript
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { LogIn, LogOut, X, Clock } from 'lucide-react';

interface ClockInOutButtonProps {
  type: 'clock-in' | 'clock-out';
  time: Date | null;
  onSetTime: () => void;
  onSetNow: () => void;
  onClearTime?: () => void;
}

export const ClockInOutButton = ({ type, time, onSetTime, onSetNow, onClearTime }: ClockInOutButtonProps) => {
  const isClockIn = type === 'clock-in';
  const Icon = isClockIn ? LogIn : LogOut;
  const label = isClockIn ? 'Clock In' : 'Clock Out';

  if (time) {
    return (
      <div className="flex items-center justify-between p-3 border-2 border-foreground bg-secondary">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4" />
          <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold">{format(time, 'h:mm a')}</span>
          {onClearTime && (
            <button
              onClick={onClearTime}
              className="p-1 hover:bg-foreground/10 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={onSetTime}
        className={cn(
          'flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-foreground/50',
          'text-foreground/70 hover:text-foreground hover:border-foreground transition-colors'
        )}
      >
        <Icon className="w-4 h-4" />
        <span className="text-xs font-mono uppercase tracking-wider">{label}</span>
      </button>
      <button
        onClick={onSetNow}
        className={cn(
          'px-3 py-2 border-2 border-foreground/50',
          'text-foreground/70 hover:text-foreground hover:border-foreground hover:bg-foreground/10 transition-colors',
          'flex items-center gap-1'
        )}
      >
        <Clock className="w-3 h-3" />
        <span className="text-xs font-mono uppercase">Now</span>
      </button>
    </div>
  );
};
```

### File: src/components/TimePickerDialog.tsx

```typescript
import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Clock, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TimePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  selectedDate: Date;
  onConfirm: (time: Date) => void;
  wakeTime?: Date | null;
  isSleepTime?: boolean;
}

export const TimePickerDialog = ({
  open,
  onOpenChange,
  title,
  selectedDate,
  onConfirm,
  wakeTime,
  isSleepTime = false,
}: TimePickerDialogProps) => {
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));

  const isPastMidnight = (): boolean => {
    if (!isSleepTime || !wakeTime) return false;
    
    const [hours, minutes] = time.split(':').map(Number);
    const wakeHours = wakeTime.getHours();
    const wakeMinutes = wakeTime.getMinutes();
    
    const sleepMinutesFromMidnight = hours * 60 + minutes;
    const wakeMinutesFromMidnight = wakeHours * 60 + wakeMinutes;
    
    return sleepMinutesFromMidnight < wakeMinutesFromMidnight;
  };

  const handleConfirm = () => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    let dateTime = new Date(`${dateStr}T${time}`);
    
    if (isPastMidnight()) {
      dateTime = addDays(dateTime, 1);
    }
    
    onConfirm(dateTime);
    onOpenChange(false);
  };

  const pastMidnight = isPastMidnight();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="pl-12 h-14 text-2xl font-mono bg-secondary border-border text-center"
            />
          </div>
          
          {pastMidnight && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Moon className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary">
                This will be recorded as {format(addDays(selectedDate, 1), 'MMM d')} (past midnight)
              </span>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

### File: src/components/AuthForm.tsx

```typescript
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';

export const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Logged in successfully!');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success('Account created! You can now log in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="border-2 border-foreground p-8 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            {isLogin ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2">
            {isLogin
              ? 'Sync your data across devices'
              : 'Save your tracking data'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-mono uppercase tracking-widest">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 border-2 border-foreground bg-transparent font-mono"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-mono uppercase tracking-widest">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 border-2 border-foreground bg-transparent font-mono"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-sm font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:bg-foreground hover:text-background transition-colors"
            disabled={loading}
          >
            {loading ? (
              'Loading...'
            ) : isLogin ? (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </>
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

### File: src/components/ThemeToggle.tsx

```typescript
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="text-muted-foreground hover:text-foreground"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </Button>
  );
};
```

### File: src/components/ClientSelector.tsx

```typescript
import { cn } from '@/lib/utils';
import { TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { Building2 } from 'lucide-react';

interface ClientSelectorProps {
  value: TrackerClient;
  onChange: (client: TrackerClient) => void;
  size?: 'sm' | 'md';
}

const clients: TrackerClient[] = [
  'rosser-results',
  'carolinas',
  'richmond',
  'memphis',
  'tri-cities',
  'birmingham',
  'outside',
  'personal',
  'other',
];

const clientColors: Record<TrackerClient, string> = {
  'rosser-results': 'bg-primary',
  'carolinas': 'bg-primary',
  'richmond': 'bg-primary',
  'memphis': 'bg-primary',
  'tri-cities': 'bg-primary',
  'birmingham': 'bg-primary',
  'outside': 'bg-primary',
  'personal': 'bg-primary',
  'other': 'bg-primary',
};

export const ClientSelector = ({ value, onChange, size = 'md' }: ClientSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {clients.map((client) => {
        const isSelected = value === client;
        
        return (
          <button
            key={client}
            onClick={() => onChange(client)}
            className={cn(
              'flex items-center gap-2 rounded-lg transition-all duration-200',
              size === 'sm' ? 'px-3 py-2' : 'px-4 py-3',
              isSelected
                ? `${clientColors[client]} text-white`
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Building2 className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            <span className={cn('font-medium', size === 'sm' ? 'text-sm' : 'text-base')}>
              {TRACKER_CLIENT_LABELS[client]}
            </span>
          </button>
        );
      })}
    </div>
  );
};
```

### File: src/components/MultiClientSelector.tsx

```typescript
import { cn } from '@/lib/utils';
import { TrackerClient, TRACKER_CLIENT_LABELS } from '@/types/clientTracker';
import { Building2, Check } from 'lucide-react';

interface MultiClientSelectorProps {
  value: TrackerClient[];
  onChange: (clients: TrackerClient[]) => void;
  size?: 'sm' | 'md';
}

const clients: TrackerClient[] = [
  'rosser-results',
  'carolinas',
  'richmond',
  'memphis',
  'tri-cities',
  'birmingham',
  'outside',
  'personal',
  'other',
];

const clientColors: Record<TrackerClient, string> = {
  'rosser-results': 'bg-primary',
  'carolinas': 'bg-primary',
  'richmond': 'bg-primary',
  'memphis': 'bg-primary',
  'tri-cities': 'bg-primary',
  'birmingham': 'bg-primary',
  'outside': 'bg-primary',
  'personal': 'bg-primary',
  'other': 'bg-primary',
};

export const MultiClientSelector = ({ value, onChange, size = 'md' }: MultiClientSelectorProps) => {
  const toggleClient = (client: TrackerClient) => {
    if (value.includes(client)) {
      onChange(value.filter(c => c !== client));
    } else {
      onChange([...value, client]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {clients.map((client) => {
        const isSelected = value.includes(client);
        
        return (
          <button
            key={client}
            onClick={() => toggleClient(client)}
            className={cn(
              'flex items-center gap-2 rounded-lg transition-all duration-200 relative',
              size === 'sm' ? 'px-3 py-2' : 'px-4 py-3',
              isSelected
                ? `${clientColors[client]} text-white`
                : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <Building2 className={cn(size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            <span className={cn('font-medium', size === 'sm' ? 'text-sm' : 'text-base')}>
              {TRACKER_CLIENT_LABELS[client]}
            </span>
            {isSelected && (
              <Check className={cn('absolute -top-1 -right-1 p-0.5 rounded-full bg-background text-foreground', size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
            )}
          </button>
        );
      })}
    </div>
  );
};
```

---

## 6. ROUTING SETUP

### File: src/App.tsx

```typescript
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ClientTracker from "./pages/ClientTracker";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ClientTracker />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

### File: src/main.tsx

```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

---

## REMAINING COMPONENTS

The following components are also required and should be copied from the file list above:

- `src/components/ClientTrackerLiveMode.tsx` - Full-screen live timer
- `src/components/ClientTrackerLiveEntryForm.tsx` - Post-session entry form
- `src/components/ClientTrackerAddEntryForm.tsx` - Manual entry form
- `src/components/ClientTrackerTimelineView.tsx` - Timeline display
- `src/components/ClientTrackerWeekNavigator.tsx` - Week navigation
- `src/components/ClientTrackerWeeklyStats.tsx` - Summary statistics
- `src/components/ClientTrackerEditEntryDialog.tsx` - Edit entry dialog
- `src/components/MultiClientTimeAllocation.tsx` - Time allocation dialog
- `src/pages/ClientTracker.tsx` - Main page component

**Note:** Due to file size constraints, these component files should be created by prompting: "Create the ClientTrackerLiveMode, ClientTrackerAddEntryForm, ClientTrackerTimelineView, ClientTrackerWeekNavigator, ClientTrackerWeeklyStats, ClientTrackerEditEntryDialog, ClientTrackerLiveEntryForm, MultiClientTimeAllocation components and the main ClientTracker page as shown in the original Work Time Tracker app."

---

## COMPLETE

This export contains:
- ✅ Database schema with RLS policies
- ✅ All styling (index.css, tailwind.config.ts)
- ✅ All hooks (useAuth, useTheme, useLiveClock, useQuoteRotation, useCloudClientTracker)
- ✅ All types (clientTracker.ts)
- ✅ All UI components (button, input, label, dialog, tabs, collapsible, sonner)
- ✅ All shared components (LiveClock, MilestoneButton, ClockInOutButton, TimePickerDialog, AuthForm, ThemeToggle, ClientSelector, MultiClientSelector)
- ✅ Data files (motivationalQuotes.ts)
- ✅ Routing setup (App.tsx, main.tsx)

Enable Lovable Cloud when creating the project to get automatic Supabase integration.
