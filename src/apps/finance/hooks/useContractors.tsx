import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { businessInfo } from '../data/businessData';

export interface Contractor {
  id: string;
  name: string;
  monthly_pay: number;
  created_at: string;
  updated_at: string;
}

export type ContractorInsert = Omit<Contractor, 'id' | 'created_at' | 'updated_at'>;
export type ContractorUpdate = Partial<ContractorInsert>;

const STORAGE_KEY = 'finance_contractors';
const CONTRACTORS_CHANGED_EVENT = 'finance_contractors_changed';

const getInitialContractors = (): Contractor[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid JSON, reset to defaults
    }
  }

  const defaultContractors: Contractor[] = businessInfo.contractors.map((con, index) => ({
    id: `con-${index + 1}`,
    name: con.name,
    monthly_pay: con.monthlyPay,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultContractors));
  return defaultContractors;
};

const notifyChange = () => {
  window.dispatchEvent(new CustomEvent(CONTRACTORS_CHANGED_EVENT));
};

export const useContractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>(() => getInitialContractors());
  const [loading, setLoading] = useState(true);

  const syncFromStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setContractors(JSON.parse(stored));
      } catch {
        // Invalid JSON, keep current state
      }
    }
  }, []);

  useEffect(() => {
    syncFromStorage();
    setLoading(false);

    const handleChange = () => syncFromStorage();
    window.addEventListener(CONTRACTORS_CHANGED_EVENT, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(CONTRACTORS_CHANGED_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [syncFromStorage]);

  const saveToStorage = useCallback((newContractors: Contractor[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newContractors));
    setContractors(newContractors);
    notifyChange();
  }, []);

  const addContractor = async (contractor: ContractorInsert) => {
    const now = new Date().toISOString();
    const newContractor: Contractor = {
      ...contractor,
      id: `con-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    const newContractors = [...contractors, newContractor];
    saveToStorage(newContractors);
    toast({ title: 'Contractor added', description: `${contractor.name} has been added.` });
    return { data: newContractor };
  };

  const updateContractor = async (id: string, updates: ContractorUpdate) => {
    const contractorIndex = contractors.findIndex(c => c.id === id);
    if (contractorIndex === -1) {
      toast({ title: 'Error updating contractor', description: 'Contractor not found', variant: 'destructive' });
      return { error: 'Contractor not found' };
    }

    const updatedContractor: Contractor = {
      ...contractors[contractorIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const newContractors = contractors.map(c => c.id === id ? updatedContractor : c);
    saveToStorage(newContractors);
    toast({ title: 'Contractor updated' });
    return { data: updatedContractor };
  };

  const deleteContractor = async (id: string) => {
    const contractor = contractors.find(c => c.id === id);
    if (!contractor) {
      toast({ title: 'Error deleting contractor', description: 'Contractor not found', variant: 'destructive' });
      return { error: 'Contractor not found' };
    }

    const newContractors = contractors.filter(c => c.id !== id);
    saveToStorage(newContractors);
    toast({ title: 'Contractor deleted', description: `${contractor.name} has been removed.` });
    return { success: true };
  };

  const refetch = () => {
    syncFromStorage();
  };

  const totalMonthlyPay = contractors.reduce((sum, con) => sum + con.monthly_pay, 0);

  return {
    contractors,
    loading,
    addContractor,
    updateContractor,
    deleteContractor,
    refetch,
    totalMonthlyPay,
  };
};
