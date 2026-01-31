import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Expense, RecurringFrequency } from "../types";

const EXPENSE_CATEGORIES = [
  "Housing",
  "Utilities",
  "Insurance",
  "Subscriptions",
  "Transportation",
  "Food",
  "Healthcare",
  "Entertainment",
  "Personal",
  "Other",
];

interface ExpenseFormProps {
  expense?: Expense;
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id"> | Expense) => void;
  creditCards: { id: string; name: string }[];
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, open, onClose, onSave, creditCards }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Other",
    amount: "",
    dueDay: "",
    renewalDate: undefined as Date | undefined,
    isRecurring: true,
    recurringFrequency: "monthly" as RecurringFrequency,
    linkedCardId: "",
  });

  // Sync form data when expense prop changes (edit mode)
  useEffect(() => {
    if (open) {
      setFormData({
        name: expense?.name || "",
        category: expense?.category || "Other",
        amount: expense?.amount?.toString() || "",
        dueDay: expense?.dueDay?.toString() || "",
        renewalDate: expense?.renewalDate ? new Date(expense.renewalDate) : undefined,
        isRecurring: expense?.isRecurring ?? true,
        recurringFrequency: expense?.recurringFrequency || "monthly",
        linkedCardId: expense?.linkedCardId || "",
      });
    }
  }, [expense, open]);

  const isDateBasedFrequency = formData.recurringFrequency === "quarterly" || formData.recurringFrequency === "yearly";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDayValue = parseInt(formData.dueDay);
    const expenseData = {
      name: formData.name,
      category: formData.category,
      amount: parseFloat(formData.amount) || 0,
      dueDay: !isDateBasedFrequency && dueDayValue >= 1 && dueDayValue <= 31 ? dueDayValue : undefined,
      renewalDate: isDateBasedFrequency && formData.renewalDate ? formData.renewalDate.toISOString() : undefined,
      isRecurring: formData.recurringFrequency !== "none",
      recurringFrequency: formData.recurringFrequency,
      linkedCardId: formData.linkedCardId || undefined,
    };

    if (expense) {
      onSave({ ...expense, ...expenseData });
    } else {
      onSave(expenseData);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? "Edit Expense" : "Add Expense"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Expense Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Netflix, Rent, Electric Bill"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            {isDateBasedFrequency ? (
              <div className="grid gap-2">
                <Label>Renewal Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.renewalDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.renewalDate ? format(formData.renewalDate, "PPP") : <span>Pick renewal date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.renewalDate}
                      onSelect={(date) => setFormData({ ...formData, renewalDate: date })}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-muted-foreground">
                  When does this {formData.recurringFrequency} expense renew?
                </p>
              </div>
            ) : formData.recurringFrequency === "monthly" ? (
              <div className="grid gap-2">
                <Label htmlFor="dueDay">Due Day (1-31)</Label>
                <Input
                  id="dueDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.dueDay}
                  onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                  placeholder="e.g., 15 for the 15th of each month"
                />
              </div>
            ) : null}
            <div className="grid gap-2">
              <Label htmlFor="linkedCard">Linked Credit Card (Optional)</Label>
              <Select
                value={formData.linkedCardId || "none"}
                onValueChange={(value) => setFormData({ ...formData, linkedCardId: value === "none" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="None - Pay directly" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - Pay directly</SelectItem>
                  {creditCards.map((card) => (
                    <SelectItem key={card.id} value={card.id}>
                      {card.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Link to a card if this expense is auto-charged to it
              </p>
            </div>
            <div className="space-y-2">
              <Label>Recurring Frequency</Label>
              <Select
                value={formData.recurringFrequency}
                onValueChange={(value) => setFormData({ ...formData, recurringFrequency: value as RecurringFrequency })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="none">One-time (not recurring)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
