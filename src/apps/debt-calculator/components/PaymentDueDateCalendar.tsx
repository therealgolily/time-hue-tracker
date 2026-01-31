import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths, setDate, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, CreditCard as CreditCardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { CreditCard } from "../types";
import { formatCurrency } from "../lib/calculations";

interface PaymentDueDateCalendarProps {
  creditCards: CreditCard[];
  onCardClick?: (card: CreditCard) => void;
}

export const PaymentDueDateCalendar: React.FC<PaymentDueDateCalendarProps> = ({ 
  creditCards,
  onCardClick 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const cardsWithDueDates = creditCards.filter(card => card.dueDay && card.dueDay >= 1 && card.dueDay <= 31);

  // Calculate due dates for the current month view
  const dueDatesMap = useMemo(() => {
    const map = new Map<string, CreditCard[]>();
    
    cardsWithDueDates.forEach(card => {
      if (!card.dueDay) return;
      
      // Get the due date for current month
      const monthStart = startOfMonth(currentMonth);
      const daysInMonth = endOfMonth(currentMonth).getDate();
      const actualDueDay = Math.min(card.dueDay, daysInMonth);
      const dueDate = setDate(monthStart, actualDueDay);
      
      const dateKey = format(dueDate, "yyyy-MM-dd");
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, card]);
    });
    
    return map;
  }, [cardsWithDueDates, currentMonth]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [currentMonth]);

  // Pad the beginning of the month to align with weekday
  const startPadding = useMemo(() => {
    const firstDay = startOfMonth(currentMonth).getDay();
    return Array(firstDay).fill(null);
  }, [currentMonth]);

  const handlePrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
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
          {/* Padding for start of month */}
          {startPadding.map((_, index) => (
            <div key={`pad-${index}`} className="aspect-square" />
          ))}

          {/* Days of the month */}
          {days.map(day => {
            const dateKey = format(day, "yyyy-MM-dd");
            const cardsOnDay = dueDatesMap.get(dateKey) || [];
            const hasPayments = cardsOnDay.length > 0;
            const isDayToday = isToday(day);

            return (
              <TooltipProvider key={dateKey}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "aspect-square flex flex-col items-center justify-start p-1 rounded-md transition-colors cursor-default",
                        isDayToday && "ring-2 ring-primary ring-offset-1",
                        hasPayments && "bg-destructive/10 hover:bg-destructive/20"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-mono",
                        isDayToday && "font-bold text-primary",
                        !isSameMonth(day, currentMonth) && "text-muted-foreground"
                      )}>
                        {format(day, "d")}
                      </span>
                      {hasPayments && (
                        <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                          {cardsOnDay.slice(0, 3).map(card => (
                            <div
                              key={card.id}
                              className="w-2 h-2 rounded-full bg-destructive cursor-pointer hover:scale-125 transition-transform"
                              onClick={() => onCardClick?.(card)}
                            />
                          ))}
                          {cardsOnDay.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">+{cardsOnDay.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {hasPayments && (
                    <TooltipContent side="bottom" className="max-w-[200px]">
                      <div className="space-y-2">
                        <p className="font-mono text-xs uppercase tracking-wider font-bold">
                          {format(day, "MMM d")} - Payments Due
                        </p>
                        {cardsOnDay.map(card => (
                          <div key={card.id} className="flex items-center gap-2 text-sm">
                            <CreditCardIcon className="h-3 w-3" />
                            <span className="font-medium">{card.name}</span>
                            <span className="text-muted-foreground ml-auto">
                              {formatCurrency(card.minimumPayment)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Legend / Summary */}
        {cardsWithDueDates.length > 0 ? (
          <div className="mt-6 border-t-2 border-foreground pt-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">
              This Month's Due Dates
            </h3>
            <div className="space-y-2">
              {cardsWithDueDates.map(card => {
                const daysInMonth = endOfMonth(currentMonth).getDate();
                const actualDueDay = Math.min(card.dueDay!, daysInMonth);
                const dueDate = setDate(startOfMonth(currentMonth), actualDueDay);
                const isPast = dueDate < new Date() && !isToday(dueDate);
                
                return (
                  <div 
                    key={card.id} 
                    className={cn(
                      "flex items-center justify-between p-2 rounded border",
                      isPast ? "border-muted bg-muted/30" : "border-destructive/30 bg-destructive/5",
                      onCardClick && "cursor-pointer hover:bg-accent/50"
                    )}
                    onClick={() => onCardClick?.(card)}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCardIcon className={cn("h-4 w-4", isPast ? "text-muted-foreground" : "text-destructive")} />
                      <span className={cn("font-medium", isPast && "text-muted-foreground line-through")}>
                        {card.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="font-mono text-muted-foreground">
                        {format(dueDate, "MMM d")}
                      </span>
                      <span className={cn("font-semibold", isPast ? "text-muted-foreground" : "text-destructive")}>
                        {formatCurrency(card.minimumPayment)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 border-t-2 border-foreground pt-4 text-center">
            <p className="text-muted-foreground font-mono text-sm">
              No due dates set. Edit your credit cards to add payment due dates.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
