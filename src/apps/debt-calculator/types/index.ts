export interface CreditCard {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minimumPayment: number;
  monthlyPurchases: number;
  creditLimit: number;
  dueDay?: number; // Day of month (1-31) when payment is due
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
}

export interface Budget {
  grossIncome: number;
  taxRate: number;
  expenses: Expense[];
}

export type FinancialEventType = 
  | 'payment_change'      // Change monthly payment amount
  | 'income_start'        // New recurring income starts
  | 'income_end'          // Recurring income ends
  | 'expense_start'       // New recurring expense starts
  | 'expense_end'         // Recurring expense ends
  | 'asset_sale'          // Sell an asset (one-time)
  | 'windfall'            // One-time income (tax refund, bonus)
  | 'one_time_expense';   // One-time expense (tax payment, emergency)

export interface FinancialEvent {
  id: string;
  type: FinancialEventType;
  startMonth: number;      // Which month this event starts (1-based)
  endMonth?: number;       // For income_end/expense_end, or null for ongoing
  description: string;     // User's description
  amount: number;          // Dollar amount
  assetId?: string;        // For asset_sale, link to asset
  icon?: string;           // Emoji icon for visual timeline
}

export interface PaymentScenario {
  id: string;
  name: string;
  baseMonthlyPayment: number;  // Starting payment amount
  events: FinancialEvent[];    // Timeline of events
  isDefault?: boolean;
  // Legacy fields for migration
  monthlyPayment?: number;
  targetMonths?: number;
  plannedAssetSales?: PlannedAssetSale[];
  freezeSpending?: boolean;
}

export interface MonthlyBreakdown {
  month: number;
  startingBalance: number;
  payment: number;
  interest: number;
  principal: number;
  newPurchases: number;
  endingBalance: number;
  totalInterestPaid: number;
}

export interface CardPayoffDetail {
  cardId: string;
  cardName: string;
  payoffMonth: number;
  totalInterest: number;
  breakdown: MonthlyBreakdown[];
}

export interface ScenarioResult {
  scenario: PaymentScenario;
  monthlyPayment: number;
  totalMonths: number;
  totalInterest: number;
  payoffDate: Date;
  cardDetails: CardPayoffDetail[];
  monthlyBreakdown: MonthlyBreakdown[];
}

export interface CheckingAccount {
  id: string;
  name: string;
  balance: number;
}

export interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
}

export interface PhysicalAsset {
  id: string;
  name: string;
  value: number;
}

export interface ExpectedIncome {
  id: string;
  description: string;
  amount: number;
  date: Date;
  isRecurring: boolean;
}

export interface OtherDebt {
  id: string;
  name: string;
  type: "payment_plan" | "lump_sum";
  amount: number;
  monthlyPayment?: number;
  paymentsRemaining?: number;
  dueDate?: Date;
  interestRate?: number;
  settingAsideMonthly?: boolean;
  monthlySetAside?: number;
}

export interface PlannedAssetSale {
  assetId: string;
  assetName: string;
  salePrice: number;
  month: number;
}

export interface FinanceData {
  creditCards: CreditCard[];
  budget: Budget;
  scenarios: PaymentScenario[];
  selectedScenarioId: string | null;
  checkingAccounts: CheckingAccount[];
  savingsAccounts: SavingsAccount[];
  physicalAssets: PhysicalAsset[];
  expectedIncome: ExpectedIncome[];
  otherDebts: OtherDebt[];
}
