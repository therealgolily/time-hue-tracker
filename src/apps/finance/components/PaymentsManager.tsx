import { format, isFuture, parseISO } from 'date-fns';
import { DollarSign, Edit, Trash2, Plus, Clock, CheckCircle2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const paymentMethodLabels: Record<string, string> = {
  check: 'CHECK',
  direct_deposit: 'DEPOSIT',
  quickbooks: 'QB',
  stripe: 'STRIPE',
};

const PaymentRow = ({ 
  payment, 
  clients, 
  updatePayment, 
  deletePayment, 
  markAsReceived,
  isLast 
}: { 
  payment: Payment;
  clients: any[];
  updatePayment: (id: string, data: any) => Promise<any>;
  deletePayment: (id: string) => Promise<any>;
  markAsReceived?: (payment: Payment) => void;
  isLast: boolean;
}) => {
  const client = clients.find(c => c.id === payment.client_id);
  const isPending = payment.status === 'pending';
  const isPastDue = isPending && !isFuture(parseISO(payment.date));

  return (
    <tr className={!isLast ? "border-b border-foreground/30" : ""}>
      <td className="p-3">
        <div className="font-bold">{client?.name || 'Unknown'}</div>
        {payment.description && (
          <div className="text-xs font-mono text-muted-foreground mt-0.5">
            {payment.description}
          </div>
        )}
      </td>
      <td className="p-3 text-center text-sm font-mono text-muted-foreground">
        {format(parseISO(payment.date), 'MMM d, yyyy')}
      </td>
      <td className="p-3 text-right font-mono font-bold tabular-nums">
        ${Number(payment.amount).toLocaleString()}
      </td>
      <td className="p-3 text-center">
        <span className="text-xs font-mono uppercase bg-muted px-2 py-1 border border-foreground">
          {paymentMethodLabels[payment.payment_method] || payment.payment_method}
        </span>
      </td>
      <td className="p-3 text-center">
        {isPending ? (
          <span className={`text-xs font-mono uppercase px-2 py-1 border ${
            isPastDue 
              ? 'bg-destructive/20 text-destructive border-destructive' 
              : 'bg-chart-4/20 text-chart-4 border-chart-4'
          }`}>
            {isPastDue ? 'OVERDUE' : 'PENDING'}
          </span>
        ) : (
          <span className="text-xs font-mono uppercase px-2 py-1 bg-primary/20 text-primary border border-primary">
            RECEIVED
          </span>
        )}
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center justify-end gap-1">
          {isPending && markAsReceived && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 hover:bg-primary hover:text-primary-foreground"
              onClick={() => markAsReceived(payment)}
              title="Mark as received"
            >
              <CheckCircle2 className="w-4 h-4" />
            </Button>
          )}
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
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground">
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
                  className="bg-destructive text-destructive-foreground rounded-none"
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
};

export const PaymentsManager = () => {
  const { payments, loading, addPayment, updatePayment, deletePayment } = usePayments();
  const { clients, loading: clientsLoading } = useClients();

  // Separate received and pending payments
  const receivedPayments = payments.filter(p => p.status === 'received');
  const pendingPayments = payments.filter(p => p.status === 'pending');

  const totalReceived = receivedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const thisMonthReceived = receivedPayments.filter(p => {
    const paymentDate = parseISO(p.date);
    return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
  });
  const thisMonthTotal = thisMonthReceived.reduce((sum, p) => sum + Number(p.amount), 0);

  const handleMarkAsReceived = async (payment: Payment) => {
    await updatePayment(payment.id, { 
      status: 'received',
      date: new Date().toISOString().split('T')[0]
    });
  };

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
            Track received & expected payments
          </p>
        </div>
        {clients.length > 0 && (
          <div className="flex gap-2">
            <PaymentForm 
              clients={clients} 
              onSubmit={addPayment} 
              defaultStatus="pending"
              trigger={
                <Button variant="outline" className="gap-2 rounded-none border-2 border-foreground">
                  <Clock className="w-4 h-4" />
                  Add Expected
                </Button>
              }
            />
            <PaymentForm clients={clients} onSubmit={addPayment} />
          </div>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-0">
        <div className="border-2 border-foreground border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">This Month</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            ${thisMonthTotal.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Received</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            ${totalReceived.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-chart-4">Expected</p>
          <p className="text-2xl font-bold mt-2 tabular-nums text-chart-4">
            ${totalPending.toLocaleString()}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Projected Total</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            ${(totalReceived + totalPending).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Content */}
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
            Record payments or add expected future payments
          </p>
          <div className="flex gap-2 justify-center">
            <PaymentForm 
              clients={clients} 
              onSubmit={addPayment} 
              defaultStatus="pending"
              trigger={
                <Button variant="outline" className="gap-2 rounded-none border-2 border-foreground">
                  <Clock className="w-4 h-4" />
                  Add Expected
                </Button>
              }
            />
            <PaymentForm clients={clients} onSubmit={addPayment} />
          </div>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-2 border-foreground h-auto p-0 bg-transparent">
            <TabsTrigger 
              value="all" 
              className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background py-3 uppercase font-mono text-xs tracking-widest"
            >
              All ({payments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="received" 
              className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background py-3 uppercase font-mono text-xs tracking-widest border-l-2 border-foreground"
            >
              Received ({receivedPayments.length})
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="rounded-none data-[state=active]:bg-foreground data-[state=active]:text-background py-3 uppercase font-mono text-xs tracking-widest border-l-2 border-foreground"
            >
              Expected ({pendingPayments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <PaymentsTable 
              payments={payments} 
              clients={clients} 
              updatePayment={updatePayment} 
              deletePayment={deletePayment}
              markAsReceived={handleMarkAsReceived}
            />
          </TabsContent>

          <TabsContent value="received" className="mt-0">
            <PaymentsTable 
              payments={receivedPayments} 
              clients={clients} 
              updatePayment={updatePayment} 
              deletePayment={deletePayment}
            />
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            {pendingPayments.length === 0 ? (
              <div className="border-2 border-t-0 border-foreground p-8 text-center">
                <Clock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-mono text-muted-foreground uppercase">No expected payments</p>
              </div>
            ) : (
              <PaymentsTable 
                payments={pendingPayments} 
                clients={clients} 
                updatePayment={updatePayment} 
                deletePayment={deletePayment}
                markAsReceived={handleMarkAsReceived}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

const PaymentsTable = ({ 
  payments, 
  clients, 
  updatePayment, 
  deletePayment,
  markAsReceived
}: { 
  payments: Payment[];
  clients: any[];
  updatePayment: (id: string, data: any) => Promise<any>;
  deletePayment: (id: string) => Promise<any>;
  markAsReceived?: (payment: Payment) => void;
}) => (
  <div className="border-2 border-t-0 border-foreground overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-foreground bg-muted/30">
            <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Client</th>
            <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Date</th>
            <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Amount</th>
            <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Method</th>
            <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Status</th>
            <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <PaymentRow
              key={payment.id}
              payment={payment}
              clients={clients}
              updatePayment={updatePayment}
              deletePayment={deletePayment}
              markAsReceived={markAsReceived}
              isLast={index === payments.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  </div>
);