import { useState, useMemo } from "react";
import { format, differenceInMonths, addMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calculator, CalendarIcon, TrendingDown, Target, Clock, Snowflake, Flame, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../lib/calculations";
import { CreditCard } from "../types";

type PaymentFrequency = "monthly" | "biweekly" | "weekly";
type PayoffStrategy = "snowball" | "avalanche" | "simultaneous";

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

interface CalculatorState {
  selectedCardIds: string[];
  targetDate: Date | undefined;
  frequency: PaymentFrequency;
  strategy: PayoffStrategy;
}

// Calculate months to pay off a single card with given monthly payment
const calculateMonthsToPayoff = (
  balance: number,
  apr: number,
  monthlyPayment: number
): number => {
  if (balance <= 0 || monthlyPayment <= 0) return 0;
  
  const monthlyRate = apr / 100 / 12;
  
  if (monthlyRate === 0) {
    return Math.ceil(balance / monthlyPayment);
  }
  
  // n = -log(1 - (r * PV / P)) / log(1 + r)
  const ratio = 1 - (monthlyRate * balance / monthlyPayment);
  if (ratio <= 0) return Infinity; // Payment too low to ever pay off
  
  const months = -Math.log(ratio) / Math.log(1 + monthlyRate);
  return Math.ceil(months);
};

// Calculate required payment to pay off balance by target date
const calculateRequiredPayment = (
  balance: number,
  apr: number,
  monthsToPayoff: number
): number => {
  if (balance <= 0 || monthsToPayoff <= 0) return 0;
  
  const monthlyRate = apr / 100 / 12;
  
  if (monthlyRate === 0) {
    return balance / monthsToPayoff;
  }
  
  // PMT formula: P = (r * PV) / (1 - (1 + r)^-n)
  const payment = (monthlyRate * balance) / (1 - Math.pow(1 + monthlyRate, -monthsToPayoff));
  
  return Math.ceil(payment * 100) / 100; // Round up to nearest cent
};

// Calculate total interest paid over the payoff period
const calculateTotalInterest = (
  balance: number,
  apr: number,
  monthlyPayment: number,
  monthsToPayoff: number
): number => {
  let remainingBalance = balance;
  let totalInterest = 0;
  const monthlyRate = apr / 100 / 12;
  
  for (let month = 0; month < monthsToPayoff && remainingBalance > 0; month++) {
    const interest = remainingBalance * monthlyRate;
    totalInterest += interest;
    remainingBalance = remainingBalance + interest - monthlyPayment;
  }
  
  return Math.max(0, totalInterest);
};

// Convert monthly payment to different frequencies
const convertPaymentFrequency = (monthlyPayment: number, frequency: PaymentFrequency): number => {
  switch (frequency) {
    case "weekly":
      return monthlyPayment * 12 / 52;
    case "biweekly":
      return monthlyPayment * 12 / 26;
    case "monthly":
    default:
      return monthlyPayment;
  }
};

const getFrequencyLabel = (frequency: PaymentFrequency): string => {
  switch (frequency) {
    case "weekly": return "weekly";
    case "biweekly": return "bi-weekly";
    case "monthly": return "monthly";
  }
};

const getFrequencyMultiplier = (frequency: PaymentFrequency): number => {
  switch (frequency) {
    case "weekly": return 52 / 12;
    case "biweekly": return 26 / 12;
    case "monthly": return 1;
  }
};

const strategyInfo: Record<PayoffStrategy, { name: string; description: string; icon: React.ReactNode }> = {
  snowball: {
    name: "Debt Snowball",
    description: "Pay smallest balance first for quick wins & motivation",
    icon: <Snowflake className="h-5 w-5" />,
  },
  avalanche: {
    name: "Debt Avalanche",
    description: "Pay highest interest rate first to save the most money",
    icon: <Flame className="h-5 w-5" />,
  },
  simultaneous: {
    name: "Simultaneous",
    description: "Pay all debts proportionally at the same time",
    icon: <Layers className="h-5 w-5" />,
  },
};

// Calculate payoff plan based on strategy
const calculateStrategyPayoff = (
  cards: CreditCard[],
  targetDate: Date,
  today: Date,
  strategy: PayoffStrategy,
  frequency: PaymentFrequency
): { results: PayoffResult[]; totalMonthlyPayment: number } => {
  const monthsToPayoff = Math.max(1, differenceInMonths(targetDate, today));
  
  if (strategy === "simultaneous") {
    // Original behavior - pay all cards proportionally
    const results = cards.map(card => {
      const requiredMonthlyPayment = calculateRequiredPayment(card.balance, card.apr, monthsToPayoff);
      const totalInterest = calculateTotalInterest(card.balance, card.apr, requiredMonthlyPayment, monthsToPayoff);
      const frequencyPayment = convertPaymentFrequency(requiredMonthlyPayment, frequency);
      const paymentsCount = Math.ceil(monthsToPayoff * getFrequencyMultiplier(frequency));

      return {
        cardId: card.id,
        cardName: card.name,
        currentBalance: card.balance,
        apr: card.apr,
        requiredPayment: frequencyPayment,
        totalPayments: paymentsCount,
        totalInterest,
        payoffDate: targetDate,
        minimumPayment: card.minimumPayment,
        extraNeeded: Math.max(0, requiredMonthlyPayment - card.minimumPayment),
        monthsToPayoff,
      };
    });

    const totalMonthlyPayment = results.reduce((sum, r) => {
      const monthly = r.requiredPayment / getFrequencyMultiplier(frequency);
      return sum + monthly;
    }, 0);

    return { results, totalMonthlyPayment };
  }

  // For snowball/avalanche - we need to calculate the required total monthly payment
  // to pay off all debts by the target date, allocating extra to priority debts
  
  // Sort cards by strategy
  const sortedCards = [...cards].sort((a, b) => {
    if (strategy === "snowball") {
      return a.balance - b.balance; // Smallest balance first
    } else {
      return b.apr - a.apr; // Highest APR first
    }
  });

  // First, calculate total required monthly payment to hit target date
  // We'll use binary search to find the right total payment
  const totalBalance = cards.reduce((sum, c) => sum + c.balance, 0);
  const totalMinimums = cards.reduce((sum, c) => sum + c.minimumPayment, 0);
  
  // Calculate if minimums alone can pay off by target date
  let testPayment = totalMinimums;
  let low = totalMinimums;
  let high = totalBalance / monthsToPayoff * 2; // Upper bound estimate
  
  // Binary search for the right total payment
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const monthsNeeded = simulatePayoff(sortedCards, mid, strategy);
    
    if (monthsNeeded <= monthsToPayoff) {
      high = mid;
      testPayment = mid;
    } else {
      low = mid;
    }
    
    if (high - low < 0.01) break;
  }

  const totalMonthlyPayment = Math.ceil(testPayment * 100) / 100;

  // Now simulate the payoff to get per-card details
  const { cardResults } = simulatePayoffDetailed(sortedCards, totalMonthlyPayment, strategy, today, frequency);

  return { results: cardResults, totalMonthlyPayment };
};

