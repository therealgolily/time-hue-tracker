/**
 * Tax Calculation Tests
 *
 * These tests verify that the S-Corp Virginia tax calculations are correct.
 * Run with: npx vitest run src/apps/finance/lib/taxCalculations.test.ts
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSCorpTaxes,
  calculateDeductionTotals,
  calculateDeductionAmount,
  TaxCalculationInput,
  TaxDeductionsInput,
  IRS_RATES,
} from './taxCalculations';
import { TAX_RATES } from '../data/businessData';

describe('calculateSCorpTaxes', () => {
  it('calculates basic S-Corp taxes without deductions', () => {
    const input: TaxCalculationInput = {
      monthlyRevenue: 20000,
      monthlyRecurringExpenses: 700,
      monthlySalary: 4000,  // $48,000 annual salary / 12
      monthlyContractorPay: 1250,
      annualSalary: 48000,
    };

    const result = calculateSCorpTaxes(input);

    // Verify monthly calculations
    expect(result.monthlyRevenue).toBe(20000);
    expect(result.monthlyExpenses).toBe(700 + 4000 + 1250); // 5950
    expect(result.monthlyGrossProfit).toBe(20000 - 5950); // 14050

    // Verify annual calculations
    expect(result.annualGrossProfit).toBe(14050 * 12); // 168600

    // Verify tax calculations
    // Employer FICA: 48000 * 0.0765 = 3672
    expect(result.taxBreakdown.employerFica).toBe(Math.round(48000 * TAX_RATES.employerFica));

    // Employee FICA: 48000 * 0.0765 = 3672
    expect(result.taxBreakdown.employeeFica).toBe(Math.round(48000 * TAX_RATES.employeeFica));

    // K-1 income: 168600 - 3672 = 164928
    expect(result.k1Income).toBe(168600 - result.taxBreakdown.employerFica);

    // Total taxable income: 48000 + K-1 = 48000 + 164928 = 212928
    const expectedTaxableIncome = 48000 + result.k1Income;
    expect(result.annualTaxableIncome).toBe(expectedTaxableIncome);

    // Federal tax: 212928 * 0.22 = 46844
    expect(result.taxBreakdown.federalIncome).toBe(Math.round(expectedTaxableIncome * TAX_RATES.federalIncome));

    // State tax: 212928 * 0.0575 = 12243
    expect(result.taxBreakdown.stateIncome).toBe(Math.round(expectedTaxableIncome * TAX_RATES.stateIncome));

    // Total tax
    const expectedTotalTax =
      result.taxBreakdown.employerFica +
      result.taxBreakdown.employeeFica +
      result.taxBreakdown.federalIncome +
      result.taxBreakdown.stateIncome;
    expect(result.annualTax).toBe(expectedTotalTax);

    // Monthly tax reserve
    expect(result.monthlyTaxReserve).toBe(Math.round(expectedTotalTax / 12));

    // Net profit
    expect(result.monthlyNetProfit).toBe(result.monthlyGrossProfit - result.monthlyTaxReserve);
  });

  it('calculates taxes with federal and state deductions', () => {
    const input: TaxCalculationInput = {
      monthlyRevenue: 20000,
      monthlyRecurringExpenses: 700,
      monthlySalary: 4000,
      monthlyContractorPay: 1250,
      annualSalary: 48000,
      deductionTotals: {
        totalAnnual: 23000,  // 401k contribution
        federalDeductions: 23000,
        stateDeductions: 23000,
        ficaDeductions: 0,  // 401k doesn't reduce FICA
      },
    };

    const result = calculateSCorpTaxes(input);

    // FICA should be calculated on full salary (no FICA deductions)
    expect(result.taxBreakdown.employerFica).toBe(Math.round(48000 * TAX_RATES.employerFica));
    expect(result.taxBreakdown.employeeFica).toBe(Math.round(48000 * TAX_RATES.employeeFica));

    // Taxable income should be reduced by deductions
    const k1Income = result.annualGrossProfit - result.taxBreakdown.employerFica;
    const taxableIncomeBeforeDeductions = 48000 + k1Income;
    const expectedFederalTaxableIncome = Math.max(0, taxableIncomeBeforeDeductions - 23000);
    const expectedStateTaxableIncome = Math.max(0, taxableIncomeBeforeDeductions - 23000);

    expect(result.annualTaxableIncomeFederal).toBe(expectedFederalTaxableIncome);
    expect(result.annualTaxableIncomeState).toBe(expectedStateTaxableIncome);

    // Federal and state taxes should be lower due to deductions
    expect(result.taxBreakdown.federalIncome).toBe(Math.round(expectedFederalTaxableIncome * TAX_RATES.federalIncome));
    expect(result.taxBreakdown.stateIncome).toBe(Math.round(expectedStateTaxableIncome * TAX_RATES.stateIncome));
  });

  it('calculates taxes with FICA deductions (HSA, health insurance)', () => {
    const input: TaxCalculationInput = {
      monthlyRevenue: 20000,
      monthlyRecurringExpenses: 700,
      monthlySalary: 4000,
      monthlyContractorPay: 1250,
      annualSalary: 48000,
      deductionTotals: {
        totalAnnual: 10150,  // HSA $4150 + Health insurance $6000
        federalDeductions: 10150,
        stateDeductions: 10150,
        ficaDeductions: 10150,  // Both HSA and health insurance reduce FICA
      },
    };

    const result = calculateSCorpTaxes(input);

    // FICA should be calculated on reduced salary
    const ficaTaxableSalary = Math.max(0, 48000 - 10150); // 37850
    expect(result.taxBreakdown.employerFica).toBe(Math.round(ficaTaxableSalary * TAX_RATES.employerFica));
    expect(result.taxBreakdown.employeeFica).toBe(Math.round(ficaTaxableSalary * TAX_RATES.employeeFica));

    // Total tax should be lower due to reduced FICA base
    const noDeductionTax = calculateSCorpTaxes({
      ...input,
      deductionTotals: undefined,
    });
    expect(result.annualTax).toBeLessThan(noDeductionTax.annualTax);
  });

  it('handles zero income correctly', () => {
    const input: TaxCalculationInput = {
      monthlyRevenue: 0,
      monthlyRecurringExpenses: 0,
      monthlySalary: 0,
      monthlyContractorPay: 0,
      annualSalary: 0,
    };

    const result = calculateSCorpTaxes(input);

    expect(result.monthlyRevenue).toBe(0);
    expect(result.monthlyExpenses).toBe(0);
    expect(result.monthlyGrossProfit).toBe(0);
    expect(result.annualTax).toBe(0);
    expect(result.monthlyTaxReserve).toBe(0);
  });

  it('handles negative profit correctly', () => {
    const input: TaxCalculationInput = {
      monthlyRevenue: 5000,
      monthlyRecurringExpenses: 3000,
      monthlySalary: 4000,  // Expenses exceed revenue
      monthlyContractorPay: 1000,
      annualSalary: 48000,
    };

    const result = calculateSCorpTaxes(input);

    expect(result.monthlyGrossProfit).toBe(5000 - 3000 - 4000 - 1000); // -3000
    expect(result.annualGrossProfit).toBe(-3000 * 12); // -36000

    // K-1 will be negative
    expect(result.k1Income).toBeLessThan(0);

    // But taxable income should not go below 0 (losses can offset income but not go negative here)
    // Actually in S-Corp, the loss passes through, so taxable income = salary + negative K-1
    // If K-1 loss > salary, we'd have 0 taxable income
    expect(result.annualTaxableIncome).toBeGreaterThanOrEqual(0);
  });
});

describe('calculateDeductionTotals', () => {
  it('calculates totals for standard deductions', () => {
    const deductions: TaxDeductionsInput = {
      traditional401k: {
        enabled: true,
        amount: 23000,
        reducesFederal: true,
        reducesState: true,
        reducesFica: false,
      },
      healthInsurance: {
        enabled: true,
        amount: 500,  // Monthly
        isMonthly: true,
        reducesFederal: true,
        reducesState: true,
        reducesFica: true,
      },
    };

    const totals = calculateDeductionTotals(deductions);

    // 401k: $23,000 annual
    // Health insurance: $500 * 12 = $6,000 annual
    expect(totals.totalAnnual).toBe(23000 + 6000);
    expect(totals.federalDeductions).toBe(23000 + 6000);
    expect(totals.stateDeductions).toBe(23000 + 6000);
    expect(totals.ficaDeductions).toBe(6000);  // Only health insurance reduces FICA
  });

  it('calculates home office deduction correctly', () => {
    const deductions: TaxDeductionsInput = {
      homeOffice: {
        enabled: true,
        amount: 0,  // Calculated from sqft
        sqft: 200,
        isHomeOffice: true,
        reducesFederal: true,
        reducesState: true,
        reducesFica: false,
      },
    };

    const totals = calculateDeductionTotals(deductions);

    // Home office: 200 sqft * $5/sqft = $1,000
    expect(totals.totalAnnual).toBe(200 * IRS_RATES.HOME_OFFICE_RATE_PER_SQFT);
  });

  it('caps home office at 300 sqft', () => {
    const deductions: TaxDeductionsInput = {
      homeOffice: {
        enabled: true,
        amount: 0,
        sqft: 500,  // Over the 300 sqft limit
        isHomeOffice: true,
        reducesFederal: true,
        reducesState: true,
        reducesFica: false,
      },
    };

    const totals = calculateDeductionTotals(deductions);

    // Should be capped at 300 sqft * $5 = $1,500
    expect(totals.totalAnnual).toBe(IRS_RATES.HOME_OFFICE_MAX_SQFT * IRS_RATES.HOME_OFFICE_RATE_PER_SQFT);
  });

  it('calculates mileage deduction correctly', () => {
    const deductions: TaxDeductionsInput = {
      businessMileage: {
        enabled: true,
        amount: 10000,  // 10,000 miles
        isMileage: true,
        reducesFederal: true,
        reducesState: true,
        reducesFica: false,
      },
    };

    const totals = calculateDeductionTotals(deductions);

    // 10,000 miles * $0.67/mile = $6,700
    expect(totals.totalAnnual).toBe(Math.round(10000 * IRS_RATES.MILEAGE_RATE_2024));
  });

  it('calculates business meals at 50% deductibility', () => {
    const deductions: TaxDeductionsInput = {
      businessMeals: {
        enabled: true,
        amount: 2000,  // Total meals spent
        reducesFederal: true,
        reducesState: true,
        reducesFica: false,
      },
    };

    const totals = calculateDeductionTotals(deductions);

    // Business meals are 50% deductible: $2,000 * 0.5 = $1,000
    expect(totals.totalAnnual).toBe(Math.round(2000 * IRS_RATES.MEALS_DEDUCTION_RATE));
  });

  it('ignores disabled deductions', () => {
    const deductions: TaxDeductionsInput = {
      traditional401k: {
        enabled: false,  // Disabled
        amount: 23000,
        reducesFederal: true,
        reducesState: true,
        reducesFica: false,
      },
    };

    const totals = calculateDeductionTotals(deductions);

    expect(totals.totalAnnual).toBe(0);
    expect(totals.federalDeductions).toBe(0);
    expect(totals.stateDeductions).toBe(0);
    expect(totals.ficaDeductions).toBe(0);
  });
});

describe('calculateDeductionAmount', () => {
  it('calculates standard annual deduction', () => {
    const amount = calculateDeductionAmount('traditional401k', {
      enabled: true,
      amount: 23000,
      reducesFederal: true,
      reducesState: true,
      reducesFica: false,
    });

    expect(amount).toBe(23000);
  });

  it('calculates monthly deduction annualized', () => {
    const amount = calculateDeductionAmount('healthInsurance', {
      enabled: true,
      amount: 500,
      isMonthly: true,
      reducesFederal: true,
      reducesState: true,
      reducesFica: true,
    });

    expect(amount).toBe(500 * 12);
  });

  it('returns 0 for disabled deduction', () => {
    const amount = calculateDeductionAmount('traditional401k', {
      enabled: false,
      amount: 23000,
      reducesFederal: true,
      reducesState: true,
      reducesFica: false,
    });

    expect(amount).toBe(0);
  });
});

describe('Tax calculation consistency', () => {
  it('ensures monthly and annual figures are consistent', () => {
    const input: TaxCalculationInput = {
      monthlyRevenue: 20000,
      monthlyRecurringExpenses: 700,
      monthlySalary: 4000,
      monthlyContractorPay: 1250,
      annualSalary: 48000,
    };

    const result = calculateSCorpTaxes(input);

    // Annual revenue should be 12x monthly
    expect(result.annualRevenue).toBe(result.monthlyRevenue * 12);

    // Annual expenses should be 12x monthly
    expect(result.annualExpenses).toBe(result.monthlyExpenses * 12);

    // Annual gross profit should be 12x monthly
    expect(result.annualGrossProfit).toBe(result.monthlyGrossProfit * 12);

    // Monthly tax reserve should be annual tax / 12 (rounded)
    expect(result.monthlyTaxReserve).toBe(Math.round(result.annualTax / 12));
  });

  it('ensures total tax equals sum of components', () => {
    const input: TaxCalculationInput = {
      monthlyRevenue: 20000,
      monthlyRecurringExpenses: 700,
      monthlySalary: 4000,
      monthlyContractorPay: 1250,
      annualSalary: 48000,
    };

    const result = calculateSCorpTaxes(input);

    const componentSum =
      result.taxBreakdown.employerFica +
      result.taxBreakdown.employeeFica +
      result.taxBreakdown.federalIncome +
      result.taxBreakdown.stateIncome;

    expect(result.annualTax).toBe(componentSum);
  });
});
