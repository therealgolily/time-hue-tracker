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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ContractorInsert, ContractorUpdate, Contractor } from '../../hooks/useContractors';

interface ContractorFormProps {
  initialData?: Contractor;
  onSubmit: (data: ContractorInsert | ContractorUpdate) => Promise<{ error?: string; data?: any }>;
  trigger?: ReactNode;
}

export const ContractorForm = ({ initialData, onSubmit, trigger }: ContractorFormProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [payType, setPayType] = useState<'monthly' | 'hourly'>(initialData?.pay_type || 'monthly');
  const [monthlyPay, setMonthlyPay] = useState(initialData?.monthly_pay?.toString() || '');
  const [hourlyRate, setHourlyRate] = useState(initialData?.hourly_rate?.toString() || '');
  const [hoursPerWeek, setHoursPerWeek] = useState(initialData?.hours_per_week?.toString() || '');
  const [submitting, setSubmitting] = useState(false);

  const isValid = name.trim() && (
    (payType === 'monthly' && monthlyPay) ||
    (payType === 'hourly' && hourlyRate && hoursPerWeek)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    const result = await onSubmit({
      name: name.trim(),
      pay_type: payType,
      monthly_pay: payType === 'monthly' ? parseFloat(monthlyPay) : 0,
      hourly_rate: payType === 'hourly' ? parseFloat(hourlyRate) : 0,
      hours_per_week: payType === 'hourly' ? parseFloat(hoursPerWeek) : 0,
    });
    setSubmitting(false);

    if (!result.error) {
      setOpen(false);
      if (!initialData) {
        setName('');
        setPayType('monthly');
        setMonthlyPay('');
        setHourlyRate('');
        setHoursPerWeek('');
      }
    }
  };

  const calculatedMonthly = payType === 'hourly' && hourlyRate && hoursPerWeek
    ? (parseFloat(hourlyRate) * parseFloat(hoursPerWeek) * 4.33).toFixed(2)
    : null;

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
            <Label htmlFor="pay_type" className="text-xs font-mono uppercase">
              Pay Type
            </Label>
            <Select value={payType} onValueChange={(v) => setPayType(v as 'monthly' | 'hourly')}>
              <SelectTrigger className="border-2 border-foreground rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly Rate</SelectItem>
                <SelectItem value="hourly">Hourly Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {payType === 'monthly' ? (
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
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="hourly_rate" className="text-xs font-mono uppercase">
                  Hourly Rate ($)
                </Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  placeholder="0.00"
                  className="border-2 border-foreground rounded-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours_per_week" className="text-xs font-mono uppercase">
                  Hours per Week
                </Label>
                <Input
                  id="hours_per_week"
                  type="number"
                  step="0.5"
                  min="0"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  placeholder="0"
                  className="border-2 border-foreground rounded-none"
                  required
                />
              </div>
              {calculatedMonthly && (
                <div className="p-3 bg-muted/30 border-2 border-foreground">
                  <p className="text-xs font-mono uppercase text-muted-foreground">
                    Estimated Monthly
                  </p>
                  <p className="text-lg font-bold text-primary tabular-nums">
                    ${parseFloat(calculatedMonthly).toLocaleString()}
                  </p>
                </div>
              )}
            </>
          )}

          <Button
            type="submit"
            disabled={submitting || !isValid}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
          >
            {submitting ? 'Saving...' : initialData ? 'Update' : 'Add Contractor'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
