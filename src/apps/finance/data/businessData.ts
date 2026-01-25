export interface Client {
  id: string;
  name: string;
  monthlyRetainer: number;
  paymentMethod: 'check' | 'direct_deposit' | 'quickbooks' | 'stripe';
  status: 'active' | 'inactive';
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'travel' | 'software' | 'messaging' | 'contractor' | 'salary' | 'misc';
  clientId?: string;
  date: string;
  recurring: boolean;
}

export interface BusinessInfo {
  companyName: string;
  type: string;
  state: string;
  members: { name: string; ownership: number }[];
  contractors: { name: string; monthlyPay: number }[];
  employees: { name: string; salary: number }[];
}

export const businessInfo: BusinessInfo = {
  companyName: 'Rosser Results',
  type: 'S-Corp',
  state: 'Virginia',
  members: [{ name: 'Nick Scott', ownership: 100 }],
  contractors: [{ name: 'Troy Clark', monthlyPay: 1250 }],
  employees: [{ name: 'Nick Scott', salary: 48000 }],
};

export const clients: Client[] = [
  {
    id: '1',
    name: 'The Window Source of Birmingham',
    monthlyRetainer: 4000,
    paymentMethod: 'check',
    status: 'active',
  },
  {
    id: '2',
    name: 'The Window Source of the Carolinas',
    monthlyRetainer: 4000,
    paymentMethod: 'direct_deposit',
    status: 'active',
  },
  {
    id: '3',
    name: 'The Window Source of the Tri Cities',
    monthlyRetainer: 4000,
    paymentMethod: 'quickbooks',
    status: 'active',
  },
  {
    id: '4',
    name: 'The Window Source of Memphis',
    monthlyRetainer: 2000,
    paymentMethod: 'stripe',
    status: 'active',
  },
  {
    id: '5',
    name: 'Window World of Richmond',
    monthlyRetainer: 6000,
    paymentMethod: 'check',
    status: 'active',
  },
];

export const expenses: Expense[] = [
  {
    id: 'e1',
    description: 'Nick Scott Salary (Monthly)',
    amount: 4000,
    category: 'salary',
    date: '2025-01-01',
    recurring: true,
  },
  {
    id: 'e2',
    description: 'Troy Clark - 1099 Contractor',
    amount: 1250,
    category: 'contractor',
    date: '2025-01-01',
    recurring: true,
  },
  {
    id: 'e3',
    description: 'Software Subscriptions (Company)',
    amount: 350,
    category: 'software',
    date: '2025-01-01',
    recurring: true,
  },
  {
    id: 'e4',
    description: 'CRM Software',
    amount: 150,
    category: 'software',
    clientId: '1',
    date: '2025-01-05',
    recurring: true,
  },
  {
    id: 'e5',
    description: 'SMS Messaging Platform',
    amount: 200,
    category: 'messaging',
    clientId: '2',
    date: '2025-01-05',
    recurring: true,
  },
  {
    id: 'e6',
    description: 'Travel - Client Visit',
    amount: 450,
    category: 'travel',
    clientId: '3',
    date: '2025-01-10',
    recurring: false,
  },
];

export const calculateMonthlyRevenue = (): number => {
  return clients
    .filter(c => c.status === 'active')
    .reduce((sum, client) => sum + client.monthlyRetainer, 0);
};

export const calculateMonthlyExpenses = (): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateClientExpenses = (clientId: string): number => {
  return expenses
    .filter(e => e.clientId === clientId)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const calculateCompanyExpenses = (): number => {
  return expenses
    .filter(e => !e.clientId)
    .reduce((sum, expense) => sum + expense.amount, 0);
};

export const getPaymentMethodLabel = (method: Client['paymentMethod']): string => {
  const labels = {
    check: 'Check',
    direct_deposit: 'Direct Deposit',
    quickbooks: 'QuickBooks',
    stripe: 'Stripe',
  };
  return labels[method];
};

export const getPaymentMethodBadgeClass = (method: Client['paymentMethod']): string => {
  const classes = {
    check: 'badge-check',
    direct_deposit: 'badge-deposit',
    quickbooks: 'badge-quickbooks',
    stripe: 'badge-stripe',
  };
  return classes[method];
};

export const TAX_RATES = {
  selfEmployment: 0.153,
  employerFica: 0.0765,
  employeeFica: 0.0765,
  federalIncome: 0.22,
  stateIncome: 0.0575,
};

export const calculateEstimatedTaxLiability = (): {
  monthly: number;
  quarterly: number;
  annual: number;
  breakdown: {
    employerFica: number;
    employeeFica: number;
    federalIncome: number;
    stateIncome: number;
  };
} => {
  const annualProfit = (calculateMonthlyRevenue() - calculateMonthlyExpenses()) * 12;
  const salary = businessInfo.employees[0]?.salary ?? 0;

  const employerFica = salary * TAX_RATES.employerFica;
  const employeeFica = salary * TAX_RATES.employeeFica;

  const adjustedProfit = annualProfit - employerFica;
  const totalTaxableIncome = salary + adjustedProfit;

  const federalIncome = totalTaxableIncome * TAX_RATES.federalIncome;
  const stateIncome = totalTaxableIncome * TAX_RATES.stateIncome;

  const totalAnnualTax = employerFica + employeeFica + federalIncome + stateIncome;

  return {
    annual: Math.round(totalAnnualTax),
    quarterly: Math.round(totalAnnualTax / 4),
    monthly: Math.round(totalAnnualTax / 12),
    breakdown: {
      employerFica: Math.round(employerFica),
      employeeFica: Math.round(employeeFica),
      federalIncome: Math.round(federalIncome),
      stateIncome: Math.round(stateIncome),
    },
  };
};
