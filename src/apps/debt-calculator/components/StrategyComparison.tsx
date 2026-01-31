import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Snowflake, Flame, Layers, TrendingDown, Trophy } from "lucide-react";
import { formatCurrency } from "../lib/calculations";
import { cn } from "@/lib/utils";

interface StrategyResult {
  strategy: "snowball" | "avalanche" | "simultaneous";
  totalInterest: number;
  totalMonths: number;
}

interface StrategyComparisonProps {
  results: StrategyResult[];
  currentStrategy: "snowball" | "avalanche" | "simultaneous";
}

const strategyInfo = {
  snowball: {
    name: "Snowball",
    description: "Smallest balance first",
    icon: Snowflake,
    color: "hsl(var(--chart-2))",
  },
  avalanche: {
    name: "Avalanche",
    description: "Highest APR first",
    icon: Flame,
    color: "hsl(var(--chart-1))",
  },
  simultaneous: {
    name: "Simultaneous",
    description: "Pay all proportionally",
    icon: Layers,
    color: "hsl(var(--chart-3))",
  },
};

export const StrategyComparison: React.FC<StrategyComparisonProps> = ({
  results,
  currentStrategy,
}) => {
  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => a.totalInterest - b.totalInterest);
  }, [results]);

  const bestStrategy = sortedResults[0];
  const worstStrategy = sortedResults[sortedResults.length - 1];
  const maxInterest = worstStrategy?.totalInterest || 0;
  const potentialSavings = worstStrategy && bestStrategy 
    ? worstStrategy.totalInterest - bestStrategy.totalInterest 
    : 0;

  if (results.length === 0) return null;

  return (
    <Card className="border-2 border-foreground">
      <CardHeader className="border-b-2 border-foreground pb-4">
        <div className="flex items-center gap-2">
          <TrendingDown className="h-5 w-5" />
          <CardTitle className="text-lg font-bold uppercase tracking-wider">
            Strategy Comparison
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Bar Chart Comparison */}
        <div className="space-y-4">
          {sortedResults.map((result, index) => {
            const info = strategyInfo[result.strategy];
            const Icon = info.icon;
            const barWidth = maxInterest > 0 
              ? (result.totalInterest / maxInterest) * 100 
              : 0;
            const isBest = index === 0;
            const isSelected = result.strategy === currentStrategy;
            const savingsVsBest = result.totalInterest - bestStrategy.totalInterest;

            return (
              <div
                key={result.strategy}
                className={cn(
                  "p-4 rounded-lg border-2 transition-colors",
                  isSelected 
                    ? "border-primary bg-primary/5" 
                    : "border-muted"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${info.color}20` }}
                    >
                      <Icon 
                        className="h-5 w-5" 
                        style={{ color: info.color }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{info.name}</span>
                        {isBest && (
                          <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                            <Trophy className="h-3 w-3" />
                            Best
                          </span>
                        )}
                        {isSelected && !isBest && (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold" style={{ color: info.color }}>
                      {formatCurrency(result.totalInterest)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {result.totalMonths} months
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-3 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-sm transition-all duration-500"
                    style={{ 
                      width: `${barWidth}%`,
                      backgroundColor: info.color,
                      opacity: 0.7,
                    }}
                  />
                </div>

                {/* Savings indicator */}
                {!isBest && savingsVsBest > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    +{formatCurrency(savingsVsBest)} more than {strategyInfo[bestStrategy.strategy].name}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Potential Savings Summary */}
        {potentialSavings > 0 && currentStrategy !== bestStrategy.strategy && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">
                  Switch to {strategyInfo[bestStrategy.strategy].name} to save {formatCurrency(
                    sortedResults.find(r => r.strategy === currentStrategy)!.totalInterest - bestStrategy.totalInterest
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  Using {strategyInfo[bestStrategy.strategy].description.toLowerCase()} minimizes total interest paid
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Already using best strategy */}
        {currentStrategy === bestStrategy.strategy && potentialSavings > 0 && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">
                  You're using the optimal strategy!
                </p>
                <p className="text-xs text-muted-foreground">
                  {strategyInfo[bestStrategy.strategy].name} saves you {formatCurrency(potentialSavings)} compared to {strategyInfo[worstStrategy.strategy].name}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
