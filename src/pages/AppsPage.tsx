import { Link, useParams, Navigate } from 'react-router-dom';
import { User, Briefcase } from 'lucide-react';
import { AppTile } from '@/components/AppTile';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

const personalApps = [
  { name: 'Time Tracking', route: '/personal-time-tracker' },
  { name: 'Finance', route: '/personal-finance' },
  { name: 'Journal', route: '/journal' },
  { name: 'Timeline', route: '/timeline' },
];

const workApps = [
  { name: 'Time Tracking', route: '/work-time-tracker' },
  { name: 'Finance', route: '/business-finance' },
  { name: 'Calendar', route: '/calendar' },
  { name: 'Tasks', route: 'tasks.rosserresults.com', external: true },
];

const AppsPage = () => {
  useTheme();
  const { category } = useParams<{ category: string }>();

  if (category !== 'personal' && category !== 'work') {
    return <Navigate to="/" replace />;
  }

  const isPersonal = category === 'personal';
  const apps = isPersonal ? personalApps : workApps;
  const oppositeCategory = isPersonal ? 'work' : 'personal';
  const CategoryIcon = isPersonal ? User : Briefcase;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b-2 border-foreground">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              to={`/apps/${oppositeCategory}`}
              className="p-2 border-2 border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-xs font-mono uppercase tracking-widest"
            >
              Switch to {oppositeCategory}
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CategoryIcon className="w-4 h-4" />
              <h1 className="text-sm font-bold uppercase tracking-widest">{category}</h1>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Apps Grid */}
      <main className="flex-1 grid grid-cols-2 md:grid-cols-4">
        {apps.map((app, index) => (
          <AppTile
            key={app.name + app.route}
            {...app}
            isLast={index === apps.length - 1}
          />
        ))}
      </main>
    </div>
  );
};

export default AppsPage;
