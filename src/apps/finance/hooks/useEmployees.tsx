import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  name: string;
  salary: number;
  created_at: string;
  updated_at: string;
}

export type EmployeeInsert = Omit<Employee, 'id' | 'created_at' | 'updated_at'>;
export type EmployeeUpdate = Partial<EmployeeInsert>;

const STORAGE_KEY = 'finance_employees';
const EMPLOYEES_CHANGED_EVENT = 'finance_employees_changed';

const getInitialEmployees = (): Employee[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid JSON, return empty
    }
  }

  return [];
};

const notifyChange = () => {
  window.dispatchEvent(new CustomEvent(EMPLOYEES_CHANGED_EVENT));
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => getInitialEmployees());
  const [loading, setLoading] = useState(true);

  const syncFromStorage = useCallback(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setEmployees(JSON.parse(stored));
      } catch {
        // Invalid JSON, keep current state
      }
    }
  }, []);

  useEffect(() => {
    syncFromStorage();
    setLoading(false);

    const handleChange = () => syncFromStorage();
    window.addEventListener(EMPLOYEES_CHANGED_EVENT, handleChange);
    window.addEventListener('storage', handleChange);

    return () => {
      window.removeEventListener(EMPLOYEES_CHANGED_EVENT, handleChange);
      window.removeEventListener('storage', handleChange);
    };
  }, [syncFromStorage]);

  const saveToStorage = useCallback((newEmployees: Employee[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newEmployees));
    setEmployees(newEmployees);
    notifyChange();
  }, []);

  const addEmployee = async (employee: EmployeeInsert) => {
    const now = new Date().toISOString();
    const newEmployee: Employee = {
      ...employee,
      id: `emp-${Date.now()}`,
      created_at: now,
      updated_at: now,
    };

    const newEmployees = [...employees, newEmployee];
    saveToStorage(newEmployees);
    toast({ title: 'Employee added', description: `${employee.name} has been added.` });
    return { data: newEmployee };
  };

  const updateEmployee = async (id: string, updates: EmployeeUpdate) => {
    const employeeIndex = employees.findIndex(e => e.id === id);
    if (employeeIndex === -1) {
      toast({ title: 'Error updating employee', description: 'Employee not found', variant: 'destructive' });
      return { error: 'Employee not found' };
    }

    const updatedEmployee: Employee = {
      ...employees[employeeIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const newEmployees = employees.map(e => e.id === id ? updatedEmployee : e);
    saveToStorage(newEmployees);
    toast({ title: 'Employee updated' });
    return { data: updatedEmployee };
  };

  const deleteEmployee = async (id: string) => {
    const employee = employees.find(e => e.id === id);
    if (!employee) {
      toast({ title: 'Error deleting employee', description: 'Employee not found', variant: 'destructive' });
      return { error: 'Employee not found' };
    }

    const newEmployees = employees.filter(e => e.id !== id);
    saveToStorage(newEmployees);
    toast({ title: 'Employee deleted', description: `${employee.name} has been removed.` });
    return { success: true };
  };

  const refetch = () => {
    syncFromStorage();
  };

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);

  return {
    employees,
    loading,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    refetch,
    totalSalary,
  };
};
