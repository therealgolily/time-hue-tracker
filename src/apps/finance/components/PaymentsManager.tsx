import { format } from 'date-fns';
import { DollarSign, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentForm } from './forms/PaymentForm';
import { usePayments, Payment } from '../hooks/usePayments';
import { useClients } from '../hooks/useClients';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

export const PaymentsManager = () => {
  const { payments, loading, addPayment, updatePayment, deletePayment } = usePayments();
  const { clients, loading: clientsLoading } = useClients();

  const totalPayments = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading || clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading payments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground mt-1">
            Track payments received from clients
          </p>
        </div>
        {clients.length > 0 && <PaymentForm clients={clients} onSubmit={addPayment} />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <p className="metric-label">Total Payments</p>
          <p className="metric-value mt-2">{payments.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">This Month</p>
          <p className="metric-value mt-2 revenue-text">${thisMonthTotal.toLocaleString()}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">All Time</p>
          <p className="metric-value mt-2 revenue-text">${totalPayments.toLocaleString()}</p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Add clients first</h3>
          <p className="text-muted-foreground">You need to add clients before recording payments.</p>
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
          <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No payments recorded</h3>
          <p className="text-muted-foreground mb-4">Start recording payments from clients.</p>
          <PaymentForm clients={clients} onSubmit={addPayment} />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Client</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => {
                const client = clients.find(c => c.id === payment.client_id);
                return (
                  <tr key={payment.id}>
                    <td className="font-medium text-foreground">
                      {client?.name || 'Unknown Client'}
                    </td>
                    <td className="text-muted-foreground">
                      {format(new Date(payment.date), 'MMM d, yyyy')}
                    </td>
                    <td className="revenue-text font-semibold">
                      ${Number(payment.amount).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge-payment ${paymentMethodBadgeClasses[payment.payment_method]}`}>
                        {paymentMethodLabels[payment.payment_method]}
                      </span>
                    </td>
                    <td className="text-muted-foreground">
                      {payment.reference_number || '—'}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <PaymentForm
                          clients={clients}
                          initialData={payment}
                          onSubmit={(data) => updatePayment(payment.id, data)}
                          trigger={
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          }
                        />
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete payment?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this payment record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePayment(payment.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
