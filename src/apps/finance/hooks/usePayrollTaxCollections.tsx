import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PayrollTaxCollection {
  id: string;
  user_id: string;
  transaction_id: string | null;
  transaction_date: string;
  payroll_check_date: string;
  federal_income_tax: number;
  social_security_employee: number;
  medicare_employee: number;
  state_income_tax: number;
  social_security_employer: number;
  medicare_employer: number;
  state_unemployment: number;
  federal_unemployment: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayrollTaxCollectionInsert {
  transaction_id?: string | null;
  transaction_date: string;
  payroll_check_date: string;
  federal_income_tax: number;
  social_security_employee: number;
  medicare_employee: number;
  state_income_tax: number;
  social_security_employer: number;
  medicare_employer: number;
  state_unemployment: number;
  federal_unemployment: number;
  notes?: string | null;
}

export interface PayrollTaxTotals {
  // Employee taxes
  federalIncomeTax: number;
  socialSecurityEmployee: number;
  medicareEmployee: number;
  stateIncomeTax: number;
  employeeTotal: number;
  
  // Employer taxes
  socialSecurityEmployer: number;
  medicareEmployer: number;
  stateUnemployment: number;
  federalUnemployment: number;
  employerTotal: number;
  
  // Grand totals
  grandTotal: number;
  collectionCount: number;
}

export const usePayrollTaxCollections = (year?: number) => {
  const queryClient = useQueryClient();
  const currentYear = year || new Date().getFullYear();

  const { data: collections = [], isLoading: loading } = useQuery({
    queryKey: ['payroll-tax-collections', currentYear],
    queryFn: async () => {
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;
      
      const { data, error } = await supabase
        .from('payroll_tax_collections')
        .select('*')
        .gte('transaction_date', startOfYear)
        .lte('transaction_date', endOfYear)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as PayrollTaxCollection[];
    },
  });

  const totals: PayrollTaxTotals = collections.reduce(
    (acc, c) => ({
      federalIncomeTax: acc.federalIncomeTax + Number(c.federal_income_tax),
      socialSecurityEmployee: acc.socialSecurityEmployee + Number(c.social_security_employee),
      medicareEmployee: acc.medicareEmployee + Number(c.medicare_employee),
      stateIncomeTax: acc.stateIncomeTax + Number(c.state_income_tax),
      employeeTotal: acc.employeeTotal + Number(c.federal_income_tax) + Number(c.social_security_employee) + Number(c.medicare_employee) + Number(c.state_income_tax),
      
      socialSecurityEmployer: acc.socialSecurityEmployer + Number(c.social_security_employer),
      medicareEmployer: acc.medicareEmployer + Number(c.medicare_employer),
      stateUnemployment: acc.stateUnemployment + Number(c.state_unemployment),
      federalUnemployment: acc.federalUnemployment + Number(c.federal_unemployment),
      employerTotal: acc.employerTotal + Number(c.social_security_employer) + Number(c.medicare_employer) + Number(c.state_unemployment) + Number(c.federal_unemployment),
      
      grandTotal: acc.grandTotal + Number(c.federal_income_tax) + Number(c.social_security_employee) + Number(c.medicare_employee) + Number(c.state_income_tax) + Number(c.social_security_employer) + Number(c.medicare_employer) + Number(c.state_unemployment) + Number(c.federal_unemployment),
      collectionCount: acc.collectionCount + 1,
    }),
    {
      federalIncomeTax: 0,
      socialSecurityEmployee: 0,
      medicareEmployee: 0,
      stateIncomeTax: 0,
      employeeTotal: 0,
      socialSecurityEmployer: 0,
      medicareEmployer: 0,
      stateUnemployment: 0,
      federalUnemployment: 0,
      employerTotal: 0,
      grandTotal: 0,
      collectionCount: 0,
    }
  );

  const addMutation = useMutation({
    mutationFn: async (collection: PayrollTaxCollectionInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('payroll_tax_collections')
        .insert({ ...collection, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-tax-collections'] });
      toast.success('Payroll tax collection added');
    },
    onError: (error) => {
      toast.error('Failed to add: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PayrollTaxCollectionInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from('payroll_tax_collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-tax-collections'] });
      toast.success('Payroll tax collection updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('payroll_tax_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-tax-collections'] });
      toast.success('Payroll tax collection deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  return {
    collections,
    loading,
    totals,
    addCollection: (data: PayrollTaxCollectionInsert) => addMutation.mutateAsync(data),
    updateCollection: (id: string, data: Partial<PayrollTaxCollectionInsert>) => updateMutation.mutateAsync({ id, ...data }),
    deleteCollection: (id: string) => deleteMutation.mutateAsync(id),
  };
};
