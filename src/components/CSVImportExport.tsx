import { useRef, useState } from 'react';
import { Download, Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DayData, TimeEntry } from '@/types/timeTracker';
import { generateCSVTemplate, exportEntriesToCSV, parseCSV, downloadCSV } from '@/lib/csvUtils';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface CSVImportExportProps {
  getDayData: (date: Date) => DayData;
  allData: Record<string, DayData>;
  onImportEntries: (entries: { date: string; entry: Omit<TimeEntry, 'id'> }[]) => Promise<void>;
}

export const CSVImportExport = ({ getDayData, allData, onImportEntries }: CSVImportExportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: string[];
  } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleDownloadTemplate = () => {
    const template = generateCSVTemplate();
    downloadCSV(template, 'time-entries-template.csv');
    toast.success('Template downloaded');
  };

  const handleExportData = () => {
    const allEntries: { date: string; entry: TimeEntry }[] = [];
    
    Object.entries(allData).forEach(([date, dayData]) => {
      dayData.entries.forEach(entry => {
        allEntries.push({ date, entry });
      });
    });

    if (allEntries.length === 0) {
      toast.error('No entries to export');
      return;
    }

    // Sort by date and time
    allEntries.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.entry.startTime.getTime() - b.entry.startTime.getTime();
    });

    const csv = exportEntriesToCSV(allEntries);
    downloadCSV(csv, `time-entries-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast.success(`Exported ${allEntries.length} entries`);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportDialogOpen(true);
    setImportResults(null);

    try {
      const content = await file.text();
      const { entries, errors } = parseCSV(content);

      if (entries.length === 0 && errors.length > 0) {
        setImportResults({ success: 0, errors });
        setIsImporting(false);
        return;
      }

      // Import entries
      const entriesToImport = entries.map(entry => ({
        date: entry.date,
        entry: {
          startTime: entry.startTime,
          endTime: entry.endTime,
          description: entry.description,
          energyLevel: entry.energyLevel,
          category: entry.category,
          client: entry.client,
          customClient: entry.customClient,
        },
      }));

      await onImportEntries(entriesToImport);

      setImportResults({
        success: entries.length,
        errors,
      });
    } catch (err) {
      setImportResults({
        success: 0,
        errors: ['Failed to read file'],
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTemplate}
          className="gap-2"
        >
          <FileText className="w-4 h-4" />
          Download Template
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportData}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          Export All
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Import CSV
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Import Results</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {isImporting ? 'Importing entries...' : 'Import complete'}
            </DialogDescription>
          </DialogHeader>

          {isImporting ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : importResults && (
            <div className="space-y-4">
              {importResults.success > 0 && (
                <div className="flex items-center gap-2 text-energy-positive">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Successfully imported {importResults.success} entries</span>
                </div>
              )}

              {importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-energy-negative">
                    <AlertCircle className="w-5 h-5" />
                    <span>{importResults.errors.length} errors</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto bg-secondary rounded-lg p-3 text-sm space-y-1">
                    {importResults.errors.map((error, i) => (
                      <p key={i} className="text-muted-foreground">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => setImportDialogOpen(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
