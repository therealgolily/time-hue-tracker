import { useState, useMemo } from "react";
import { format, addMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { ChevronDown, ChevronUp, Calendar, TrendingDown } from "lucide-react";
import { formatCurrency } from "../lib/calculations";
import { CreditCard } from "../types";

interface PayoffResult {
  cardId: string;
  cardName: string;
  currentBalance: number;
  apr: number;
  requiredPayment: number;
  totalPayments: number;
  totalInterest: number;
  payoffDate: Date;
  minimumPayment: number;
  extraNeeded: number;
  payoffOrder?: number;
  monthsToPayoff?: number;
}

interface MonthlyAmortization {
  month: number;
  date: Date;
  startingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  endingBalance: number;
  cumulativeInterest: number;
  cumulativePrincipal: number;
}

interface CardAmortization {
  cardId: string;
  cardName: string;
  apr: number;
  startingBalance: number;
  schedule: MonthlyAmortization[];
  totalInterest: number;
  totalPayments: number;
}

interface AmortizationScheduleProps {
  results: PayoffResult[];
  cards: CreditCard[];
  startDate: Date;
  totalMonthlyPayment: number;
  strategy: "snowball" | "avalanche" | "simultaneous";
}

// Generate amortization schedule for a single card
const generateCardAmortization = (
  card: CreditCard,
  monthlyPayment: number,
  startDate: Date,
  maxMonths: number = 600
): CardAmortization => {
  const schedule: MonthlyAmortization[] = [];
  const monthlyRate = card.apr / 100 / 12;
  let balance = card.balance;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= maxMonths && balance > 0.01; month++) {
    const startingBalance = balance;
    const interest = balance * monthlyRate;
    const payment = Math.min(monthlyPayment, balance + interest);
    const principal = payment - interest;
    balance = Math.max(0, balance + interest - payment);

    cumulativeInterest += interest;
    cumulativePrincipal += principal;

    schedule.push({
      month,
      date: addMonths(startDate, month),
      startingBalance,
      payment,
      interest,
      principal,
      endingBalance: balance,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  return {
    cardId: card.id,
    cardName: card.name,
    apr: card.apr,
    startingBalance: card.balance,
    schedule,
    totalInterest: cumulativeInterest,
    totalPayments: schedule.length,
  };
};

// Generate combined amortization for all cards
const generateCombinedAmortization = (
  cards: CreditCard[],
  results: PayoffResult[],
  totalMonthlyPayment: number,
  startDate: Date,
  strategy: "snowball" | "avalanche" | "simultaneous"
): MonthlyAmortization[] => {
  const maxMonths = Math.max(...results.map(r => r.monthsToPayoff || 0), 1);
  const combined: MonthlyAmortization[] = [];

  // Sort cards based on strategy
  const sortedCards = [...cards].sort((a, b) => {
    if (strategy === "snowball") return a.balance - b.balance;
    if (strategy === "avalanche") return b.apr - a.apr;
    return 0;
  });

  const balances = new Map(cards.map(c => [c.id, c.balance]));
  const minimums = new Map(cards.map(c => [c.id, c.minimumPayment]));
  const aprs = new Map(cards.map(c => [c.id, c.apr]));
  
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;

  for (let month = 1; month <= maxMonths; month++) {
    let monthlyInterest = 0;
    let monthlyPrincipal = 0;
    let monthlyPayment = 0;
    let startingBalance = 0;

    // Calculate starting balance
    balances.forEach(balance => {
      startingBalance += balance;
    });

    // Get active cards
    const activeCards = sortedCards.filter(c => (balances.get(c.id) || 0) > 0.01);
    
    if (activeCards.length === 0) break;

    if (strategy === "simultaneous") {
      // Distribute payment proportionally
      const totalBalance = activeCards.reduce((sum, c) => sum + (balances.get(c.id) || 0), 0);
      
      for (const card of activeCards) {
        const balance = balances.get(card.id) || 0;
        const proportion = balance / totalBalance;
        const cardPayment = totalMonthlyPayment * proportion;
        const monthlyRate = (aprs.get(card.id) || 0) / 100 / 12;
        
        const interest = balance * monthlyRate;
        const principal = Math.min(cardPayment - interest, balance);
        
        monthlyInterest += interest;
        monthlyPrincipal += principal;
        monthlyPayment += Math.min(cardPayment, balance + interest);
        
        balances.set(card.id, Math.max(0, balance + interest - cardPayment));
      }
    } else {
      // Snowball/Avalanche: pay minimums first, then extra to priority card
      let extraPayment = totalMonthlyPayment;

      // Pay minimums and calculate interest for all cards
      for (const card of activeCards) {
        const balance = balances.get(card.id) || 0;
        const minimum = minimums.get(card.id) || 0;
        const monthlyRate = (aprs.get(card.id) || 0) / 100 / 12;
        
        const interest = balance * monthlyRate;
        monthlyInterest += interest;
        
        extraPayment -= minimum;
        balances.set(card.id, balance + interest - minimum);
        monthlyPayment += minimum;
        monthlyPrincipal += minimum - interest;
      }

      // Apply extra payment to priority card
      if (extraPayment > 0 && activeCards.length > 0) {
        const priorityCard = activeCards[0];
        const balance = balances.get(priorityCard.id) || 0;
        const extraApplied = Math.min(extraPayment, balance);
        
        balances.set(priorityCard.id, Math.max(0, balance - extraApplied));
        monthlyPayment += extraApplied;
        monthlyPrincipal += extraApplied;
      }
    }

    cumulativeInterest += monthlyInterest;
    cumulativePrincipal += monthlyPrincipal;

    let endingBalance = 0;
    balances.forEach(balance => {
      endingBalance += Math.max(0, balance);
    });

    combined.push({
      month,
      date: addMonths(startDate, month),
      startingBalance,
      payment: monthlyPayment,
      interest: monthlyInterest,
      principal: monthlyPrincipal,
      endingBalance,
      cumulativeInterest,
      cumulativePrincipal,
    });
  }

  return combined;
};

export const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  results,
  cards,
  startDate,
  totalMonthlyPayment,
  strategy,
}) => {
  const [showAllRows, setShowAllRows] = useState(false);
  const [activeTab, setActiveTab] = useState<"combined" | string>("combined");

  const combinedSchedule = useMemo(() => {
    return generateCombinedAmortization(cards, results, totalMonthlyPayment, startDate, strategy);
  }, [cards, results, totalMonthlyPayment, startDate, strategy]);

  const cardSchedules = useMemo(() => {
    return results.map(result => {
      const card = cards.find(c => c.id === result.cardId);
      if (!card) return null;
      
      // For individual cards, calculate their portion of the payment
      const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
      const proportion = card.balance / totalBalance;
      const cardPayment = totalMonthlyPayment * proportion;
      
      return generateCardAmortization(card, cardPayment, startDate);
    }).filter(Boolean) as CardAmortization[];
  }, [cards, results, totalMonthlyPayment, startDate]);

  const chartData = useMemo(() => {
    return combinedSchedule.map(month => ({
      month: month.month,
      monthLabel: format(month.date, "MMM yy"),
      interest: month.interest,
      principal: month.principal,
      balance: month.endingBalance,
    }));
  }, [combinedSchedule]);

  const getDisplayData = (schedule: MonthlyAmortization[]) => {
    if (showAllRows || schedule.length <= 24) {
      return schedule;
    }
    return [...schedule.slice(0, 12), ...schedule.slice(-12)];
  };

  const totalInterest = combinedSchedule.length > 0 
    ? combinedSchedule[combinedSchedule.length - 1].cumulativeInterest 
    : 0;
  const totalPrincipal = combinedSchedule.length > 0 
    ? combinedSchedule[combinedSchedule.length - 1].cumulativePrincipal 
    : 0;

  return (
    <Card className="border-2 border-foreground">
      <CardHeader className="border-b-2 border-foreground pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle className="text-lg font-bold uppercase tracking-wider">
            Amortization Schedule
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Month-by-month breakdown of principal vs interest payments
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Total Payments</p>
            <p className="text-lg font-bold">{combinedSchedule.length} months</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Total Principal</p>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPrincipal)}
            </p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Total Interest</p>
            <p className="text-lg font-bold text-destructive">{formatCurrency(totalInterest)}</p>
          </div>
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-[10px] font-mono uppercase text-muted-foreground">Interest Ratio</p>
            <p className="text-lg font-bold">
              {((totalInterest / (totalPrincipal + totalInterest)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div>
          <h4 className="text-sm font-mono uppercase tracking-wider mb-3">Payment Breakdown Over Time</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="2%">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="monthLabel" 
                  tick={{ fontSize: 10 }}
                  interval={Math.ceil(chartData.length / 12) - 1}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrency(value),
                    name === "interest" ? "Interest" : "Principal"
                  ]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="interest" 
                  stackId="a" 
                  fill="hsl(var(--destructive))" 
                  name="Interest"
                />
                <Bar 
                  dataKey="principal" 
                  stackId="a" 
                  fill="hsl(var(--chart-2))" 
                  name="Principal"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Over Time Chart */}
        <div>
          <h4 className="text-sm font-mono uppercase tracking-wider mb-3">Remaining Balance Over Time</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="monthLabel" 
                  tick={{ fontSize: 10 }}
                  interval={Math.ceil(chartData.length / 12) - 1}
                />
                <YAxis 
                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), "Balance"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary) / 0.2)"
                  name="Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="combined">Combined</TabsTrigger>
            {cardSchedules.map(schedule => (
              <TabsTrigger key={schedule.cardId} value={schedule.cardId}>
                {schedule.cardName}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="combined">
            <AmortizationTable 
              schedule={combinedSchedule}
              showAllRows={showAllRows}
              onToggleShowAll={() => setShowAllRows(!showAllRows)}
              getDisplayData={getDisplayData}
            />
          </TabsContent>

          {cardSchedules.map(cardSchedule => (
            <TabsContent key={cardSchedule.cardId} value={cardSchedule.cardId}>
              <div className="mb-3 p-3 bg-muted/50 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-medium">{cardSchedule.cardName}</span>
                  <span className="text-sm text-muted-foreground ml-2">
                    {cardSchedule.apr}% APR • Starting: {formatCurrency(cardSchedule.startingBalance)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Total Interest: </span>
                  <span className="font-medium text-destructive">{formatCurrency(cardSchedule.totalInterest)}</span>
                </div>
              </div>
              <AmortizationTable 
                schedule={cardSchedule.schedule}
                showAllRows={showAllRows}
                onToggleShowAll={() => setShowAllRows(!showAllRows)}
                getDisplayData={getDisplayData}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface AmortizationTableProps {
  schedule: MonthlyAmortization[];
  showAllRows: boolean;
  onToggleShowAll: () => void;
  getDisplayData: (schedule: MonthlyAmortization[]) => MonthlyAmortization[];
}

const AmortizationTable: React.FC<AmortizationTableProps> = ({
  schedule,
  showAllRows,
  onToggleShowAll,
  getDisplayData,
}) => {
  const displayData = getDisplayData(schedule);
  const hasHiddenRows = schedule.length > 24 && !showAllRows;

  return (
    <div className="space-y-3">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Month</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Starting</TableHead>
              <TableHead className="text-right">Payment</TableHead>
              <TableHead className="text-right">Interest</TableHead>
              <TableHead className="text-right">Principal</TableHead>
              <TableHead className="text-right">Ending</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((month, index) => {
              const showGap = hasHiddenRows && index === 12;
              return (
                <> 
                  {showGap && (
                    <TableRow key="gap">
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-2 bg-muted/30">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingDown className="h-4 w-4" />
                          <span>... {schedule.length - 24} months hidden ...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow key={month.month}>
                    <TableCell className="font-medium">{month.month}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(month.date, "MMM yyyy")}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(month.startingBalance)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(month.payment)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(month.interest)}</TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(month.principal)}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(month.endingBalance)}</TableCell>
                  </TableRow>
                </>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {schedule.length > 24 && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleShowAll}
            className="gap-2"
          >
            {showAllRows ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show All {schedule.length} Months
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
