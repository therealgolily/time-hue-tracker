import { Calculator, AlertTriangle, DollarSign, Calendar, Building } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { TAX_RATES } from '../data/businessData';
import { TaxDeductionsManager } from './TaxDeductionsManager';
import { useTaxCalculations } from '../hooks/useTaxCalculations';

export const TaxView = () => {
  // Use centralized tax calculations
  const {
    taxes: taxCalc,
    loading,
    deductionTotals,
    deductions,
    tripTotals,
    rawData,
  } = useTaxCalculations();

  const { totalSalary } = rawData;
  const salary = totalSalary;

  const {
    totalAnnual: totalAnnualDeductions,
    federalDeductions,
    stateDeductions,
    ficaDeductions,
  } = deductionTotals;

  // Use values from centralized calculations
  const annualProfit = taxCalc.annualGrossProfit;
  const adjustedProfit = taxCalc.k1Income;
  const totalTaxableIncomeBeforeDeductions = salary + adjustedProfit;
  const federalTaxableIncome = taxCalc.annualTaxableIncomeFederal;
  const stateTaxableIncome = taxCalc.annualTaxableIncomeState;
  const ficaTaxableSalary = Math.max(0, salary - ficaDeductions);

  const taxes = {
    annual: taxCalc.annualTax,
    quarterly: Math.round(taxCalc.annualTax / 4),
    monthly: taxCalc.monthlyTaxReserve,
    breakdown: taxCalc.taxBreakdown,
  };

  // Calculate tax savings from deductions
  const taxWithoutDeductions = {
    federalIncome: totalTaxableIncomeBeforeDeductions * TAX_RATES.federalIncome,
    stateIncome: totalTaxableIncomeBeforeDeductions * TAX_RATES.stateIncome,
    employerFica: salary * TAX_RATES.employerFica,
    employeeFica: salary * TAX_RATES.employeeFica,
  };
  const totalWithoutDeductions = taxWithoutDeductions.federalIncome + taxWithoutDeductions.stateIncome +
    taxWithoutDeductions.employerFica + taxWithoutDeductions.employeeFica;
  const deductionSavings = Math.round(totalWithoutDeductions - taxCalc.annualTax);

  // Self-employment tax savings calculation
  const selfEmploymentTaxIfSoleProp = (annualProfit + salary) * TAX_RATES.selfEmployment;
  const sCorpFicaTotal = taxes.breakdown.employerFica + taxes.breakdown.employeeFica;
  const ficaSavings = Math.max(0, selfEmploymentTaxIfSoleProp - sCorpFicaTotal);

  const taxBreakdown = [
    {
      name: 'Employer FICA',
      rate: '7.65%',
      base: `$${salary.toLocaleString()} salary`,
      amount: taxes.breakdown.employerFica,
      description: 'S-Corp pays employer share: Social Security (6.2%) + Medicare (1.45%)',
    },
    {
      name: 'Employee FICA (Withheld)',
      rate: '7.65%',
      base: `$${salary.toLocaleString()} salary`,
      amount: taxes.breakdown.employeeFica,
      description: 'Withheld from paycheck: Social Security (6.2%) + Medicare (1.45%)',
    },
    {
      name: 'Federal Income Tax',
      rate: '22%',
      base: `$${federalTaxableIncome.toLocaleString()} taxable income${federalDeductions > 0 ? ` (after $${federalDeductions.toLocaleString()} deductions)` : ''}`,
      amount: taxes.breakdown.federalIncome,
      description: 'On W-2 salary + K-1 pass-through income, minus deductions',
    },
    {
      name: 'Virginia State Tax',
      rate: '5.75%',
      base: `$${stateTaxableIncome.toLocaleString()} taxable income${stateDeductions > 0 ? ` (after $${stateDeductions.toLocaleString()} deductions)` : ''}`,
      amount: taxes.breakdown.stateIncome,
      description: 'Virginia tax on W-2 salary + K-1, minus deductions',
    },
  ];

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  const quarterlyPayments = [
    { quarter: 'Q1', due: `April 15, ${currentYear}`, amount: taxes.quarterly },
    { quarter: 'Q2', due: `June 15, ${currentYear}`, amount: taxes.quarterly },
    { quarter: 'Q3', due: `September 15, ${currentYear}`, amount: taxes.quarterly },
    { quarter: 'Q4', due: `January 15, ${nextYear}`, amount: taxes.quarterly },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tax data...</div>
      </div>
    );
  }

  const effectiveRate = annualProfit > 0 ? ((taxes.annual / (annualProfit + salary)) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tax Liability</h1>
        <p className="text-muted-foreground mt-1">
          Estimated tax obligations for S-Corp in Virginia
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Est. Annual Tax"
          value={taxes.annual}
          icon={Calculator}
          variant="expense"
        />
        <MetricCard
          title="Quarterly Payment"
          value={taxes.quarterly}
          icon={Calendar}
          variant="expense"
        />
        <MetricCard
          title="Monthly Reserve"
          value={taxes.monthly}
          icon={DollarSign}
          variant="neutral"
          subtitle="Set aside monthly"
        />
        <MetricCard
          title="Effective Rate"
          value={`${effectiveRate}%`}
          icon={Building}
          variant="neutral"
        />
      </div>

      <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground">S-Corp Tax Advantage</h3>
          <p className="text-sm text-muted-foreground mt-1">
            As an S-Corp, you save on self-employment taxes. Only your salary 
            (${salary.toLocaleString()}/year) is subject to FICA taxes (15.3% total), 
            while your K-1 distributions (${adjustedProfit.toLocaleString()}) avoid 
            the 15.3% self-employment tax.
            {ficaSavings > 0 && (
              <span className="font-semibold text-foreground">
                {' '}Estimated annual FICA savings: ${ficaSavings.toLocaleString()}.
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Income Breakdown */}
      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Income Breakdown (Annual)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            How your S-Corp income flows to you
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">W-2 Salary</p>
              <p className="text-sm text-muted-foreground">Subject to FICA taxes</p>
            </div>
            <p className="text-xl font-bold text-foreground">${salary.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">K-1 Pass-Through (Distributions)</p>
              <p className="text-sm text-muted-foreground">Not subject to FICA - only income tax</p>
            </div>
            <p className="text-xl font-bold text-foreground">${adjustedProfit.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Gross Taxable Income</p>
              <p className="text-sm text-muted-foreground">W-2 + K-1 before deductions</p>
            </div>
            <p className="text-xl font-bold text-foreground">${totalTaxableIncomeBeforeDeductions.toLocaleString()}</p>
          </div>
          {totalAnnualDeductions > 0 && (
            <>
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border border-success/20">
                <div>
                  <p className="font-medium text-foreground">Pre-Tax Deductions</p>
                  <p className="text-sm text-muted-foreground">401(k), health insurance, HSA, etc.</p>
                </div>
                <p className="text-xl font-bold text-success">-${totalAnnualDeductions.toLocaleString()}</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                <div>
                  <p className="font-semibold text-foreground">Federal Taxable Income</p>
                  <p className="text-sm text-muted-foreground">After ${federalDeductions.toLocaleString()} in deductions</p>
                </div>
                <p className="text-2xl font-bold text-primary">${federalTaxableIncome.toLocaleString()}</p>
              </div>
              {stateDeductions !== federalDeductions && (
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div>
                    <p className="font-medium text-foreground">VA State Taxable Income</p>
                    <p className="text-sm text-muted-foreground">After ${stateDeductions.toLocaleString()} in deductions</p>
                  </div>
                  <p className="text-xl font-bold text-foreground">${stateTaxableIncome.toLocaleString()}</p>
                </div>
              )}
            </>
          )}
          {totalAnnualDeductions === 0 && (
            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
              <div>
                <p className="font-semibold text-foreground">Total Taxable Income</p>
                <p className="text-sm text-muted-foreground">No deductions applied</p>
              </div>
              <p className="text-2xl font-bold text-primary">${totalTaxableIncomeBeforeDeductions.toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Updated Tax Liability Summary */}
      {totalAnnualDeductions > 0 && (
        <div className="bg-card rounded-xl border-2 border-primary/30 shadow-sm overflow-hidden">
          <div className="p-6 bg-primary/5">
            <h2 className="text-xl font-semibold text-foreground">Updated Tax Summary</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Your tax liability with deductions applied
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/30 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Original Tax</p>
                <p className="text-xl font-bold text-muted-foreground line-through">${Math.round(totalWithoutDeductions).toLocaleString()}</p>
              </div>
              <div className="p-4 bg-success/10 rounded-lg text-center border border-success/30">
                <p className="text-sm text-success">Tax Savings</p>
                <p className="text-xl font-bold text-success">-${deductionSavings.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-primary/10 rounded-lg text-center border-2 border-primary/30">
                <p className="text-sm text-primary font-medium">Final Tax Liability</p>
                <p className="text-2xl font-bold text-primary">${taxes.annual.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted/20 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxable Income (Federal):</span>
                <span className="font-medium">${federalTaxableIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Taxable Income (VA State):</span>
                <span className="font-medium">${stateTaxableIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">FICA Taxable Salary:</span>
                <span className="font-medium">${ficaTaxableSalary.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Tax Breakdown (Annual)</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Estimated based on current income and standard rates
          </p>
        </div>
        <div className="p-6 space-y-4">
          {taxBreakdown.map((tax) => (
            <div
              key={tax.name}
              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-foreground">{tax.name}</p>
                  <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                    {tax.rate}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{tax.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on: {tax.base}</p>
              </div>
              <p className="text-xl font-bold expense-text">${tax.amount.toLocaleString()}</p>
            </div>
          ))}

          <div className="flex items-center justify-between p-4 bg-destructive/10 rounded-lg border-2 border-destructive/20">
            <div>
              <p className="font-semibold text-foreground">Total Annual Tax Liability</p>
              <p className="text-sm text-muted-foreground">Sum of all tax obligations</p>
            </div>
            <p className="text-2xl font-bold expense-text">${taxes.annual.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">Quarterly Payment Schedule</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Estimated quarterly tax payment dates and amounts
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Quarter</th>
                <th>Due Date</th>
                <th>Estimated Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {quarterlyPayments.map((payment, index) => (
                <tr key={payment.quarter}>
                  <td className="font-medium text-foreground">{payment.quarter} {currentYear}</td>
                  <td className="text-muted-foreground">{payment.due}</td>
                  <td className="expense-text font-semibold">
                    ${payment.amount.toLocaleString()}
                  </td>
                  <td>
                    {index === 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-sm">
                        <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                        <span className="text-warning font-medium">Upcoming</span>
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Scheduled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-semibold">
                <td>Total Annual</td>
                <td />
                <td className="expense-text">${taxes.annual.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Tax Deductions Manager */}
      <TaxDeductionsManager
        tripTotals={tripTotals}
      />

      {deductionSavings > 0 && (
        <div className="bg-success/10 border border-success/30 rounded-xl p-6">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-success" />
            Tax Savings from Deductions
          </h3>
          <p className="text-muted-foreground mt-2">
            Your pre-tax deductions are saving you approximately{' '}
            <span className="font-bold text-success">${deductionSavings.toLocaleString()}</span>{' '}
            in taxes annually by reducing your taxable income.
          </p>
        </div>
      )}

      <div className="bg-success/10 border border-success/30 rounded-xl p-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-success" />
          Monthly Tax Savings Recommendation
        </h3>
        <p className="text-muted-foreground mt-2">
          To ensure you have funds available for quarterly tax payments, set aside{' '}
          <span className="font-bold text-foreground">${taxes.monthly.toLocaleString()}</span>{' '}
          each month into a separate tax savings account. This will cover your estimated
          federal and Virginia state tax obligations throughout the year.
        </p>
      </div>
    </div>
  );
};
