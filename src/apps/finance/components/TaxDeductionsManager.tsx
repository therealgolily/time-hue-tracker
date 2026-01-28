import { useState, useEffect } from 'react';
import { DollarSign, PiggyBank, Heart, Shield, Building, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the structure for tax deductions (matches scenario pattern)
export interface TaxDeductionConfig {
  enabled: boolean;
  amount: number;
  label: string;
  description: string;
  reducesFederal: boolean;
  reducesState: boolean;
  reducesFica: boolean;
}

export interface TaxDeductionsConfig {
  [key: string]: TaxDeductionConfig;
}

// Default tax deductions with 2024 IRS limits as placeholders
export const getDefaultTaxDeductions = (): TaxDeductionsConfig => ({
  traditional401k: {
    enabled: false,
    amount: 23000,
    label: '401(k) / 403(b)',
    description: 'Pre-tax contributions (2024 max: $23,000, or $30,500 if 50+)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  healthInsurance: {
    enabled: false,
    amount: 500,
    label: 'Health Insurance Premium',
    description: 'Monthly premium via S-Corp (enter monthly amount)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: true,
  },
  hsaContribution: {
    enabled: false,
    amount: 4150,
    label: 'HSA Contribution',
    description: 'Health Savings Account (2024 max: $4,150 individual, $8,300 family)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: true,
  },
  traditionalIra: {
    enabled: false,
    amount: 7000,
    label: 'Traditional IRA',
    description: 'Pre-tax IRA (2024 max: $7,000, or $8,000 if 50+)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  sepIra: {
    enabled: false,
    amount: 0,
    label: 'SEP-IRA',
    description: 'Up to 25% of net self-employment income (max $69,000)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  dentalVision: {
    enabled: false,
    amount: 100,
    label: 'Dental & Vision',
    description: 'Monthly premium (enter monthly amount)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: true,
  },
  fsa: {
    enabled: false,
    amount: 3200,
    label: 'FSA (Flexible Spending)',
    description: 'Healthcare FSA (2024 max: $3,200)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: true,
  },
  dependentCareFsa: {
    enabled: false,
    amount: 5000,
    label: 'Dependent Care FSA',
    description: 'Dependent care expenses (max: $5,000/year)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: true,
  },
});

const getCategoryIcon = (key: string) => {
  if (key.includes('401k') || key.includes('ira') || key.includes('Ira')) return PiggyBank;
  if (key.includes('health') || key.includes('Health') || key.includes('dental') || key.includes('Dental')) return Heart;
  if (key.includes('hsa') || key.includes('fsa') || key.includes('Fsa')) return Shield;
  return DollarSign;
};

interface TaxDeductionsManagerProps {
  onChange?: (deductions: TaxDeductionsConfig, totals: DeductionTotals) => void;
}

export interface DeductionTotals {
  totalAnnual: number;
  federalDeductions: number;
  stateDeductions: number;
  ficaDeductions: number;
}

export const useTaxDeductionsConfig = () => {
  const [deductions, setDeductions] = useState<TaxDeductionsConfig>(getDefaultTaxDeductions());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load from database
  useEffect(() => {
    const loadDeductions = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('tax_deductions')
          .select('*')
          .eq('user_id', user.id)
          .eq('name', '__config__')
          .maybeSingle();

        if (error) throw error;

        if (data) {
          // Parse stored config and merge with defaults
          try {
            const storedConfig = JSON.parse(data.category) as TaxDeductionsConfig;
            setDeductions({ ...getDefaultTaxDeductions(), ...storedConfig });
          } catch {
            setDeductions(getDefaultTaxDeductions());
          }
        }
      } catch (error) {
        console.error('Error loading tax deductions config:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDeductions();
  }, []);

  // Save to database
  const saveDeductions = async (newDeductions: TaxDeductionsConfig) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tax_deductions')
        .upsert({
          user_id: user.id,
          name: '__config__',
          type: 'annual',
          amount: 0,
          category: JSON.stringify(newDeductions),
          reduces_federal: true,
          reduces_state: true,
          reduces_fica: false,
        }, {
          onConflict: 'user_id,name',
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving tax deductions config:', error);
      toast({
        title: 'Error',
        description: 'Failed to save tax deductions',
        variant: 'destructive',
      });
    }
  };

  const toggleDeduction = (key: string) => {
    const newDeductions = {
      ...deductions,
      [key]: { ...deductions[key], enabled: !deductions[key].enabled },
    };
    setDeductions(newDeductions);
    saveDeductions(newDeductions);
  };

  const updateAmount = (key: string, amount: number) => {
    const newDeductions = {
      ...deductions,
      [key]: { ...deductions[key], amount },
    };
    setDeductions(newDeductions);
    saveDeductions(newDeductions);
  };

  // Calculate totals
  const calculateTotals = (): DeductionTotals => {
    let totalAnnual = 0;
    let federalDeductions = 0;
    let stateDeductions = 0;
    let ficaDeductions = 0;

    Object.entries(deductions).forEach(([key, d]) => {
      if (!d.enabled) return;
      
      // Health insurance and dental are monthly, others are annual
      const isMonthly = key === 'healthInsurance' || key === 'dentalVision';
      const annualAmount = isMonthly ? d.amount * 12 : d.amount;

      totalAnnual += annualAmount;
      if (d.reducesFederal) federalDeductions += annualAmount;
      if (d.reducesState) stateDeductions += annualAmount;
      if (d.reducesFica) ficaDeductions += annualAmount;
    });

    return { totalAnnual, federalDeductions, stateDeductions, ficaDeductions };
  };

  return {
    deductions,
    loading,
    toggleDeduction,
    updateAmount,
    totals: calculateTotals(),
  };
};

export const TaxDeductionsManager = ({ onChange }: TaxDeductionsManagerProps = {}) => {
  const { deductions, loading, toggleDeduction, updateAmount, totals } = useTaxDeductionsConfig();

  // Notify parent of changes immediately on any deduction state change
  useEffect(() => {
    if (onChange && !loading) {
      onChange(deductions, totals);
    }
  }, [deductions, totals, onChange, loading]);

  if (loading) {
    return (
      <div className="bg-card rounded-xl border border-border/50 shadow-sm p-6">
        <div className="text-muted-foreground">Loading deductions...</div>
      </div>
    );
  }

  const enabledCount = Object.values(deductions).filter(d => d.enabled).length;

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Tax Deductions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Toggle deductions on/off and enter your amounts (2024 IRS limits shown)
            </p>
          </div>
          {enabledCount > 0 && (
            <div className="text-right">
              <p className="text-2xl font-bold text-success">-${totals.totalAnnual.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{enabledCount} active</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-2">
        {Object.entries(deductions).map(([key, deduction]) => {
          const Icon = getCategoryIcon(key);
          const isMonthly = key === 'healthInsurance' || key === 'dentalVision';
          const annualAmount = isMonthly ? deduction.amount * 12 : deduction.amount;

          return (
            <div
              key={key}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                deduction.enabled 
                  ? 'bg-success/5 border-success/30' 
                  : 'bg-muted/20 border-border/50 opacity-60'
              }`}
            >
              <Switch
                checked={deduction.enabled}
                onCheckedChange={() => toggleDeduction(key)}
              />
              <div className="p-2 bg-muted/50 rounded-lg">
                <Icon className={`w-4 h-4 ${deduction.enabled ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${deduction.enabled ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {deduction.label}
                </p>
                <p className="text-xs text-muted-foreground truncate">{deduction.description}</p>
                {deduction.enabled && (
                  <div className="flex gap-2 mt-1">
                    {deduction.reducesFederal && (
                      <span className="text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">
                        Fed
                      </span>
                    )}
                    {deduction.reducesState && (
                      <span className="text-xs bg-purple-500/10 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded">
                        VA
                      </span>
                    )}
                    {deduction.reducesFica && (
                      <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded">
                        FICA
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={deduction.amount}
                    onChange={(e) => updateAmount(key, Number(e.target.value) || 0)}
                    className="w-24 h-8 text-sm font-mono pl-5 pr-2"
                    disabled={!deduction.enabled}
                    min={0}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-8">
                  {isMonthly ? '/mo' : '/yr'}
                </span>
              </div>
              {deduction.enabled && isMonthly && (
                <span className="text-xs text-muted-foreground">
                  = ${annualAmount.toLocaleString()}/yr
                </span>
              )}
            </div>
          );
        })}
      </div>

      {totals.totalAnnual > 0 && (
        <div className="p-4 bg-success/10 border-t border-success/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Total Annual Tax Deductions</p>
              <p className="text-xs text-muted-foreground">
                Federal: -${totals.federalDeductions.toLocaleString()} • 
                State: -${totals.stateDeductions.toLocaleString()} • 
                FICA: -${totals.ficaDeductions.toLocaleString()}
              </p>
            </div>
            <p className="text-2xl font-bold text-success">
              -${totals.totalAnnual.toLocaleString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
