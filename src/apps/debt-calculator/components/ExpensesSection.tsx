import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, CreditCard as CreditCardIcon, Calendar, Receipt } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../lib/calculations";
import { Expense } from "../types";
import { cn } from "@/lib/utils";

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

const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

interface ExpenseFormProps {
  expense?: Expense;
  open: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, "id"> | Expense) => void;
  creditCards: { id: string; name: string }[];
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ expense, open, onClose, onSave, creditCards }) => {
  const [formData, setFormData] = useState({
    name: expense?.name || "",
    category: expense?.category || "Other",
    amount: expense?.amount?.toString() || "",
    dueDay: expense?.dueDay?.toString() || "",
    isRecurring: expense?.isRecurring ?? true,
    linkedCardId: expense?.linkedCardId || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dueDayValue = parseInt(formData.dueDay);
    const expenseData = {
      name: formData.name,
      category: formData.category,
      amount: parseFloat(formData.amount) || 0,
      dueDay: dueDayValue >= 1 && dueDayValue <= 31 ? dueDayValue : undefined,
      isRecurring: formData.isRecurring,
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
              <Label htmlFor="amount">Monthly Amount</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="isRecurring">Recurring Monthly</Label>
              <Switch
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
              />
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

export const ExpensesSection: React.FC = () => {
  const { data, addExpense, updateExpense, deleteExpense } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  const totalExpenses = data.budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Group expenses by category
  const expensesByCategory = data.budget.expenses.reduce((acc, exp) => {
    const cat = exp.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(exp);
    return acc;
  }, {} as Record<string, Expense[]>);

  const handleSaveExpense = (expenseData: Omit<Expense, "id"> | Expense) => {
    if ('id' in expenseData) {
      updateExpense(expenseData.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    setFormOpen(false);
    setEditingExpense(undefined);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingExpense(undefined);
  };

  const getLinkedCardName = (cardId?: string) => {
    if (!cardId) return null;
    const card = data.creditCards.find(c => c.id === cardId);
    return card?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 border-b-2 border-foreground pb-2">
        <h2 className="text-xl font-bold uppercase tracking-wider">Monthly Expenses</h2>
        <Button 
          onClick={() => { setEditingExpense(undefined); setFormOpen(true); }} 
          className="border-2 border-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <ExpenseForm
        expense={editingExpense}
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveExpense}
        creditCards={data.creditCards.map(c => ({ id: c.id, name: c.name }))}
      />

      {/* Summary Card */}
      <Card className="border-2 border-foreground">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-mono uppercase tracking-wider text-muted-foreground">Total Monthly Expenses</p>
              <p className="text-3xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
            <Receipt className="h-12 w-12 text-muted-foreground/30" />
          </div>
        </CardContent>
      </Card>

      {/* Expenses by Category */}
      {Object.keys(expensesByCategory).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(expensesByCategory).map(([category, expenses]) => {
            const categoryTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
            
            return (
              <Card key={category} className="border-2 border-foreground">
                <CardHeader className="pb-3 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold uppercase tracking-wider">{category}</CardTitle>
                    <span className="font-mono text-sm font-bold">{formatCurrency(categoryTotal)}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {expenses.map((expense) => {
                      const linkedCard = getLinkedCardName(expense.linkedCardId);
                      
                      return (
                        <div 
                          key={expense.id} 
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{expense.name || expense.category}</span>
                              {expense.isRecurring && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono uppercase">
                                  Monthly
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {expense.dueDay && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Due: {expense.dueDay}{getOrdinalSuffix(expense.dueDay)}
                                </span>
                              )}
                              {linkedCard && (
                                <span className="flex items-center gap-1">
                                  <CreditCardIcon className="h-3 w-3" />
                                  {linkedCard}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{formatCurrency(expense.amount)}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditExpense(expense)}
                              className="h-8 w-8"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteExpense(expense.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-2 border-dashed border-muted-foreground/30">
          <CardContent className="py-8 text-center">
            <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wider">
              No expenses added yet. Add your monthly expenses to track them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
