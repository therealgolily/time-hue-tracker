import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { RecurringFrequency, Expense } from "../types";
import { toast } from "@/hooks/use-toast";

interface ParsedExpense {
  date: string;
  description: string;
  amount: number;
}

interface ExpenseCSVImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (expenses: Omit<Expense, "id">[]) => void;
}

const EXPENSE_CATEGORIES = [
  "Housing",
  "Utilities",
  "Insurance",
  "Subscriptions",
  "Transportation",
  "Food",
  "Healthcare",
  "Entertainment",
  "Personal",
  "Other",
];

const parseDate = (dateStr: string): { day: number; valid: boolean } => {
  // Try MM/DD/YYYY, YYYY-MM-DD, or MM-DD-YYYY
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,  // MM/DD/YYYY
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,     // YYYY-MM-DD
    /^(\d{1,2})-(\d{1,2})-(\d{4})$/,     // MM-DD-YYYY
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      // Extract day based on format
      if (format === formats[1]) {
        // YYYY-MM-DD
        return { day: parseInt(match[3]), valid: true };
      } else {
        // MM/DD/YYYY or MM-DD-YYYY
        return { day: parseInt(match[2]), valid: true };
      }
    }
  }
  return { day: 1, valid: false };
};

const parseCSV = (text: string): ParsedExpense[] => {
  const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
  const expenses: ParsedExpense[] = [];

  // Skip header if present
  const startIndex = lines[0]?.toLowerCase().includes('date') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields and commas
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());

    if (parts.length >= 3) {
      const amount = parseFloat(parts[2].replace(/[$,]/g, ''));
      if (!isNaN(amount)) {
        expenses.push({
          date: parts[0],
          description: parts[1],
          amount: Math.abs(amount),
        });
      }
    }
  }

  return expenses;
};

export const ExpenseCSVImport: React.FC<ExpenseCSVImportProps> = ({ open, onClose, onImport }) => {
  const [parsedExpenses, setParsedExpenses] = useState<ParsedExpense[]>([]);
  const [category, setCategory] = useState("Other");
  const [recurringFrequency, setRecurringFrequency] = useState<RecurringFrequency>("monthly");
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const expenses = parseCSV(text);
      setParsedExpenses(expenses);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (parsedExpenses.length === 0) {
      toast({
        title: "No expenses to import",
        description: "Please upload a valid CSV file.",
        variant: "destructive",
      });
      return;
    }

    const expensesToImport: Omit<Expense, "id">[] = parsedExpenses.map((exp) => {
      const { day } = parseDate(exp.date);
      return {
        name: exp.description,
        category,
        amount: exp.amount,
        dueDay: day >= 1 && day <= 31 ? day : undefined,
        isRecurring: recurringFrequency !== "none",
        recurringFrequency,
      };
    });

    onImport(expensesToImport);
    toast({
      title: "Expenses imported",
      description: `Successfully imported ${expensesToImport.length} expenses.`,
    });
    handleClose();
  };

  const handleClose = () => {
    setParsedExpenses([]);
    setFileName("");
    setCategory("Other");
    setRecurringFrequency("monthly");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  const totalAmount = parsedExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import Expenses from CSV
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>CSV File</Label>
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                {fileName || "Choose CSV file"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Expected columns: date, description, amount
            </p>
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label>Category for all imported expenses</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recurring Frequency */}
          <div className="space-y-2">
            <Label>Recurring Frequency</Label>
            <Select value={recurringFrequency} onValueChange={(v) => setRecurringFrequency(v as RecurringFrequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="none">One-time (not recurring)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How often these expenses repeat
            </p>
          </div>

          {/* Preview */}
          {parsedExpenses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Preview ({parsedExpenses.length} expenses)
                </Label>
                <span className="text-sm font-mono font-semibold">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="max-h-[200px] overflow-y-auto border rounded-lg p-2 space-y-1">
                {parsedExpenses.slice(0, 10).map((exp, idx) => (
                  <div key={idx} className="flex justify-between text-sm py-1 px-2 bg-muted/50 rounded">
                    <span className="truncate flex-1">{exp.description}</span>
                    <span className="font-mono ml-2">${exp.amount.toFixed(2)}</span>
                  </div>
                ))}
                {parsedExpenses.length > 10 && (
                  <p className="text-xs text-center text-muted-foreground py-1">
                    ... and {parsedExpenses.length - 10} more
                  </p>
                )}
              </div>
            </div>
          )}

          {fileName && parsedExpenses.length === 0 && (
            <div className="flex items-center gap-2 text-amber-600 text-sm">
              <AlertCircle className="h-4 w-4" />
              No valid expenses found in the file
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={parsedExpenses.length === 0}>
            Import {parsedExpenses.length > 0 ? `${parsedExpenses.length} Expenses` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
