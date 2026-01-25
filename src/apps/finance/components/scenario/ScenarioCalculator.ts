import { ScenarioConfig } from '../../hooks/useScenarios';
import { Client } from '../../hooks/useClients';
import { Expense } from '../../hooks/useExpenses';
import { TAX_RATES } from '../../data/businessData';

export interface ScenarioResults {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyContractors: number;
  grossProfit: number;
  adjustedSalary: number;
  taxDeductionsTotal: number;
  taxableIncome: number;
  estimatedAnnualTax: number;
  estimatedMonthlyTax: number;
  netProfit: number;
  bankAllocations: Array<{ name: string; amount: number; percentage: number }>;
  taxBreakdown: {
    employerFica: number;
    employeeFica: number;
    federalIncome: number;
    stateIncome: number;
  };
}

export const calculateScenario = (
  config: ScenarioConfig,
  clients: Client[],
  expenses: Expense[],
  baseSalary: number
): ScenarioResults => {
  // Calculate monthly revenue from clients
  let monthlyRevenue = 0;
  
  // Add real clients (not removed, with possible retainer modifications)
  clients.filter(c => c.status === 'active').forEach(client => {
    if (config.removedClientIds.includes(client.id)) return;
    const scenarioClient = config.scenarioClients.find(sc => sc.id === client.id);
    monthlyRevenue += scenarioClient?.monthlyRetainer ?? Number(client.monthly_retainer);
  });

  // Add virtual clients
  config.scenarioClients.filter(c => c.isVirtual).forEach(client => {
    monthlyRevenue += client.monthlyRetainer;
  });

  // Calculate monthly expenses
  let monthlyExpenses = 0;
  
  // Add real expenses (recurring, not removed)
  expenses.filter(e => e.recurring).forEach(expense => {
    if (config.removedExpenseIds.includes(expense.id)) return;
    monthlyExpenses += Number(expense.amount);
  });

  // Add virtual expenses
  config.scenarioExpenses.filter(e => e.isVirtual && e.recurring).forEach(expense => {
    monthlyExpenses += expense.amount;
  });

  // Calculate contractor costs
  const monthlyContractors = config.additionalContractors.reduce((sum, c) => sum + c.pay, 0);
  monthlyExpenses += monthlyContractors;

  // Calculate gross profit
  const grossProfit = monthlyRevenue - monthlyExpenses;

  // Calculate adjusted salary
  const adjustedSalary = baseSalary + config.salaryAdjustment;

  // Calculate tax deductions
  const taxDeductionsTotal = Object.values(config.taxDeductions)
    .filter(d => d.enabled)
    .reduce((sum, d) => sum + d.amount, 0);

  // Calculate taxes (S-Corp style)
  const annualProfit = grossProfit * 12;
  const employerFica = adjustedSalary * TAX_RATES.employerFica;
  const employeeFica = adjustedSalary * TAX_RATES.employeeFica;
  
  // Adjusted profit after employer FICA
  const adjustedProfit = annualProfit - employerFica;
  
  // Total taxable income (salary + profit - deductions)
  const taxableIncome = Math.max(0, adjustedSalary + adjustedProfit - taxDeductionsTotal);
  
  // Federal and state taxes
  const federalIncome = taxableIncome * TAX_RATES.federalIncome;
  const stateIncome = taxableIncome * TAX_RATES.stateIncome;
  
  // Total annual tax
  const estimatedAnnualTax = employerFica + employeeFica + federalIncome + stateIncome;
  const estimatedMonthlyTax = Math.round(estimatedAnnualTax / 12);

  // Net profit after tax reserve
  const netProfit = grossProfit - estimatedMonthlyTax;

  // Bank allocations
  const bankAllocations = config.bankAllocations.map(allocation => ({
    name: allocation.name,
    percentage: allocation.percentage,
    amount: Math.round(netProfit * (allocation.percentage / 100)),
  }));

  return {
    monthlyRevenue,
    monthlyExpenses,
    monthlyContractors,
    grossProfit,
    adjustedSalary,
    taxDeductionsTotal,
    taxableIncome,
    estimatedAnnualTax: Math.round(estimatedAnnualTax),
    estimatedMonthlyTax,
    netProfit,
    bankAllocations,
    taxBreakdown: {
      employerFica: Math.round(employerFica),
      employeeFica: Math.round(employeeFica),
      federalIncome: Math.round(federalIncome),
      stateIncome: Math.round(stateIncome),
    },
  };
};

// Calculate baseline (current reality without any scenario modifications)
export const calculateBaseline = (
  clients: Client[],
  expenses: Expense[],
  baseSalary: number
): ScenarioResults => {
  const emptyConfig: ScenarioConfig = {
    scenarioClients: [],
    removedClientIds: [],
    scenarioExpenses: [],
    removedExpenseIds: [],
    additionalContractors: [],
    salaryAdjustment: 0,
    taxDeductions: {},
    bankAllocations: [
      { name: 'Operating', percentage: 50, color: '#000000' },
      { name: 'Tax Reserve', percentage: 30, color: '#666666' },
      { name: 'Owner Pay', percentage: 20, color: '#999999' },
    ],
  };
  
  return calculateScenario(emptyConfig, clients, expenses, baseSalary);
};
