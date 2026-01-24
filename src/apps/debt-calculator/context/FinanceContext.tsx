import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  FinanceData, 
  CreditCard, 
  Expense, 
  PaymentScenario, 
  CheckingAccount, 
  SavingsAccount, 
  PhysicalAsset, 
  ExpectedIncome, 
  OtherDebt 
} from "../types";
import { loadData, saveData, getInitialData } from "../lib/storage";

interface FinanceContextType {
  data: FinanceData;
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
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<FinanceData>(() => {
    const loaded = loadData();
    return loaded || getInitialData();
  });

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addCreditCard = (card: Omit<CreditCard, "id">) => {
    const newCard: CreditCard = {
      ...card,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      creditCards: [...prev.creditCards, newCard],
    }));
  };

  const updateCreditCard = (id: string, updates: Partial<CreditCard>) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.map(card =>
        card.id === id ? { ...card, ...updates } : card
      ),
    }));
  };

  const deleteCreditCard = (id: string) => {
    setData(prev => ({
      ...prev,
      creditCards: prev.creditCards.filter(card => card.id !== id),
    }));
  };

  const updateBudget = (updates: Partial<FinanceData["budget"]>) => {
    setData(prev => ({
      ...prev,
      budget: { ...prev.budget, ...updates },
    }));
  };

  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: [...prev.budget.expenses, newExpense],
      },
    }));
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: prev.budget.expenses.map(expense =>
          expense.id === id ? { ...expense, ...updates } : expense
        ),
      },
    }));
  };

  const deleteExpense = (id: string) => {
    setData(prev => ({
      ...prev,
      budget: {
        ...prev.budget,
        expenses: prev.budget.expenses.filter(expense => expense.id !== id),
      },
    }));
  };

  const addScenario = (scenario: Omit<PaymentScenario, "id">) => {
    const newScenario: PaymentScenario = {
      ...scenario,
      id: crypto.randomUUID(),
    };
    setData(prev => ({
      ...prev,
      scenarios: [...prev.scenarios, newScenario],
    }));
  };

  const updateScenario = (id: string, updates: Partial<PaymentScenario>) => {
    setData(prev => ({
      ...prev,
      scenarios: prev.scenarios.map(scenario =>
        scenario.id === id ? { ...scenario, ...updates } : scenario
      ),
    }));
  };

  const deleteScenario = (id: string) => {
    setData(prev => ({
      ...prev,
      scenarios: prev.scenarios.filter(scenario => scenario.id !== id),
      selectedScenarioId: prev.selectedScenarioId === id ? "default" : prev.selectedScenarioId,
    }));
  };

  const selectScenario = (id: string) => {
    setData(prev => ({
      ...prev,
      selectedScenarioId: id,
    }));
  };

  const addCheckingAccount = (account: Omit<CheckingAccount, "id">) => {
    const newAccount: CheckingAccount = { ...account, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, checkingAccounts: [...prev.checkingAccounts, newAccount] }));
  };

  const updateCheckingAccount = (id: string, updates: Partial<CheckingAccount>) => {
    setData(prev => ({
      ...prev,
      checkingAccounts: prev.checkingAccounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc),
    }));
  };

  const deleteCheckingAccount = (id: string) => {
    setData(prev => ({ ...prev, checkingAccounts: prev.checkingAccounts.filter(acc => acc.id !== id) }));
  };

  const addSavingsAccount = (account: Omit<SavingsAccount, "id">) => {
    const newAccount: SavingsAccount = { ...account, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, savingsAccounts: [...prev.savingsAccounts, newAccount] }));
  };

  const updateSavingsAccount = (id: string, updates: Partial<SavingsAccount>) => {
    setData(prev => ({
      ...prev,
      savingsAccounts: prev.savingsAccounts.map(acc => acc.id === id ? { ...acc, ...updates } : acc),
    }));
  };

  const deleteSavingsAccount = (id: string) => {
    setData(prev => ({ ...prev, savingsAccounts: prev.savingsAccounts.filter(acc => acc.id !== id) }));
  };

  const addPhysicalAsset = (asset: Omit<PhysicalAsset, "id">) => {
    const newAsset: PhysicalAsset = { ...asset, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, physicalAssets: [...prev.physicalAssets, newAsset] }));
  };

  const updatePhysicalAsset = (id: string, updates: Partial<PhysicalAsset>) => {
    setData(prev => ({
      ...prev,
      physicalAssets: prev.physicalAssets.map(asset => asset.id === id ? { ...asset, ...updates } : asset),
    }));
  };

  const deletePhysicalAsset = (id: string) => {
    setData(prev => ({ ...prev, physicalAssets: prev.physicalAssets.filter(asset => asset.id !== id) }));
  };

  const addExpectedIncome = (income: Omit<ExpectedIncome, "id">) => {
    const newIncome: ExpectedIncome = { ...income, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, expectedIncome: [...prev.expectedIncome, newIncome] }));
  };

  const updateExpectedIncome = (id: string, updates: Partial<ExpectedIncome>) => {
    setData(prev => ({
      ...prev,
      expectedIncome: prev.expectedIncome.map(income => income.id === id ? { ...income, ...updates } : income),
    }));
  };

  const deleteExpectedIncome = (id: string) => {
    setData(prev => ({ ...prev, expectedIncome: prev.expectedIncome.filter(income => income.id !== id) }));
  };

  const addOtherDebt = (debt: Omit<OtherDebt, "id">) => {
    const newDebt: OtherDebt = { ...debt, id: crypto.randomUUID() };
    setData(prev => ({ ...prev, otherDebts: [...prev.otherDebts, newDebt] }));
  };

  const updateOtherDebt = (id: string, updates: Partial<OtherDebt>) => {
    setData(prev => ({
      ...prev,
      otherDebts: prev.otherDebts.map(debt => debt.id === id ? { ...debt, ...updates } : debt),
    }));
  };

  const deleteOtherDebt = (id: string) => {
    setData(prev => ({ ...prev, otherDebts: prev.otherDebts.filter(debt => debt.id !== id) }));
  };

  return (
    <FinanceContext.Provider
      value={{
        data,
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
