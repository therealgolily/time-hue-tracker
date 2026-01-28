import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TaxDeduction {
  id: string;
  user_id: string;
  name: string;
  type: 'annual' | 'monthly';
  amount: number;
  category: 'retirement_401k' | 'health_insurance' | 'hsa' | 'ira' | 'other';
  reduces_federal: boolean;
  reduces_state: boolean;
  reduces_fica: boolean;
  created_at: string;
  updated_at: string;
}

export type TaxDeductionInsert = Omit<TaxDeduction, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export const useTaxDeductions = () => {
  const [deductions, setDeductions] = useState<TaxDeduction[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDeductions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('tax_deductions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setDeductions((data || []) as TaxDeduction[]);
    } catch (error: any) {
      console.error('Error fetching tax deductions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tax deductions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addDeduction = async (deduction: TaxDeductionInsert) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('tax_deductions')
        .insert({
          ...deduction,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      setDeductions(prev => [...prev, data as TaxDeduction]);
      toast({
        title: 'Deduction Added',
        description: `${deduction.name} has been added`,
      });
      return data;
    } catch (error: any) {
      console.error('Error adding deduction:', error);
      toast({
        title: 'Error',
        description: 'Failed to add deduction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateDeduction = async (id: string, updates: Partial<TaxDeductionInsert>) => {
    try {
      const { data, error } = await supabase
        .from('tax_deductions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setDeductions(prev => prev.map(d => d.id === id ? data as TaxDeduction : d));
      toast({
        title: 'Deduction Updated',
        description: 'Tax deduction has been updated',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating deduction:', error);
      toast({
        title: 'Error',
        description: 'Failed to update deduction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteDeduction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tax_deductions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDeductions(prev => prev.filter(d => d.id !== id));
      toast({
        title: 'Deduction Deleted',
        description: 'Tax deduction has been removed',
      });
    } catch (error: any) {
      console.error('Error deleting deduction:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete deduction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDeductions();
  }, []);

  // Calculate totals
  const totalAnnualDeductions = deductions.reduce((sum, d) => {
    const annualAmount = d.type === 'monthly' ? Number(d.amount) * 12 : Number(d.amount);
    return sum + annualAmount;
  }, 0);

  const federalDeductions = deductions
    .filter(d => d.reduces_federal)
    .reduce((sum, d) => {
      const annualAmount = d.type === 'monthly' ? Number(d.amount) * 12 : Number(d.amount);
      return sum + annualAmount;
    }, 0);

  const stateDeductions = deductions
    .filter(d => d.reduces_state)
    .reduce((sum, d) => {
      const annualAmount = d.type === 'monthly' ? Number(d.amount) * 12 : Number(d.amount);
      return sum + annualAmount;
    }, 0);

  const ficaDeductions = deductions
    .filter(d => d.reduces_fica)
    .reduce((sum, d) => {
      const annualAmount = d.type === 'monthly' ? Number(d.amount) * 12 : Number(d.amount);
      return sum + annualAmount;
    }, 0);

  return {
    deductions,
    loading,
    addDeduction,
    updateDeduction,
    deleteDeduction,
    refetch: fetchDeductions,
    totalAnnualDeductions,
    federalDeductions,
    stateDeductions,
    ficaDeductions,
  };
};
