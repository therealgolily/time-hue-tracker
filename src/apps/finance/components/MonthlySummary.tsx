import { PieChart, TrendingUp, TrendingDown, DollarSign, ArrowRight } from 'lucide-react';
import { MetricCard } from './MetricCard';
import {
  calculateMonthlyRevenue,
  calculateMonthlyExpenses,
  calculateEstimatedTaxLiability,
  clients,
  expenses,
} from '../data/businessData';

export const MonthlySummary = () => {
  const monthlyRevenue = calculateMonthlyRevenue();
  const monthlyExpenses = calculateMonthlyExpenses();
  const taxes = calculateEstimatedTaxLiability();
  const grossProfit = monthlyRevenue - monthlyExpenses;
  const netProfit = grossProfit - taxes.monthly;

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyData = months.map((month, index) => ({
    month,
    revenue: monthlyRevenue,
    expenses: monthlyExpenses,
    profit: grossProfit,
    taxReserve: taxes.monthly,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Monthly Summary</h1>
        <p className="text-muted-foreground mt-1">
          Complete financial picture month by month
        </p>
      </div>

      <div className="bg-primary text-primary-foreground rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/70 text-sm uppercase tracking-wider">January 2025</p>
            <h2 className="text-2xl font-bold mt-1">Monthly Snapshot</h2>
          </div>
          <PieChart className="w-10 h-10 text-primary-foreground/50" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-primary-foreground/60 text-sm">Revenue</p>
            <p className="text-3xl font-bold mt-1">${monthlyRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-primary-foreground/60 text-sm">Expenses</p>
            <p className="text-3xl font-bold mt-1">${monthlyExpenses.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-primary-foreground/60 text-sm">Gross Profit</p>
            <p className="text-3xl font-bold mt-1">${grossProfit.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-primary-foreground/60 text-sm">Net (After Tax Reserve)</p>
            <p className="text-3xl font-bold mt-1">${netProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <h2 className="text-xl font-semibold text-foreground mb-6">Cash Flow Breakdown</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-medium text-foreground">Total Revenue</p>
                <p className="text-sm text-muted-foreground">{clients.length} client retainers</p>
              </div>
            </div>
            <p className="text-2xl font-bold revenue-text">+${monthlyRevenue.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="font-medium text-foreground">Total Expenses</p>
                <p className="text-sm text-muted-foreground">{expenses.length} expense items</p>
              </div>
            </div>
            <p className="text-2xl font-bold expense-text">-${monthlyExpenses.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Gross Profit</p>
                <p className="text-sm text-muted-foreground">Before tax reserve</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">${grossProfit.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-foreground">Tax Reserve</p>
                <p className="text-sm text-muted-foreground">Estimated monthly liability</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-warning">-${taxes.monthly.toLocaleString()}</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg border-2 border-success/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Net Available</p>
                <p className="text-sm text-muted-foreground">After all obligations</p>
              </div>
            </div>
            <p className="text-3xl font-bold revenue-text">${netProfit.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border/50">
          <h2 className="text-xl font-semibold text-foreground">2025 Monthly Projections</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Based on current client retainers and expenses
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Month</th>
                <th>Revenue</th>
                <th>Expenses</th>
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
                <td className="expense-text">${(monthlyExpenses * 12).toLocaleString()}</td>
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
