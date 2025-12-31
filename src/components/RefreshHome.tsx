import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Home, Check, Flame, Calendar as CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  addMonths,
  getDay,
  startOfYear
} from 'date-fns';

interface RefreshHomeProps {
  onStartReflection: () => void;
}

const RefreshHome = ({ onStartReflection }: RefreshHomeProps) => {
  const { user } = useAuth();
  const [reflectionDates, setReflectionDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Get the 12 months starting from January of the current year
  const months = useMemo(() => {
    const start = startOfYear(new Date());
    return Array.from({ length: 12 }, (_, i) => addMonths(start, i));
  }, []);

  useEffect(() => {
    const fetchReflections = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reflections')
        .select('date')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching reflections:', error);
      } else if (data) {
        setReflectionDates(new Set(data.map(r => r.date)));
      }
      setLoading(false);
    };

    fetchReflections();
  }, [user]);

  // Calculate streak and total
  const { streak, total } = useMemo(() => {
    if (reflectionDates.size === 0) {
      return { streak: 0, total: 0 };
    }

    const total = reflectionDates.size;
    
    // Calculate streak
    let streak = 0;
    const today = new Date();
    let currentDate = today;
    
    // Check if today has a reflection, if not start from yesterday
    const todayStr = format(today, 'yyyy-MM-dd');
    if (!reflectionDates.has(todayStr)) {
      currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (reflectionDates.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { streak, total };
  }, [reflectionDates]);

  const renderMiniCalendar = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Get the day of week the month starts on (0 = Sunday)
    const startDayOfWeek = getDay(monthStart);
    
    // Create empty cells for days before the month starts
    const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => (
      <div key={`empty-${i}`} className="w-5 h-5" />
    ));

    return (
      <div className="bg-card rounded-lg p-3 border border-border">
        <h3 className="text-sm font-medium text-foreground mb-2 text-center">
          {format(month, 'MMMM')}
        </h3>
        <div className="grid grid-cols-7 gap-0.5">
          {/* Day headers */}
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={day + i} className="w-5 h-5 text-[10px] text-muted-foreground flex items-center justify-center">
              {day}
            </div>
          ))}
          {emptyCells}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const hasReflection = reflectionDates.has(dateStr);
            const isTodayDate = isToday(day);
            
            return (
              <button
                key={dateStr}
                onClick={() => isTodayDate && onStartReflection()}
                disabled={!isTodayDate}
                className={`
                  w-5 h-5 text-[10px] rounded flex items-center justify-center transition-colors
                  ${isTodayDate 
                    ? 'bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90' 
                    : hasReflection 
                      ? 'bg-emerald-500/20 text-emerald-500' 
                      : 'text-muted-foreground'
                  }
                  ${!isTodayDate && 'cursor-default'}
                `}
              >
                {hasReflection && !isTodayDate ? (
                  <Check className="w-3 h-3" />
                ) : (
                  format(day, 'd')
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Home className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Refresh</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-muted-foreground">Current Streak</span>
            </div>
            <div className="text-4xl font-bold text-foreground">{streak}</div>
            <div className="text-sm text-muted-foreground">days</div>
          </div>
          <div className="bg-card rounded-xl p-6 border border-border text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total Days</span>
            </div>
            <div className="text-4xl font-bold text-foreground">{total}</div>
            <div className="text-sm text-muted-foreground">reflections</div>
          </div>
        </div>

        {/* Today's prompt */}
        <div 
          onClick={onStartReflection}
          className="bg-primary/10 border border-primary/20 rounded-xl p-6 mb-8 text-center cursor-pointer hover:bg-primary/20 transition-colors"
        >
          <p className="text-lg text-foreground mb-2">Ready for today's reflection?</p>
          <p className="text-sm text-muted-foreground">Click here or tap today's date below</p>
        </div>

        {/* 12-month calendar grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
          {months.map((month) => (
            <div key={format(month, 'yyyy-MM')}>
              {renderMiniCalendar(month)}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default RefreshHome;
