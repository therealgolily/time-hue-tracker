import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface AppTileProps {
  name: string;
  route: string;
  comingSoon?: boolean;
  isLast?: boolean;
  external?: boolean;
}

export const AppTile = ({ name, route, comingSoon, isLast, external }: AppTileProps) => {
  const baseStyles = cn(
    "flex flex-col items-center justify-center gap-3 p-8 md:p-12 transition-colors duration-200",
    "border-b-2 md:border-b-0 md:border-r-2 border-foreground",
    isLast && "border-b-0 md:border-r-0"
  );

  if (comingSoon) {
    return (
      <div className={cn(baseStyles, "cursor-not-allowed opacity-40")}>
        <div className="text-center">
          <h3 className="text-sm font-bold uppercase tracking-widest">{name}</h3>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">Soon</p>
        </div>
      </div>
    );
  }

  if (external) {
    return (
      <a
        href={route.startsWith('http') ? route : `https://${route}`}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          baseStyles,
          "hover:bg-primary hover:text-primary-foreground"
        )}
      >
        <h3 className="text-sm font-bold uppercase tracking-widest text-center">{name}</h3>
      </a>
    );
  }

  return (
    <Link
      to={route}
      className={cn(
        baseStyles,
        "hover:bg-primary hover:text-primary-foreground"
      )}
    >
      <h3 className="text-sm font-bold uppercase tracking-widest text-center">{name}</h3>
    </Link>
  );
};