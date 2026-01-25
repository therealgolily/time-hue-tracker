import { DollarSign, TrendingDown, TrendingUp, Calculator, Users, Briefcase } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useClients } from '../hooks/useClients';
import { useExpenses } from '../hooks/useExpenses';
import { usePayments } from '../hooks/usePayments';
import { useEmployees } from '../hooks/useEmployees';
import { format } from 'date-fns';
import { TAX_RATES } from '../data/businessData';

const paymentMethodLabels: Record<string, string> = {
  check: 'Check',
  direct_deposit: 'Direct Deposit',
  quickbooks: 'QuickBooks',
  stripe: 'Stripe',
};

const paymentMethodBadgeClasses: Record<string, string> = {
  check: 'badge-check',
  direct_deposit: 'badge-deposit',
  quickbooks: 'badge-quickbooks',
  stripe: 'badge-stripe',
};

export const FinanceDashboard = () => {
  const { clients, loading: clientsLoading } = useClients();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { payments, loading: paymentsLoading } = usePayments();
  const { totalSalary, loading: employeesLoading } = useEmployees();

  const loading = clientsLoading || expensesLoading || paymentsLoading || employeesLoading;

  const monthlyRetainerRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_retainer), 0);
  
  const recurringExpenses = expenses
    .filter(e => e.recurring)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const monthlyProfit = monthlyRetainerRevenue - recurringExpenses;

  const salary = totalSalary;
  const annualProfit = monthlyProfit * 12;
  const ficaTax = salary * (TAX_RATES.employerFica + TAX_RATES.employeeFica);
  const employerFica = salary * TAX_RATES.employerFica;
  const adjustedProfit = annualProfit - employerFica;
  const totalTaxableIncome = salary + adjustedProfit;
  const federalTax = totalTaxableIncome * TAX_RATES.federalIncome;
  const stateTax = totalTaxableIncome * TAX_RATES.stateIncome;
  const annualTax = ficaTax + federalTax + stateTax;
  const estimatedTax = Math.max(0, Math.round(annualTax / 12));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Financial Overview</h1>
        <p className="text-muted-foreground mt-1">
          {format(new Date(), 'MMMM yyyy')} • S-Corp Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Expected Revenue"
          value={monthlyRetainerRevenue}
          icon={TrendingUp}
          variant="revenue"
          subtitle={`${clients.filter(c => c.status === 'active').length} active clients`}
        />
        <MetricCard
          title="Recurring Expenses"
          value={recurringExpenses}
          icon={TrendingDown}
          variant="expense"
          subtitle="Monthly recurring"
        />
        <MetricCard
          title="Net Profit"
          value={monthlyProfit}
          icon={DollarSign}
          variant={monthlyProfit >= 0 ? 'revenue' : 'expense'}
          subtitle="Before taxes"
        />
        <MetricCard
          title="Est. Tax Reserve"
          value={estimatedTax}
          icon={Calculator}
          variant="neutral"
          subtitle="S-Corp FICA + income tax"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Received This Month"
          value={thisMonthTotal}
          icon={Briefcase}
          variant="revenue"
          subtitle={`${thisMonthPayments.length} payments`}
        />
        <MetricCard
          title="Active Clients"
          value={clients.filter(c => c.status === 'active').length}
          icon={Users}
          variant="default"
        />
        <MetricCard
          title="Annual Projection"
          value={monthlyRetainerRevenue * 12}
          icon={TrendingUp}
          variant="revenue"
          subtitle="Based on retainers"
        />
      </div>

      {clients.length > 0 ? (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold text-foreground">Client Retainers</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Monthly recurring revenue by client
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr className="bg-muted/30">
                  <th>Client</th>
                  <th>Monthly Retainer</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client.id}>
                    <td className="font-medium text-foreground">{client.name}</td>
                    <td className="revenue-text font-semibold">
                      ${Number(client.monthly_retainer).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge-payment ${paymentMethodBadgeClasses[client.payment_method]}`}>
                        {paymentMethodLabels[client.payment_method]}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-success' : 'bg-muted-foreground'}`} />
                        <span className="text-sm text-muted-foreground capitalize">{client.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-muted/30 font-semibold">
                  <td>Total Monthly Revenue</td>
                  <td className="revenue-text">${monthlyRetainerRevenue.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 p-8 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients yet</h3>
          <p className="text-muted-foreground">Add clients to start tracking revenue.</p>
        </div>
      )}
    </div>
  );
};
