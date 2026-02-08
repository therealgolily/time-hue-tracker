import { useState, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PayrollTaxCollection, PayrollTaxCollectionInsert } from '../../hooks/usePayrollTaxCollections';
import { format } from 'date-fns';

interface PayrollTaxFormProps {
  initialData?: PayrollTaxCollection;
  onSubmit: (data: PayrollTaxCollectionInsert) => Promise<any>;
  trigger?: ReactNode;
}

export const PayrollTaxForm = ({ initialData, onSubmit, trigger }: PayrollTaxFormProps) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const [formData, setFormData] = useState({
    transaction_id: initialData?.transaction_id || '',
    transaction_date: initialData?.transaction_date || today,
    payroll_check_date: initialData?.payroll_check_date || today,
    federal_income_tax: initialData?.federal_income_tax?.toString() || '',
    social_security_employee: initialData?.social_security_employee?.toString() || '',
    medicare_employee: initialData?.medicare_employee?.toString() || '',
    state_income_tax: initialData?.state_income_tax?.toString() || '',
    social_security_employer: initialData?.social_security_employer?.toString() || '',
    medicare_employer: initialData?.medicare_employer?.toString() || '',
    state_unemployment: initialData?.state_unemployment?.toString() || '',
    federal_unemployment: initialData?.federal_unemployment?.toString() || '',
    notes: initialData?.notes || '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const employeeSubtotal =
    (parseFloat(formData.federal_income_tax) || 0) +
    (parseFloat(formData.social_security_employee) || 0) +
    (parseFloat(formData.medicare_employee) || 0) +
    (parseFloat(formData.state_income_tax) || 0);

  const employerSubtotal =
    (parseFloat(formData.social_security_employer) || 0) +
    (parseFloat(formData.medicare_employer) || 0) +
    (parseFloat(formData.state_unemployment) || 0) +
    (parseFloat(formData.federal_unemployment) || 0);

  const total = employeeSubtotal + employerSubtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.transaction_date || !formData.payroll_check_date) return;

    setSubmitting(true);
    try {
      await onSubmit({
        transaction_id: formData.transaction_id || null,
        transaction_date: formData.transaction_date,
        payroll_check_date: formData.payroll_check_date,
        federal_income_tax: parseFloat(formData.federal_income_tax) || 0,
        social_security_employee: parseFloat(formData.social_security_employee) || 0,
        medicare_employee: parseFloat(formData.medicare_employee) || 0,
        state_income_tax: parseFloat(formData.state_income_tax) || 0,
        social_security_employer: parseFloat(formData.social_security_employer) || 0,
        medicare_employer: parseFloat(formData.medicare_employer) || 0,
        state_unemployment: parseFloat(formData.state_unemployment) || 0,
        federal_unemployment: parseFloat(formData.federal_unemployment) || 0,
        notes: formData.notes || null,
      });
      setOpen(false);
      if (!initialData) {
        setFormData({
          transaction_id: '',
          transaction_date: today,
          payroll_check_date: today,
          federal_income_tax: '',
          social_security_employee: '',
          medicare_employee: '',
          state_income_tax: '',
          social_security_employer: '',
          medicare_employer: '',
          state_unemployment: '',
          federal_unemployment: '',
          notes: '',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const CurrencyInput = ({ label, field, value }: { label: string; field: string; value: string }) => (
    <div className="space-y-1">
      <Label htmlFor={field} className="text-xs font-mono uppercase">
        {label}
      </Label>
      <Input
        id={field}
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => updateField(field, e.target.value)}
        placeholder="0.00"
        className="border-2 border-foreground rounded-none"
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
            <Plus className="w-4 h-4" />
            Add Tax Collection
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-2 border-foreground rounded-none max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide">
            {initialData ? 'Edit Tax Collection' : 'Add Tax Collection'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Transaction Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="transaction_id" className="text-xs font-mono uppercase">
                Transaction ID
              </Label>
              <Input
                id="transaction_id"
                value={formData.transaction_id}
                onChange={(e) => updateField('transaction_id', e.target.value)}
                placeholder="12664074"
                className="border-2 border-foreground rounded-none"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="transaction_date" className="text-xs font-mono uppercase">
                Transaction Date *
              </Label>
              <Input
                id="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={(e) => updateField('transaction_date', e.target.value)}
                className="border-2 border-foreground rounded-none"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="payroll_check_date" className="text-xs font-mono uppercase">
                Payroll Check Date *
              </Label>
              <Input
                id="payroll_check_date"
                type="date"
                value={formData.payroll_check_date}
                onChange={(e) => updateField('payroll_check_date', e.target.value)}
                className="border-2 border-foreground rounded-none"
                required
              />
            </div>
          </div>

          {/* Employee Taxes */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b-2 border-foreground pb-1">
              <h3 className="text-sm font-bold uppercase tracking-wide">Employee Taxes</h3>
              <span className="font-mono text-sm">${employeeSubtotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CurrencyInput label="Federal Income Tax" field="federal_income_tax" value={formData.federal_income_tax} />
              <CurrencyInput label="Social Security" field="social_security_employee" value={formData.social_security_employee} />
              <CurrencyInput label="Medicare" field="medicare_employee" value={formData.medicare_employee} />
              <CurrencyInput label="State Income Tax (VA)" field="state_income_tax" value={formData.state_income_tax} />
            </div>
          </div>

          {/* Employer Taxes */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b-2 border-foreground pb-1">
              <h3 className="text-sm font-bold uppercase tracking-wide">Employer Taxes</h3>
              <span className="font-mono text-sm">${employerSubtotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <CurrencyInput label="Employer Social Security" field="social_security_employer" value={formData.social_security_employer} />
              <CurrencyInput label="Employer Medicare" field="medicare_employer" value={formData.medicare_employer} />
              <CurrencyInput label="State Unemployment (SUTA)" field="state_unemployment" value={formData.state_unemployment} />
              <CurrencyInput label="Federal Unemployment (FUTA)" field="federal_unemployment" value={formData.federal_unemployment} />
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t-2 border-b-2 border-foreground py-2">
            <span className="font-bold uppercase tracking-wide">Total</span>
            <span className="font-mono text-lg font-bold">${total.toFixed(2)}</span>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes" className="text-xs font-mono uppercase">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Optional notes..."
              className="border-2 border-foreground rounded-none"
              rows={2}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
          >
            {submitting ? 'Saving...' : initialData ? 'Update' : 'Add Tax Collection'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
