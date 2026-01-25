import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Payment, PaymentInsert, PaymentUpdate } from '../../hooks/usePayments';
import { Client } from '../../hooks/useClients';

interface PaymentFormProps {
  onSubmit: (data: PaymentInsert | PaymentUpdate) => Promise<any>;
  clients: Client[];
  initialData?: Payment;
  trigger?: React.ReactNode;
}

export const PaymentForm = ({ onSubmit, clients, initialData, trigger }: PaymentFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    client_id: initialData?.client_id || (clients[0]?.id || ''),
    amount: initialData?.amount?.toString() || '',
    payment_method: initialData?.payment_method || 'check',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data: PaymentInsert = {
      client_id: formData.client_id,
      amount: parseFloat(formData.amount) || 0,
      payment_method: formData.payment_method as Payment['payment_method'],
      date: new Date().toISOString().split('T')[0],
      reference_number: null,
      notes: null,
    };
    const result = await onSubmit(data);
    if (!result.error) {
      setOpen(false);
      if (!initialData) setFormData({ client_id: clients[0]?.id || '', amount: '', payment_method: 'check' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="gap-2"><Plus className="w-4 h-4" />Record Payment</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialData ? 'Edit Payment' : 'Record Payment'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={formData.client_id} onValueChange={(v) => setFormData({ ...formData, client_id: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
