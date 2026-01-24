import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Flame, Calendar as CalendarIcon, Search, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday,
  addMonths,
  getDay,
  startOfYear,
  isFuture,
  parseISO
} from 'date-fns';

interface Reflection {
  date: string;
  accomplishment_1: string | null;
  accomplishment_2: string | null;
  accomplishment_3: string | null;
  priority_1: string | null;
  priority_2: string | null;
  priority_3: string | null;
}

interface RefreshHomeProps {
  onStartReflection: () => void;
  onViewReflection: (reflection: Reflection) => void;
}

const RefreshHome = ({ onStartReflection, onViewReflection }: RefreshHomeProps) => {
  const { user, loading: authLoading } = useAuth();
  const [reflections, setReflections] = useState<Map<string, Reflection>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const months = useMemo(() => {
    const start = startOfYear(new Date());
    return Array.from({ length: 12 }, (_, i) => addMonths(start, i));
  }, []);

  useEffect(() => {
    const fetchReflections = async () => {
      if (authLoading) return;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('reflections')
        .select('date, accomplishment_1, accomplishment_2, accomplishment_3, priority_1, priority_2, priority_3')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching reflections:', error);
      } else if (data) {
        const reflectionMap = new Map<string, Reflection>();
        data.forEach(r => reflectionMap.set(r.date, r));
        setReflections(reflectionMap);
      }
      setLoading(false);
    };

    fetchReflections();
  }, [user, authLoading]);

  const { streak, total } = useMemo(() => {
    if (reflections.size === 0) {
      return { streak: 0, total: 0 };
    }

    const total = reflections.size;
    
    let streak = 0;
    const today = new Date();
    let currentDate = today;
    
    const todayStr = format(today, 'yyyy-MM-dd');
    const utcTodayStr = new Date().toISOString().split('T')[0];
    const hasToday = reflections.has(todayStr) || reflections.has(utcTodayStr);

    if (!hasToday) {
      currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (reflections.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return { streak, total };
  }, [reflections]);

  const localTodayStr = format(new Date(), 'yyyy-MM-dd');
  const utcTodayStr = new Date().toISOString().split('T')[0];
  const todayReflection = reflections.get(localTodayStr) ?? reflections.get(utcTodayStr);

  const filteredReflections = useMemo(() => {
    const all = Array.from(reflections.values()).sort(
      (a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()
    );
    if (!searchQuery.trim()) return all;
    const q = searchQuery.toLowerCase();
    return all.filter(r => 
      [r.accomplishment_1, r.accomplishment_2, r.accomplishment_3, r.priority_1, r.priority_2, r.priority_3]
        .some(text => text?.toLowerCase().includes(q))
    );
  }, [reflections, searchQuery]);

  const renderMiniCalendar = (month: Date) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const startDayOfWeek = getDay(monthStart);
    
    const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => (
      <div key={`empty-${i}`} className="w-5 h-5" />
    ));

    return (
      <div className="border-2 border-foreground p-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-center mb-3">
          {format(month, 'MMM')}
        </h3>
        <div className="grid grid-cols-7 gap-0.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={day + i} className="w-5 h-5 text-[9px] font-mono uppercase text-muted-foreground flex items-center justify-center">
              {day}
            </div>
          ))}
          {emptyCells}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const isTodayDate = isToday(day);

            const reflection = reflections.get(dateStr) ?? (isTodayDate ? reflections.get(utcTodayStr) : undefined);
            const hasReflection = !!reflection;
            const isFutureDate = isFuture(day);
            const isClickable = isTodayDate || hasReflection;
            
            const handleClick = () => {
              if (hasReflection && reflection) {
                onViewReflection(reflection);
              } else if (isTodayDate) {
                onStartReflection();
              }
            };
            
            return (
              <button
                key={dateStr}
                onClick={handleClick}
                disabled={!isClickable}
                className={`
                  w-5 h-5 text-[9px] font-mono flex items-center justify-center transition-colors
                  ${isTodayDate 
                    ? 'bg-primary text-primary-foreground cursor-pointer hover:bg-foreground hover:text-background' 
                    : hasReflection 
                      ? 'bg-foreground text-background cursor-pointer hover:bg-primary hover:text-primary-foreground' 
                      : isFutureDate
                        ? 'text-muted-foreground/30'
                        : 'text-muted-foreground'
                  }
                `}
              >
                {hasReflection ? (
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
        <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Swiss style */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="p-2 -ml-2 hover:bg-primary hover:text-primary-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-sm font-bold uppercase tracking-widest">Refresh</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Stats - Swiss grid */}
        <div className="grid grid-cols-2 gap-px bg-foreground mb-8">
          <div className="bg-background p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Streak</span>
            </div>
            <div className="text-5xl font-black">{streak}</div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2">days</div>
          </div>
          <div className="bg-background p-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total</span>
            </div>
            <div className="text-5xl font-black">{total}</div>
            <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2">reflections</div>
          </div>
        </div>

        {/* Today's prompt - Swiss style */}
        <div 
          onClick={() => {
            if (todayReflection) {
              onViewReflection(todayReflection);
            } else {
              onStartReflection();
            }
          }}
          className="border-2 border-primary p-8 mb-8 text-center cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors group"
        >
          <p className="text-lg font-bold uppercase tracking-tight">
            {todayReflection ? "View today's reflection" : "Ready for today's reflection?"}
          </p>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground group-hover:text-primary-foreground/70 mt-2">
            {todayReflection ? "Click to see what you wrote" : "Click here or tap today's date below"}
          </p>
        </div>

        {/* 12-month calendar grid - Swiss style */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          {months.map((month) => (
            <div key={format(month, 'yyyy-MM')}>
              {renderMiniCalendar(month)}
            </div>
          ))}
        </div>

        {/* Reflection History - Swiss style */}
        <div className="border-t-2 border-foreground pt-8">
          <div className="flex items-center gap-3 mb-6">
            <List className="w-4 h-4" />
            <h2 className="text-sm font-bold uppercase tracking-widest">History</h2>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reflections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 border-2 border-foreground bg-transparent text-sm font-mono"
            />
          </div>
          {filteredReflections.length === 0 ? (
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground text-center py-8">
              {searchQuery ? 'No reflections match your search.' : 'No reflections yet.'}
            </p>
          ) : (
            <ul className="space-y-2">
              {filteredReflections.map((r) => (
                <li
                  key={r.date}
                  onClick={() => onViewReflection(r)}
                  className="border-2 border-foreground p-4 cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  <div className="text-xs font-bold uppercase tracking-widest mb-2">
                    {format(parseISO(r.date), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {[r.accomplishment_1, r.accomplishment_2, r.accomplishment_3].filter(Boolean).join(' • ') || 'No accomplishments'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default RefreshHome;