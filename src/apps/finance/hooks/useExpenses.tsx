import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceAuth } from './useFinanceAuth';
import { toast } from '@/hooks/use-toast';

export interface Expense {
  id: string;
  user_id: string;
  client_id: string | null;
  description: string;
  amount: number;
  category: 'travel' | 'software' | 'messaging' | 'contractor' | 'salary' | 'misc';
  date: string;
  recurring: boolean;
  created_at: string;
  updated_at: string;
}

export type ExpenseInsert = Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ExpenseUpdate = Partial<ExpenseInsert>;

export const useExpenses = () => {
  const { user } = useFinanceAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching expenses', description: error.message, variant: 'destructive' });
    } else {
      setExpenses(data as Expense[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();
  }, [user]);

  const addExpense = async (expense: ExpenseInsert) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('expenses')
      .insert({ ...expense, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding expense', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setExpenses([data as Expense, ...expenses]);
    toast({ title: 'Expense added', description: `$${expense.amount} expense recorded.` });
    return { data };
  };

  const updateExpense = async (id: string, updates: ExpenseUpdate) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error updating expense', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setExpenses(expenses.map(e => e.id === id ? data as Expense : e));
    toast({ title: 'Expense updated' });
    return { data };
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting expense', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setExpenses(expenses.filter(e => e.id !== id));
    toast({ title: 'Expense deleted' });
    return { success: true };
  };

  const addExpenses = async (expenseList: ExpenseInsert[]) => {
    if (!user) return { error: 'Not authenticated' };

    const expensesWithUser = expenseList.map(expense => ({
      ...expense,
      user_id: user.id,
    }));

    const { data, error } = await supabase
      .from('expenses')
      .insert(expensesWithUser)
      .select();

    if (error) {
      toast({ title: 'Error importing expenses', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setExpenses([...(data as Expense[]), ...expenses]);
    return { data };
  };

  return { expenses, loading, addExpense, addExpenses, updateExpense, deleteExpense, refetch: fetchExpenses };
};
