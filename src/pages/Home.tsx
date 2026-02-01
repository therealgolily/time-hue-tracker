import { useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CONSISTENCY_QUOTES } from '@/data/consistencyQuotes';

const STORAGE_KEY = 'home-quote-index';

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

        {/* Two large buttons */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
          <Link
            to="/apps/personal"
            className="flex items-center justify-center p-12 md:p-16 border-b-2 md:border-b-0 md:border-r-2 border-foreground hover:bg-primary hover:text-primary-foreground transition-colors group"
          >
            <span className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest transition-transform duration-300 group-hover:scale-110">
              Personal
            </span>
          </Link>
          <Link
            to="/apps/work"
            className="flex items-center justify-center p-12 md:p-16 hover:bg-primary hover:text-primary-foreground transition-colors group"
          >
            <span className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-widest transition-transform duration-300 group-hover:scale-110">
              Work
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
