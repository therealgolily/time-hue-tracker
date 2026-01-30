/**
 * Centralized Tax Calculations Hook
 *
 * This hook provides consistent tax calculations across all finance components.
 * It pulls data from all relevant sources (clients, expenses, employees, contractors, deductions)
 * and calculates taxes using the centralized calculation utility.
 */

import { useMemo } from 'react';
import { useClients } from './useClients';
import { useExpenses } from './useExpenses';
import { useEmployees } from './useEmployees';
import { useContractors } from './useContractors';
import { useTaxDeductionsConfig, DeductionTotals, TaxDeductionsConfig } from '../components/TaxDeductionsManager';
import { useTripExpenses, TripTotals } from './useTripExpenses';
import {
  calculateSCorpTaxes,
  createTaxInput,
  TaxCalculationResult,
  DeductionTotals as CalcDeductionTotals,
} from '../lib/taxCalculations';

export interface UseTaxCalculationsResult {
  // Tax calculation results
  taxes: TaxCalculationResult;

  // Loading states
  loading: boolean;
  dataLoading: boolean;
  deductionsLoading: boolean;

  // Deductions data for UI
  deductions: TaxDeductionsConfig;
  deductionTotals: DeductionTotals;
  toggleDeduction: (key: string) => void;
  updateDeductionAmount: (key: string, amount: number) => void;
  updateDeductionSqft: (key: string, sqft: number) => void;

  // Trip totals for UI
  tripTotals: TripTotals;

  // Raw data for components that need it
  rawData: {
    clients: ReturnType<typeof useClients>['clients'];
    expenses: ReturnType<typeof useExpenses>['expenses'];
    totalSalary: number;
    contractorMonthlyPay: number;
  };
}

/**
 * Main hook for tax calculations
 *
 * Use this hook in any component that needs tax information.
 * It ensures consistent calculations across Dashboard, Summary, and TaxView.
 */
export const useTaxCalculations = (): UseTaxCalculationsResult => {
  // Get all financial data
  const { clients, loading: clientsLoading } = useClients();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { totalSalary, loading: employeesLoading } = useEmployees();
  const { totalMonthlyPay: contractorMonthlyPay, loading: contractorsLoading } = useContractors();
  const { totals: tripTotals } = useTripExpenses();

  // Get tax deductions
  const {
    deductions,
    loading: deductionsLoading,
    toggleDeduction,
    updateAmount: updateDeductionAmount,
    updateSqft: updateDeductionSqft,
    totals: deductionTotals,
  } = useTaxDeductionsConfig();

  const dataLoading = clientsLoading || expensesLoading || employeesLoading || contractorsLoading;
  const loading = dataLoading || deductionsLoading;

  // Calculate taxes using centralized utility
  const taxes = useMemo(() => {
    // Create input from hook data
    const input = createTaxInput(
      clients,
      expenses,
      totalSalary,
      contractorMonthlyPay,
      undefined,  // Don't pass raw deductions
      deductionTotals as CalcDeductionTotals,  // Pass pre-calculated totals
    );

    return calculateSCorpTaxes(input);
  }, [clients, expenses, totalSalary, contractorMonthlyPay, deductionTotals]);

  return {
    taxes,
    loading,
    dataLoading,
    deductionsLoading,
    deductions,
    deductionTotals,
    toggleDeduction,
    updateDeductionAmount,
    updateDeductionSqft,
    tripTotals,
    rawData: {
      clients,
      expenses,
      totalSalary,
      contractorMonthlyPay,
    },
  };
};
