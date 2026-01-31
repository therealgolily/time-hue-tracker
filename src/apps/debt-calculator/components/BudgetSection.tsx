import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency, calculateNetIncome, calculateAvailableForDebt } from "../lib/calculations";

export const BudgetSection: React.FC = () => {
  const { data, updateBudget, addExpense, deleteExpense } = useFinance();
  const { budget } = data;
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");

  const netIncome = calculateNetIncome(budget.grossIncome, budget.taxRate);
  const totalExpenses = budget.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const availableForDebt = calculateAvailableForDebt(netIncome, totalExpenses);

  const handleAddExpense = () => {
    if (newExpenseCategory && newExpenseAmount) {
      addExpense({
        category: newExpenseCategory,
        name: newExpenseCategory,
        amount: parseFloat(newExpenseAmount),
        isRecurring: true,
      });
      setNewExpenseCategory("");
      setNewExpenseAmount("");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Income</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="grossIncome">Monthly Gross Income</Label>
            <Input
              id="grossIncome"
              type="number"
              step="0.01"
              value={budget.grossIncome || ""}
              onChange={(e) => updateBudget({ grossIncome: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              value={budget.taxRate}
              onChange={(e) => updateBudget({ taxRate: parseFloat(e.target.value) || 0 })}
              placeholder="30"
            />
          </div>
          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Gross Income:</span>
              <span className="font-medium">{formatCurrency(budget.grossIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxes ({budget.taxRate}%):</span>
              <span className="font-medium text-destructive">
                -{formatCurrency(budget.grossIncome * (budget.taxRate / 100))}
              </span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Net Income:</span>
              <span className="text-success">{formatCurrency(netIncome)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {budget.expenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="font-medium">{expense.category}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{formatCurrency(expense.amount)}</span>
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
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Category (e.g., Rent)"
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value)}
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Amount"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              className="w-32"
            />
            <Button onClick={handleAddExpense} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between font-semibold text-base">
              <span>Total Expenses:</span>
              <span className="text-destructive">{formatCurrency(totalExpenses)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary">
        <CardHeader>
          <CardTitle>Available for Debt Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Net Income:</span>
              <span className="font-medium">{formatCurrency(netIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Expenses:</span>
              <span className="font-medium text-destructive">-{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between font-bold text-xl pt-2 border-t">
              <span>Available:</span>
              <span className={availableForDebt > 0 ? "text-success" : "text-destructive"}>
                {formatCurrency(availableForDebt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
