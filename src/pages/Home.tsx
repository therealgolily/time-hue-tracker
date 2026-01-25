import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, RefreshCw, LogOut, Building2, Calculator, TrendingUp } from 'lucide-react';
import { AppTile } from '@/components/AppTile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CONSISTENCY_QUOTES } from '@/data/consistencyQuotes';

const STORAGE_KEY = 'home-quote-index';

const apps = [
  {
    name: 'Energy',
    route: '/energy-tracker',
    icon: Zap,
  },
  {
    name: 'Clients',
    route: '/client-tracker',
    icon: Building2,
  },
  {
    name: 'Refresh',
    route: '/refresh',
    icon: RefreshCw,
  },
  {
    name: 'Debt',
    route: '/debt-calculator',
    icon: Calculator,
  },
  {
    name: 'Finance',
    route: '/finance',
    icon: TrendingUp,
  },
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
      {/* Header - Swiss style with bold typography */}
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

      {/* Main Content - Grid-based Swiss layout */}
      <main className="flex-1 flex flex-col">
        {/* Quote section - Large typography */}
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

        {/* App Grid - Swiss grid system */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 border-b-2 border-foreground">
          {apps.map((app, index) => (
            <AppTile key={app.name} {...app} isLast={index === apps.length - 1} />
          ))}
        </div>
      </main>

      {/* Footer - Minimal */}
      <footer className="px-6 py-4">
        <div className="container mx-auto">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Personal Dashboard
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;