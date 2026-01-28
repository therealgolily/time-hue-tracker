import { useState } from 'react';
import { Plus, Trash2, Edit2, Percent, Shield, Building, Heart, PiggyBank, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTaxDeductions, TaxDeductionInsert, TaxDeduction } from '../hooks/useTaxDeductions';

const CATEGORY_OPTIONS = [
  { value: 'retirement_401k', label: '401(k) / 403(b)', icon: PiggyBank },
  { value: 'health_insurance', label: 'Health Insurance', icon: Heart },
  { value: 'hsa', label: 'HSA / FSA', icon: Shield },
  { value: 'ira', label: 'Traditional IRA', icon: PiggyBank },
  { value: 'other', label: 'Other', icon: HelpCircle },
];

const getCategoryIcon = (category: string) => {
  const option = CATEGORY_OPTIONS.find(o => o.value === category);
  return option?.icon || HelpCircle;
};

const getCategoryLabel = (category: string) => {
  const option = CATEGORY_OPTIONS.find(o => o.value === category);
  return option?.label || 'Other';
};

interface DeductionFormProps {
  onSubmit: (data: TaxDeductionInsert) => Promise<void>;
  initialData?: TaxDeduction;
  onClose: () => void;
}

const DeductionForm = ({ onSubmit, initialData, onClose }: DeductionFormProps) => {
  const [formData, setFormData] = useState<TaxDeductionInsert>({
    name: initialData?.name || '',
    type: initialData?.type || 'annual',
    amount: initialData?.amount || 0,
    category: initialData?.category || 'retirement_401k',
    reduces_federal: initialData?.reduces_federal ?? true,
    reduces_state: initialData?.reduces_state ?? true,
    reduces_fica: initialData?.reduces_fica ?? false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Deduction Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="e.g., 401(k) Contribution"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Frequency</Label>
          <Select
            value={formData.type}
            onValueChange={(value: 'annual' | 'monthly') => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annual">Annual</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">Amount ({formData.type === 'monthly' ? 'per month' : 'per year'})</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
          required
        />
        {formData.type === 'monthly' && formData.amount > 0 && (
          <p className="text-xs text-muted-foreground">
            = ${(formData.amount * 12).toLocaleString()} annually
          </p>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-border">
        <p className="text-sm font-medium text-foreground">Reduces Taxable Income For:</p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="reduces_federal" className="font-normal">Federal Income Tax</Label>
          </div>
          <Switch
            id="reduces_federal"
            checked={formData.reduces_federal}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reduces_federal: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="reduces_state" className="font-normal">Virginia State Tax</Label>
          </div>
          <Switch
            id="reduces_state"
            checked={formData.reduces_state}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reduces_state: checked }))}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="reduces_fica" className="font-normal">FICA (Social Security/Medicare)</Label>
          </div>
          <Switch
            id="reduces_fica"
            checked={formData.reduces_fica}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, reduces_fica: checked }))}
          />
        </div>
        
        <p className="text-xs text-muted-foreground">
          Note: Most deductions (401k, health insurance) reduce income tax but not FICA.
          HSA contributions through payroll may reduce FICA.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : initialData ? 'Update' : 'Add Deduction'}
        </Button>
      </div>
    </form>
  );
};

export const TaxDeductionsManager = () => {
  const { 
    deductions, 
    loading, 
    addDeduction, 
    updateDeduction, 
    deleteDeduction,
    totalAnnualDeductions,
    federalDeductions,
    stateDeductions,
  } = useTaxDeductions();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<TaxDeduction | null>(null);

  const handleAdd = async (data: TaxDeductionInsert) => {
    await addDeduction(data);
  };

  const handleUpdate = async (data: TaxDeductionInsert) => {
    if (editingDeduction) {
      await updateDeduction(editingDeduction.id, data);
      setEditingDeduction(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <div className="text-muted-foreground">Loading deductions...</div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Tax Deductions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pre-tax deductions that reduce your taxable income
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Deduction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Tax Deduction</DialogTitle>
            </DialogHeader>
            <DeductionForm onSubmit={handleAdd} onClose={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {deductions.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No tax deductions added yet.</p>
          <p className="text-sm mt-1">Add 401(k), health insurance, HSA, or other pre-tax deductions.</p>
        </div>
      ) : (
        <>
          <div className="p-6 space-y-3">
            {deductions.map((deduction) => {
              const Icon = getCategoryIcon(deduction.category);
              const annualAmount = deduction.type === 'monthly' 
                ? Number(deduction.amount) * 12 
                : Number(deduction.amount);

              return (
                <div
                  key={deduction.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{deduction.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{getCategoryLabel(deduction.category)}</span>
                        <span>•</span>
                        <span>
                          ${Number(deduction.amount).toLocaleString()}/{deduction.type === 'monthly' ? 'mo' : 'yr'}
                        </span>
                        {deduction.type === 'monthly' && (
                          <>
                            <span>•</span>
                            <span>${annualAmount.toLocaleString()}/yr</span>
                          </>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        {deduction.reduces_federal && (
                          <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                            Federal
                          </span>
                        )}
                        {deduction.reduces_state && (
                          <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded">
                            State
                          </span>
                        )}
                        {deduction.reduces_fica && (
                          <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded">
                            FICA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-bold text-success mr-4">
                      -${annualAmount.toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingDeduction(deduction)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteDeduction(deduction.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-6 bg-success/10 border-t border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Total Annual Deductions</p>
                <p className="text-sm text-muted-foreground">
                  Reduces Federal by ${federalDeductions.toLocaleString()} • 
                  State by ${stateDeductions.toLocaleString()}
                </p>
              </div>
              <p className="text-2xl font-bold text-success">
                -${totalAnnualDeductions.toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingDeduction} onOpenChange={(open) => !open && setEditingDeduction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tax Deduction</DialogTitle>
          </DialogHeader>
          {editingDeduction && (
            <DeductionForm 
              onSubmit={handleUpdate} 
              initialData={editingDeduction}
              onClose={() => setEditingDeduction(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
