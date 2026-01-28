import { ScenarioConfig, ScenarioTaxDeduction } from '../../hooks/useScenarios';
import { Client } from '../../hooks/useClients';
import { Expense } from '../../hooks/useExpenses';
import { Contractor } from '../../hooks/useContractors';
import { Employee } from '../../hooks/useEmployees';
import { TAX_RATES } from '../../data/businessData';

// IRS rates for calculations
const HOME_OFFICE_RATE_PER_SQFT = 5;
const HOME_OFFICE_MAX_SQFT = 300;
const MILEAGE_RATE_2024 = 0.67;

export interface ScenarioResults {
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyContractors: number;
  monthlySalary: number;
  monthlyRecurringExpenses: number;
  grossProfit: number;
  adjustedSalary: number;
  taxDeductionsTotal: number;
  tripExpensesTotal: number;
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
  contractors: Contractor[],
  employees: Employee[],
  _baseSalary?: number // Deprecated, kept for backwards compat
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

  // Calculate monthly recurring expenses (software, misc, etc.)
  let monthlyRecurringExpenses = 0;
  
  // Add real expenses (recurring, not removed)
  expenses.filter(e => e.recurring).forEach(expense => {
    if (config.removedExpenseIds.includes(expense.id)) return;
    monthlyRecurringExpenses += Number(expense.amount);
  });

  // Add virtual expenses
  (config.scenarioExpenses || []).filter(e => e.isVirtual && e.recurring).forEach(expense => {
    monthlyRecurringExpenses += expense.amount;
  });

  // Calculate contractor costs from database (with scenario modifications)
  let realContractorPay = 0;
  contractors.forEach(contractor => {
    // Skip if removed in scenario
    if ((config.removedContractorIds || []).includes(contractor.id)) return;
    // Use scenario amount if modified
    const scenarioContractor = (config.scenarioContractors || []).find(sc => sc.id === contractor.id);
    realContractorPay += scenarioContractor?.monthlyPay ?? Number(contractor.monthly_pay);
  });
  
  // Add virtual contractors from scenario
  const virtualContractorPay = (config.additionalContractors || []).reduce((sum, c) => sum + c.pay, 0);
  const monthlyContractors = realContractorPay + virtualContractorPay;

  // Calculate employee salaries from database (with scenario modifications)
  let totalAnnualSalary = 0;
  employees.forEach(employee => {
    // Skip if removed in scenario
    if ((config.removedEmployeeIds || []).includes(employee.id)) return;
    // Use scenario salary if modified
    const scenarioEmployee = (config.scenarioEmployees || []).find(se => se.id === employee.id);
    totalAnnualSalary += scenarioEmployee?.salary ?? Number(employee.salary);
  });

  // Add virtual employees from scenario
  const virtualEmployeeSalary = (config.additionalEmployees || []).reduce((sum, e) => sum + e.salary, 0);
  totalAnnualSalary += virtualEmployeeSalary;

  // Apply salary adjustment (backwards compatibility)
  const adjustedSalary = totalAnnualSalary + (config.salaryAdjustment || 0);
  const monthlySalary = adjustedSalary / 12;

  // Total monthly operating costs (matches Summary)
  const monthlyExpenses = monthlyRecurringExpenses + monthlySalary + monthlyContractors;

  // Calculate gross profit
  const grossProfit = monthlyRevenue - monthlyExpenses;

  // Calculate tax deductions with proper handling for special types
  let taxDeductionsTotal = 0;
  Object.entries(config.taxDeductions || {}).forEach(([key, d]) => {
    if (!d || !d.enabled) return;
    
    let annualAmount: number;
    
    // Handle special calculation types
    if (d.isHomeOffice) {
      const sqft = Math.min(d.sqft || 0, HOME_OFFICE_MAX_SQFT);
      annualAmount = sqft * HOME_OFFICE_RATE_PER_SQFT;
    } else if (d.isMileage) {
      annualAmount = Math.round(d.amount * MILEAGE_RATE_2024);
    } else if (key === 'businessMeals' || key === 'travelMeals') {
      // 50% deductible for meals
      annualAmount = Math.round(d.amount * 0.5);
    } else if (d.isMonthly) {
      annualAmount = d.amount * 12;
    } else {
      annualAmount = d.amount;
    }
    
    taxDeductionsTotal += annualAmount;
  });

  // Calculate trip expenses (with 50% on meals)
  let tripExpensesTotal = 0;
  const tripExp = config.tripExpenses;
  if (tripExp?.enabled) {
    tripExpensesTotal = 
      tripExp.flights +
      tripExp.lodging +
      tripExp.groundTransport +
      Math.round(tripExp.meals * 0.5) + // 50% deductible
      tripExp.perDiem +
      tripExp.otherExpenses;
  }

  // Total deductions including trips
  const totalDeductions = taxDeductionsTotal + tripExpensesTotal;

  // Calculate taxes (S-Corp style)
  const annualProfit = grossProfit * 12;
  const employerFica = adjustedSalary * TAX_RATES.employerFica;
  const employeeFica = adjustedSalary * TAX_RATES.employeeFica;
  
  // Adjusted profit after employer FICA
  const adjustedProfit = annualProfit - employerFica;
  
  // Total taxable income (salary + profit - deductions)
  const taxableIncome = Math.max(0, adjustedSalary + adjustedProfit - totalDeductions);
  
  // Federal and state taxes
  const federalIncome = taxableIncome * TAX_RATES.federalIncome;
  const stateIncome = taxableIncome * TAX_RATES.stateIncome;
  
  // Total annual tax
  const estimatedAnnualTax = employerFica + employeeFica + federalIncome + stateIncome;
  const estimatedMonthlyTax = Math.round(estimatedAnnualTax / 12);

  // Net profit after tax reserve
  const netProfit = grossProfit - estimatedMonthlyTax;

  // Bank allocations
  const bankAllocations = (config.bankAllocations || []).map(allocation => ({
    name: allocation.name,
    percentage: allocation.percentage,
    amount: Math.round(netProfit * (allocation.percentage / 100)),
  }));

  return {
    monthlyRevenue,
    monthlyExpenses,
    monthlyContractors,
    monthlySalary,
    monthlyRecurringExpenses,
    grossProfit,
    adjustedSalary,
    taxDeductionsTotal,
    tripExpensesTotal,
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
  contractors: Contractor[],
  employees: Employee[]
): ScenarioResults => {
  const emptyConfig: ScenarioConfig = {
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
    taxDeductions: {},
    bankAllocations: [
      { name: 'Operating', percentage: 50, color: '#000000' },
      { name: 'Tax Reserve', percentage: 30, color: '#666666' },
      { name: 'Owner Pay', percentage: 20, color: '#999999' },
    ],
    tripExpenses: {
      enabled: false,
      flights: 0,
      lodging: 0,
      groundTransport: 0,
      meals: 0,
      perDiem: 0,
      otherExpenses: 0,
    },
  };
  
  return calculateScenario(emptyConfig, clients, expenses, contractors, employees);
};
