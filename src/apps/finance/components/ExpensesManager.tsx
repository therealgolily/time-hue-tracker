import { format } from 'date-fns';
import { Receipt, Edit, Trash2, Plane, Monitor, MessageSquare, Users, Building, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExpenseForm } from './forms/ExpenseForm';
import { ExpenseCSVImport } from './forms/ExpenseCSVImport';
import { useExpenses, ExpenseInsert } from '../hooks/useExpenses';
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
  travel: 'TRAVEL',
  software: 'SOFTWARE',
  messaging: 'MESSAGING',
  contractor: 'CONTRACTOR',
  salary: 'SALARY',
  misc: 'MISC',
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
      <div className="flex items-center justify-center h-64 border-2 border-foreground">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Expenses</h2>
          <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
            Track business expenses & COGS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseCSVImport clients={clients} onImport={handleCSVImport} />
          <ExpenseForm clients={clients} onSubmit={addExpense} />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
        <div className="border-2 border-foreground border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Expenses</p>
          <p className="text-2xl font-bold mt-2 tabular-nums text-primary">
            ${totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Recurring</p>
          <p className="text-2xl font-bold mt-2 tabular-nums text-primary">
            ${recurringExpenses.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">One-time</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            ${(totalExpenses - recurringExpenses).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      {expenses.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">No Expenses</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase mb-4">
            Start logging business expenses
          </p>
          <ExpenseForm clients={clients} onSubmit={addExpense} />
        </div>
      ) : (
        <div className="border-2 border-foreground overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/30">
                  <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Description</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Category</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Client</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Date</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Amount</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => {
                  const Icon = categoryIcons[expense.category] || MoreHorizontal;
                  const client = expense.client_id ? clients.find(c => c.id === expense.client_id) : null;
                  return (
                    <tr 
                      key={expense.id}
                      className={index < expenses.length - 1 ? "border-b border-foreground/30" : ""}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{expense.description}</span>
                          {expense.recurring && (
                            <span className="text-xs font-mono uppercase bg-foreground text-background px-2 py-0.5">
                              Monthly
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-2 text-xs font-mono uppercase">
                          <Icon className="w-4 h-4" />
                          {categoryLabels[expense.category]}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm font-mono text-muted-foreground">
                        {client ? client.name : '—'}
                      </td>
                      <td className="p-3 text-center text-sm font-mono text-muted-foreground">
                        {format(new Date(expense.date), 'MMM d')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold tabular-nums text-primary">
                        ${Number(expense.amount).toLocaleString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ExpenseForm
                            clients={clients}
                            initialData={expense}
                            onSubmit={(data) => updateExpense(expense.id, data)}
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                <Edit className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-2 border-foreground rounded-none">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="uppercase tracking-wide">Delete Expense?</AlertDialogTitle>
                                <AlertDialogDescription className="font-mono text-sm">
                                  This will permanently delete this expense record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-2 border-foreground rounded-none">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteExpense(expense.id)}
                                  className="bg-primary text-primary-foreground rounded-none"
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
        </div>
      )}
    </div>
  );
};