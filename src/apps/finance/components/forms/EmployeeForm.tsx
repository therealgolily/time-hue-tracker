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
import { EmployeeInsert, EmployeeUpdate, Employee } from '../../hooks/useEmployees';

interface EmployeeFormProps {
  initialData?: Employee;
  onSubmit: (data: EmployeeInsert | EmployeeUpdate) => Promise<{ error?: string; data?: any }>;
  trigger?: ReactNode;
}

export const EmployeeForm = ({ initialData, onSubmit, trigger }: EmployeeFormProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [salary, setSalary] = useState(initialData?.salary?.toString() || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !salary) return;

    setSubmitting(true);
    const result = await onSubmit({
      name: name.trim(),
      salary: parseFloat(salary),
    });
    setSubmitting(false);

    if (!result.error) {
      setOpen(false);
      if (!initialData) {
        setName('');
        setSalary('');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none">
            <Plus className="w-4 h-4" />
            Add Employee
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="border-2 border-foreground rounded-none">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide">
            {initialData ? 'Edit Employee' : 'Add Employee'}
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
              placeholder="Employee name"
              className="border-2 border-foreground rounded-none"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salary" className="text-xs font-mono uppercase">
              Annual Salary
            </Label>
            <Input
              id="salary"
              type="number"
              step="1"
              min="0"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="48000"
              className="border-2 border-foreground rounded-none"
              required
            />
            <p className="text-xs font-mono text-muted-foreground">
              Enter the annual W-2 salary amount
            </p>
          </div>
          <Button
            type="submit"
            disabled={submitting || !name.trim() || !salary}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none"
          >
            {submitting ? 'Saving...' : initialData ? 'Update' : 'Add Employee'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
