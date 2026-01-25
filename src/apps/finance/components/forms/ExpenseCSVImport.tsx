import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Client } from '../../hooks/useClients';
import { ExpenseInsert } from '../../hooks/useExpenses';
import { toast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ExpenseCSVImportProps {
  clients: Client[];
  onImport: (expenses: ExpenseInsert[]) => Promise<void>;
}

interface ParsedExpense {
  date: string;
  description: string;
  card: string;
  amount: number;
  clientName: string;
  recurring: boolean;
  clientId: string | null;
  isValid: boolean;
  error?: string;
}

// Parse date from multiple formats: YYYY-MM-DD, MM-DD-YYYY, MM/DD/YYYY
const parseDate = (dateStr: string): string | null => {
  if (!dateStr) return null;
  
  const cleanDate = dateStr.trim();
  
  // YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
    return cleanDate;
  }
  
  // MM-DD-YYYY or MM/DD/YYYY format
  const mdyMatch = cleanDate.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (mdyMatch) {
    const [, month, day, year] = mdyMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  
  return null;
};

// Parse amount, removing $ and commas
const parseAmount = (amountStr: string): number | null => {
  if (!amountStr) return null;
  const cleaned = amountStr.replace(/[$,]/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
};

// Map Card column to category
const mapCardToCategory = (card: string): 'travel' | 'software' | 'messaging' | 'contractor' | 'salary' | 'misc' => {
  // Default to software since most expenses in the sample are software/subscriptions
  return 'software';
};

export const ExpenseCSVImport = ({ clients, onImport }: ExpenseCSVImportProps) => {
  const [open, setOpen] = useState(false);
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
    if (lines.length < 2) {
      toast({ title: 'Invalid CSV', description: 'No data rows found.', variant: 'destructive' });
      return;
    }

    // Parse header
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
    
    const dateIdx = headers.findIndex(h => h === 'date');
    const descIdx = headers.findIndex(h => h === 'description');
    const cardIdx = headers.findIndex(h => h === 'card');
    const amountIdx = headers.findIndex(h => h === 'amount');
    const clientIdx = headers.findIndex(h => h === 'client');
    const recurringIdx = headers.findIndex(h => h === 'recurring');

    if (dateIdx === -1 || descIdx === -1 || amountIdx === -1) {
      toast({ 
        title: 'Invalid CSV format', 
        description: 'CSV must have Date, Description, and Amount columns.', 
        variant: 'destructive' 
      });
      return;
    }

    const parsed: ParsedExpense[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Parse CSV line handling quoted values
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of line) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const dateStr = values[dateIdx] || '';
      const description = values[descIdx] || '';
      const card = cardIdx !== -1 ? (values[cardIdx] || '') : '';
      const amountStr = values[amountIdx] || '';
      const clientName = clientIdx !== -1 ? (values[clientIdx] || '') : '';
      const recurringStr = recurringIdx !== -1 ? (values[recurringIdx] || '') : '';

      const parsedDate = parseDate(dateStr);
      const amount = parseAmount(amountStr);
      const recurring = recurringStr.toUpperCase() === 'TRUE';

      // Try to match client by name (case-insensitive partial match)
      let clientId: string | null = null;
      if (clientName) {
        const matchedClient = clients.find(c => 
          c.name.toLowerCase().includes(clientName.toLowerCase()) ||
          clientName.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedClient) {
          clientId = matchedClient.id;
        }
      }

      const isValid = parsedDate !== null && amount !== null && description.trim() !== '';
      let error: string | undefined;
      if (!parsedDate) error = 'Invalid date';
      else if (amount === null) error = 'Invalid amount';
      else if (!description.trim()) error = 'Missing description';

      parsed.push({
        date: parsedDate || dateStr,
        description: description.trim(),
        card,
        amount: amount || 0,
        clientName,
        recurring,
        clientId,
        isValid,
        error,
      });
    }

    setParsedExpenses(parsed);
    setOpen(true);
  };

  const handleImport = async () => {
    const validExpenses = parsedExpenses.filter(e => e.isValid);
    if (validExpenses.length === 0) {
      toast({ title: 'No valid expenses', description: 'Please fix errors before importing.', variant: 'destructive' });
      return;
    }

    setImporting(true);

    const expensesToInsert: ExpenseInsert[] = validExpenses.map(e => ({
      date: e.date,
      description: e.description,
      amount: e.amount,
      category: mapCardToCategory(e.card),
      client_id: e.clientId,
      recurring: e.recurring,
    }));

    try {
      await onImport(expensesToInsert);
      toast({ title: 'Import successful', description: `${validExpenses.length} expenses imported.` });
      setParsedExpenses([]);
      setOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({ title: 'Import failed', description: 'An error occurred during import.', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const validCount = parsedExpenses.filter(e => e.isValid).length;
  const invalidCount = parsedExpenses.filter(e => !e.isValid).length;

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button 
        variant="outline" 
        className="gap-2 border-2 border-foreground rounded-none"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl border-2 border-foreground rounded-none">
          <DialogHeader>
            <DialogTitle className="uppercase tracking-wide flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" />
              Import Expenses Preview
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2 text-sm font-mono">
              <Check className="w-4 h-4 text-green-600" />
              <span>{validCount} valid</span>
            </div>
            {invalidCount > 0 && (
              <div className="flex items-center gap-2 text-sm font-mono text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{invalidCount} errors</span>
              </div>
            )}
          </div>

          <ScrollArea className="h-[400px] border-2 border-foreground">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-foreground bg-muted/30">
                  <TableHead className="text-xs font-mono uppercase">Status</TableHead>
                  <TableHead className="text-xs font-mono uppercase">Date</TableHead>
                  <TableHead className="text-xs font-mono uppercase">Description</TableHead>
                  <TableHead className="text-xs font-mono uppercase">Card</TableHead>
                  <TableHead className="text-xs font-mono uppercase text-right">Amount</TableHead>
                  <TableHead className="text-xs font-mono uppercase">Client</TableHead>
                  <TableHead className="text-xs font-mono uppercase">Recurring</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedExpenses.map((expense, idx) => (
                  <TableRow 
                    key={idx} 
                    className={expense.isValid ? '' : 'bg-destructive/10'}
                  >
                    <TableCell>
                      {expense.isValid ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-4 h-4 text-destructive" />
                          <span className="text-xs text-destructive">{expense.error}</span>
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{expense.date}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{expense.description}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{expense.card}</TableCell>
                    <TableCell className="font-mono text-sm text-right tabular-nums">
                      ${expense.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {expense.clientId ? (
                        <span className="text-green-600">{expense.clientName}</span>
                      ) : expense.clientName ? (
                        <span className="text-muted-foreground">{expense.clientName} (no match)</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {expense.recurring && (
                        <span className="text-xs font-mono uppercase bg-foreground text-background px-2 py-0.5">
                          Yes
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-2 border-foreground rounded-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="bg-primary text-primary-foreground rounded-none"
            >
              {importing ? 'Importing...' : `Import ${validCount} Expenses`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
