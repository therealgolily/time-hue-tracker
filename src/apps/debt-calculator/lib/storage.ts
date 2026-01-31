import { FinanceData } from "../types";
import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "finance-calculator-data";

// Local storage functions for migration and fallback
export const loadDataFromLocalStorage = (): FinanceData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return migrateData(JSON.parse(stored));
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
  }
  return null;
};

export const clearLocalStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// Migration helper for old data format
const migrateData = (data: any): FinanceData => {
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
  data.savedPayoffScenarios = data.savedPayoffScenarios ?? [];
  
  // Migration: Convert saved payoff scenario date strings to Date objects
  if (data.savedPayoffScenarios) {
    data.savedPayoffScenarios = data.savedPayoffScenarios.map((scenario: any) => ({
      ...scenario,
      createdAt: new Date(scenario.createdAt),
      targetDate: scenario.targetDate ? new Date(scenario.targetDate) : undefined,
      payoffDate: new Date(scenario.payoffDate),
    }));
  }
  
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
};

// Database functions
export const loadDataFromDatabase = async (userId: string): Promise<FinanceData | null> => {
  try {
    const { data, error } = await supabase
      .from('debt_calculator_data')
      .select('data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error("Error loading data from database:", error);
      return null;
    }

    if (data?.data) {
      return migrateData(data.data as any);
    }
    return null;
  } catch (error) {
    console.error("Error loading data from database:", error);
    return null;
  }
};

export const saveDataToDatabase = async (userId: string, financeData: FinanceData): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('debt_calculator_data')
      .upsert({
        user_id: userId,
        data: financeData as any,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      console.error("Error saving data to database:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error saving data to database:", error);
    return false;
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
    savedPayoffScenarios: [],
  };
};
