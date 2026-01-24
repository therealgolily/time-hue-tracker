import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, RefreshCw, LogOut, Building2 } from 'lucide-react';
import { AppTile } from '@/components/AppTile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CONSISTENCY_QUOTES } from '@/data/consistencyQuotes';

const STORAGE_KEY = 'home-quote-index';

const apps = [
  {
    name: 'Energy Tracker',
    route: '/energy-tracker',
    icon: Zap,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    name: 'Client Tracker',
    route: '/client-tracker',
    icon: Building2,
    gradient: 'bg-gradient-to-br from-blue-500 to-cyan-600',
  },
  {
    name: 'Refresh',
    route: '/refresh',
    icon: RefreshCw,
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
];

const Home = () => {
  useTheme();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const currentQuote = useMemo(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const index = stored ? parseInt(stored, 10) : 0;
    const quote = CONSISTENCY_QUOTES[index % CONSISTENCY_QUOTES.length];
    
    // Advance for next time
    const nextIndex = (index + 1) % CONSISTENCY_QUOTES.length;
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());
    
    return quote;
  }, []);

  // Show loading or nothing while checking auth
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">My Apps</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={signOut}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12 max-w-xl">
          <blockquote className="text-xl md:text-2xl font-light text-foreground leading-relaxed mb-3">
            "{currentQuote.text}"
          </blockquote>
          <p className="text-sm text-muted-foreground">— {currentQuote.author}</p>
        </div>

        {/* App Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-2xl">
          {apps.map((app) => (
            <AppTile key={app.name} {...app} />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground border-t border-border">
        Personal Dashboard
      </footer>
    </div>
  );
};

export default Home;
