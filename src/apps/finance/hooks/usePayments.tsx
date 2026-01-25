import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceAuth } from './useFinanceAuth';
import { toast } from '@/hooks/use-toast';

export interface Payment {
  id: string;
  user_id: string;
  client_id: string;
  amount: number;
  date: string;
  payment_method: 'check' | 'direct_deposit' | 'quickbooks' | 'stripe';
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export type PaymentInsert = Omit<Payment, 'id' | 'user_id' | 'created_at'>;
export type PaymentUpdate = Partial<PaymentInsert>;

export const usePayments = () => {
  const { user } = useFinanceAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast({ title: 'Error fetching payments', description: error.message, variant: 'destructive' });
    } else {
      setPayments(data as Payment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const addPayment = async (payment: PaymentInsert) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('payments')
      .insert({ ...payment, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error recording payment', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setPayments([data as Payment, ...payments]);
    toast({ title: 'Payment recorded', description: `$${payment.amount} payment logged.` });
    return { data };
  };

  const updatePayment = async (id: string, updates: PaymentUpdate) => {
    const { data, error } = await supabase
      .from('payments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error updating payment', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setPayments(payments.map(p => p.id === id ? data as Payment : p));
    toast({ title: 'Payment updated' });
    return { data };
  };

  const deletePayment = async (id: string) => {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting payment', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setPayments(payments.filter(p => p.id !== id));
    toast({ title: 'Payment deleted' });
    return { success: true };
  };

  return { payments, loading, addPayment, updatePayment, deletePayment, refetch: fetchPayments };
};
