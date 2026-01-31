import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, setDate } from "date-fns";
import { ChevronLeft, ChevronRight, CreditCard as CreditCardIcon, Plus, Receipt, RefreshCw, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { CreditCard, Expense } from "../types";
import { formatCurrency } from "../lib/calculations";

type DueItem = {
  id: string;
  type: 'card' | 'expense';
  name: string;
  amount: number;
  dueDay: number;
  linkedCardId?: string;
  linkedCardName?: string;
  isRecurring?: boolean;
};

interface PaymentDueDateCalendarProps {
  creditCards: CreditCard[];
  expenses: Expense[];
  onCardClick?: (card: CreditCard) => void;
  onExpenseClick?: (expense: Expense) => void;
  onAddDueDate?: (type: 'card' | 'expense', itemId: string, dueDay: number) => void;
}

export const PaymentDueDateCalendar: React.FC<PaymentDueDateCalendarProps> = ({ 
  creditCards,
  expenses,
  onCardClick,
  onExpenseClick,
  onAddDueDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addDueDateDialogOpen, setAddDueDateDialogOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [newDueDateType, setNewDueDateType] = useState<'card' | 'expense'>('expense');
  const [selectedItemId, setSelectedItemId] = useState<string>('');

  // Combine cards and expenses with due dates
  const allDueItems = useMemo(() => {
    const items: DueItem[] = [];
    
    creditCards.forEach(card => {
      if (card.dueDay && card.dueDay >= 1 && card.dueDay <= 31) {
        items.push({
          id: card.id,
          type: 'card',
          name: card.name,
          amount: card.minimumPayment,
          dueDay: card.dueDay,
        });
      }
    });
    
    expenses.forEach(expense => {
      if (expense.dueDay && expense.dueDay >= 1 && expense.dueDay <= 31) {
        const linkedCard = expense.linkedCardId 
          ? creditCards.find(c => c.id === expense.linkedCardId)
          : undefined;
        items.push({
          id: expense.id,
          type: 'expense',
          name: expense.name || expense.category,
          amount: expense.amount,
          dueDay: expense.dueDay,
          linkedCardId: expense.linkedCardId,
          linkedCardName: linkedCard?.name,
          isRecurring: expense.isRecurring,
        });
      }
    });
    
    return items;
  }, [creditCards, expenses]);

  // Calculate due dates for the current month view
  const dueDatesMap = useMemo(() => {
    const map = new Map<string, DueItem[]>();
    
    allDueItems.forEach(item => {
      const monthStart = startOfMonth(currentMonth);
      const daysInMonth = endOfMonth(currentMonth).getDate();
      const actualDueDay = Math.min(item.dueDay, daysInMonth);
      const dueDate = setDate(monthStart, actualDueDay);
      
      const dateKey = format(dueDate, "yyyy-MM-dd");
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, item]);
    });
    
    return map;
  }, [allDueItems, currentMonth]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  const startPadding = useMemo(() => {
    const firstDay = startOfMonth(currentMonth).getDay();
    return Array(firstDay).fill(null);
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setAddDueDateDialogOpen(true);
    setSelectedItemId('');
  };

  const handleAddDueDate = () => {
    if (selectedItemId && selectedDay && onAddDueDate) {
      onAddDueDate(newDueDateType, selectedItemId, selectedDay);
    }
    setAddDueDateDialogOpen(false);
    setSelectedDay(null);
    setSelectedItemId('');
  };

  const handleItemClick = (item: DueItem) => {
    if (item.type === 'card') {
      const card = creditCards.find(c => c.id === item.id);
      if (card && onCardClick) onCardClick(card);
    } else {
      const expense = expenses.find(e => e.id === item.id);
      if (expense && onExpenseClick) onExpenseClick(expense);
    }
  };

  // Get items without due dates for the add dialog
  const cardsWithoutDueDate = creditCards.filter(c => !c.dueDay);
  const expensesWithoutDueDate = expenses.filter(e => !e.dueDay);

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <>
      <Card className="border-2 border-foreground">
        <CardHeader className="border-b-2 border-foreground pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Payment Due Dates
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday} className="font-mono text-xs">
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth} className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="text-center font-mono text-sm uppercase tracking-widest mt-2">
            {format(currentMonth, "MMMM yyyy")}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Credit Card</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-expense" />
              <span className="text-muted-foreground">Expense</span>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-mono uppercase tracking-wider text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {startPadding.map((_, index) => (
              <div key={`pad-${index}`} className="aspect-square" />
            ))}

            {days.map(day => {
              const dateKey = format(day, "yyyy-MM-dd");
              const itemsOnDay = dueDatesMap.get(dateKey) || [];
              const hasItems = itemsOnDay.length > 0;
              const isDayToday = isToday(day);
              const dayNumber = parseInt(format(day, "d"));
              const dayTotal = itemsOnDay.reduce((sum, item) => sum + item.amount, 0);

              return (
                <TooltipProvider key={dateKey}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "aspect-square flex flex-col items-center justify-start p-1 rounded-md transition-colors cursor-pointer hover:bg-accent/50",
                          isDayToday && "ring-2 ring-primary ring-offset-1",
                          hasItems && "bg-muted hover:bg-muted/80"
                        )}
                        onClick={() => handleDayClick(dayNumber)}
                      >
                        <span className={cn(
                          "text-sm font-mono",
                          isDayToday && "font-bold text-primary",
                          !isSameMonth(day, currentMonth) && "text-muted-foreground"
                        )}>
                          {format(day, "d")}
                        </span>
                        {hasItems && (
                          <>
                            <span className="text-[10px] font-bold text-foreground mt-0.5 leading-none">
                              ${dayTotal >= 1000 ? `${(dayTotal / 1000).toFixed(1)}k` : dayTotal.toFixed(0)}
                            </span>
                            <div className="flex flex-wrap justify-center gap-0.5 mt-0.5">
                              {itemsOnDay.slice(0, 3).map(item => (
                                <div
                                  key={`${item.type}-${item.id}`}
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full cursor-pointer hover:scale-125 transition-transform",
                                    item.type === 'card' ? "bg-destructive" : "bg-expense"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item);
                                  }}
                                />
                              ))}
                              {itemsOnDay.length > 3 && (
                                <span className="text-[8px] text-muted-foreground">+{itemsOnDay.length - 3}</span>
                              )}
                            </div>
                          </>
                        )}
                        {!hasItems && (
                          <Plus className="h-3 w-3 text-muted-foreground/30 mt-1 opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[250px]">
                      <div className="space-y-2">
                        <p className="font-mono text-xs uppercase tracking-wider font-bold">
                          {format(day, "MMM d")} {hasItems ? "- Due" : "- Click to add"}
                        </p>
                        {itemsOnDay.map(item => (
                          <div key={`${item.type}-${item.id}`} className="flex items-center gap-2 text-sm">
                          {item.type === 'card' ? (
                              <CreditCardIcon className="h-3 w-3 text-destructive" />
                            ) : (
                              <Receipt className="h-3 w-3 text-expense" />
                            )}
                            <span className="font-medium flex-1">{item.name}</span>
                            <span className="text-muted-foreground">
                              {formatCurrency(item.amount)}
                            </span>
                          </div>
                        ))}
                        {!hasItems && (
                          <p className="text-xs text-muted-foreground">Click to add a due date</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>

          {/* Monthly Totals Summary */}
          <div className="mt-6 border-t-2 border-foreground pt-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-destructive/10 border border-destructive/30 rounded p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-destructive font-mono uppercase mb-1">
                  <CreditCardIcon className="h-3 w-3" />
                  Cards
                </div>
                <p className="text-lg font-bold text-destructive">
                  {formatCurrency(allDueItems.filter(i => i.type === 'card').reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </div>
              <div className="bg-expense/10 border border-expense/30 rounded p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-expense font-mono uppercase mb-1">
                  <Receipt className="h-3 w-3" />
                  Expenses
                </div>
                <p className="text-lg font-bold text-expense">
                  {formatCurrency(allDueItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </div>
              <div className="bg-foreground/5 border border-foreground/30 rounded p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-xs text-foreground font-mono uppercase mb-1">
                  <DollarSign className="h-3 w-3" />
                  Total
                </div>
                <p className="text-lg font-bold">
                  {formatCurrency(allDueItems.reduce((sum, i) => sum + i.amount, 0))}
                </p>
              </div>
            </div>

            {/* Recurring indicator */}
            {allDueItems.some(i => i.isRecurring) && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 px-1">
                <RefreshCw className="h-3 w-3" />
                <span>Recurring expenses auto-populate each month</span>
              </div>
            )}
          </div>

          {/* Summary List */}
          {allDueItems.length > 0 ? (
            <div className="border-t border-muted pt-4">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
                This Month's Due Dates
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {allDueItems
                  .sort((a, b) => a.dueDay - b.dueDay)
                  .map(item => {
                    const daysInMonth = endOfMonth(currentMonth).getDate();
                    const actualDueDay = Math.min(item.dueDay, daysInMonth);
                    const dueDate = setDate(startOfMonth(currentMonth), actualDueDay);
                    const isPast = dueDate < new Date() && !isToday(dueDate);
                    
                    return (
                      <div 
                        key={`${item.type}-${item.id}`}
                        className={cn(
                          "flex items-center justify-between p-2 rounded border cursor-pointer",
                          isPast ? "border-muted bg-muted/30" : 
                            item.type === 'card' ? "border-destructive/30 bg-destructive/5" : "border-expense/30 bg-expense/5",
                          "hover:bg-accent/50"
                        )}
                        onClick={() => handleItemClick(item)}
                      >
                        <div className="flex items-center gap-2">
                          {item.type === 'card' ? (
                            <CreditCardIcon className={cn("h-4 w-4", isPast ? "text-muted-foreground" : "text-destructive")} />
                          ) : (
                            <Receipt className={cn("h-4 w-4", isPast ? "text-muted-foreground" : "text-expense")} />
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className={cn("font-medium", isPast && "text-muted-foreground line-through")}>
                              {item.name}
                            </span>
                            {item.isRecurring && (
                              <RefreshCw className="h-3 w-3 text-muted-foreground" />
                            )}
                            {item.linkedCardName && (
                              <span className="text-xs text-muted-foreground">
                                via {item.linkedCardName}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-mono text-muted-foreground">
                            {format(dueDate, "MMM d")}
                          </span>
                          <span className={cn(
                            "font-semibold", 
                            isPast ? "text-muted-foreground" : 
                              item.type === 'card' ? "text-destructive" : "text-expense"
                          )}>
                            {formatCurrency(item.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="border-t border-muted pt-4 text-center">
              <p className="text-muted-foreground font-mono text-sm">
                No due dates set. Click on a day to add a due date, or edit your credit cards and expenses.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Due Date Dialog */}
      <Dialog open={addDueDateDialogOpen} onOpenChange={setAddDueDateDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add Due Date for Day {selectedDay}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select
                value={newDueDateType}
                onValueChange={(value: 'card' | 'expense') => {
                  setNewDueDateType(value);
                  setSelectedItemId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit Card</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Select {newDueDateType === 'card' ? 'Credit Card' : 'Expense'}</Label>
              <Select
                value={selectedItemId}
                onValueChange={setSelectedItemId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Choose a ${newDueDateType === 'card' ? 'card' : 'expense'}`} />
                </SelectTrigger>
                <SelectContent>
                  {newDueDateType === 'card' ? (
                    cardsWithoutDueDate.length > 0 ? (
                      cardsWithoutDueDate.map(card => (
                        <SelectItem key={card.id} value={card.id}>
                          {card.name} - {formatCurrency(card.minimumPayment)}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">All cards have due dates</div>
                    )
                  ) : (
                    expensesWithoutDueDate.length > 0 ? (
                      expensesWithoutDueDate.map(expense => (
                        <SelectItem key={expense.id} value={expense.id}>
                          {expense.name || expense.category} - {formatCurrency(expense.amount)}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">All expenses have due dates</div>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDueDateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDueDate} disabled={!selectedItemId}>
              Set Due Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
