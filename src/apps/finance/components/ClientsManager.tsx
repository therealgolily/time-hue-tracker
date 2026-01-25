import { Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClientForm } from './forms/ClientForm';
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

export const ClientsManager = () => {
  const { clients, loading, addClient, updateClient, deleteClient } = useClients();

  const totalRevenue = clients
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + Number(c.monthly_retainer), 0);

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
      <div className="flex items-center justify-between border-b-2 border-foreground pb-4">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight">Clients</h2>
          <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
            Manage retainers & payment methods
          </p>
        </div>
        <ClientForm onSubmit={addClient} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
        <div className="border-2 border-foreground border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Clients</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">{clients.length}</p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Active</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            {clients.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Monthly Revenue</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      {clients.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">No Clients</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase mb-4">
            Add your first client to start tracking
          </p>
          <ClientForm onSubmit={addClient} />
        </div>
      ) : (
        <div className="border-2 border-foreground overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-foreground bg-muted/30">
                <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Client</th>
                <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Retainer</th>
                <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Method</th>
                <th className="text-center p-3 text-xs font-mono uppercase tracking-widest">Status</th>
                <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Actions</th>
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
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <ClientForm
                        initialData={client}
                        onSubmit={(data) => updateClient(client.id, data)}
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
                            <AlertDialogTitle className="uppercase tracking-wide">Delete Client?</AlertDialogTitle>
                            <AlertDialogDescription className="font-mono text-sm">
                              This will permanently delete {client.name} and all associated records.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-2 border-foreground rounded-none">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteClient(client.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};