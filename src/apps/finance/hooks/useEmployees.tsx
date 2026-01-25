import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFinanceAuth } from './useFinanceAuth';
import { toast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  user_id: string;
  name: string;
  salary: number;
  created_at: string;
  updated_at: string;
}

export type EmployeeInsert = Omit<Employee, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type EmployeeUpdate = Partial<EmployeeInsert>;

const LOCAL_STORAGE_KEY = 'finance_employees';

export const useEmployees = () => {
  const { user } = useFinanceAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name');

    if (error) {
      toast({ title: 'Error fetching employees', description: error.message, variant: 'destructive' });
    } else {
      setEmployees(data as Employee[]);
    }
    setLoading(false);
  }, [user]);

  // Migrate localStorage data to database on first load
  const migrateLocalData = useCallback(async () => {
    if (!user) return;

    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return;

    try {
      const localEmployees = JSON.parse(stored);
      if (!Array.isArray(localEmployees) || localEmployees.length === 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }

      // Skip if it looks like seed data
      const isSeedData = localEmployees.every(
        (e: any) => e.id?.startsWith('emp-')
      ) && localEmployees.some((e: any) => e.salary === 48000);

      if (isSeedData) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }

      // Insert into database
      const inserts = localEmployees.map((emp: any) => ({
        user_id: user.id,
        name: emp.name,
        salary: emp.salary,
      }));

      const { error } = await supabase.from('employees').insert(inserts);

      if (!error) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        toast({ title: 'Data migrated', description: 'Your employees have been saved to the cloud.' });
      }
    } catch (e) {
      console.error('Failed to migrate employee data:', e);
    }
  }, [user]);

  useEffect(() => {
    const init = async () => {
      await migrateLocalData();
      await fetchEmployees();
    };
    init();
  }, [migrateLocalData, fetchEmployees]);

  const addEmployee = async (employee: EmployeeInsert) => {
    if (!user) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('employees')
      .insert({ ...employee, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error adding employee', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setEmployees([...employees, data as Employee]);
    toast({ title: 'Employee added', description: `${employee.name} has been added.` });
    return { data };
  };

  const updateEmployee = async (id: string, updates: EmployeeUpdate) => {
    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error updating employee', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setEmployees(employees.map(e => e.id === id ? data as Employee : e));
    toast({ title: 'Employee updated' });
    return { data };
  };

  const deleteEmployee = async (id: string) => {
    const employee = employees.find(e => e.id === id);
    
    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting employee', description: error.message, variant: 'destructive' });
      return { error: error.message };
    }

    setEmployees(employees.filter(e => e.id !== id));
    toast({ title: 'Employee deleted', description: employee ? `${employee.name} has been removed.` : undefined });
    return { success: true };
  };

  const totalSalary = employees.reduce((sum, emp) => sum + Number(emp.salary), 0);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch: fetchEmployees,
    totalSalary,
  };
};
