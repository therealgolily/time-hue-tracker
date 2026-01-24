import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppTileProps {
  name: string;
  route: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  isLast?: boolean;
}

export const AppTile = ({ name, route, icon: Icon, comingSoon, isLast }: AppTileProps) => {
  if (comingSoon) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center gap-4 p-12 md:p-16 cursor-not-allowed opacity-40",
        "border-b-2 md:border-b-0 md:border-r-2 border-foreground",
        isLast && "border-b-0 md:border-r-0"
      )}>
        <Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
        <div className="text-center">
          <h3 className="text-lg font-bold uppercase tracking-widest">{name}</h3>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-2">Coming Soon</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={route}
      className={cn(
        "group flex flex-col items-center justify-center gap-4 p-12 md:p-16 transition-colors duration-200",
        "border-b-2 md:border-b-0 md:border-r-2 border-foreground",
        "hover:bg-primary hover:text-primary-foreground",
        isLast && "border-b-0 md:border-r-0"
      )}
    >
      <Icon className="w-12 h-12 md:w-16 md:h-16" strokeWidth={1.5} />
      <h3 className="text-lg font-bold uppercase tracking-widest">{name}</h3>
    </Link>
  );
};