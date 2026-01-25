import { useState } from 'react';
import { Plus, Trash2, DollarSign, Users, Receipt, Briefcase, PiggyBank, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScenarioConfig } from '../../hooks/useScenarios';
import { useClients } from '../../hooks/useClients';
import { useExpenses } from '../../hooks/useExpenses';
import { useEmployees } from '../../hooks/useEmployees';
import { useContractors } from '../../hooks/useContractors';
import { TAX_RATES } from '../../data/businessData';

interface ScenarioEditorProps {
  config: ScenarioConfig;
  onChange: (config: ScenarioConfig) => void;
}

const defaultTaxDeductions: ScenarioConfig['taxDeductions'] = {
  traditional401k: { enabled: false, amount: 0, label: 'Traditional 401(k)', description: 'Pre-tax contributions (max $23,000/yr)' },
  healthInsurance: { enabled: false, amount: 0, label: 'Health Insurance', description: 'Monthly premium (S-Corp deductible)' },
  hsaContribution: { enabled: false, amount: 0, label: 'HSA Contribution', description: 'Health Savings Account (max $4,150/yr individual)' },
  sepIra: { enabled: false, amount: 0, label: 'SEP-IRA', description: 'Up to 25% of compensation' },
  homeOffice: { enabled: false, amount: 0, label: 'Home Office', description: 'Simplified: $5/sq ft, max 300 sq ft' },
};

const defaultBankAllocations: ScenarioConfig['bankAllocations'] = [
  { name: 'Operating', percentage: 50, color: '#000000' },
  { name: 'Tax Reserve', percentage: 30, color: '#666666' },
  { name: 'Owner Pay', percentage: 20, color: '#999999' },
];

export const getDefaultConfig = (): ScenarioConfig => ({
  scenarioClients: [],
  removedClientIds: [],
  scenarioExpenses: [],
  removedExpenseIds: [],
  scenarioContractors: [],
  removedContractorIds: [],
  additionalContractors: [],
  scenarioEmployees: [],
  removedEmployeeIds: [],
  additionalEmployees: [],
  salaryAdjustment: 0,
  taxDeductions: defaultTaxDeductions,
  bankAllocations: defaultBankAllocations,
});

