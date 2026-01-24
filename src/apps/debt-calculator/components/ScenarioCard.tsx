import { ScenarioResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2 } from "lucide-react";
import { formatCurrency, formatDate } from "../lib/calculations";
import { cn } from "@/lib/utils";

interface ScenarioCardProps {
  result: ScenarioResult;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  totalAssets?: number;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({ result, isSelected, onSelect, onDelete, totalAssets = 0 }) => {
  const finalBalance = result.monthlyBreakdown[result.monthlyBreakdown.length - 1]?.endingBalance || 0;
  const projectedNetWorth = totalAssets - finalBalance;
  const hasAssetSales = result.scenario.plannedAssetSales && result.scenario.plannedAssetSales.length > 0;
  const hasEvents = result.scenario.events && result.scenario.events.length > 0;
  
  // Calculate total monthly purchases across all cards
  const totalMonthlyPurchases = result.monthlyBreakdown[0]?.newPurchases || 0;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {isSelected && <CheckCircle2 className="h-5 w-5 text-primary" />}
            <CardTitle className="text-lg">{result.scenario.name}</CardTitle>
          </div>
          {onDelete && !result.scenario.isDefault && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Monthly Payment:</span>
          <span className="font-bold text-primary">{formatCurrency(result.monthlyPayment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Payoff Date:</span>
          <span className="font-medium">{formatDate(result.payoffDate)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Months to Payoff:</span>
          <span className="font-medium">{result.totalMonths} months</span>
        </div>
        <div className="flex justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Total Interest:</span>
          <span className="font-semibold text-destructive">{formatCurrency(result.totalInterest)}</span>
        </div>
        {hasEvents && (
          <div className="pt-2 border-t">
            <div className="text-xs font-medium text-foreground mb-2">Timeline Events:</div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {result.scenario.events!.slice(0, 3).map((event, idx) => (
                <div key={idx} className="text-xs text-muted-foreground flex items-start gap-1">
                  <span>{event.icon}</span>
                  <span>Month {event.startMonth}: {event.description}</span>
                </div>
              ))}
              {result.scenario.events!.length > 3 && (
                <div className="text-xs text-muted-foreground italic">
                  +{result.scenario.events!.length - 3} more events...
                </div>
              )}
            </div>
          </div>
        )}
        {hasAssetSales && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">Includes asset sales:</div>
            {result.scenario.plannedAssetSales!.map((sale, idx) => (
              <div key={idx}>
                • {sale.assetName} for {formatCurrency(sale.salePrice)} in month {sale.month}
              </div>
            ))}
          </div>
        )}
        {result.scenario.freezeSpending ? (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Assumes no new purchases</span> during payoff period
          </div>
        ) : totalMonthlyPurchases > 0 && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Includes monthly purchases:</span> {formatCurrency(totalMonthlyPurchases)}/month
          </div>
        )}
        {totalAssets > 0 && (
          <div className="flex justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">Projected Net Worth:</span>
            <span className={`font-semibold ${projectedNetWorth >= 0 ? "text-positive" : "text-destructive"}`}>
              {formatCurrency(projectedNetWorth)}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
