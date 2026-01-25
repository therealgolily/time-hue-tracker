import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { Client, ClientInsert, ClientUpdate } from '../../hooks/useClients';

interface ClientFormProps {
  onSubmit: (data: ClientInsert | ClientUpdate) => Promise<any>;
  initialData?: Client;
  trigger?: React.ReactNode;
}

export const ClientForm = ({ onSubmit, initialData, trigger }: ClientFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    monthly_retainer: initialData?.monthly_retainer?.toString() || '',
    payment_method: initialData?.payment_method || 'check',
    status: initialData?.status || 'active',
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        monthly_retainer: initialData.monthly_retainer?.toString() || '',
        payment_method: initialData.payment_method || 'check',
        status: initialData.status || 'active',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      name: formData.name,
      monthly_retainer: parseFloat(formData.monthly_retainer) || 0,
      payment_method: formData.payment_method as Client['payment_method'],
      status: formData.status as Client['status'],
    };
    const result = await onSubmit(data);
    if (!result.error) {
      setOpen(false);
      if (!initialData) setFormData({ name: '', monthly_retainer: '', payment_method: 'check', status: 'active' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || <Button className="gap-2"><Plus className="w-4 h-4" />Add Client</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialData ? 'Edit Client' : 'Add New Client'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Client Name</Label>
            <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Monthly Retainer ($)</Label>
            <Input type="number" value={formData.monthly_retainer} onChange={(e) => setFormData({ ...formData, monthly_retainer: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={(v: any) => setFormData({ ...formData, payment_method: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                <SelectItem value="quickbooks">QuickBooks</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={loading} className="flex-1">{loading ? 'Saving...' : initialData ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