export const ScenarioEditor = ({ config, onChange }: ScenarioEditorProps) => {
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { employees } = useEmployees();
  const { contractors } = useContractors();

  // Merge current config with defaults for any missing fields
  const mergedConfig: ScenarioConfig = {
    ...getDefaultConfig(),
    ...config,
    taxDeductions: { ...defaultTaxDeductions, ...config.taxDeductions },
    bankAllocations: config.bankAllocations?.length ? config.bankAllocations : defaultBankAllocations,
    scenarioContractors: config.scenarioContractors || [],
    removedContractorIds: config.removedContractorIds || [],
    scenarioEmployees: config.scenarioEmployees || [],
    removedEmployeeIds: config.removedEmployeeIds || [],
    additionalEmployees: config.additionalEmployees || [],
  };

  // === Client modifications ===
  const addVirtualClient = () => {
    const newClient = {
      id: `virtual-${Date.now()}`,
      name: 'New Client',
      monthlyRetainer: 0,
      isVirtual: true,
    };
    onChange({
      ...mergedConfig,
      scenarioClients: [...mergedConfig.scenarioClients, newClient],
    });
  };

  const updateScenarioClient = (id: string, updates: Partial<{ name: string; monthlyRetainer: number }>) => {
    const existing = mergedConfig.scenarioClients.find(c => c.id === id);
    if (existing) {
      onChange({
        ...mergedConfig,
        scenarioClients: mergedConfig.scenarioClients.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
      });
    } else {
      // Create a modified version of a real client
      const realClient = clients.find(c => c.id === id);
      if (realClient) {
        onChange({
          ...mergedConfig,
          scenarioClients: [
            ...mergedConfig.scenarioClients,
            { id, name: realClient.name, monthlyRetainer: updates.monthlyRetainer ?? Number(realClient.monthly_retainer), isVirtual: false },
          ],
        });
      }
    }
  };

  const toggleClientRemoval = (id: string) => {
    const isRemoved = mergedConfig.removedClientIds.includes(id);
    onChange({
      ...mergedConfig,
      removedClientIds: isRemoved
        ? mergedConfig.removedClientIds.filter(cid => cid !== id)
        : [...mergedConfig.removedClientIds, id],
    });
  };

  const removeVirtualClient = (id: string) => {
    onChange({
      ...mergedConfig,
      scenarioClients: mergedConfig.scenarioClients.filter(c => c.id !== id),
    });
  };

  // === Expense modifications ===
  const addVirtualExpense = () => {
    const newExpense = {
      id: `virtual-${Date.now()}`,
      description: 'New Expense',
      amount: 0,
      recurring: true,
      isVirtual: true,
    };
    onChange({
      ...mergedConfig,
      scenarioExpenses: [...mergedConfig.scenarioExpenses, newExpense],
    });
  };

  const updateScenarioExpense = (id: string, updates: Partial<{ description: string; amount: number; recurring: boolean }>) => {
    const existing = mergedConfig.scenarioExpenses.find(e => e.id === id);
    if (existing) {
      onChange({
        ...mergedConfig,
        scenarioExpenses: mergedConfig.scenarioExpenses.map(e =>
          e.id === id ? { ...e, ...updates } : e
        ),
      });
    }
  };

  const toggleExpenseRemoval = (id: string) => {
    const isRemoved = mergedConfig.removedExpenseIds.includes(id);
    onChange({
      ...mergedConfig,
      removedExpenseIds: isRemoved
        ? mergedConfig.removedExpenseIds.filter(eid => eid !== id)
        : [...mergedConfig.removedExpenseIds, id],
    });
  };

  const removeVirtualExpense = (id: string) => {
    onChange({
      ...mergedConfig,
      scenarioExpenses: mergedConfig.scenarioExpenses.filter(e => e.id !== id),
    });
  };

  // === Real Contractor modifications ===
  const toggleContractorRemoval = (id: string) => {
    const isRemoved = mergedConfig.removedContractorIds.includes(id);
    onChange({
      ...mergedConfig,
      removedContractorIds: isRemoved
        ? mergedConfig.removedContractorIds.filter(cid => cid !== id)
        : [...mergedConfig.removedContractorIds, id],
    });
  };

  const updateScenarioContractor = (id: string, updates: Partial<{ name: string; monthlyPay: number }>) => {
    const existing = mergedConfig.scenarioContractors.find(c => c.id === id);
    if (existing) {
      onChange({
        ...mergedConfig,
        scenarioContractors: mergedConfig.scenarioContractors.map(c =>
          c.id === id ? { ...c, ...updates } : c
        ),
      });
    } else {
      const realContractor = contractors.find(c => c.id === id);
      if (realContractor) {
        onChange({
          ...mergedConfig,
          scenarioContractors: [
            ...mergedConfig.scenarioContractors,
            { id, name: realContractor.name, monthlyPay: updates.monthlyPay ?? Number(realContractor.monthly_pay) },
          ],
        });
      }
    }
  };

  const getContractorPay = (contractorId: string) => {
    const scenarioContractor = mergedConfig.scenarioContractors.find(c => c.id === contractorId);
    if (scenarioContractor) return scenarioContractor.monthlyPay;
    const realContractor = contractors.find(c => c.id === contractorId);
    return realContractor ? Number(realContractor.monthly_pay) : 0;
  };

  // === Virtual Contractor modifications ===
  const addVirtualContractor = () => {
    onChange({
      ...mergedConfig,
      additionalContractors: [...mergedConfig.additionalContractors, { name: 'New Contractor', pay: 0 }],
    });
  };

  const updateVirtualContractor = (index: number, updates: Partial<{ name: string; pay: number }>) => {
    onChange({
      ...mergedConfig,
      additionalContractors: mergedConfig.additionalContractors.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      ),
    });
  };

  const removeVirtualContractor = (index: number) => {
    onChange({
      ...mergedConfig,
      additionalContractors: mergedConfig.additionalContractors.filter((_, i) => i !== index),
    });
  };

  // === Real Employee modifications ===
  const toggleEmployeeRemoval = (id: string) => {
    const isRemoved = mergedConfig.removedEmployeeIds.includes(id);
    onChange({
      ...mergedConfig,
      removedEmployeeIds: isRemoved
        ? mergedConfig.removedEmployeeIds.filter(eid => eid !== id)
        : [...mergedConfig.removedEmployeeIds, id],
    });
  };

  const updateScenarioEmployee = (id: string, updates: Partial<{ name: string; salary: number }>) => {
    const existing = mergedConfig.scenarioEmployees.find(e => e.id === id);
    if (existing) {
      onChange({
        ...mergedConfig,
        scenarioEmployees: mergedConfig.scenarioEmployees.map(e =>
          e.id === id ? { ...e, ...updates } : e
        ),
      });
    } else {
      const realEmployee = employees.find(e => e.id === id);
      if (realEmployee) {
        onChange({
          ...mergedConfig,
          scenarioEmployees: [
            ...mergedConfig.scenarioEmployees,
            { id, name: realEmployee.name, salary: updates.salary ?? Number(realEmployee.salary) },
          ],
        });
      }
    }
  };

  const getEmployeeSalary = (employeeId: string) => {
    const scenarioEmployee = mergedConfig.scenarioEmployees.find(e => e.id === employeeId);
    if (scenarioEmployee) return scenarioEmployee.salary;
    const realEmployee = employees.find(e => e.id === employeeId);
    return realEmployee ? Number(realEmployee.salary) : 0;
  };

  // === Virtual Employee modifications ===
  const addVirtualEmployee = () => {
    onChange({
      ...mergedConfig,
      additionalEmployees: [...mergedConfig.additionalEmployees, { name: 'New Employee', salary: 0 }],
    });
  };

  const updateVirtualEmployee = (index: number, updates: Partial<{ name: string; salary: number }>) => {
    onChange({
      ...mergedConfig,
      additionalEmployees: mergedConfig.additionalEmployees.map((e, i) =>
        i === index ? { ...e, ...updates } : e
      ),
    });
  };

  const removeVirtualEmployee = (index: number) => {
    onChange({
      ...mergedConfig,
      additionalEmployees: mergedConfig.additionalEmployees.filter((_, i) => i !== index),
    });
  };

  // === Salary adjustment (deprecated, kept for backwards compatibility) ===
  const updateSalaryAdjustment = (amount: number) => {
    onChange({ ...mergedConfig, salaryAdjustment: amount });
  };

  // === Tax deductions ===
  const toggleTaxDeduction = (key: string) => {
    const current = mergedConfig.taxDeductions[key];
    onChange({
      ...mergedConfig,
      taxDeductions: {
        ...mergedConfig.taxDeductions,
        [key]: { ...current, enabled: !current.enabled },
      },
    });
  };

  const updateTaxDeductionAmount = (key: string, amount: number) => {
    const current = mergedConfig.taxDeductions[key];
    onChange({
      ...mergedConfig,
      taxDeductions: {
        ...mergedConfig.taxDeductions,
        [key]: { ...current, amount },
      },
    });
  };

  // === Bank allocations ===
  const updateBankAllocation = (index: number, updates: Partial<{ name: string; percentage: number }>) => {
    onChange({
      ...mergedConfig,
      bankAllocations: mergedConfig.bankAllocations.map((a, i) =>
        i === index ? { ...a, ...updates } : a
      ),
    });
  };

  const addBankAllocation = () => {
    onChange({
      ...mergedConfig,
      bankAllocations: [...mergedConfig.bankAllocations, { name: 'New Account', percentage: 0, color: '#cccccc' }],
    });
  };

  const removeBankAllocation = (index: number) => {
    onChange({
      ...mergedConfig,
      bankAllocations: mergedConfig.bankAllocations.filter((_, i) => i !== index),
    });
  };

  // Get effective client retainer for display
  const getClientRetainer = (clientId: string) => {
    const scenarioClient = mergedConfig.scenarioClients.find(c => c.id === clientId);
    if (scenarioClient) return scenarioClient.monthlyRetainer;
    const realClient = clients.find(c => c.id === clientId);
    return realClient ? Number(realClient.monthly_retainer) : 0;
  };

  return (
    <div className="space-y-6">
      {/* Clients Section */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Clients</h3>
          </div>
          <Button size="sm" variant="outline" onClick={addVirtualClient} className="h-7 text-xs rounded-none border-2 border-foreground">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
          {clients.filter(c => c.status === 'active').map(client => {
            const isRemoved = mergedConfig.removedClientIds.includes(client.id);
            const scenarioClient = mergedConfig.scenarioClients.find(c => c.id === client.id);
            return (
              <div key={client.id} className={`flex items-center gap-2 p-2 border border-foreground/30 ${isRemoved ? 'opacity-40 line-through' : ''}`}>
                <Switch checked={!isRemoved} onCheckedChange={() => toggleClientRemoval(client.id)} />
                <span className="flex-1 text-sm font-mono truncate">{client.name}</span>
                <Input
                  type="number"
                  value={scenarioClient?.monthlyRetainer ?? Number(client.monthly_retainer)}
                  onChange={(e) => updateScenarioClient(client.id, { monthlyRetainer: Number(e.target.value) })}
                  className="w-24 h-7 text-xs font-mono rounded-none border-2"
                  disabled={isRemoved}
                />
              </div>
            );
          })}
          {mergedConfig.scenarioClients.filter(c => c.isVirtual).map(client => (
            <div key={client.id} className="flex items-center gap-2 p-2 border border-foreground bg-primary/5">
              <span className="text-xs font-mono uppercase text-muted-foreground">NEW</span>
              <Input
                value={client.name}
                onChange={(e) => updateScenarioClient(client.id, { name: e.target.value })}
                className="flex-1 h-7 text-xs rounded-none border-2"
                placeholder="Client name"
              />
              <Input
                type="number"
                value={client.monthlyRetainer}
                onChange={(e) => updateScenarioClient(client.id, { monthlyRetainer: Number(e.target.value) })}
                className="w-24 h-7 text-xs font-mono rounded-none border-2"
                placeholder="Retainer"
              />
              <Button size="sm" variant="ghost" onClick={() => removeVirtualClient(client.id)} className="h-7 w-7 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {clients.filter(c => c.status === 'active').length === 0 && mergedConfig.scenarioClients.filter(c => c.isVirtual).length === 0 && (
            <p className="text-xs font-mono text-muted-foreground uppercase text-center py-2">No clients yet</p>
          )}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Recurring Expenses</h3>
          </div>
          <Button size="sm" variant="outline" onClick={addVirtualExpense} className="h-7 text-xs rounded-none border-2 border-foreground">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
          {expenses.filter(e => e.recurring).map(expense => {
            const isRemoved = mergedConfig.removedExpenseIds.includes(expense.id);
            return (
              <div key={expense.id} className={`flex items-center gap-2 p-2 border border-foreground/30 ${isRemoved ? 'opacity-40 line-through' : ''}`}>
                <Switch checked={!isRemoved} onCheckedChange={() => toggleExpenseRemoval(expense.id)} />
                <span className="flex-1 text-sm font-mono truncate">{expense.description}</span>
                <span className="text-xs font-mono text-muted-foreground">${Number(expense.amount).toLocaleString()}</span>
              </div>
            );
          })}
          {mergedConfig.scenarioExpenses.filter(e => e.isVirtual).map(expense => (
            <div key={expense.id} className="flex items-center gap-2 p-2 border border-foreground bg-primary/5">
              <span className="text-xs font-mono uppercase text-muted-foreground">NEW</span>
              <Input
                value={expense.description}
                onChange={(e) => updateScenarioExpense(expense.id, { description: e.target.value })}
                className="flex-1 h-7 text-xs rounded-none border-2"
                placeholder="Description"
              />
              <Input
                type="number"
                value={expense.amount}
                onChange={(e) => updateScenarioExpense(expense.id, { amount: Number(e.target.value) })}
                className="w-24 h-7 text-xs font-mono rounded-none border-2"
                placeholder="Amount"
              />
              <Button size="sm" variant="ghost" onClick={() => removeVirtualExpense(expense.id)} className="h-7 w-7 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {expenses.filter(e => e.recurring).length === 0 && mergedConfig.scenarioExpenses.filter(e => e.isVirtual).length === 0 && (
            <p className="text-xs font-mono text-muted-foreground uppercase text-center py-2">No recurring expenses</p>
          )}
        </div>
      </div>

      {/* Employees (W-2 Salaries) Section */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Employees (W-2)</h3>
          </div>
          <Button size="sm" variant="outline" onClick={addVirtualEmployee} className="h-7 text-xs rounded-none border-2 border-foreground">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
          {employees.map(employee => {
            const isRemoved = mergedConfig.removedEmployeeIds.includes(employee.id);
            const scenarioEmployee = mergedConfig.scenarioEmployees.find(e => e.id === employee.id);
            return (
              <div key={employee.id} className={`flex items-center gap-2 p-2 border border-foreground/30 ${isRemoved ? 'opacity-40 line-through' : ''}`}>
                <Switch checked={!isRemoved} onCheckedChange={() => toggleEmployeeRemoval(employee.id)} />
                <span className="flex-1 text-sm font-mono truncate">{employee.name}</span>
                <Input
                  type="number"
                  value={scenarioEmployee?.salary ?? Number(employee.salary)}
                  onChange={(e) => updateScenarioEmployee(employee.id, { salary: Number(e.target.value) })}
                  className="w-28 h-7 text-xs font-mono rounded-none border-2"
                  disabled={isRemoved}
                />
                <span className="text-xs text-muted-foreground">/yr</span>
              </div>
            );
          })}
          {mergedConfig.additionalEmployees.map((employee, index) => (
            <div key={`virtual-emp-${index}`} className="flex items-center gap-2 p-2 border border-foreground bg-primary/5">
              <span className="text-xs font-mono uppercase text-muted-foreground">NEW</span>
              <Input
                value={employee.name}
                onChange={(e) => updateVirtualEmployee(index, { name: e.target.value })}
                className="flex-1 h-7 text-xs rounded-none border-2"
                placeholder="Name"
              />
              <Input
                type="number"
                value={employee.salary}
                onChange={(e) => updateVirtualEmployee(index, { salary: Number(e.target.value) })}
                className="w-28 h-7 text-xs font-mono rounded-none border-2"
                placeholder="Annual salary"
              />
              <Button size="sm" variant="ghost" onClick={() => removeVirtualEmployee(index)} className="h-7 w-7 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {employees.length === 0 && mergedConfig.additionalEmployees.length === 0 && (
            <p className="text-xs font-mono text-muted-foreground uppercase text-center py-2">No employees yet</p>
          )}
        </div>
      </div>

      {/* Contractors (1099) Section */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Contractors (1099)</h3>
          </div>
          <Button size="sm" variant="outline" onClick={addVirtualContractor} className="h-7 text-xs rounded-none border-2 border-foreground">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="p-3 space-y-2 max-h-48 overflow-y-auto">
          {contractors.map(contractor => {
            const isRemoved = mergedConfig.removedContractorIds.includes(contractor.id);
            const scenarioContractor = mergedConfig.scenarioContractors.find(c => c.id === contractor.id);
            return (
              <div key={contractor.id} className={`flex items-center gap-2 p-2 border border-foreground/30 ${isRemoved ? 'opacity-40 line-through' : ''}`}>
                <Switch checked={!isRemoved} onCheckedChange={() => toggleContractorRemoval(contractor.id)} />
                <span className="flex-1 text-sm font-mono truncate">{contractor.name}</span>
                <Input
                  type="number"
                  value={scenarioContractor?.monthlyPay ?? Number(contractor.monthly_pay)}
                  onChange={(e) => updateScenarioContractor(contractor.id, { monthlyPay: Number(e.target.value) })}
                  className="w-24 h-7 text-xs font-mono rounded-none border-2"
                  disabled={isRemoved}
                />
                <span className="text-xs text-muted-foreground">/mo</span>
              </div>
            );
          })}
          {mergedConfig.additionalContractors.map((contractor, index) => (
            <div key={`virtual-con-${index}`} className="flex items-center gap-2 p-2 border border-foreground bg-primary/5">
              <span className="text-xs font-mono uppercase text-muted-foreground">NEW</span>
              <Input
                value={contractor.name}
                onChange={(e) => updateVirtualContractor(index, { name: e.target.value })}
                className="flex-1 h-7 text-xs rounded-none border-2"
                placeholder="Name"
              />
              <Input
                type="number"
                value={contractor.pay}
                onChange={(e) => updateVirtualContractor(index, { pay: Number(e.target.value) })}
                className="w-24 h-7 text-xs font-mono rounded-none border-2"
                placeholder="Monthly pay"
              />
              <Button size="sm" variant="ghost" onClick={() => removeVirtualContractor(index)} className="h-7 w-7 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          {contractors.length === 0 && mergedConfig.additionalContractors.length === 0 && (
            <p className="text-xs font-mono text-muted-foreground uppercase text-center py-2">No contractors yet</p>
          )}
        </div>
      </div>

      {/* Tax Deductions Section */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Tax Deductions</h3>
          </div>
        </div>
        <div className="p-3 space-y-2">
          {Object.entries(mergedConfig.taxDeductions).map(([key, deduction]) => (
            <div key={key} className="flex items-center gap-2 p-2 border border-foreground/30">
              <Switch checked={deduction.enabled} onCheckedChange={() => toggleTaxDeduction(key)} />
              <div className="flex-1">
                <p className="text-sm font-mono">{deduction.label}</p>
                <p className="text-xs text-muted-foreground">{deduction.description}</p>
              </div>
              <Input
                type="number"
                value={deduction.amount}
                onChange={(e) => updateTaxDeductionAmount(key, Number(e.target.value))}
                className="w-24 h-7 text-xs font-mono rounded-none border-2"
                placeholder="Annual"
                disabled={!deduction.enabled}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Bank Allocations Section */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Bank Allocations</h3>
          </div>
          <Button size="sm" variant="outline" onClick={addBankAllocation} className="h-7 text-xs rounded-none border-2 border-foreground">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="p-3 space-y-2">
          {mergedConfig.bankAllocations.map((allocation, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-foreground/30">
              <Input
                value={allocation.name}
                onChange={(e) => updateBankAllocation(index, { name: e.target.value })}
                className="flex-1 h-7 text-xs rounded-none border-2"
                placeholder="Account name"
              />
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={allocation.percentage}
                  onChange={(e) => updateBankAllocation(index, { percentage: Number(e.target.value) })}
                  className="w-16 h-7 text-xs font-mono rounded-none border-2"
                  min={0}
                  max={100}
                />
                <span className="text-xs font-mono">%</span>
              </div>
              {mergedConfig.bankAllocations.length > 1 && (
                <Button size="sm" variant="ghost" onClick={() => removeBankAllocation(index)} className="h-7 w-7 p-0">
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
          <p className={`text-xs font-mono ${mergedConfig.bankAllocations.reduce((sum, a) => sum + a.percentage, 0) === 100 ? 'text-muted-foreground' : 'text-destructive'}`}>
            Total: {mergedConfig.bankAllocations.reduce((sum, a) => sum + a.percentage, 0)}%
          </p>
        </div>
      </div>
    </div>
  );
};
