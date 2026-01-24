import { useState } from "react";
import { ScenarioResult } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../lib/calculations";

interface MonthlyBreakdownTableProps {
  result: ScenarioResult;
}

export const MonthlyBreakdownTable: React.FC<MonthlyBreakdownTableProps> = ({ result }) => {
  const [showAll, setShowAll] = useState(false);
  const totalMonths = result.monthlyBreakdown.length;
  
  const getAssetSaleForMonth = (month: number): number => {
    if (!result.scenario.plannedAssetSales) return 0;
    return result.scenario.plannedAssetSales
      .filter(sale => sale.month === month)
      .reduce((sum, sale) => sum + sale.salePrice, 0);
  };

  const getEventsForMonth = (month: number): string => {
    if (!result.scenario.events || result.scenario.events.length === 0) return "-";
    const monthEvents = result.scenario.events
      .filter(e => e.startMonth === month || e.endMonth === month)
      .map(e => `${e.icon} ${e.description.slice(0, 20)}${e.description.length > 20 ? "..." : ""}`)
      .join(", ");
    return monthEvents || "-";
  };

  const getDisplayData = () => {
    if (showAll || totalMonths <= 24) {
      return result.monthlyBreakdown;
    }

    const first12 = result.monthlyBreakdown.slice(0, 12);
    const last12 = result.monthlyBreakdown.slice(-12);
    return [...first12, ...last12];
  };

  const displayData = getDisplayData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Month-by-Month Breakdown</CardTitle>
          {totalMonths > 24 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "Show Less" : `Show All ${totalMonths} Months`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Starting Balance</TableHead>
                <TableHead className="text-right">Payment</TableHead>
                <TableHead>Events</TableHead>
                <TableHead className="text-right">Interest</TableHead>
                <TableHead className="text-right">Principal</TableHead>
                <TableHead className="text-right">New Purchases</TableHead>
                <TableHead className="text-right">Ending Balance</TableHead>
                <TableHead className="text-right">Total Interest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((month, index) => {
                const showGap = !showAll && totalMonths > 24 && index === 12;
                return (
                  <>
                    {showGap && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-2">
                          ... {totalMonths - 24} months hidden ...
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(month.startingBalance)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(month.payment)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {getEventsForMonth(month.month)}
                      </TableCell>
                      <TableCell className="text-right text-destructive">{formatCurrency(month.interest)}</TableCell>
                      <TableCell className="text-right text-emerald-600 dark:text-emerald-400">{formatCurrency(month.principal)}</TableCell>
                      <TableCell className="text-right">{month.newPurchases > 0 ? formatCurrency(month.newPurchases) : "-"}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(month.endingBalance)}</TableCell>
                      <TableCell className="text-right font-medium text-destructive">
                        {formatCurrency(month.totalInterestPaid)}
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
