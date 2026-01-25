import { FlaskConical } from 'lucide-react';

export const ScenarioPlayground = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Scenario Playground</h1>
        <p className="text-muted-foreground mt-1">
          Test different financial scenarios
        </p>
      </div>
      <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
        <FlaskConical className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Scenario Planning</h3>
        <p className="text-muted-foreground">
          Use the full version in the original app for what-if analysis.
        </p>
      </div>
    </div>
  );
};
