import { format } from 'date-fns';
import { Users, Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useContractors, ContractorInsert, ContractorUpdate } from '../hooks/useContractors';
import { ContractorForm } from './forms/ContractorForm';
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

export const ContractorsManager = () => {
  const { contractors, loading, addContractor, updateContractor, deleteContractor, totalMonthlyPay } = useContractors();

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
          <h2 className="text-2xl font-bold uppercase tracking-tight">Contractors</h2>
          <p className="text-sm font-mono text-muted-foreground uppercase mt-1">
            Manage contractor payments
          </p>
        </div>
        <ContractorForm onSubmit={addContractor} />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
        <div className="border-2 border-foreground border-r-0 sm:border-r-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Total Contractors</p>
          <p className="text-2xl font-bold mt-2 tabular-nums">
            {contractors.length}
          </p>
        </div>
        <div className="border-2 border-foreground border-t-0 sm:border-t-2 p-4">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Monthly Pay</p>
          <p className="text-2xl font-bold mt-2 tabular-nums text-primary">
            ${totalMonthlyPay.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Table */}
      {contractors.length === 0 ? (
        <div className="border-2 border-foreground p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-bold uppercase mb-2">No Contractors</h3>
          <p className="text-sm font-mono text-muted-foreground uppercase mb-4">
            Add your first contractor
          </p>
          <ContractorForm onSubmit={addContractor} />
        </div>
      ) : (
        <div className="border-2 border-foreground overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-foreground bg-muted/30">
                  <th className="text-left p-3 text-xs font-mono uppercase tracking-widest">Name</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Monthly Pay</th>
                  <th className="text-right p-3 text-xs font-mono uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contractors.map((contractor, index) => (
                  <tr
                    key={contractor.id}
                    className={index < contractors.length - 1 ? "border-b border-foreground/30" : ""}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="font-bold">{contractor.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold tabular-nums text-primary">
                      ${Number(contractor.monthly_pay).toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <ContractorForm
                          initialData={contractor}
                          onSubmit={(data) => updateContractor(contractor.id, data)}
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
                              <AlertDialogTitle className="uppercase tracking-wide">Delete Contractor?</AlertDialogTitle>
                              <AlertDialogDescription className="font-mono text-sm">
                                This will permanently delete {contractor.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="border-2 border-foreground rounded-none">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteContractor(contractor.id)}
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
        </div>
      )}
    </div>
  );
};
