import { PieChart, TrendingUp, TrendingDown, DollarSign, ArrowRight, Users, User, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import { useClients } from '../hooks/useClients';
import { useExpenses } from '../hooks/useExpenses';
import { usePayments } from '../hooks/usePayments';
import { useContractors } from '../hooks/useContractors';
import { useTaxCalculations } from '../hooks/useTaxCalculations';

export const MonthlySummary = () => {
  const { clients, loading: clientsLoading } = useClients();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { payments, loading: paymentsLoading } = usePayments();
  const { contractors, loading: contractorsLoading } = useContractors();

  // Use centralized tax calculations (includes deductions)
  const { taxes: taxCalc, loading: taxLoading, deductionTotals, rawData } = useTaxCalculations();
  const { totalSalary, contractorMonthlyPay } = rawData;

  const loading = clientsLoading || expensesLoading || paymentsLoading || contractorsLoading || taxLoading;

  // Use values from centralized calculations
  const monthlyRevenue = taxCalc.monthlyRevenue;
  const monthlyRecurringExpenses = taxCalc.monthlyExpenses - (totalSalary / 12) - contractorMonthlyPay;
  const monthlySalary = totalSalary / 12;
  const totalMonthlyExpenses = taxCalc.monthlyExpenses;
  const grossProfit = taxCalc.monthlyGrossProfit;

  const taxes = {
    annual: taxCalc.annualTax,
    monthly: taxCalc.monthlyTaxReserve,
  };

  // Net available after tax reserve
  const netProfit = taxCalc.monthlyNetProfit;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyData = months.map((month) => ({
    month,
    revenue: monthlyRevenue,
    expenses: totalMonthlyExpenses,
    profit: grossProfit,
    taxReserve: taxes.monthly,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-foreground">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Loading…</div>
      </div>
    );
  }

  const hasAnyData = clients.length > 0 || expenses.length > 0 || payments.length > 0;

  return (
    <div className="space-y-6">
      <div className="border-b-2 border-foreground pb-4">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Monthly Summary</h2>
        <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
          {format(new Date(), 'MMMM yyyy')} • S-Corp Virginia
        </p>
      </div>

      {!hasAnyData ? (
        <div className="border-2 border-foreground p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">No finance data yet</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase">
            Add a client, expense, or payment to see your monthly summary.
          </p>
        </div>
      ) : (
        <div className="border-2 border-foreground">
          <div className="border-b-2 border-foreground p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Snapshot</p>
              <h3 className="text-lg font-bold uppercase">This Month</h3>
            </div>
            <PieChart className="w-6 h-6" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
            <div className="p-4 border-r-0 md:border-r-2 border-foreground">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Revenue</p>
              <p className="text-2xl font-bold tabular-nums">${monthlyRevenue.toLocaleString()}</p>
            </div>
            <div className="p-4 border-r-0 md:border-r-2 border-foreground">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">All Costs</p>
              <p className="text-2xl font-bold tabular-nums">${totalMonthlyExpenses.toLocaleString()}</p>
            </div>
            <div className="p-4 border-r-0 md:border-r-2 border-foreground">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Gross</p>
              <p className="text-2xl font-bold tabular-nums">${grossProfit.toLocaleString()}</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Net</p>
              <p className="text-2xl font-bold tabular-nums">${netProfit.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-4">
          <h3 className="text-sm font-bold uppercase tracking-widest">Cash Flow Breakdown</h3>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between p-4 border border-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold uppercase">Expected Revenue</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {clients.filter((c) => c.status === 'active').length} active clients
                </p>
              </div>
            </div>
            <p className="text-xl font-mono font-bold tabular-nums">+${monthlyRevenue.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 border border-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold uppercase">Your Salary (W-2)</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  ${totalSalary.toLocaleString()}/year
                </p>
              </div>
            </div>
            <p className="text-xl font-mono font-bold tabular-nums">-${monthlySalary.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 border border-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold uppercase">Contractor Payments (1099)</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {contractors.length} contractor{contractors.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <p className="text-xl font-mono font-bold tabular-nums">-${contractorMonthlyPay.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 border border-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold uppercase">Recurring Expenses</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {expenses.filter((e) => e.recurring).length} recurring items
                </p>
              </div>
            </div>
            <p className="text-xl font-mono font-bold tabular-nums">-${monthlyRecurringExpenses.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 border border-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center">
                <ArrowRight className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold uppercase">Gross Profit</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Before taxes</p>
              </div>
            </div>
            <p className="text-xl font-mono font-bold tabular-nums">${grossProfit.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 border border-foreground">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-foreground flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold uppercase">Tax Reserve</p>
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  FICA + Federal + VA State
                </p>
              </div>
            </div>
            <p className="text-xl font-mono font-bold tabular-nums">-${taxes.monthly.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 border-2 border-foreground bg-foreground text-background">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border-2 border-background flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold uppercase">Net Available</p>
                <p className="text-xs font-mono uppercase tracking-widest text-background/70">After reserve</p>
              </div>
            </div>
            <p className="text-2xl font-mono font-bold tabular-nums">${netProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="border-2 border-foreground overflow-hidden">
        <div className="p-4 border-b-2 border-foreground">
          <h3 className="text-sm font-bold uppercase tracking-widest">Monthly Projections</h3>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
            Based on retainers, salary, contractors & recurring expenses
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Month</th>
                <th>Revenue</th>
                <th>All Costs</th>
                <th>Gross Profit</th>
                <th>Tax Reserve</th>
                <th>Net</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={data.month} className={index === 0 ? 'bg-primary/5' : ''}>
                  <td className="font-medium text-foreground">
                    {data.month}
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </td>
                  <td className="revenue-text font-semibold">${data.revenue.toLocaleString()}</td>
                  <td className="expense-text">${data.expenses.toLocaleString()}</td>
                  <td className="font-semibold">${data.profit.toLocaleString()}</td>
                  <td className="text-warning">${data.taxReserve.toLocaleString()}</td>
                  <td className="revenue-text font-bold">
                    ${(data.profit - data.taxReserve).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-semibold">
                <td>Annual Total</td>
                <td className="revenue-text">${(monthlyRevenue * 12).toLocaleString()}</td>
                <td className="expense-text">${(totalMonthlyExpenses * 12).toLocaleString()}</td>
                <td>${(grossProfit * 12).toLocaleString()}</td>
                <td className="text-warning">${taxes.annual.toLocaleString()}</td>
                <td className="revenue-text">${(netProfit * 12).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
