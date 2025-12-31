import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppTileProps {
  name: string;
  description: string;
  route: string;
  icon: LucideIcon;
  gradient: string;
  comingSoon?: boolean;
}

export const AppTile = ({ name, description, route, icon: Icon, gradient, comingSoon }: AppTileProps) => {
  if (comingSoon) {
    return (
      <div className="group flex flex-col items-center gap-3 p-6 cursor-not-allowed opacity-60">
        <div
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg",
            "bg-muted"
          )}
        >
          <Icon className="w-10 h-10 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">{name}</h3>
          <p className="text-xs text-muted-foreground mt-1">Coming Soon</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={route}
      className="group flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:bg-accent/50"
    >
      <div
        className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:shadow-xl",
          gradient
        )}
      >
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div className="text-center">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{name}</h3>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
    </Link>
  );
};
