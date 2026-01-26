import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, RefreshCw, LogOut, Briefcase, Calculator, TrendingUp, CalendarDays, Clock, CheckSquare } from 'lucide-react';
import { AppTile } from '@/components/AppTile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CONSISTENCY_QUOTES } from '@/data/consistencyQuotes';

const STORAGE_KEY = 'home-quote-index';

// Organized into logical groups for better visual hierarchy
const timeApps = [
  { name: 'Personal', route: '/personal-time-tracker', icon: User },
  { name: 'Work', route: '/work-time-tracker', icon: Briefcase },
];

const financeApps = [
  { name: 'Personal', route: '/personal-finance', icon: Calculator },
  { name: 'Business', route: '/business-finance', icon: TrendingUp },
];

const utilityApps = [
  { name: 'Journal', route: '/journal', icon: RefreshCw },
  { name: 'Calendar', route: '/calendar', icon: CalendarDays },
  { name: 'Timeline', route: '/timeline', icon: Clock },
  { name: 'Tasks', route: 'tasks.rosserresults.com', icon: CheckSquare, external: true },
];

const Home = () => {
  useTheme();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const currentQuote = useMemo(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const index = stored ? parseInt(stored, 10) : 0;
    const quote = CONSISTENCY_QUOTES[index % CONSISTENCY_QUOTES.length];
    
    const nextIndex = (index + 1) % CONSISTENCY_QUOTES.length;
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());
    
    return quote;
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-sm font-bold uppercase tracking-widest">Dashboard</h1>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="hover:bg-primary hover:text-primary-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Quote section */}
        <div className="border-b-2 border-foreground px-6 py-12 md:py-16">
          <div className="container mx-auto max-w-4xl">
            <blockquote className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              "{currentQuote.text}"
            </blockquote>
            <p className="mt-6 text-sm font-mono uppercase tracking-widest text-muted-foreground">
              — {currentQuote.author}
            </p>
          </div>
        </div>

        {/* App Grid - Organized sections */}
        <div className="flex-1 flex flex-col">
          {/* Time Tracking Row */}
          <div className="border-b-2 border-foreground">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
              <div className="border-b-2 md:border-b-0 md:border-r-2 border-foreground px-6 py-4 flex items-center">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Time Tracking</span>
              </div>
              <div className="grid grid-cols-2">
                {timeApps.map((app, index) => (
                  <AppTile 
                    key={app.name + app.route} 
                    {...app} 
                    isLast={index === timeApps.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Finance Row */}
          <div className="border-b-2 border-foreground">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
              <div className="border-b-2 md:border-b-0 md:border-r-2 border-foreground px-6 py-4 flex items-center">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Finance</span>
              </div>
              <div className="grid grid-cols-2">
                {financeApps.map((app, index) => (
                  <AppTile 
                    key={app.name + app.route} 
                    {...app} 
                    isLast={index === financeApps.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Utilities Row */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] h-full">
              <div className="border-b-2 md:border-b-0 md:border-r-2 border-foreground px-6 py-4 flex items-center">
                <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Utilities</span>
              </div>
              <div className="grid grid-cols-4">
                {utilityApps.map((app, index) => (
                  <AppTile 
                    key={app.name + app.route} 
                    {...app} 
                    isLast={index === utilityApps.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;