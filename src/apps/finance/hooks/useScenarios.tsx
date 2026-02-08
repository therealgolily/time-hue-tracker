import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceAuth } from './useFinanceAuth';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface ScenarioTaxDeduction {
  enabled: boolean;
  amount: number;
  label: string;
  description: string;
  reducesFederal?: boolean;
  reducesState?: boolean;
  reducesFica?: boolean;
  isMonthly?: boolean;
  isHomeOffice?: boolean;
  isMileage?: boolean;
  sqft?: number;
}

export interface ScenarioTripExpenses {
  enabled: boolean;
  flights: number;
  lodging: number;
  groundTransport: number;
  meals: number;
  perDiem: number;
  otherExpenses: number;
}

export interface ScenarioExpectedPayment {
  id: string;
  clientName: string;
  amount: number;
  description: string;
  date: string;
  isFromDb?: boolean;
}

export interface ScenarioConfig {
  scenarioClients: Array<{ id: string; name: string; monthlyRetainer: number; isVirtual?: boolean }>;
  removedClientIds: string[];
  scenarioExpenses: Array<{ id: string; description: string; amount: number; recurring: boolean; isVirtual?: boolean }>;
  removedExpenseIds: string[];
  // Real contractors from DB (can be toggled off or amounts modified)
  scenarioContractors: Array<{ id: string; name: string; monthlyPay: number }>;
  removedContractorIds: string[];
  // Virtual contractors (new hires in scenario) - supports both monthly and hourly
  additionalContractors: Array<{ 
    name: string; 
    pay: number; 
    payType?: 'monthly' | 'hourly';
    hourlyRate?: number;
    hoursPerWeek?: number;
  }>;
  // Real employees from DB (can be toggled off or amounts modified)
  scenarioEmployees: Array<{ id: string; name: string; salary: number }>;
  removedEmployeeIds: string[];
  // Virtual employees (new hires in scenario)
  additionalEmployees: Array<{ name: string; salary: number }>;
  salaryAdjustment: number; // Deprecated but kept for backwards compatibility
  taxDeductions: Record<string, ScenarioTaxDeduction>;
  bankAllocations: Array<{ name: string; percentage: number; color: string }>;
  // Trip expenses from travel tracker
  tripExpenses: ScenarioTripExpenses;
  // Expected one-time payments
  expectedPayments: {
    enabled: boolean;
    payments: ScenarioExpectedPayment[];
  };
}

export interface Scenario {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  config: ScenarioConfig;
  created_at: string;
  updated_at: string;
}

export const useScenarios = () => {
  const { user } = useFinanceAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: scenarios, isLoading } = useQuery({
    queryKey: ['finance_scenarios', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('scenarios')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(row => ({
        ...row,
        config: row.config as unknown as ScenarioConfig,
      })) as Scenario[];
    },
    enabled: !!user?.id,
  });

  const saveScenario = useMutation({
    mutationFn: async ({ name, description, config }: { name: string; description?: string; config: ScenarioConfig }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('scenarios')
        .insert([{
          user_id: user.id,
          name,
          description: description || null,
          config: config as unknown as Json,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_scenarios'] });
      toast({ title: 'Scenario saved', description: 'Your scenario has been saved successfully.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateScenario = useMutation({
    mutationFn: async ({ id, name, description, config }: { id: string; name: string; description?: string; config: ScenarioConfig }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('scenarios')
        .update({
          name,
          description: description || null,
          config: config as unknown as Json,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_scenarios'] });
      toast({ title: 'Scenario updated', description: 'Your scenario has been updated.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteScenario = useMutation({
    mutationFn: async (id: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('scenarios')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance_scenarios'] });
      toast({ title: 'Scenario deleted', description: 'Your scenario has been removed.' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    scenarios,
    isLoading,
    saveScenario,
    updateScenario,
    deleteScenario,
  };
};
