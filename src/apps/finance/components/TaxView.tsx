import { Calculator, AlertTriangle, DollarSign, Calendar, Building } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { TAX_RATES } from '../data/businessData';
import { useClients } from '../hooks/useClients';
import { useExpenses } from '../hooks/useExpenses';
import { useEmployees } from '../hooks/useEmployees';

export const TaxView = () => {
  const { clients, loading: clientsLoading } = useClients();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { totalSalary, loading: employeesLoading } = useEmployees();

  const loading = clientsLoading || expensesLoading || employeesLoading;

  const monthlyRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_retainer), 0);

  const monthlyExpenses = expenses
    .filter(e => e.recurring)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const annualProfit = monthlyProfit * 12;
  const salary = totalSalary;

  const employerFica = salary * TAX_RATES.employerFica;
  const adjustedProfit = annualProfit - employerFica;
  const totalTaxableIncome = salary + adjustedProfit;

  const employeeFica = salary * TAX_RATES.employeeFica;
  const federalIncome = totalTaxableIncome * TAX_RATES.federalIncome;
  const stateIncome = totalTaxableIncome * TAX_RATES.stateIncome;
  const totalAnnualTax = employerFica + employeeFica + federalIncome + stateIncome;

  const taxes = {
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
      base: `$${totalTaxableIncome.toLocaleString()} taxable income`,
      amount: taxes.breakdown.federalIncome,
      description: 'On W-2 salary + K-1 pass-through income (profit)',
    },
    {
      name: 'Virginia State Tax',
      rate: '5.75%',
      base: `$${totalTaxableIncome.toLocaleString()} taxable income`,
      amount: taxes.breakdown.stateIncome,
      description: 'Virginia tax on W-2 salary + K-1 pass-through income',
    },
  ];

  const quarterlyPayments = [
    { quarter: 'Q1', due: 'April 15, 2025', amount: taxes.quarterly },
    { quarter: 'Q2', due: 'June 15, 2025', amount: taxes.quarterly },
    { quarter: 'Q3', due: 'September 15, 2025', amount: taxes.quarterly },
    { quarter: 'Q4', due: 'January 15, 2026', amount: taxes.quarterly },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading tax data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tax Liability</h1>
        <p className="text-muted-foreground mt-1">
          Estimated tax obligations for S-Corp
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
          value={`${annualProfit > 0 ? ((taxes.annual / annualProfit) * 100).toFixed(1) : 0}%`}
          icon={Building}
          variant="neutral"
        />
      </div>

      <div className="bg-warning/10 border border-warning/30 rounded-xl p-6 flex gap-4">
        <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-foreground">S-Corp Tax Advantage</h3>
          <p className="text-sm text-muted-foreground mt-1">
            As an S-Corp, you can potentially save on self-employment taxes.
            Only the salary portion (${salary.toLocaleString()}/year) is subject to FICA taxes,
            while distributions can avoid the 15.3% self-employment tax. Consult with a CPA
            for accurate tax planning.
          </p>
        </div>
      </div>

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
                  <td className="font-medium text-foreground">{payment.quarter} 2025</td>
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

      <div className="bg-success/10 border border-success/30 rounded-xl p-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-success" />
          Monthly Tax Savings Recommendation
        </h3>
        <p className="text-muted-foreground mt-2">
          To ensure you have funds available for quarterly tax payments, set aside{' '}
          <span className="font-bold text-foreground">${taxes.monthly.toLocaleString()}</span>{' '}
          each month into a separate tax savings account. This will cover your estimated
          federal and state tax obligations throughout the year.
        </p>
      </div>
    </div>
  );
};
