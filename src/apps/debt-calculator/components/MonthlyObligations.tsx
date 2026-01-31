import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CreditCard as CreditCardIcon, 
  Calendar as CalendarIcon, 
  Receipt, 
  Upload,
  DollarSign,
  Banknote
} from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../lib/calculations";
import { Expense, CreditCard, OtherDebt, RecurringFrequency } from "../types";
import { ExpenseCSVImport } from "./ExpenseCSVImport";
import { ExpenseForm } from "./ExpenseForm";

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
  none: "One-time",
};

const getOrdinalSuffix = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

export const MonthlyObligations: React.FC = () => {
  const { data, addExpense, updateExpense, deleteExpense } = useFinance();
  const [formOpen, setFormOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined);

  // Calculate totals
  const totals = useMemo(() => {
    const monthlyExpenses = data.budget.expenses
      .filter(exp => exp.isRecurring && exp.recurringFrequency === "monthly")
      .reduce((sum, exp) => sum + exp.amount, 0);
    
    const creditCardMinimums = data.creditCards.reduce((sum, card) => sum + card.minimumPayment, 0);
    
    const otherDebtPayments = data.otherDebts
      .filter(debt => debt.type === "payment_plan" && debt.monthlyPayment)
      .reduce((sum, debt) => sum + (debt.monthlyPayment || 0), 0);

    const oneTimeExpenses = data.budget.expenses
      .filter(exp => !exp.isRecurring || exp.recurringFrequency === "none")
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      monthlyExpenses,
      creditCardMinimums,
      otherDebtPayments,
      oneTimeExpenses,
      total: monthlyExpenses + creditCardMinimums + otherDebtPayments,
    };
  }, [data.budget.expenses, data.creditCards, data.otherDebts]);

  // Group expenses by category
  const expensesByCategory = useMemo(() => {
    return data.budget.expenses
      .filter(exp => exp.isRecurring && exp.recurringFrequency === "monthly")
      .reduce((acc, exp) => {
        const cat = exp.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(exp);
        return acc;
      }, {} as Record<string, Expense[]>);
  }, [data.budget.expenses]);

  // One-time expenses
  const oneTimeExpenses = useMemo(() => {
    return data.budget.expenses.filter(
      exp => !exp.isRecurring || exp.recurringFrequency === "none"
    );
  }, [data.budget.expenses]);

  // Quarterly/Yearly expenses
  const periodicExpenses = useMemo(() => {
    return data.budget.expenses.filter(
      exp => exp.isRecurring && (exp.recurringFrequency === "quarterly" || exp.recurringFrequency === "yearly")
    );
  }, [data.budget.expenses]);

  const handleSaveExpense = (expenseData: Omit<Expense, "id"> | Expense) => {
    if ('id' in expenseData) {
      updateExpense(expenseData.id, expenseData);
    } else {
      addExpense(expenseData);
    }
    setFormOpen(false);
    setEditingExpense(undefined);
  };

  const handleImportExpenses = (expenses: Omit<Expense, "id">[]) => {
    expenses.forEach((exp) => addExpense(exp));
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
      {/* Total Monthly Obligations Summary */}
      <Card className="border-2 border-foreground bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Total Monthly Obligations</p>
              <p className="text-4xl font-bold text-destructive mt-1">
                {formatCurrency(totals.total)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <DollarSign className="h-8 w-8 text-destructive" />
            </div>
          </div>
          
          {/* Breakdown */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-foreground/20">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Expenses</p>
              <p className="text-lg font-bold">{formatCurrency(totals.monthlyExpenses)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Card Minimums</p>
              <p className="text-lg font-bold">{formatCurrency(totals.creditCardMinimums)}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Debt Payments</p>
              <p className="text-lg font-bold">{formatCurrency(totals.otherDebtPayments)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Card Payments Section */}
      {data.creditCards.length > 0 && (
        <Card className="border-2 border-foreground">
          <CardHeader className="border-b-2 border-foreground pb-4">
            <div className="flex items-center gap-2">
              <CreditCardIcon className="h-5 w-5" />
              <CardTitle className="text-lg font-bold uppercase tracking-wider">
                Credit Card Payments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {data.creditCards.map((card) => (
                <div 
                  key={card.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium">{card.name}</span>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      {card.dueDay && (
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Due: {card.dueDay}{getOrdinalSuffix(card.dueDay)}
                        </span>
                      )}
                      <span>Balance: {formatCurrency(card.balance)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-destructive">{formatCurrency(card.minimumPayment)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-3 border-t font-bold">
                <span>Total Card Minimums</span>
                <span>{formatCurrency(totals.creditCardMinimums)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Debt Payments Section */}
      {data.otherDebts.filter(d => d.type === "payment_plan" && d.monthlyPayment).length > 0 && (
        <Card className="border-2 border-foreground">
          <CardHeader className="border-b-2 border-foreground pb-4">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              <CardTitle className="text-lg font-bold uppercase tracking-wider">
                Debt Payments
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {data.otherDebts
                .filter(debt => debt.type === "payment_plan" && debt.monthlyPayment)
                .map((debt) => (
                  <div 
                    key={debt.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <span className="font-medium">{debt.name}</span>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {debt.paymentsRemaining && (
                          <span>{debt.paymentsRemaining} payments left</span>
                        )}
                        <span>Remaining: {formatCurrency(debt.amount)}</span>
                      </div>
                    </div>
                    <span className="font-bold text-destructive">{formatCurrency(debt.monthlyPayment || 0)}</span>
                  </div>
                ))}
              <div className="flex items-center justify-between pt-3 border-t font-bold">
                <span>Total Debt Payments</span>
                <span>{formatCurrency(totals.otherDebtPayments)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurring Expenses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-foreground pb-2">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            <h2 className="text-lg font-bold uppercase tracking-wider">Recurring Expenses</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setCsvImportOpen(true)} 
              className="border-2 border-foreground"
              size="sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button 
              onClick={() => { setEditingExpense(undefined); setFormOpen(true); }} 
              className="border-2 border-foreground"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        <ExpenseForm
          expense={editingExpense}
          open={formOpen}
          onClose={handleCloseForm}
          onSave={handleSaveExpense}
          creditCards={data.creditCards.map(c => ({ id: c.id, name: c.name }))}
        />

        <ExpenseCSVImport
          open={csvImportOpen}
          onClose={() => setCsvImportOpen(false)}
          onImport={handleImportExpenses}
        />

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
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                {expense.dueDay && (
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="h-3 w-3" />
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
              <p className="text-muted-foreground">No recurring expenses yet.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => { setEditingExpense(undefined); setFormOpen(true); }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Periodic Expenses (Quarterly/Yearly) */}
      {periodicExpenses.length > 0 && (
        <Card className="border-2 border-foreground">
          <CardHeader className="border-b-2 border-foreground pb-4">
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              Periodic Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {periodicExpenses.map((expense) => {
                const linkedCard = getLinkedCardName(expense.linkedCardId);
                
                return (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expense.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono uppercase">
                          {FREQUENCY_LABELS[expense.recurringFrequency || "monthly"]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {expense.renewalDate && (
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Renews: {format(new Date(expense.renewalDate), "MMM d, yyyy")}
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
      )}

      {/* One-Time Expenses */}
      {oneTimeExpenses.length > 0 && (
        <Card className="border-2 border-foreground">
          <CardHeader className="border-b-2 border-foreground pb-4">
            <CardTitle className="text-lg font-bold uppercase tracking-wider">
              One-Time Expenses
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {oneTimeExpenses.map((expense) => {
                const linkedCard = getLinkedCardName(expense.linkedCardId);
                
                return (
                  <div 
                    key={expense.id} 
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{expense.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono uppercase">
                          One-time
                        </span>
                      </div>
                      {linkedCard && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <CreditCardIcon className="h-3 w-3" />
                          {linkedCard}
                        </div>
                      )}
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
      )}
    </div>
  );
};
