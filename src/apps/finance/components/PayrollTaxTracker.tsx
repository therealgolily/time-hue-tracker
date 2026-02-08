import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { usePayrollTaxCollections, PayrollTaxCollection } from '../hooks/usePayrollTaxCollections';
import { PayrollTaxForm } from './forms/PayrollTaxForm';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const PayrollTaxTracker = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { collections, loading, totals, addCollection, updateCollection, deleteCollection } = usePayrollTaxCollections(selectedYear);

  const handleYearChange = (delta: number) => {
    setSelectedYear(prev => prev + delta);
  };

  return (
    <div className="space-y-6">
      {/* Year Selector & Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleYearChange(-1)}
            className="rounded-none border-2 border-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-mono text-lg font-bold px-4">{selectedYear}</span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleYearChange(1)}
            className="rounded-none border-2 border-foreground"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <PayrollTaxForm onSubmit={addCollection} />
      </div>

      {/* YTD Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 border-foreground rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">
              Employee Taxes Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(totals.employeeTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Federal Income</span>
                <span className="font-mono">{formatCurrency(totals.federalIncomeTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Social Security</span>
                <span className="font-mono">{formatCurrency(totals.socialSecurityEmployee)}</span>
              </div>
              <div className="flex justify-between">
                <span>Medicare</span>
                <span className="font-mono">{formatCurrency(totals.medicareEmployee)}</span>
              </div>
              <div className="flex justify-between">
                <span>State Income (VA)</span>
                <span className="font-mono">{formatCurrency(totals.stateIncomeTax)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-foreground rounded-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">
              Employer Taxes Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(totals.employerTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <div className="flex justify-between">
                <span>Social Security</span>
                <span className="font-mono">{formatCurrency(totals.socialSecurityEmployer)}</span>
              </div>
              <div className="flex justify-between">
                <span>Medicare</span>
                <span className="font-mono">{formatCurrency(totals.medicareEmployer)}</span>
              </div>
              <div className="flex justify-between">
                <span>SUTA (VA)</span>
                <span className="font-mono">{formatCurrency(totals.stateUnemployment)}</span>
              </div>
              <div className="flex justify-between">
                <span>FUTA</span>
                <span className="font-mono">{formatCurrency(totals.federalUnemployment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-foreground rounded-none bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-mono uppercase text-muted-foreground">
              Total YTD Taxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{formatCurrency(totals.grandTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {totals.collectionCount} payroll run{totals.collectionCount !== 1 ? 's' : ''} recorded
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collections Table */}
      <Card className="border-2 border-foreground rounded-none">
        <CardHeader>
          <CardTitle className="text-sm font-mono uppercase">Tax Collection History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : collections.length === 0 ? (
            <p className="text-muted-foreground text-sm">No tax collections recorded for {selectedYear}.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-mono text-xs uppercase">Date</TableHead>
                    <TableHead className="font-mono text-xs uppercase">TX ID</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Employee</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Employer</TableHead>
                    <TableHead className="font-mono text-xs uppercase text-right">Total</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collections.map((collection) => {
                    const employeeTotal =
                      Number(collection.federal_income_tax) +
                      Number(collection.social_security_employee) +
                      Number(collection.medicare_employee) +
                      Number(collection.state_income_tax);
                    const employerTotal =
                      Number(collection.social_security_employer) +
                      Number(collection.medicare_employer) +
                      Number(collection.state_unemployment) +
                      Number(collection.federal_unemployment);
                    const total = employeeTotal + employerTotal;

                    return (
                      <TableRow key={collection.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(collection.transaction_date), 'MM/dd/yyyy')}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {collection.transaction_id || '-'}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right">
                          {formatCurrency(employeeTotal)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right">
                          {formatCurrency(employerTotal)}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-right font-medium">
                          {formatCurrency(total)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <PayrollTaxForm
                              initialData={collection}
                              onSubmit={(data) => updateCollection(collection.id, data)}
                              trigger={
                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                  <Pencil className="w-3 h-3" />
                                </Button>
                              }
                            />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="border-2 border-foreground rounded-none">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Tax Collection</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this tax collection record? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="rounded-none">Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteCollection(collection.id)}
                                    className="rounded-none bg-destructive text-destructive-foreground"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
