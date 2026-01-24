import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

interface NetWorthSummaryProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
}

export const NetWorthSummary = ({ totalAssets, totalLiabilities, netWorth }: NetWorthSummaryProps) => {
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
  const isPositive = netWorth >= 0;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Net Worth Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">Total Assets</p>
            <p className="text-2xl font-bold text-positive flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4" />
              ${totalAssets.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Liabilities</p>
            <p className="text-2xl font-bold text-destructive flex items-center gap-1">
              <ArrowDownRight className="h-4 w-4" />
              ${totalLiabilities.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net Worth</p>
            <p className={`text-2xl font-bold ${isPositive ? "text-positive" : "text-destructive"}`}>
              ${netWorth.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Debt-to-Asset Ratio</p>
            <p className="text-2xl font-bold">
              {debtToAssetRatio.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
