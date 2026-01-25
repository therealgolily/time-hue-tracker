import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceAuth } from './useFinanceAuth';
import { toast } from '@/hooks/use-toast';

export interface Contractor {
  id: string;
  user_id: string;
  name: string;
  monthly_pay: number;
  created_at: string;
  updated_at: string;
}

export type ContractorInsert = Omit<Contractor, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type ContractorUpdate = Partial<ContractorInsert>;

const LOCAL_STORAGE_KEY = 'finance_contractors';

export const useContractors = () => {
  const { user } = useFinanceAuth();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContractors = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('contractors')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error fetching contractors', description: error.message, variant: 'destructive' });
    } else {
      setContractors(data as Contractor[]);
    }
    setLoading(false);
  }, [user]);

  // Migrate localStorage data to database on first load
  const migrateLocalData = useCallback(async () => {
    if (!user) return;

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return;

    try {
      const localContractors = JSON.parse(stored);
      if (!Array.isArray(localContractors) || localContractors.length === 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }

      // Insert into database
      const inserts = localContractors.map((con: any) => ({
        user_id: user.id,
        name: con.name,
        monthly_pay: con.monthly_pay,
      }));

      const { error } = await supabase.from('contractors').insert(inserts);

      if (!error) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        toast({ title: 'Data migrated', description: 'Your contractors have been saved to the cloud.' });
      }
    } catch (e) {
      console.error('Failed to migrate contractor data:', e);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      await migrateLocalData();
      await fetchContractors();
    };
    init();
  }, [migrateLocalData, fetchContractors]);

  const addContractor = async (contractor: ContractorInsert) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('contractors')
      .insert({ ...contractor, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding contractor', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setContractors([...contractors, data as Contractor]);
    toast({ title: 'Contractor added', description: `${contractor.name} has been added.` });
    return { data };
  };

  const updateContractor = async (id: string, updates: ContractorUpdate) => {
    const { data, error } = await supabase
      .from('contractors')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error updating contractor', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setContractors(contractors.map(c => c.id === id ? data as Contractor : c));
    toast({ title: 'Contractor updated' });
    return { data };
  };

  const deleteContractor = async (id: string) => {
    const contractor = contractors.find(c => c.id === id);

    const { error } = await supabase
      .from('contractors')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting contractor', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setContractors(contractors.filter(c => c.id !== id));
    toast({ title: 'Contractor deleted', description: contractor ? `${contractor.name} has been removed.` : undefined });
    return { success: true };
  };

  const totalMonthlyPay = contractors.reduce((sum, con) => sum + Number(con.monthly_pay), 0);

  return {
    contractors,
    loading,
    addContractor,
    updateContractor,
    deleteContractor,
    refetch: fetchContractors,
    totalMonthlyPay,
  };
};
