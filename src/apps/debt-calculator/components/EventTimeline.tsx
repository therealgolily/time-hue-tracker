import { FinancialEvent } from "../types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { formatCurrency } from "../lib/calculations";

interface EventTimelineProps {
  events: FinancialEvent[];
  onRemoveEvent: (eventId: string) => void;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events, onRemoveEvent }) => {
  const sortedEvents = [...events].sort((a, b) => a.startMonth - b.startMonth);

  const getEventLabel = (event: FinancialEvent): string => {
    switch (event.type) {
      case "payment_change":
        return `Now paying ${formatCurrency(event.amount)}/month`;
      case "income_start":
        return `+${formatCurrency(event.amount)}/month${event.endMonth ? ` until month ${event.endMonth}` : " ongoing"}`;
      case "income_end":
        return `Income ends`;
      case "expense_start":
        return `-${formatCurrency(event.amount)}/month${event.endMonth ? ` until month ${event.endMonth}` : " ongoing"}`;
      case "expense_end":
        return `Expense ends`;
      case "asset_sale":
        return `${formatCurrency(event.amount)} one-time payment`;
      case "windfall":
        return `${formatCurrency(event.amount)} one-time windfall`;
      case "one_time_expense":
        return `${formatCurrency(event.amount)} one-time expense`;
      default:
        return formatCurrency(event.amount);
    }
  };

  const getEventColor = (type: FinancialEvent["type"]): string => {
    switch (type) {
      case "income_start":
      case "expense_end":
      case "windfall":
      case "asset_sale":
        return "border-l-green-500 bg-green-50 dark:bg-green-950/20";
      case "income_end":
      case "expense_start":
      case "one_time_expense":
        return "border-l-red-500 bg-red-50 dark:bg-red-950/20";
      case "payment_change":
        return "border-l-blue-500 bg-blue-50 dark:bg-blue-950/20";
      default:
        return "border-l-gray-500 bg-gray-50 dark:bg-gray-950/20";
    }
  };

  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No events added yet. Add events to model changes in your financial situation.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {sortedEvents.map((event) => (
        <Card
          key={event.id}
          className={`p-4 border-l-4 ${getEventColor(event.type)} transition-all hover:shadow-md`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{event.icon}</span>
                <span className="font-medium">
                  Month {event.startMonth}: {event.description}
                </span>
              </div>
              <p className="text-sm text-muted-foreground ml-7">
                {getEventLabel(event)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemoveEvent(event.id)}
              className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
