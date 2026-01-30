/**
 * Centralized S-Corp Tax Calculation Utility for Virginia
 *
 * This module provides consistent tax calculations across all finance components.
 * All tax-related calculations should use these functions to ensure consistency.
 */

import { TAX_RATES } from '../data/businessData';

// IRS standard rates for 2024
export const IRS_RATES = {
  HOME_OFFICE_RATE_PER_SQFT: 5,
  HOME_OFFICE_MAX_SQFT: 300,
  MILEAGE_RATE_2024: 0.67,
  MEALS_DEDUCTION_RATE: 0.5,
};

/**
 * Input for tax deductions - compatible with TaxDeductionsManager
 */
export interface TaxDeductionInput {
  enabled: boolean;
  amount: number;
  sqft?: number;
  isHomeOffice?: boolean;
  isMileage?: boolean;
  isMonthly?: boolean;
  reducesFederal: boolean;
  reducesState: boolean;
  reducesFica: boolean;
}

export interface TaxDeductionsInput {
  [key: string]: TaxDeductionInput;
}

/**
 * Calculated deduction totals
 */
export interface DeductionTotals {
  totalAnnual: number;
  federalDeductions: number;
  stateDeductions: number;
  ficaDeductions: number;
}

/**
 * Input for tax calculations
 */
export interface TaxCalculationInput {
  // Income
  monthlyRevenue: number;

  // Expenses
  monthlyRecurringExpenses: number;
  monthlySalary: number;  // Monthly W-2 salary (annual / 12)
  monthlyContractorPay: number;

  // Annual salary for FICA calculations
  annualSalary: number;

  // Deductions (optional - if not provided, no deductions applied)
  deductions?: TaxDeductionsInput;

  // Pre-calculated deduction totals (alternative to passing deductions)
  deductionTotals?: DeductionTotals;
}

/**
 * Tax calculation results
 */
export interface TaxCalculationResult {
  // Monthly figures
  monthlyRevenue: number;
  monthlyExpenses: number;  // Total operating costs
  monthlyGrossProfit: number;
  monthlyEmployerFica: number;
  monthlyNetBeforeTaxes: number;
  monthlyTaxReserve: number;
  monthlyNetProfit: number;

  // Annual figures
  annualRevenue: number;
  annualExpenses: number;
  annualGrossProfit: number;
  annualTaxableIncome: number;
  annualTaxableIncomeFederal: number;
  annualTaxableIncomeState: number;
  annualTax: number;

  // Tax breakdown (annual)
  taxBreakdown: {
    employerFica: number;
    employeeFica: number;
    federalIncome: number;
    stateIncome: number;
  };

  // K-1 pass-through income (profit after employer FICA)
  k1Income: number;

  // Deduction info
  deductionTotals: DeductionTotals;

  // Effective tax rate
  effectiveRate: number;
}

/**
 * Calculate the annual amount for a deduction based on its type
 */
export function calculateDeductionAmount(key: string, deduction: TaxDeductionInput): number {
  if (!deduction.enabled) return 0;

  if (deduction.isHomeOffice) {
    const sqft = Math.min(deduction.sqft || 0, IRS_RATES.HOME_OFFICE_MAX_SQFT);
    return sqft * IRS_RATES.HOME_OFFICE_RATE_PER_SQFT;
  } else if (deduction.isMileage) {
    return Math.round(deduction.amount * IRS_RATES.MILEAGE_RATE_2024);
  } else if (key === 'businessMeals' || key === 'travelMeals') {
    return Math.round(deduction.amount * IRS_RATES.MEALS_DEDUCTION_RATE);
  } else if (deduction.isMonthly) {
    return deduction.amount * 12;
  }
  return deduction.amount;
}

/**
 * Calculate deduction totals from a deductions config
 */
export function calculateDeductionTotals(deductions: TaxDeductionsInput): DeductionTotals {
  let totalAnnual = 0;
  let federalDeductions = 0;
  let stateDeductions = 0;
  let ficaDeductions = 0;

  Object.entries(deductions).forEach(([key, d]) => {
    if (!d || !d.enabled) return;

    const annualAmount = calculateDeductionAmount(key, d);

    totalAnnual += annualAmount;
    if (d.reducesFederal) federalDeductions += annualAmount;
    if (d.reducesState) stateDeductions += annualAmount;
    if (d.reducesFica) ficaDeductions += annualAmount;
  });

  return { totalAnnual, federalDeductions, stateDeductions, ficaDeductions };
}

/**
 * Calculate S-Corp Virginia taxes
 *
 * This is the main tax calculation function that should be used by all components.
 * It handles:
 * - Employer FICA (7.65% of salary, a business expense)
 * - Employee FICA (7.65% of salary, withheld from paycheck)
 * - Federal income tax (22% on taxable income)
 * - Virginia state tax (5.75% on taxable income)
 * - Tax deductions that reduce taxable income
 * - FICA deductions that reduce FICA taxable wages (HSA, health insurance, etc.)
 */
