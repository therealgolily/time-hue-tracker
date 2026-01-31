import { useState, useMemo } from "react";
import { format, differenceInDays, differenceInWeeks, differenceInMonths, addMonths } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator, CalendarIcon, TrendingDown, Target, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../lib/calculations";
import { CreditCard } from "../types";

type PaymentFrequency = "monthly" | "biweekly" | "weekly";

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
}

interface CalculatorState {
  selectedCardIds: string[];
  targetDate: Date | undefined;
  frequency: PaymentFrequency;
}

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

export const DebtPayoffCalculator: React.FC = () => {
  const { data } = useFinance();
  const [state, setState] = useState<CalculatorState>({
    selectedCardIds: [],
    targetDate: undefined,
    frequency: "monthly",
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

  // Calculate results for each selected card
  const results = useMemo((): PayoffResult[] => {
    if (!state.targetDate || state.selectedCardIds.length === 0) return [];

    const monthsToPayoff = Math.max(1, differenceInMonths(state.targetDate, today));

    return state.selectedCardIds.map(cardId => {
      const card = data.creditCards.find(c => c.id === cardId);
      if (!card) return null;

      const requiredMonthlyPayment = calculateRequiredPayment(
        card.balance,
        card.apr,
        monthsToPayoff
      );

      const totalInterest = calculateTotalInterest(
        card.balance,
        card.apr,
        requiredMonthlyPayment,
        monthsToPayoff
      );

      const frequencyPayment = convertPaymentFrequency(requiredMonthlyPayment, state.frequency);
      const paymentsCount = Math.ceil(monthsToPayoff * getFrequencyMultiplier(state.frequency));

      return {
        cardId: card.id,
        cardName: card.name,
        currentBalance: card.balance,
        apr: card.apr,
        requiredPayment: frequencyPayment,
        totalPayments: paymentsCount,
        totalInterest,
        payoffDate: state.targetDate,
        minimumPayment: card.minimumPayment,
        extraNeeded: Math.max(0, requiredMonthlyPayment - card.minimumPayment),
      };
    }).filter(Boolean) as PayoffResult[];
  }, [state.selectedCardIds, state.targetDate, state.frequency, data.creditCards]);

  // Calculate totals
  const totals = useMemo(() => {
    if (results.length === 0) return null;

    const totalBalance = results.reduce((sum, r) => sum + r.currentBalance, 0);
    const totalPaymentPerPeriod = results.reduce((sum, r) => sum + r.requiredPayment, 0);
    const totalInterest = results.reduce((sum, r) => sum + r.totalInterest, 0);
    const totalMinimums = results.reduce((sum, r) => sum + r.minimumPayment, 0);
    const monthlyEquivalent = results.reduce((sum, r) => {
      const monthly = r.requiredPayment / getFrequencyMultiplier(state.frequency) * getFrequencyMultiplier("monthly");
      return sum + monthly;
    }, 0);

    return {
      totalBalance,
      totalPaymentPerPeriod,
      totalInterest,
      totalMinimums,
      extraNeeded: Math.max(0, monthlyEquivalent - totalMinimums),
      monthlyEquivalent,
    };
  }, [results, state.frequency]);

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
                Payment Breakdown by Card
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {results.map(result => (
                  <div
                    key={result.cardId}
                    className="p-4 bg-muted/50 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold">{result.cardName}</span>
                        <div className="text-xs text-muted-foreground">
                          {result.apr}% APR • Balance: {formatCurrency(result.currentBalance)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">
                          {formatCurrency(result.requiredPayment)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          per {state.frequency === "biweekly" ? "2 weeks" : state.frequency === "weekly" ? "week" : "month"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-foreground/10 text-sm">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Current Min</p>
                        <p className="font-medium">{formatCurrency(result.minimumPayment)}/mo</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-muted-foreground">Extra Needed</p>
                        <p className="font-medium text-primary">+{formatCurrency(result.extraNeeded)}/mo</p>
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
