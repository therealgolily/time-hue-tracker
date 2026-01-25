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

const isLikelySeedEmployeeData = (value: unknown): value is Employee[] => {
  if (!Array.isArray(value)) return false;

  // Heuristic: the old code seeded localStorage with ids like "emp-1" and a single employee
  // (Nick Scott) at $48,000. There is currently no UI to manage employees, so this is safe
  // to treat as demo/seed data.
  const hasEmpIds = value.every(
    (e) =>
      e &&
      typeof e === 'object' &&
      typeof (e as any).id === 'string' &&
      (e as any).id.startsWith('emp-')
  );

  const has48000Salary = value.some(
    (e) => e && typeof e === 'object' && Number((e as any).salary) === 48000
  );

  return hasEmpIds && has48000Salary;
};

const parseStoredEmployees = (stored: string | null): Employee[] => {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (isLikelySeedEmployeeData(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return Array.isArray(parsed) ? (parsed as Employee[]) : [];
  } catch {
    return [];
  }
};

const getInitialEmployees = (): Employee[] => {
  if (typeof window === 'undefined') return [];

  return parseStoredEmployees(localStorage.getItem(STORAGE_KEY));
};

const notifyChange = () => {
  window.dispatchEvent(new CustomEvent(EMPLOYEES_CHANGED_EVENT));
};

export const useEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>(() => getInitialEmployees());
  const [loading, setLoading] = useState(true);

  const syncFromStorage = useCallback(() => {
    const next = parseStoredEmployees(localStorage.getItem(STORAGE_KEY));
    setEmployees(next);
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
