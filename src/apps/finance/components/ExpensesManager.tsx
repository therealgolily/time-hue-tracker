import { format } from 'date-fns';
import { Receipt, Edit, Trash2, Plane, Monitor, MessageSquare, Users, Building, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from './forms/ExpenseForm';
import { ExpenseCSVImport } from './forms/ExpenseCSVImport';
import { useExpenses, Expense, ExpenseInsert } from '../hooks/useExpenses';
import { useClients } from '../hooks/useClients';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const categoryIcons: Record<string, any> = {
  travel: Plane,
  software: Monitor,
  messaging: MessageSquare,
  contractor: Users,
  salary: Building,
  misc: MoreHorizontal,
};

const categoryLabels: Record<string, string> = {
  travel: 'Travel',
  software: 'Software',
  messaging: 'Messaging',
  contractor: 'Contractors',
  salary: 'Salary',
  misc: 'Miscellaneous',
};

export const ExpensesManager = () => {
  const { expenses, loading, addExpense, addExpenses, updateExpense, deleteExpense } = useExpenses();
  const { clients } = useClients();

  const handleCSVImport = async (expenseList: ExpenseInsert[]) => {
    await addExpenses(expenseList);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const recurringExpenses = expenses.filter(e => e.recurring).reduce((sum, e) => sum + Number(e.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track all business expenses and COGS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseCSVImport clients={clients} onImport={handleCSVImport} />
          <ExpenseForm clients={clients} onSubmit={addExpense} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <p className="metric-label">Total Expenses</p>
          <p className="metric-value mt-2 expense-text">${totalExpenses.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Recurring Monthly</p>
          <p className="metric-value mt-2 expense-text">${recurringExpenses.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">One-time Expenses</p>
          <p className="metric-value mt-2">${(totalExpenses - recurringExpenses).toLocaleString()}</p>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
          <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No expenses yet</h3>
          <p className="text-muted-foreground mb-4">Start logging your business expenses.</p>
          <ExpenseForm clients={clients} onSubmit={addExpense} />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Description</th>
                <th>Category</th>
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => {
                const Icon = categoryIcons[expense.category] || MoreHorizontal;
                const client = expense.client_id ? clients.find(c => c.id === expense.client_id) : null;
                return (
                  <tr key={expense.id}>
                    <td>
                      <div>
                        <span className="font-medium text-foreground">{expense.description}</span>
                        {expense.recurring && (
                          <span className="ml-2 text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                            Monthly
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {categoryLabels[expense.category]}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {client ? client.name : 'Company-wide'}
                    </td>
                    <td className="text-muted-foreground">
                      {format(new Date(expense.date), 'MMM d, yyyy')}
                    </td>
                    <td className="expense-text font-semibold">
                      ${Number(expense.amount).toLocaleString()}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ExpenseForm
                          clients={clients}
                          initialData={expense}
                          onSubmit={(data) => updateExpense(expense.id, data)}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete expense?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this expense record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteExpense(expense.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
