import { useState } from 'react';
import { Plus, Trash2, DollarSign, Users, Receipt, Briefcase, PiggyBank } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScenarioConfig } from '../../hooks/useScenarios';
import { useClients } from '../../hooks/useClients';
import { useExpenses } from '../../hooks/useExpenses';
import { useEmployees } from '../../hooks/useEmployees';
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
  additionalContractors: [],
  salaryAdjustment: 0,
  taxDeductions: defaultTaxDeductions,
  bankAllocations: defaultBankAllocations,
});

export const ScenarioEditor = ({ config, onChange }: ScenarioEditorProps) => {
  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { employees, totalSalary } = useEmployees();

  // Merge current config with defaults for any missing fields
  const mergedConfig: ScenarioConfig = {
    ...getDefaultConfig(),
    ...config,
    taxDeductions: { ...defaultTaxDeductions, ...config.taxDeductions },
    bankAllocations: config.bankAllocations?.length ? config.bankAllocations : defaultBankAllocations,
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

  // === Contractor modifications ===
  const addContractor = () => {
    onChange({
      ...mergedConfig,
      additionalContractors: [...mergedConfig.additionalContractors, { name: 'New Contractor', pay: 0 }],
    });
  };

  const updateContractor = (index: number, updates: Partial<{ name: string; pay: number }>) => {
    onChange({
      ...mergedConfig,
      additionalContractors: mergedConfig.additionalContractors.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      ),
    });
  };

  const removeContractor = (index: number) => {
    onChange({
      ...mergedConfig,
      additionalContractors: mergedConfig.additionalContractors.filter((_, i) => i !== index),
    });
  };

  // === Salary adjustment ===
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

      {/* Contractors/Hires Section */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-3 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            <h3 className="text-sm font-bold uppercase tracking-widest">Contractors / Hires</h3>
          </div>
          <Button size="sm" variant="outline" onClick={addContractor} className="h-7 text-xs rounded-none border-2 border-foreground">
            <Plus className="w-3 h-3 mr-1" /> Add
          </Button>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2 p-2 border border-foreground/30">
            <span className="flex-1 text-sm font-mono">Salary Adjustment (annual)</span>
            <Input
              type="number"
              value={mergedConfig.salaryAdjustment}
              onChange={(e) => updateSalaryAdjustment(Number(e.target.value))}
              className="w-28 h-7 text-xs font-mono rounded-none border-2"
              placeholder="+/- amount"
            />
          </div>
          {mergedConfig.additionalContractors.map((contractor, index) => (
            <div key={index} className="flex items-center gap-2 p-2 border border-foreground bg-primary/5">
              <Input
                value={contractor.name}
                onChange={(e) => updateContractor(index, { name: e.target.value })}
                className="flex-1 h-7 text-xs rounded-none border-2"
                placeholder="Name"
              />
              <Input
                type="number"
                value={contractor.pay}
                onChange={(e) => updateContractor(index, { pay: Number(e.target.value) })}
                className="w-24 h-7 text-xs font-mono rounded-none border-2"
                placeholder="Monthly pay"
              />
              <Button size="sm" variant="ghost" onClick={() => removeContractor(index)} className="h-7 w-7 p-0">
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
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