// Simulate payoff and return months needed
const simulatePayoff = (
  sortedCards: CreditCard[],
  totalMonthlyPayment: number,
  strategy: PayoffStrategy
): number => {
  const balances = sortedCards.map(c => c.balance);
  const minimums = sortedCards.map(c => c.minimumPayment);
  const aprs = sortedCards.map(c => c.apr);
  
  let month = 0;
  const maxMonths = 600; // 50 year cap
  
  while (balances.some(b => b > 0.01) && month < maxMonths) {
    month++;
    
    // Calculate minimums for active cards
    let availableExtra = totalMonthlyPayment;
    const activeIndices: number[] = [];
    
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] > 0) {
        activeIndices.push(i);
        availableExtra -= minimums[i];
      }
    }
    
    // Apply interest and minimum payments
    for (const i of activeIndices) {
      const monthlyRate = aprs[i] / 100 / 12;
      balances[i] = balances[i] * (1 + monthlyRate) - minimums[i];
    }
    
    // Apply extra to priority card
    if (availableExtra > 0 && activeIndices.length > 0) {
      const priorityIndex = activeIndices[0]; // First in sorted order
      balances[priorityIndex] -= availableExtra;
    }
    
    // Clean up negative balances
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] < 0) balances[i] = 0;
    }
  }
  
  return month;
};

