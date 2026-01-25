import { Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientForm } from './forms/ClientForm';
import { useClients, Client } from '../hooks/useClients';
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

export const ClientsManager = () => {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();

  const totalRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_retainer), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Manage your client retainers and payment methods
          </p>
        </div>
        <ClientForm onSubmit={addClient} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="metric-card">
          <p className="metric-label">Total Clients</p>
          <p className="metric-value mt-2">{clients.length}</p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Active Clients</p>
          <p className="metric-value mt-2 revenue-text">
            {clients.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="metric-card">
          <p className="metric-label">Monthly Revenue</p>
          <p className="metric-value mt-2 revenue-text">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {clients.length === 0 ? (
        <div className="bg-card rounded-xl border border-border/50 p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No clients yet</h3>
          <p className="text-muted-foreground mb-4">Add your first client to start tracking revenue.</p>
          <ClientForm onSubmit={addClient} />
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
          <table className="data-table">
            <thead>
              <tr className="bg-muted/30">
                <th>Client</th>
                <th>Monthly Retainer</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
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
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <ClientForm
                        initialData={client}
                        onSubmit={(data) => updateClient(client.id, data)}
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
                            <AlertDialogTitle>Delete client?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {client.name} and all associated payment records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteClient(client.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
