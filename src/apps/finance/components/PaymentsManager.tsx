import { format } from 'date-fns';
import { DollarSign, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PaymentForm } from './forms/PaymentForm';
import { usePayments } from '../hooks/usePayments';
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
  check: 'CHECK',
  direct_deposit: 'DEPOSIT',
  quickbooks: 'QB',
  stripe: 'STRIPE',
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
      <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Payments</h2>
          <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
            Track payments from clients
          </p>
        </div>
        {clients.length > 0 && <PaymentForm clients={clients} onSubmit={addPayment} />}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
        <div className="border-2 border-foreground border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Payments</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">{payments.length}</p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            ${thisMonthTotal.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">All Time</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            ${totalPayments.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      {clients.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">Add Clients First</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase">
            You need to add clients before recording payments
          </p>
        </div>
      ) : payments.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <DollarSign className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">No Payments</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase mb-4">
            Start recording payments from clients
          </p>
          <PaymentForm clients={clients} onSubmit={addPayment} />
        </div>
      ) : (
        <div className="border-2 border-foreground overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/30">
                  <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Client</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Date</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Amount</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Method</th>
                  <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Reference</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => {
                  const client = clients.find(c => c.id === payment.client_id);
                  return (
                    <tr 
                      key={payment.id}
                      className={index < payments.length - 1 ? "border-b border-foreground/30" : ""}
                    >
                      <td className="p-3 font-bold">
                        {client?.name || 'Unknown'}
                      </td>
                      <td className="p-3 text-center text-sm font-mono text-muted-foreground">
                        {format(new Date(payment.date), 'MMM d')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold tabular-nums">
                        ${Number(payment.amount).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-xs font-mono uppercase bg-muted px-2 py-1 border border-foreground">
                          {paymentMethodLabels[payment.payment_method] || payment.payment_method}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm font-mono text-muted-foreground">
                        {payment.reference_number || '—'}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <PaymentForm
                            clients={clients}
                            initialData={payment}
                            onSubmit={(data) => updatePayment(payment.id, data)}
                            trigger={
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                <Edit className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary hover:text-primary-foreground">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="border-2 border-foreground rounded-none">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="uppercase tracking-wide">Delete Payment?</AlertDialogTitle>
                                <AlertDialogDescription className="font-mono text-sm">
                                  This will permanently delete this payment record.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-2 border-foreground rounded-none">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deletePayment(payment.id)}
                                  className="bg-primary text-primary-foreground rounded-none"
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
        </div>
      )}
    </div>
  );
};