// Detailed simulation for results
const simulatePayoffDetailed = (
  sortedCards: CreditCard[],
  totalMonthlyPayment: number,
  strategy: PayoffStrategy,
  today: Date,
  frequency: PaymentFrequency
): { cardResults: PayoffResult[] } => {
  const balances = sortedCards.map(c => c.balance);
  const minimums = sortedCards.map(c => c.minimumPayment);
  const aprs = sortedCards.map(c => c.apr);
  const interests: number[] = sortedCards.map(() => 0);
  const payoffMonths: number[] = sortedCards.map(() => 0);
  const avgPayments: number[] = sortedCards.map(() => 0);
  const paymentCounts: number[] = sortedCards.map(() => 0);
  
  let month = 0;
  const maxMonths = 600;
  let payoffOrder = 1;
  const orders: number[] = sortedCards.map(() => 0);
  
  while (balances.some(b => b > 0.01) && month < maxMonths) {
    month++;
    
    // Calculate minimums for active cards
    let availableExtra = totalMonthlyPayment;
    const activeIndices: number[] = [];
    
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] > 0.01) {
        activeIndices.push(i);
        availableExtra -= minimums[i];
      }
    }
    
    // Apply interest and track payments
    for (const i of activeIndices) {
      const monthlyRate = aprs[i] / 100 / 12;
      const interest = balances[i] * monthlyRate;
      interests[i] += interest;
      balances[i] = balances[i] + interest - minimums[i];
      avgPayments[i] += minimums[i];
      paymentCounts[i]++;
    }
    
    // Apply extra to priority card
    if (availableExtra > 0 && activeIndices.length > 0) {
      const priorityIndex = activeIndices[0];
      balances[priorityIndex] -= availableExtra;
      avgPayments[priorityIndex] += availableExtra;
    }
    
    // Check for newly paid off cards
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] <= 0.01 && payoffMonths[i] === 0) {
        payoffMonths[i] = month;
        orders[i] = payoffOrder++;
        balances[i] = 0;
      }
    }
  }
  
  const cardResults: PayoffResult[] = sortedCards.map((card, i) => {
    const months = payoffMonths[i] || month;
    const avgMonthly = paymentCounts[i] > 0 ? avgPayments[i] / paymentCounts[i] : minimums[i];
    const frequencyPayment = convertPaymentFrequency(avgMonthly, frequency);
    
    return {
      cardId: card.id,
      cardName: card.name,
      currentBalance: card.balance,
      apr: card.apr,
      requiredPayment: frequencyPayment,
      totalPayments: Math.ceil(months * getFrequencyMultiplier(frequency)),
      totalInterest: interests[i],
      payoffDate: addMonths(today, months),
      minimumPayment: card.minimumPayment,
      extraNeeded: Math.max(0, avgMonthly - card.minimumPayment),
      payoffOrder: orders[i],
      monthsToPayoff: months,
    };
  });
  
  return { cardResults };
};

