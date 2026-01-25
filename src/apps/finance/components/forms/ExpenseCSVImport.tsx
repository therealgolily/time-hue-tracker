import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { Client } from '../../hooks/useClients';
import { ExpenseInsert } from '../../hooks/useExpenses';

interface ExpenseCSVImportProps {
  clients: Client[];
  onImport: (expenses: ExpenseInsert[]) => Promise<void>;
}

export const ExpenseCSVImport = ({ clients, onImport }: ExpenseCSVImportProps) => {
  return (
    <Button variant="outline" className="gap-2" disabled>
      <Upload className="w-4 h-4" />
      Import CSV
    </Button>
  );
};