export function calculateSCorpTaxes(input: TaxCalculationInput): TaxCalculationResult {
  const {
    monthlyRevenue,
    monthlyRecurringExpenses,
    monthlySalary,
    monthlyContractorPay,
    annualSalary,
    deductions,
    deductionTotals: providedDeductionTotals,
  } = input;

  // Calculate deduction totals if deductions provided, otherwise use provided totals or zeros
  const deductionTotals: DeductionTotals = providedDeductionTotals
    || (deductions ? calculateDeductionTotals(deductions) : {
      totalAnnual: 0,
      federalDeductions: 0,
      stateDeductions: 0,
      ficaDeductions: 0,
    });

  const {
    federalDeductions,
    stateDeductions,
    ficaDeductions,
  } = deductionTotals;

  // Monthly calculations
  const monthlyExpenses = monthlyRecurringExpenses + monthlySalary + monthlyContractorPay;
  const monthlyGrossProfit = monthlyRevenue - monthlyExpenses;

  // Annual calculations
  const annualRevenue = monthlyRevenue * 12;
  const annualExpenses = monthlyExpenses * 12;
  const annualGrossProfit = monthlyGrossProfit * 12;

  // FICA taxable salary (reduced by FICA deductions like HSA, health insurance)
  const ficaTaxableSalary = Math.max(0, annualSalary - ficaDeductions);

  // Employer FICA (business expense) - calculated on FICA taxable salary
  const employerFica = ficaTaxableSalary * TAX_RATES.employerFica;
  const monthlyEmployerFica = employerFica / 12;

  // Employee FICA (withheld from paycheck) - also on FICA taxable salary
  const employeeFica = ficaTaxableSalary * TAX_RATES.employeeFica;

  // K-1 pass-through income (profit after employer FICA deduction)
  const k1Income = annualGrossProfit - employerFica;

  // Total taxable income before deductions: W-2 salary + K-1 distributions
  const totalTaxableIncomeBeforeDeductions = annualSalary + k1Income;

  // Apply deductions to taxable income
  const annualTaxableIncomeFederal = Math.max(0, totalTaxableIncomeBeforeDeductions - federalDeductions);
  const annualTaxableIncomeState = Math.max(0, totalTaxableIncomeBeforeDeductions - stateDeductions);

  // For display purposes, use the higher of the two as the "primary" taxable income
  const annualTaxableIncome = Math.max(annualTaxableIncomeFederal, annualTaxableIncomeState);

  // Income taxes
  const federalIncome = annualTaxableIncomeFederal * TAX_RATES.federalIncome;
  const stateIncome = annualTaxableIncomeState * TAX_RATES.stateIncome;

  // Round individual tax components first for consistency
  const roundedTaxBreakdown = {
    employerFica: Math.round(employerFica),
    employeeFica: Math.round(employeeFica),
    federalIncome: Math.round(federalIncome),
    stateIncome: Math.round(stateIncome),
  };

  // Total annual tax is sum of rounded components (ensures consistency)
  const annualTax = Math.max(0,
    roundedTaxBreakdown.employerFica +
    roundedTaxBreakdown.employeeFica +
    roundedTaxBreakdown.federalIncome +
    roundedTaxBreakdown.stateIncome
  );

  // Monthly figures
  const monthlyTaxReserve = Math.round(annualTax / 12);
  const monthlyNetBeforeTaxes = monthlyGrossProfit - monthlyEmployerFica;
  const monthlyNetProfit = monthlyGrossProfit - monthlyTaxReserve;

  // Effective tax rate
  const totalIncome = annualSalary + k1Income;
  const effectiveRate = totalIncome > 0 ? (annualTax / totalIncome) * 100 : 0;

  return {
    monthlyRevenue,
    monthlyExpenses,
    monthlyGrossProfit,
    monthlyEmployerFica,
    monthlyNetBeforeTaxes,
    monthlyTaxReserve,
    monthlyNetProfit,
    annualRevenue,
    annualExpenses,
    annualGrossProfit,
    annualTaxableIncome,
    annualTaxableIncomeFederal,
    annualTaxableIncomeState,
    annualTax,
    taxBreakdown: roundedTaxBreakdown,
    k1Income,
    deductionTotals,
    effectiveRate,
  };
}

/**
 * Helper to create tax input from common hook data
 */
export function createTaxInput(
  clients: { status: string; monthly_retainer: number | string }[],
  expenses: { recurring: boolean; amount: number | string }[],
  totalSalary: number,
  contractorMonthlyPay: number,
  deductions?: TaxDeductionsInput,
  deductionTotals?: DeductionTotals,
): TaxCalculationInput {
  const monthlyRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_retainer), 0);

  const monthlyRecurringExpenses = expenses
    .filter(e => e.recurring)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  return {
    monthlyRevenue,
    monthlyRecurringExpenses,
    monthlySalary: totalSalary / 12,
    monthlyContractorPay: contractorMonthlyPay,
    annualSalary: totalSalary,
    deductions,
    deductionTotals,
  };
}
