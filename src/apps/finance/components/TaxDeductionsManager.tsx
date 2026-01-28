import { useState, useEffect } from 'react';
import { DollarSign, PiggyBank, Heart, Shield, Building, Car, GraduationCap, Briefcase, Phone, Utensils, FileText, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define the structure for tax deductions (matches scenario pattern)
export interface TaxDeductionConfig {
  enabled: boolean;
  amount: number;
  label: string;
  description: string;
  reducesFederal: boolean;
  reducesState: boolean;
  reducesFica: boolean;
  // Special field for home office sq ft calculation
  sqft?: number;
  isHomeOffice?: boolean;
  isMileage?: boolean;
  // For monthly vs annual display
  isMonthly?: boolean;
}

export interface TaxDeductionsConfig {
  [key: string]: TaxDeductionConfig;
}

// IRS standard rates for 2024
const HOME_OFFICE_RATE_PER_SQFT = 5; // $5 per sq ft (simplified method)
const HOME_OFFICE_MAX_SQFT = 300; // Max 300 sq ft for simplified
const MILEAGE_RATE_2024 = 0.67; // 67 cents per mile for 2024

// Default tax deductions with 2024 IRS limits as placeholders
export const getDefaultTaxDeductions = (): TaxDeductionsConfig => ({
  // === RETIREMENT ACCOUNTS ===
  traditional401k: {
    enabled: false,
    amount: 23000,
    label: '401(k) / 403(b)',
    description: 'Pre-tax contributions (2024 max: $23,000, or $30,500 if 50+)',
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
  traditionalIra: {
    enabled: false,
    amount: 7000,
    label: 'Traditional IRA',
    description: 'Pre-tax IRA (2024 max: $7,000, or $8,000 if 50+)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  
  // === HEALTH & INSURANCE ===
  healthInsurance: {
    enabled: false,
    amount: 500,
    label: 'Health Insurance Premium',
    description: 'Monthly premium via S-Corp (enter monthly amount)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: true,
    isMonthly: true,
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
  dentalVision: {
    enabled: false,
    amount: 100,
    label: 'Dental & Vision',
    description: 'Monthly premium (enter monthly amount)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: true,
    isMonthly: true,
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
  lifeInsurance: {
    enabled: false,
    amount: 50,
    label: 'Group Life Insurance',
    description: 'Monthly premium up to $50k coverage is tax-free',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isMonthly: true,
  },
  disabilityInsurance: {
    enabled: false,
    amount: 100,
    label: 'Disability Insurance',
    description: 'Monthly premium for S-Corp provided disability coverage',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isMonthly: true,
  },

  // === HOME OFFICE ===
  homeOffice: {
    enabled: false,
    amount: 0, // Calculated from sqft
    sqft: 150,
    label: 'Home Office (Simplified)',
    description: `$${HOME_OFFICE_RATE_PER_SQFT}/sq ft method (max ${HOME_OFFICE_MAX_SQFT} sq ft = $${HOME_OFFICE_RATE_PER_SQFT * HOME_OFFICE_MAX_SQFT})`,
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isHomeOffice: true,
  },

  // === VEHICLE & MILEAGE ===
  businessMileage: {
    enabled: false,
    amount: 0, // Calculated from miles
    label: 'Business Mileage',
    description: `${MILEAGE_RATE_2024 * 100}¢/mile for 2024 (enter annual miles)`,
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isMileage: true,
  },
  vehicleExpenses: {
    enabled: false,
    amount: 0,
    label: 'Vehicle Expenses (Actual)',
    description: 'Gas, repairs, insurance, depreciation (business % only)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },

  // === PROFESSIONAL SERVICES ===
  accountingFees: {
    enabled: false,
    amount: 1500,
    label: 'Accounting & Bookkeeping',
    description: 'CPA, tax prep, bookkeeping services',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  legalFees: {
    enabled: false,
    amount: 500,
    label: 'Legal Fees',
    description: 'Business legal services, contracts, LLC maintenance',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  professionalDevelopment: {
    enabled: false,
    amount: 1000,
    label: 'Education & Training',
    description: 'Courses, certifications, conferences related to business',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  professionalDues: {
    enabled: false,
    amount: 300,
    label: 'Professional Memberships',
    description: 'Industry associations, professional organizations',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },

  // === BUSINESS INSURANCE ===
  businessInsurance: {
    enabled: false,
    amount: 150,
    label: 'Business Insurance',
    description: 'Monthly E&O, liability, professional insurance',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isMonthly: true,
  },

  // === TECHNOLOGY & OFFICE ===
  cellPhone: {
    enabled: false,
    amount: 100,
    label: 'Cell Phone (Business %)',
    description: 'Monthly business portion of phone bill',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isMonthly: true,
  },
  internet: {
    enabled: false,
    amount: 50,
    label: 'Internet (Business %)',
    description: 'Monthly business portion of internet bill',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isMonthly: true,
  },
  equipmentDepreciation: {
    enabled: false,
    amount: 0,
    label: 'Equipment Depreciation',
    description: 'Annual depreciation on computers, furniture, equipment',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },

  // === MEALS & ENTERTAINMENT ===
  businessMeals: {
    enabled: false,
    amount: 0,
    label: 'Business Meals (50%)',
    description: 'Annual total of client/business meals (50% deductible)',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },

  // === OTHER DEDUCTIONS ===
  charitableContributions: {
    enabled: false,
    amount: 0,
    label: 'Charitable Contributions',
    description: 'Corporate charitable donations',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  bankFees: {
    enabled: false,
    amount: 25,
    label: 'Bank & Merchant Fees',
    description: 'Monthly business banking and payment processing fees',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
    isMonthly: true,
  },
  officeSupplies: {
    enabled: false,
    amount: 500,
    label: 'Office Supplies',
    description: 'Annual office supplies, stationery, small equipment',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
  advertisingMarketing: {
    enabled: false,
    amount: 0,
    label: 'Advertising & Marketing',
    description: 'Annual marketing, ads, promotional materials',
    reducesFederal: true,
    reducesState: true,
    reducesFica: false,
  },
});

const getCategoryIcon = (key: string) => {
  if (key.includes('401k') || key.includes('ira') || key.includes('Ira') || key.includes('sep')) return PiggyBank;
  if (key.includes('health') || key.includes('Health') || key.includes('dental') || key.includes('Dental') || key.includes('life') || key.includes('disability')) return Heart;
  if (key.includes('hsa') || key.includes('fsa') || key.includes('Fsa')) return Shield;
  if (key.includes('homeOffice')) return Building;
  if (key.includes('mileage') || key.includes('vehicle') || key.includes('Vehicle')) return Car;
  if (key.includes('professional') || key.includes('education') || key.includes('Education')) return GraduationCap;
  if (key.includes('accounting') || key.includes('legal')) return FileText;
  if (key.includes('Insurance') || key.includes('insurance')) return Shield;
  if (key.includes('cell') || key.includes('internet')) return Phone;
  if (key.includes('meals') || key.includes('Meals')) return Utensils;
  if (key.includes('business') || key.includes('Business')) return Briefcase;
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

  const updateSqft = (key: string, sqft: number) => {
    const newDeductions = {
      ...deductions,
      [key]: { ...deductions[key], sqft: Math.min(sqft, HOME_OFFICE_MAX_SQFT) },
    };
    setDeductions(newDeductions);
    saveDeductions(newDeductions);
  };

  // Calculate totals with special handling for different deduction types
  const calculateTotals = (): DeductionTotals => {
    let totalAnnual = 0;
    let federalDeductions = 0;
    let stateDeductions = 0;
    let ficaDeductions = 0;

    Object.entries(deductions).forEach(([key, d]) => {
      if (!d.enabled) return;
      
      let annualAmount: number;

      // Handle special calculation types
      if (d.isHomeOffice) {
        // Home office: $5 per sq ft, max 300 sq ft
        const sqft = Math.min(d.sqft || 0, HOME_OFFICE_MAX_SQFT);
        annualAmount = sqft * HOME_OFFICE_RATE_PER_SQFT;
      } else if (d.isMileage) {
        // Mileage: 67 cents per mile
        annualAmount = Math.round(d.amount * MILEAGE_RATE_2024);
      } else if (key === 'businessMeals') {
        // Meals are 50% deductible
        annualAmount = Math.round(d.amount * 0.5);
      } else if (d.isMonthly) {
        // Monthly items
        annualAmount = d.amount * 12;
      } else {
        // Standard annual amount
        annualAmount = d.amount;
      }

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
    updateSqft,
    totals: calculateTotals(),
  };
};

export const TaxDeductionsManager = ({ onChange }: TaxDeductionsManagerProps = {}) => {
  const { deductions, loading, toggleDeduction, updateAmount, updateSqft, totals } = useTaxDeductionsConfig();

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

  // Group deductions by category
  const categories = {
    'Retirement': ['traditional401k', 'sepIra', 'traditionalIra'],
    'Health & Insurance': ['healthInsurance', 'hsaContribution', 'dentalVision', 'fsa', 'dependentCareFsa', 'lifeInsurance', 'disabilityInsurance'],
    'Home Office': ['homeOffice'],
    'Vehicle & Travel': ['businessMileage', 'vehicleExpenses'],
    'Professional Services': ['accountingFees', 'legalFees', 'professionalDevelopment', 'professionalDues'],
    'Business Insurance': ['businessInsurance'],
    'Technology & Office': ['cellPhone', 'internet', 'equipmentDepreciation', 'officeSupplies'],
    'Meals & Marketing': ['businessMeals', 'advertisingMarketing'],
    'Other': ['charitableContributions', 'bankFees'],
  };

  // Helper to calculate display amount for a deduction
  const getDisplayAmount = (key: string, d: TaxDeductionConfig) => {
    if (d.isHomeOffice) {
      const sqft = Math.min(d.sqft || 0, HOME_OFFICE_MAX_SQFT);
      return sqft * HOME_OFFICE_RATE_PER_SQFT;
    } else if (d.isMileage) {
      return Math.round(d.amount * MILEAGE_RATE_2024);
    } else if (key === 'businessMeals') {
      return Math.round(d.amount * 0.5);
    } else if (d.isMonthly) {
      return d.amount * 12;
    }
    return d.amount;
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">S-Corp Tax Deductions</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Toggle deductions on/off and enter your amounts (2024 IRS rates & limits)
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

      <div className="divide-y divide-border/30">
        {Object.entries(categories).map(([category, keys]) => {
          const categoryDeductions = keys.filter(key => deductions[key]);
          if (categoryDeductions.length === 0) return null;

          return (
            <div key={category} className="p-4">
              <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                {category}
              </h3>
              <div className="space-y-2">
                {categoryDeductions.map((key) => {
                  const deduction = deductions[key];
                  if (!deduction) return null;
                  
                  const Icon = getCategoryIcon(key);
                  const annualAmount = getDisplayAmount(key, deduction);

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

                      {/* Input section - varies by type */}
                      <div className="flex items-center gap-2">
                        {deduction.isHomeOffice ? (
                          // Home Office: sq ft input
                          <>
                            <Input
                              type="number"
                              value={deduction.sqft || 0}
                              onChange={(e) => updateSqft(key, Number(e.target.value) || 0)}
                              className="w-20 h-8 text-sm font-mono text-center"
                              disabled={!deduction.enabled}
                              min={0}
                              max={HOME_OFFICE_MAX_SQFT}
                            />
                            <span className="text-xs text-muted-foreground">sq ft</span>
                          </>
                        ) : deduction.isMileage ? (
                          // Mileage: miles input
                          <>
                            <Input
                              type="number"
                              value={deduction.amount}
                              onChange={(e) => updateAmount(key, Number(e.target.value) || 0)}
                              className="w-24 h-8 text-sm font-mono text-center"
                              disabled={!deduction.enabled}
                              min={0}
                            />
                            <span className="text-xs text-muted-foreground">miles</span>
                          </>
                        ) : (
                          // Standard dollar input
                          <>
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
                              {deduction.isMonthly ? '/mo' : '/yr'}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Show calculated annual amount for special types */}
                      {deduction.enabled && (deduction.isMonthly || deduction.isHomeOffice || deduction.isMileage || key === 'businessMeals') && (
                        <span className="text-xs text-success font-medium whitespace-nowrap">
                          = ${annualAmount.toLocaleString()}/yr
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
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
