import { CreditCard } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CreditCard as CreditCardIcon } from "lucide-react";
import { formatCurrency } from "../lib/calculations";

interface CreditCardItemProps {
  card: CreditCard;
  onEdit: (card: CreditCard) => void;
  onDelete: (id: string) => void;
}

export const CreditCardItem: React.FC<CreditCardItemProps> = ({ card, onEdit, onDelete }) => {
  const utilization = card.creditLimit > 0 ? (card.balance / card.creditLimit) * 100 : 0;
  const utilizationColor = utilization > 30 ? "text-destructive" : "text-green-600";
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CreditCardIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{card.name}</CardTitle>
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
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Balance:</span>
          <span className="font-semibold text-destructive">{formatCurrency(card.balance)}</span>
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
        <div className="flex justify-between">
          <span className="text-sm text-muted-foreground">Credit Limit:</span>
          <span className="font-medium">{formatCurrency(card.creditLimit)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-sm text-muted-foreground">Utilization:</span>
          <span className={`font-semibold ${utilizationColor}`}>
            {utilization.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
