import { Zap, RefreshCw } from 'lucide-react';
import { AppTile } from '@/components/AppTile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const apps = [
  {
    name: 'Energy Tracker',
    description: 'Track your time & energy',
    route: '/energy-tracker',
    icon: Zap,
    gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
  },
  {
    name: 'Refresh',
    description: 'Daily reflection',
    route: '/refresh',
    icon: RefreshCw,
    gradient: 'bg-gradient-to-br from-violet-500 to-purple-600',
  },
];

const Home = () => {
  useTheme();
  const { user, signOut } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">My Apps</h1>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">{getGreeting()}</h2>
          <p className="text-muted-foreground">What would you like to work on?</p>
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
