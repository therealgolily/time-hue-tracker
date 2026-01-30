import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Plus, CalendarIcon } from 'lucide-react';
import { Payment, PaymentInsert, PaymentUpdate } from '../../hooks/usePayments';
import { Client } from '../../hooks/useClients';
import { cn } from '@/lib/utils';

interface PaymentFormProps {
  onSubmit: (data: PaymentInsert | PaymentUpdate) => Promise<any>;
  clients: Client[];
  initialData?: Payment;
  trigger?: React.ReactNode;
  defaultStatus?: 'received' | 'pending';
}

export const PaymentForm = ({ onSubmit, clients, initialData, trigger, defaultStatus = 'received' }: PaymentFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || (clients[0]?.id || ''),
    amount: initialData?.amount?.toString() || '',
    payment_method: initialData?.payment_method || 'check',
    status: initialData?.status || defaultStatus,
    date: initialData?.date ? parseISO(initialData.date) : new Date(),
    description: initialData?.description || '',
    reference_number: initialData?.reference_number || '',
  });

  // Reset form when dialog opens
  useEffect(() => {
    if (open && !initialData) {
      setFormData({
        client_id: clients[0]?.id || '',
        amount: '',
        payment_method: 'check',
        status: defaultStatus,
        date: new Date(),
        description: '',
        reference_number: '',
      });
    }
  }, [open, initialData, clients, defaultStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data: PaymentInsert = {
      client_id: formData.client_id,
      amount: parseFloat(formData.amount) || 0,
      payment_method: formData.payment_method as Payment['payment_method'],
      date: format(formData.date, 'yyyy-MM-dd'),
      status: formData.status as Payment['status'],
      description: formData.description || null,
      reference_number: formData.reference_number || null,
      notes: null,
    };
    const result = await onSubmit(data);
    if (!result.error) {
      setOpen(false);
    }
    setLoading(false);
  };

  const isPending = formData.status === 'pending';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="gap-2"><Plus className="w-4 h-4" />Record Payment</Button>}
      </DialogTrigger>
      <DialogContent className="border-2 border-foreground rounded-none">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide">
            {initialData ? 'Edit Payment' : isPending ? 'Add Expected Payment' : 'Record Payment'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Status Toggle */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase">Status</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.status === 'received' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 rounded-none border-2 border-foreground",
                  formData.status === 'received' && "bg-primary text-primary-foreground"
                )}
                onClick={() => setFormData({ ...formData, status: 'received' })}
              >
                RECEIVED
              </Button>
              <Button
                type="button"
                variant={formData.status === 'pending' ? 'default' : 'outline'}
                className={cn(
                  "flex-1 rounded-none border-2 border-foreground",
                  formData.status === 'pending' && "bg-chart-4 text-foreground"
                )}
                onClick={() => setFormData({ ...formData, status: 'pending' })}
              >
                EXPECTED
              </Button>
            </div>
          </div>

          {/* Client */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase">Client</Label>
            <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v })}>
              <SelectTrigger className="rounded-none border-2 border-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase">Amount ($)</Label>
            <Input 
              type="number" 
              value={formData.amount} 
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
              className="rounded-none border-2 border-foreground"
              required 
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase">
              {isPending ? 'Expected Date' : 'Payment Date'}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-none border-2 border-foreground",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description (especially useful for one-time payments) */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase">Description (optional)</Label>
            <Input 
              value={formData.description} 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              placeholder={isPending ? "e.g., Q4 bonus payment" : "e.g., Monthly retainer"}
              className="rounded-none border-2 border-foreground"
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-xs font-mono uppercase">Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={(v) => setFormData({ ...formData, payment_method: v as Payment['payment_method'] })}>
              <SelectTrigger className="rounded-none border-2 border-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                <SelectItem value="quickbooks">QuickBooks</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reference Number */}
          {formData.status === 'received' && (
            <div className="space-y-2">
              <Label className="text-xs font-mono uppercase">Reference # (optional)</Label>
              <Input 
                value={formData.reference_number} 
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })} 
                placeholder="Check # or transaction ID"
                className="rounded-none border-2 border-foreground"
              />
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)} 
              className="flex-1 rounded-none border-2 border-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 rounded-none"
            >
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
