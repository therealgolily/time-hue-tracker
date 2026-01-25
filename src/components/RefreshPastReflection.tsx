import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface Reflection {
  date: string;
  accomplishment_1: string | null;
  accomplishment_2: string | null;
  accomplishment_3: string | null;
  priority_1: string | null;
  priority_2: string | null;
  priority_3: string | null;
}

interface RefreshPastReflectionProps {
  reflection: Reflection;
  onBack: () => void;
}

const RefreshPastReflection = ({ reflection, onBack }: RefreshPastReflectionProps) => {
  const accomplishments = [
    reflection.accomplishment_1,
    reflection.accomplishment_2,
    reflection.accomplishment_3,
  ].filter(Boolean);

  const priorities = [
    reflection.priority_1,
    reflection.priority_2,
    reflection.priority_3,
  ].filter(Boolean);

  const formattedDate = format(new Date(reflection.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="p-2 hover:bg-accent rounded-lg transition-colors">
            <Home className="h-5 w-5 text-foreground" />
          </Link>
          <h1 className="text-xl font-semibold text-foreground">Journal</h1>
          <div className="w-9" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Calendar
        </Button>

        {/* Date header */}
        <h2 className="text-2xl font-light text-foreground mb-8 text-center">
          {formattedDate}
        </h2>

        {/* Accomplishments Section */}
        <section className="mb-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-4">
            What I accomplished
          </h3>
          {accomplishments.length > 0 ? (
            <div className="space-y-3">
              {accomplishments.map((item, index) => (
                <div 
                  key={`accomplishment-${index}`} 
                  className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border"
                >
                  <span className="text-muted-foreground font-mono text-sm">
                    {index + 1}.
                  </span>
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No accomplishments recorded</p>
          )}
        </section>

        {/* Priorities Section */}
        <section className="mb-12">
          <h3 className="text-lg font-medium text-muted-foreground mb-4">
            Tomorrow's priorities
          </h3>
          {priorities.length > 0 ? (
            <div className="space-y-3">
              {priorities.map((item, index) => (
                <div 
                  key={`priority-${index}`} 
                  className="flex items-start gap-3 bg-card rounded-lg p-4 border border-border"
                >
                  <span className="text-muted-foreground font-mono text-sm">
                    {index + 1}.
                  </span>
                  <p className="text-foreground">{item}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No priorities recorded</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default RefreshPastReflection;
