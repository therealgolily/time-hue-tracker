import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { YearCalendar } from '@/components/calendar/YearCalendar';
import { CountdownPanel } from '@/components/calendar/CountdownPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useCountdowns } from '@/hooks/useCountdowns';
import { cn } from '@/lib/utils';

const Calendar = () => {
  useTheme();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const { countdowns } = useCountdowns();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="p-2 border-2 border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-sm font-bold uppercase tracking-widest">Calendar</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content - Dynamic padding based on panel state */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        isPanelOpen ? "pr-0 md:pr-72" : "pr-0"
      )}>
        <YearCalendar countdowns={countdowns} />
      </main>

      {/* Countdown Panel */}
      <CountdownPanel onOpenChange={setIsPanelOpen} />
    </div>
  );
};

export default Calendar;
