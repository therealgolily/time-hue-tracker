import { DollarSign, TrendingDown, TrendingUp, Calculator, Users, Briefcase } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useClients } from '../hooks/useClients';
import { useExpenses } from '../hooks/useExpenses';
import { usePayments } from '../hooks/usePayments';
import { useEmployees } from '../hooks/useEmployees';
import { format } from 'date-fns';
import { TAX_RATES } from '../data/businessData';

const paymentMethodLabels: Record<string, string> = {
  check: 'CHECK',
  direct_deposit: 'DEPOSIT',
  quickbooks: 'QB',
  stripe: 'STRIPE',
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
      <div className="flex items-center justify-center h-64 border-2 border-foreground">
        <div className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b-2 border-foreground pb-4">
        <h2 className="text-2xl font-bold uppercase tracking-tight">Financial Overview</h2>
        <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
          {format(new Date(), 'MMMM yyyy')}
        </p>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0">
        <div className="border-r-0 sm:border-r-2 border-foreground last:border-r-0">
          <MetricCard
            title="Expected Revenue"
            value={monthlyRetainerRevenue}
            icon={TrendingUp}
            variant="revenue"
            subtitle={`${clients.filter(c => c.status === 'active').length} clients`}
          />
        </div>
        <div className="border-r-0 lg:border-r-2 border-foreground">
          <MetricCard
            title="Recurring Expenses"
            value={recurringExpenses}
            icon={TrendingDown}
            variant="expense"
            subtitle="Monthly"
          />
        </div>
        <div className="border-r-0 sm:border-r-2 border-foreground lg:border-r-2">
          <MetricCard
            title="Net Profit"
            value={monthlyProfit}
            icon={DollarSign}
            variant={monthlyProfit >= 0 ? 'revenue' : 'expense'}
            subtitle="Before taxes"
          />
        </div>
        <div>
          <MetricCard
            title="Tax Reserve"
            value={estimatedTax}
            icon={Calculator}
            variant="neutral"
            subtitle="Monthly"
          />
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
        <div className="border-r-0 sm:border-r-2 border-foreground">
          <MetricCard
            title="This Month"
            value={thisMonthTotal}
            icon={Briefcase}
            variant="revenue"
            subtitle={`${thisMonthPayments.length} payments`}
          />
        </div>
        <div className="border-r-0 sm:border-r-2 border-foreground">
          <MetricCard
            title="Active Clients"
            value={clients.filter(c => c.status === 'active').length}
            icon={Users}
            variant="default"
          />
        </div>
        <div>
          <MetricCard
            title="Annual Projection"
            value={monthlyRetainerRevenue * 12}
            icon={TrendingUp}
            variant="revenue"
            subtitle="Retainers"
          />
        </div>
      </div>

      {/* Client Retainers Table */}
      {clients.length > 0 ? (
        <div className="border-2 border-foreground">
          <div className="border-b-2 border-foreground p-4 bg-muted/30">
            <h3 className="text-sm font-bold uppercase tracking-widest">Client Retainers</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/30">
                  <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Client</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Retainer</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Method</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client, index) => (
                  <tr 
                    key={client.id} 
                    className={index < clients.length - 1 ? "border-b border-foreground/30" : ""}
                  >
                    <td className="p-3 font-bold">{client.name}</td>
                    <td className="p-3 text-right font-mono tabular-nums">
                      ${Number(client.monthly_retainer).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <span className="text-xs font-mono uppercase bg-muted px-2 py-1 border border-foreground">
                        {paymentMethodLabels[client.payment_method] || client.payment_method}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-mono uppercase ${
                        client.status === 'active' ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        <span className={`w-2 h-2 ${
                          client.status === 'active' ? 'bg-foreground' : 'bg-muted-foreground'
                        }`} />
                        {client.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-foreground bg-foreground text-background">
                  <td className="p-3 font-bold uppercase text-xs tracking-widest">Total</td>
                  <td className="p-3 text-right font-mono font-bold tabular-nums">
                    ${monthlyRetainerRevenue.toLocaleString()}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="border-2 border-foreground p-8 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">No Clients</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase">
            Add clients to start tracking revenue
          </p>
        </div>
      )}
    </div>
  );
};