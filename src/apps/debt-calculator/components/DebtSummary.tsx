import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CreditCard as CreditCardIcon, AlertTriangle, TrendingDown, DollarSign, Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditCard, OtherDebt } from "../types";
import { formatCurrency } from "../lib/calculations";

interface DebtSummaryProps {
  creditCards: CreditCard[];
  otherDebts: OtherDebt[];
}

export const DebtSummary: React.FC<DebtSummaryProps> = ({ creditCards, otherDebts }) => {
  const stats = useMemo(() => {
    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + card.balance, 0);
    const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.creditLimit, 0);
    const totalOtherDebt = otherDebts.reduce((sum, debt) => sum + debt.amount, 0);
    const totalDebt = totalCreditCardDebt + totalOtherDebt;
    const totalMinimumPayments = creditCards.reduce((sum, card) => sum + card.minimumPayment, 0);
    const overallUtilization = totalCreditLimit > 0 ? (totalCreditCardDebt / totalCreditLimit) * 100 : 0;
    const avgAPR = creditCards.length > 0 
      ? creditCards.reduce((sum, card) => sum + card.apr, 0) / creditCards.length 
      : 0;
    const highestAPR = creditCards.length > 0 
      ? Math.max(...creditCards.map(card => card.apr)) 
      : 0;

    // Find cards with high utilization (>30%)
    const highUtilizationCards = creditCards.filter(card => 
      card.creditLimit > 0 && (card.balance / card.creditLimit) * 100 > 30
    );

    return {
      totalDebt,
      totalCreditCardDebt,
      totalOtherDebt,
      totalCreditLimit,
      totalMinimumPayments,
      overallUtilization,
      avgAPR,
      highestAPR,
      highUtilizationCards,
      cardCount: creditCards.length,
      otherDebtCount: otherDebts.length,
    };
  }, [creditCards, otherDebts]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization <= 10) return "text-green-600 dark:text-green-400";
    if (utilization <= 30) return "text-yellow-600 dark:text-yellow-400";
    if (utilization <= 50) return "text-orange-600 dark:text-orange-400";
    return "text-destructive";
  };

  const getUtilizationBg = (utilization: number) => {
    if (utilization <= 10) return "bg-green-500";
    if (utilization <= 30) return "bg-yellow-500";
    if (utilization <= 50) return "bg-orange-500";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Debt */}
        <Card className="border-2 border-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Total Debt</p>
                <p className="text-2xl font-bold text-destructive mt-1">
                  {formatCurrency(stats.totalDebt)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Utilization */}
        <Card className="border-2 border-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Credit Utilization</p>
                <p className={cn("text-2xl font-bold mt-1", getUtilizationColor(stats.overallUtilization))}>
                  {stats.overallUtilization.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Percent className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <Progress 
              value={Math.min(stats.overallUtilization, 100)} 
              className="h-2 mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(stats.totalCreditCardDebt)} / {formatCurrency(stats.totalCreditLimit)}
            </p>
          </CardContent>
        </Card>

        {/* Monthly Minimums */}
        <Card className="border-2 border-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Monthly Minimums</p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(stats.totalMinimumPayments)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {stats.cardCount} card{stats.cardCount !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        {/* Average APR */}
        <Card className="border-2 border-foreground">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Average APR</p>
                <p className="text-2xl font-bold mt-1">
                  {stats.avgAPR.toFixed(1)}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <CreditCardIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Highest: {stats.highestAPR.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Other Debts Summary */}
      {otherDebts.length > 0 && (
        <Card className="border-2 border-foreground">
          <CardHeader className="border-b-2 border-foreground pb-4">
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Other Debts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {otherDebts.map(debt => (
                <div key={debt.id} className="flex items-center justify-between p-3 bg-muted/50 rounded border">
                  <div>
                    <span className="font-medium">{debt.name}</span>
                    <span className="text-xs text-muted-foreground ml-2 capitalize">
                      ({debt.type.replace('_', ' ')})
                    </span>
                  </div>
                  <span className="font-bold text-destructive">
                    {formatCurrency(debt.amount)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t font-bold">
                <span>Total Other Debts</span>
                <span className="text-destructive">{formatCurrency(stats.totalOtherDebt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Utilization Warning */}
      {stats.highUtilizationCards.length > 0 && (
        <Card className="border-2 border-orange-500 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-orange-600 dark:text-orange-400">High Credit Utilization</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.highUtilizationCards.length} card{stats.highUtilizationCards.length !== 1 ? 's have' : ' has'} utilization above 30%, 
                  which may negatively impact your credit score. Consider paying down these balances first:
                </p>
                <ul className="mt-2 space-y-1">
                  {stats.highUtilizationCards.map(card => (
                    <li key={card.id} className="text-sm">
                      • <span className="font-medium">{card.name}</span>: {((card.balance / card.creditLimit) * 100).toFixed(0)}% utilized
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

