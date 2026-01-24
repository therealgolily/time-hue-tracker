import { FinanceData } from "../types";

const STORAGE_KEY = "finance-calculator-data";

export const loadData = (): FinanceData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // Migration: Add creditLimit to cards that don't have it
      if (data.creditCards) {
        data.creditCards = data.creditCards.map((card: any) => ({
          ...card,
          creditLimit: card.creditLimit ?? 0,
        }));
      }
      // Migration: Add asset arrays if they don't exist
      data.checkingAccounts = data.checkingAccounts ?? [];
      data.savingsAccounts = data.savingsAccounts ?? [];
      data.physicalAssets = data.physicalAssets ?? [];
      data.expectedIncome = data.expectedIncome ?? [];
      data.otherDebts = data.otherDebts ?? [];
      
      // Migration: Convert old scenarios to new format
      if (data.scenarios) {
        data.scenarios = data.scenarios.map((scenario: any) => {
          // If already has new format, keep it
          if (scenario.baseMonthlyPayment !== undefined && scenario.events !== undefined) {
            return scenario;
          }
          
          // Convert old format to new format
          const events: any[] = [];
          const basePayment = scenario.monthlyPayment || 0;
          
          // Convert plannedAssetSales to events
          if (scenario.plannedAssetSales && scenario.plannedAssetSales.length > 0) {
            scenario.plannedAssetSales.forEach((sale: any) => {
              events.push({
                id: crypto.randomUUID(),
                type: 'asset_sale',
                startMonth: sale.month,
                description: `Sell ${sale.assetName}`,
                amount: sale.salePrice,
                assetId: sale.assetId,
                icon: '💻',
              });
            });
          }
          
          return {
            ...scenario,
            baseMonthlyPayment: basePayment,
            events: events,
          };
        });
      }
      
      // Convert date strings back to Date objects
      if (data.expectedIncome) {
        data.expectedIncome = data.expectedIncome.map((income: any) => ({
          ...income,
          date: new Date(income.date),
        }));
      }
      if (data.otherDebts) {
        data.otherDebts = data.otherDebts.map((debt: any) => ({
          ...debt,
          dueDate: debt.dueDate ? new Date(debt.dueDate) : undefined,
        }));
      }
      
      return data;
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
  }
  return null;
};

export const saveData = (data: FinanceData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

export const getInitialData = (): FinanceData => {
  return {
    creditCards: [],
    budget: {
      grossIncome: 0,
      taxRate: 30,
      expenses: [],
    },
    scenarios: [
      {
        id: "default",
        name: "Current Available Cash",
        isDefault: true,
        baseMonthlyPayment: 0,
        events: [],
      },
    ],
    selectedScenarioId: "default",
    checkingAccounts: [],
    savingsAccounts: [],
    physicalAssets: [],
    expectedIncome: [],
    otherDebts: [],
  };
};
