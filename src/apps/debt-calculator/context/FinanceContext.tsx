import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { 
  FinanceData, 
  CreditCard, 
  Expense, 
  PaymentScenario, 
  CheckingAccount, 
  SavingsAccount, 
  PhysicalAsset, 
  ExpectedIncome, 
  OtherDebt,
  SavedPayoffScenario 
} from "../types";
import { 
  loadDataFromDatabase, 
  saveDataToDatabase, 
  loadDataFromLocalStorage, 
  clearLocalStorage,
  getInitialData 
} from "../lib/storage";
import { useAuth } from "@/hooks/useAuth";

interface FinanceContextType {
  data: FinanceData;
  loading: boolean;
  addCreditCard: (card: Omit<CreditCard, "id">) => void;
  updateCreditCard: (id: string, card: Partial<CreditCard>) => void;
  deleteCreditCard: (id: string) => void;
  updateBudget: (budget: Partial<FinanceData["budget"]>) => void;
  addExpense: (expense: Omit<Expense, "id">) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  addScenario: (scenario: Omit<PaymentScenario, "id">) => void;
  updateScenario: (id: string, scenario: Partial<PaymentScenario>) => void;
  deleteScenario: (id: string) => void;
  selectScenario: (id: string) => void;
  addCheckingAccount: (account: Omit<CheckingAccount, "id">) => void;
  updateCheckingAccount: (id: string, account: Partial<CheckingAccount>) => void;
  deleteCheckingAccount: (id: string) => void;
  addSavingsAccount: (account: Omit<SavingsAccount, "id">) => void;
  updateSavingsAccount: (id: string, account: Partial<SavingsAccount>) => void;
  deleteSavingsAccount: (id: string) => void;
  addPhysicalAsset: (asset: Omit<PhysicalAsset, "id">) => void;
  updatePhysicalAsset: (id: string, asset: Partial<PhysicalAsset>) => void;
  deletePhysicalAsset: (id: string) => void;
  addExpectedIncome: (income: Omit<ExpectedIncome, "id">) => void;
  updateExpectedIncome: (id: string, income: Partial<ExpectedIncome>) => void;
  deleteExpectedIncome: (id: string) => void;
  addOtherDebt: (debt: Omit<OtherDebt, "id">) => void;
  updateOtherDebt: (id: string, debt: Partial<OtherDebt>) => void;
  deleteOtherDebt: (id: string) => void;
  addSavedPayoffScenario: (scenario: Omit<SavedPayoffScenario, "id">) => void;
  updateSavedPayoffScenario: (id: string, scenario: Partial<SavedPayoffScenario>) => void;
  deleteSavedPayoffScenario: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [data, setData] = useState<FinanceData>(getInitialData());
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Try to load from database first
      const dbData = await loadDataFromDatabase(user.id);
      
      if (dbData) {
        setData(dbData);
      } else {
        // Check if there's localStorage data to migrate
        const localData = loadDataFromLocalStorage();
        if (localData) {
          setData(localData);
          // Migrate to database
          await saveDataToDatabase(user.id, localData);
          // Clear localStorage after successful migration
          clearLocalStorage();
        }
      }
      
