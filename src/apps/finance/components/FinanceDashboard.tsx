import { DollarSign, TrendingDown, TrendingUp, Calculator, Users, Briefcase, User } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { useClients } from '../hooks/useClients';
import { useExpenses } from '../hooks/useExpenses';
import { usePayments } from '../hooks/usePayments';
import { useEmployees } from '../hooks/useEmployees';
import { useContractors } from '../hooks/useContractors';
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
  const { totalMonthlyPay: contractorMonthlyPay, loading: contractorsLoading } = useContractors();

  const loading = clientsLoading || expensesLoading || paymentsLoading || employeesLoading || contractorsLoading;

  // Revenue from active client retainers
  const monthlyRetainerRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_retainer), 0);
  
  // Recurring software/misc expenses
  const recurringExpenses = expenses
    .filter(e => e.recurring)
    .reduce((sum, e) => sum + Number(e.amount), 0);

  // Monthly salary (annual / 12)
  const monthlySalary = totalSalary / 12;

  // Total monthly operating costs: expenses + salary + contractors
  const totalMonthlyOperatingCosts = recurringExpenses + monthlySalary + contractorMonthlyPay;

  // Gross profit before taxes
  const monthlyGrossProfit = monthlyRetainerRevenue - totalMonthlyOperatingCosts;

  // Employer FICA on salary (business expense)
  const monthlyEmployerFica = (totalSalary * TAX_RATES.employerFica) / 12;
  
  // Net profit after employer FICA
  const monthlyNetBeforeTaxes = monthlyGrossProfit - monthlyEmployerFica;

  // Tax calculations for S-Corp Virginia
  const annualGrossProfit = monthlyGrossProfit * 12;
  const employerFica = totalSalary * TAX_RATES.employerFica;
  const adjustedProfit = annualGrossProfit - employerFica; // Pass-through K-1 income
  const totalTaxableIncome = totalSalary + adjustedProfit; // W-2 + K-1
  const employeeFica = totalSalary * TAX_RATES.employeeFica;
  const federalTax = totalTaxableIncome * TAX_RATES.federalIncome;
  const stateTax = totalTaxableIncome * TAX_RATES.stateIncome;
  const annualTax = employerFica + employeeFica + federalTax + stateTax;
  const estimatedMonthlyTax = Math.max(0, Math.round(annualTax / 12));

  // Current month payments
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

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
          {format(new Date(), 'MMMM yyyy')} • S-Corp Virginia
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
            title="Operating Costs"
            value={totalMonthlyOperatingCosts}
            icon={TrendingDown}
            variant="expense"
            subtitle="All monthly costs"
          />
        </div>
        <div className="border-r-0 sm:border-r-2 border-foreground lg:border-r-2">
          <MetricCard
            title="Gross Profit"
            value={monthlyGrossProfit}
            icon={DollarSign}
            variant={monthlyGrossProfit >= 0 ? 'revenue' : 'expense'}
            subtitle="Before taxes"
          />
        </div>
        <div>
          <MetricCard
            title="Tax Reserve"
            value={estimatedMonthlyTax}
            icon={Calculator}
            variant="neutral"
            subtitle="Monthly"
          />
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="border-2 border-foreground">
        <div className="border-b-2 border-foreground p-4 bg-muted/30">
          <h3 className="text-sm font-bold uppercase tracking-widest">Monthly Cost Breakdown</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
          <div className="p-4 border-r-0 sm:border-r-2 border-b sm:border-b-0 border-foreground">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Your Salary</p>
            </div>
            <p className="text-xl font-bold tabular-nums text-primary">
              ${monthlySalary.toLocaleString()}
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              ${totalSalary.toLocaleString()}/yr
            </p>
          </div>
          <div className="p-4 border-r-0 sm:border-r-2 border-b sm:border-b-0 border-foreground">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contractors</p>
            </div>
            <p className="text-xl font-bold tabular-nums text-primary">
              ${contractorMonthlyPay.toLocaleString()}
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              1099 payments
            </p>
          </div>
          <div className="p-4 border-r-0 sm:border-r-2 border-b sm:border-b-0 border-foreground">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Expenses</p>
            </div>
            <p className="text-xl font-bold tabular-nums">
              ${recurringExpenses.toLocaleString()}
            </p>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Recurring only
            </p>
          </div>
          <div className="p-4 bg-foreground text-background">
            <p className="text-xs font-mono uppercase tracking-widest text-background/70 mb-2">Total Costs</p>
            <p className="text-xl font-bold tabular-nums">
              ${totalMonthlyOperatingCosts.toLocaleString()}
            </p>
            <p className="text-xs font-mono text-background/70 mt-1">
              + ${monthlyEmployerFica.toLocaleString()} FICA
            </p>
          </div>
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
