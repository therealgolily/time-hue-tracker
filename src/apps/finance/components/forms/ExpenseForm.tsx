import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus } from 'lucide-react';
import { Expense, ExpenseInsert, ExpenseUpdate } from '../../hooks/useExpenses';
import { Client } from '../../hooks/useClients';

interface ExpenseFormProps {
  onSubmit: (data: ExpenseInsert | ExpenseUpdate) => Promise<any>;
  clients: Client[];
  initialData?: Expense;
  trigger?: React.ReactNode;
}

export const ExpenseForm = ({ onSubmit, clients, initialData, trigger }: ExpenseFormProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: initialData?.description || '',
    amount: initialData?.amount?.toString() || '',
    category: initialData?.category || 'misc',
    client_id: initialData?.client_id || '',
    recurring: initialData?.recurring || false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data: ExpenseInsert = {
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      category: formData.category as Expense['category'],
      client_id: formData.client_id || null,
      date: new Date().toISOString().split('T')[0],
      recurring: formData.recurring,
    };
    const result = await onSubmit(data);
    if (!result.error) {
      setOpen(false);
      if (!initialData) setFormData({ description: '', amount: '', category: 'misc', client_id: '', recurring: false });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button className="gap-2"><Plus className="w-4 h-4" />Add Expense</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{initialData ? 'Edit Expense' : 'Add Expense'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Amount ($)</Label>
            <Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={formData.category} onValueChange={(v: any) => setFormData({ ...formData, category: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="software">Software</SelectItem>
                <SelectItem value="travel">Travel</SelectItem>
                <SelectItem value="messaging">Messaging</SelectItem>
                <SelectItem value="misc">Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <Label>Recurring Monthly</Label>
            <Switch checked={formData.recurring} onCheckedChange={(c) => setFormData({ ...formData, recurring: c })} />
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