      isInitialLoadRef.current = false;
      setLoading(false);
    };

    loadData();
  }, [user]);

  // Save data to database with debouncing
  const saveData = useCallback(async (newData: FinanceData) => {
    if (!user || isInitialLoadRef.current) return;

    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce saves to avoid too many database writes
    saveTimeoutRef.current = setTimeout(async () => {
      await saveDataToDatabase(user.id, newData);
    }, 500);
  }, [user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const updateData = useCallback((updater: (prev: FinanceData) => FinanceData) => {
    setData(prev => {
      const newData = updater(prev);
      saveData(newData);
      return newData;
    });
  }, [saveData]);

  const addCreditCard = useCallback((card: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      ...card,
      id: crypto.randomUUID(),
    };
    updateData(prev => ({
      ...prev,
      creditCards: [...prev.creditCards, newCard],
    }));
  }, [updateData]);

  const updateCreditCard = useCallback((id: string, updates: Partial<CreditCard>) => {
    updateData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(card =>
        card.id === id ? { ...card, ...updates } : card
      ),
    }));
  }, [updateData]);

  const deleteCreditCard = useCallback((id: string) => {
    updateData(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(card => card.id !== id),
    }));
  }, [updateData]);

  const updateBudget = useCallback((updates: Partial<FinanceData["budget"]>) => {
    updateData(prev => ({
      ...prev,
      budget: { ...prev.budget, ...updates },
    }));
  }, [updateData]);

  const addExpense = useCallback((expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    updateData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: [...prev.budget.expenses, newExpense],
      },
    }));
  }, [updateData]);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    updateData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: prev.budget.expenses.map(expense =>
          expense.id === id ? { ...expense, ...updates } : expense
        ),
      },
    }));
  }, [updateData]);

  const deleteExpense = useCallback((id: string) => {
    updateData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: prev.budget.expenses.filter(expense => expense.id !== id),
      },
    }));
  }, [updateData]);

  const addScenario = useCallback((scenario: Omit<PaymentScenario, "id">) => {
    const newScenario: PaymentScenario = {
      ...scenario,
      id: crypto.randomUUID(),
    };
    updateData(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, newScenario],
    }));
  }, [updateData]);

  const updateScenario = useCallback((id: string, updates: Partial<PaymentScenario>) => {
    updateData(prev => ({
      ...prev,
      scenarios: prev.scenarios.map(scenario =>
        scenario.id === id ? { ...scenario, ...updates } : scenario
      ),
    }));
  }, [updateData]);

  const deleteScenario = useCallback((id: string) => {
    updateData(prev => ({
      ...prev,
      scenarios: prev.scenarios.filter(scenario => scenario.id !== id),
      selectedScenarioId: prev.selectedScenarioId === id ? "default" : prev.selectedScenarioId,
    }));
  }, [updateData]);

  const selectScenario = useCallback((id: string) => {
    updateData(prev => ({
      ...prev,
      selectedScenarioId: id,
    }));
  }, [updateData]);

  const addCheckingAccount = useCallback((account: Omit<CheckingAccount, "id">) => {
    const newAccount: CheckingAccount = { ...account, id: crypto.randomUUID() };
    updateData(prev => ({ ...prev, checkingAccounts: [...prev.checkingAccounts, newAccount] }));
  }, [updateData]);

  const updateCheckingAccount = useCallback((id: string, updates: Partial<CheckingAccount>) => {
    updateData(prev => ({
      ...prev,
      checkingAccounts: prev.checkingAccounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc),
    }));
  }, [updateData]);

  const deleteCheckingAccount = useCallback((id: string) => {
    updateData(prev => ({ ...prev, checkingAccounts: prev.checkingAccounts.filter(acc => acc.id !== id) }));
  }, [updateData]);

  const addSavingsAccount = useCallback((account: Omit<SavingsAccount, "id">) => {
    const newAccount: SavingsAccount = { ...account, id: crypto.randomUUID() };
    updateData(prev => ({ ...prev, savingsAccounts: [...prev.savingsAccounts, newAccount] }));
  }, [updateData]);

  const updateSavingsAccount = useCallback((id: string, updates: Partial<SavingsAccount>) => {
    updateData(prev => ({
      ...prev,
      savingsAccounts: prev.savingsAccounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc),
    }));
  }, [updateData]);

  const deleteSavingsAccount = useCallback((id: string) => {
    updateData(prev => ({ ...prev, savingsAccounts: prev.savingsAccounts.filter(acc => acc.id !== id) }));
  }, [updateData]);

  const addPhysicalAsset = useCallback((asset: Omit<PhysicalAsset, "id">) => {
    const newAsset: PhysicalAsset = { ...asset, id: crypto.randomUUID() };
    updateData(prev => ({ ...prev, physicalAssets: [...prev.physicalAssets, newAsset] }));
  }, [updateData]);

  const updatePhysicalAsset = useCallback((id: string, updates: Partial<PhysicalAsset>) => {
    updateData(prev => ({
      ...prev,
      physicalAssets: prev.physicalAssets.map(asset => asset.id === id ? { ...asset, ...updates } : asset),
    }));
  }, [updateData]);

  const deletePhysicalAsset = useCallback((id: string) => {
    updateData(prev => ({ ...prev, physicalAssets: prev.physicalAssets.filter(asset => asset.id !== id) }));
  }, [updateData]);

  const addExpectedIncome = useCallback((income: Omit<ExpectedIncome, "id">) => {
    const newIncome: ExpectedIncome = { ...income, id: crypto.randomUUID() };
    updateData(prev => ({ ...prev, expectedIncome: [...prev.expectedIncome, newIncome] }));
  }, [updateData]);

  const updateExpectedIncome = useCallback((id: string, updates: Partial<ExpectedIncome>) => {
    updateData(prev => ({
      ...prev,
      expectedIncome: prev.expectedIncome.map(income => income.id === id ? { ...income, ...updates } : income),
    }));
  }, [updateData]);

  const deleteExpectedIncome = useCallback((id: string) => {
    updateData(prev => ({ ...prev, expectedIncome: prev.expectedIncome.filter(income => income.id !== id) }));
  }, [updateData]);

  const addOtherDebt = useCallback((debt: Omit<OtherDebt, "id">) => {
    const newDebt: OtherDebt = { ...debt, id: crypto.randomUUID() };
    updateData(prev => ({ ...prev, otherDebts: [...prev.otherDebts, newDebt] }));
  }, [updateData]);

  const updateOtherDebt = useCallback((id: string, updates: Partial<OtherDebt>) => {
    updateData(prev => ({
      ...prev,
      otherDebts: prev.otherDebts.map(debt => debt.id === id ? { ...debt, ...updates } : debt),
    }));
  }, [updateData]);

  const deleteOtherDebt = useCallback((id: string) => {
    updateData(prev => ({ ...prev, otherDebts: prev.otherDebts.filter(debt => debt.id !== id) }));
  }, [updateData]);

  const addSavedPayoffScenario = useCallback((scenario: Omit<SavedPayoffScenario, "id">) => {
    const newScenario: SavedPayoffScenario = { ...scenario, id: crypto.randomUUID() };
    updateData(prev => ({ ...prev, savedPayoffScenarios: [...prev.savedPayoffScenarios, newScenario] }));
  }, [updateData]);

  const updateSavedPayoffScenario = useCallback((id: string, updates: Partial<SavedPayoffScenario>) => {
    updateData(prev => ({
      ...prev,
      savedPayoffScenarios: prev.savedPayoffScenarios.map(scenario => 
        scenario.id === id ? { ...scenario, ...updates } : scenario
      ),
    }));
  }, [updateData]);

  const deleteSavedPayoffScenario = useCallback((id: string) => {
    updateData(prev => ({ ...prev, savedPayoffScenarios: prev.savedPayoffScenarios.filter(s => s.id !== id) }));
  }, [updateData]);

  return (
    <FinanceContext.Provider
      value={{
        data,
        loading,
        addCreditCard,
        updateCreditCard,
        deleteCreditCard,
        updateBudget,
        addExpense,
        updateExpense,
        deleteExpense,
        addScenario,
        updateScenario,
        deleteScenario,
        selectScenario,
        addCheckingAccount,
        updateCheckingAccount,
        deleteCheckingAccount,
        addSavingsAccount,
        updateSavingsAccount,
        deleteSavingsAccount,
        addPhysicalAsset,
        updatePhysicalAsset,
        deletePhysicalAsset,
        addExpectedIncome,
        updateExpectedIncome,
        deleteExpectedIncome,
        addOtherDebt,
        updateOtherDebt,
        deleteOtherDebt,
        addSavedPayoffScenario,
        updateSavedPayoffScenario,
        deleteSavedPayoffScenario,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error("useFinance must be used within FinanceProvider");
  }
  return context;
};