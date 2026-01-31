import { CreditCard } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CreditCard as CreditCardIcon, AlertTriangle } from "lucide-react";
import { formatCurrency } from "../lib/calculations";
import { cn } from "@/lib/utils";

const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

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

interface CreditCardItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({ card, onEdit, onDelete }) => {
  const utilization = card.creditLimit > 0 ? (card.balance / card.creditLimit) * 100 : 0;
  const isHighUtilization = utilization > 30;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{card.name}</CardTitle>
            {isHighUtilization && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(card)}
              className="h-8 w-8"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(card.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Utilization Progress Bar */}
        <div className="space-y-1.5 pb-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Utilization</span>
            <span className={cn("text-sm font-bold", getUtilizationColor(utilization))}>
              {utilization.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all", getUtilizationBg(utilization))}
              style={{ width: `${Math.min(utilization, 100)}%` }}
            />
            {/* 30% marker */}
            <div className="absolute top-0 bottom-0 w-px bg-foreground/30" style={{ left: '30%' }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(card.balance)}</span>
            <span>{formatCurrency(card.creditLimit)}</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">APR:</span>
          <span className="font-medium">{card.apr.toFixed(2)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Min Payment:</span>
          <span className="font-medium">{formatCurrency(card.minimumPayment)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Monthly Purchases:</span>
          <span className="font-medium">{formatCurrency(card.monthlyPurchases)}</span>
        </div>
        {card.dueDay && (
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Due Day:</span>
            <span className="font-medium">{card.dueDay}{getOrdinalSuffix(card.dueDay)} of month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
