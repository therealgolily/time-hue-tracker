import { useState, ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ContractorInsert, ContractorUpdate, Contractor } from '../../hooks/useContractors';

interface ContractorFormProps {
  initialData?: Contractor;
  onSubmit: (data: ContractorInsert | ContractorUpdate) => Promise<{ error?: string; data?: any }>;
  trigger?: ReactNode;
}

export const ContractorForm = ({ initialData, onSubmit, trigger }: ContractorFormProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [monthlyPay, setMonthlyPay] = useState(initialData?.monthly_pay?.toString() || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !monthlyPay) return;

    setSubmitting(true);
    const result = await onSubmit({
      name: name.trim(),
      monthly_pay: parseFloat(monthlyPay),
    });
    setSubmitting(false);

    if (!result.error) {
      setOpen(false);
      if (!initialData) {
        setName('');
        setMonthlyPay('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
            <Plus className="w-4 h-4" />
            Add Contractor
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-2 border-foreground rounded-none">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide">
            {initialData ? 'Edit Contractor' : 'Add Contractor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-mono uppercase">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contractor name"
              className="border-2 border-foreground rounded-none"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly_pay" className="text-xs font-mono uppercase">
              Monthly Pay
            </Label>
            <Input
              id="monthly_pay"
              type="number"
              step="0.01"
              min="0"
              value={monthlyPay}
              onChange={(e) => setMonthlyPay(e.target.value)}
              placeholder="0.00"
              className="border-2 border-foreground rounded-none"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={submitting || !name.trim() || !monthlyPay}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
          >
            {submitting ? 'Saving...' : initialData ? 'Update' : 'Add Contractor'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