export const DebtPayoffCalculator: React.FC = () => {
  const { data } = useFinance();
  const [state, setState] = useState<CalculatorState>({
    selectedCardIds: [],
    targetDate: undefined,
    frequency: "monthly",
    strategy: "avalanche",
  });

  const today = new Date();
  
  // Quick date presets
  const datePresets = useMemo(() => [
    { label: "6 months", date: addMonths(today, 6) },
    { label: "1 year", date: addMonths(today, 12) },
    { label: "2 years", date: addMonths(today, 24) },
    { label: "3 years", date: addMonths(today, 36) },
    { label: "5 years", date: addMonths(today, 60) },
  ], []);

  // Get selected cards
  const selectedCards = useMemo(() => {
    return data.creditCards.filter(c => state.selectedCardIds.includes(c.id));
  }, [data.creditCards, state.selectedCardIds]);

  // Calculate results based on strategy
  const { results, totalMonthlyPayment } = useMemo(() => {
    if (!state.targetDate || state.selectedCardIds.length === 0) {
      return { results: [], totalMonthlyPayment: 0 };
    }

    return calculateStrategyPayoff(
      selectedCards,
      state.targetDate,
      today,
      state.strategy,
      state.frequency
    );
  }, [state.selectedCardIds, state.targetDate, state.frequency, state.strategy, selectedCards]);

  // Calculate totals
  const totals = useMemo(() => {
    if (results.length === 0) return null;

    const totalBalance = results.reduce((sum, r) => sum + r.currentBalance, 0);
    const totalPaymentPerPeriod = convertPaymentFrequency(totalMonthlyPayment, state.frequency);
    const totalInterest = results.reduce((sum, r) => sum + r.totalInterest, 0);
    const totalMinimums = results.reduce((sum, r) => sum + r.minimumPayment, 0);

    return {
      totalBalance,
      totalPaymentPerPeriod,
      totalInterest,
      totalMinimums,
      extraNeeded: Math.max(0, totalMonthlyPayment - totalMinimums),
      monthlyEquivalent: totalMonthlyPayment,
    };
  }, [results, state.frequency, totalMonthlyPayment]);

  const toggleCard = (cardId: string) => {
    setState(prev => ({
      ...prev,
      selectedCardIds: prev.selectedCardIds.includes(cardId)
        ? prev.selectedCardIds.filter(id => id !== cardId)
        : [...prev.selectedCardIds, cardId],
    }));
  };

  const selectAllCards = () => {
    setState(prev => ({
      ...prev,
      selectedCardIds: data.creditCards.map(c => c.id),
    }));
  };

  const clearSelection = () => {
    setState(prev => ({
      ...prev,
      selectedCardIds: [],
    }));
  };

  // Sort results for display based on strategy
  const sortedResults = useMemo(() => {
    if (state.strategy === "simultaneous") {
      return results;
    }
    return [...results].sort((a, b) => (a.payoffOrder || 0) - (b.payoffOrder || 0));
  }, [results, state.strategy]);

  return (
    <div className="space-y-6">
      <Card className="border-2 border-foreground">
        <CardHeader className="border-b-2 border-foreground pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Debt Payoff Calculator
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Strategy Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-mono uppercase tracking-wider">Payoff Strategy</Label>
            <RadioGroup
              value={state.strategy}
              onValueChange={(value) => setState(prev => ({ ...prev, strategy: value as PayoffStrategy }))}
              className="grid gap-3"
            >
              {(Object.keys(strategyInfo) as PayoffStrategy[]).map((key) => {
                const info = strategyInfo[key];
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                      state.strategy === key
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-foreground/50"
                    )}
                    onClick={() => setState(prev => ({ ...prev, strategy: key }))}
                  >
                    <RadioGroupItem value={key} id={key} className="mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-primary">{info.icon}</span>
                        <label htmlFor={key} className="font-bold cursor-pointer">
                          {info.name}
                        </label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{info.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Card Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-mono uppercase tracking-wider">Select Cards to Pay Off</Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAllCards} className="text-xs">
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={clearSelection} className="text-xs">
                  Clear
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              {data.creditCards.map(card => (
                <div
                  key={card.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors",
                    state.selectedCardIds.includes(card.id)
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-foreground/50"
                  )}
                  onClick={() => toggleCard(card.id)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={state.selectedCardIds.includes(card.id)}
                      onCheckedChange={() => toggleCard(card.id)}
                    />
                    <div>
                      <span className="font-medium">{card.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {card.apr}% APR • Min: {formatCurrency(card.minimumPayment)}
                      </div>
                    </div>
                  </div>
                  <span className="font-bold text-destructive">{formatCurrency(card.balance)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Target Date Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-mono uppercase tracking-wider">Target Payoff Date</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {datePresets.map(preset => (
                <Button
                  key={preset.label}
                  variant={state.targetDate && format(state.targetDate, "yyyy-MM") === format(preset.date, "yyyy-MM") ? "default" : "outline"}
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, targetDate: preset.date }))}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-2",
                    !state.targetDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {state.targetDate ? format(state.targetDate, "PPP") : "Or pick a custom date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={state.targetDate}
                  onSelect={(date) => setState(prev => ({ ...prev, targetDate: date }))}
                  disabled={(date) => date < today}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Payment Frequency */}
          <div className="space-y-3">
            <Label className="text-sm font-mono uppercase tracking-wider">Payment Frequency</Label>
            <Select
              value={state.frequency}
              onValueChange={(value) => setState(prev => ({ ...prev, frequency: value as PaymentFrequency }))}
            >
              <SelectTrigger className="border-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="biweekly">Bi-Weekly (every 2 weeks)</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && totals && (
        <>
          {/* Summary Card */}
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Required {getFrequencyLabel(state.frequency)} Payment
                  </p>
                  <p className="text-4xl font-bold text-primary mt-1">
                    {formatCurrency(totals.totalPaymentPerPeriod)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Using {strategyInfo[state.strategy].name} strategy
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-foreground/20">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total to Pay Off</p>
                  <p className="text-lg font-bold">{formatCurrency(totals.totalBalance)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Total Interest</p>
                  <p className="text-lg font-bold text-destructive">{formatCurrency(totals.totalInterest)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Current Minimums</p>
                  <p className="text-lg font-bold">{formatCurrency(totals.totalMinimums)}/mo</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Extra Needed</p>
                  <p className="text-lg font-bold text-primary">+{formatCurrency(totals.extraNeeded)}/mo</p>
                </div>
              </div>

              {state.targetDate && (
                <div className="mt-4 pt-4 border-t border-foreground/20 flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Debt-free by <span className="font-bold text-foreground">{format(state.targetDate, "MMMM d, yyyy")}</span>
                    {" "}({differenceInMonths(state.targetDate, today)} months)
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Per-Card Breakdown */}
          <Card className="border-2 border-foreground">
            <CardHeader className="border-b-2 border-foreground pb-4">
              <CardTitle className="text-lg font-bold uppercase tracking-wider">
                {state.strategy === "simultaneous" ? "Payment Breakdown by Card" : "Payoff Order"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {sortedResults.map((result, index) => (
                  <div
                    key={result.cardId}
                    className="p-4 bg-muted/50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {state.strategy !== "simultaneous" && (
                          <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                            {result.payoffOrder || index + 1}
                          </div>
                        )}
                        <div>
                          <span className="font-bold">{result.cardName}</span>
                          <div className="text-xs text-muted-foreground">
                            {result.apr}% APR • Balance: {formatCurrency(result.currentBalance)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(result.requiredPayment)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          avg per {state.frequency === "biweekly" ? "2 weeks" : state.frequency === "weekly" ? "week" : "month"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-foreground/10 text-sm">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">
                          {state.strategy === "simultaneous" ? "Current Min" : "Paid Off In"}
                        </p>
                        <p className="font-medium">
                          {state.strategy === "simultaneous" 
                            ? `${formatCurrency(result.minimumPayment)}/mo`
                            : `${result.monthsToPayoff} months`}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">
                          {state.strategy === "simultaneous" ? "Extra Needed" : "Payoff Date"}
                        </p>
                        <p className="font-medium text-primary">
                          {state.strategy === "simultaneous"
                            ? `+${formatCurrency(result.extraNeeded)}/mo`
                            : format(result.payoffDate, "MMM yyyy")}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Interest Cost</p>
                        <p className="font-medium text-destructive">{formatCurrency(result.totalInterest)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {(state.selectedCardIds.length === 0 || !state.targetDate) && (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="py-8 text-center">
            <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {state.selectedCardIds.length === 0
                ? "Select one or more cards to calculate payoff"
                : "Choose a target payoff date to see your payment plan"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
