import { ScenarioResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "../lib/calculations";

interface CardBreakdownProps {
  result: ScenarioResult;
}

export const CardBreakdown: React.FC<CardBreakdownProps> = ({ result }) => {
  const sortedCards = [...result.cardDetails].sort((a, b) => a.payoffMonth - b.payoffMonth);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Individual Card Payoff Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedCards.map((card) => (
            <div key={card.cardId} className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-lg">{card.cardName}</h4>
                <span className="text-sm text-muted-foreground">
                  Paid off in month {card.payoffMonth}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-sm text-muted-foreground">Payoff Month:</span>
                  <p className="font-semibold">{card.payoffMonth}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Total Interest:</span>
                  <p className="font-semibold text-destructive">{formatCurrency(card.totalInterest)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
