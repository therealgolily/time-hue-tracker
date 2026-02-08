-- Create payroll tax collections table
CREATE TABLE public.payroll_tax_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  transaction_id TEXT,
  transaction_date DATE NOT NULL,
  payroll_check_date DATE NOT NULL,
  
  -- Employee taxes
  federal_income_tax NUMERIC NOT NULL DEFAULT 0,
  social_security_employee NUMERIC NOT NULL DEFAULT 0,
  medicare_employee NUMERIC NOT NULL DEFAULT 0,
  state_income_tax NUMERIC NOT NULL DEFAULT 0,
  
  -- Employer taxes
  social_security_employer NUMERIC NOT NULL DEFAULT 0,
  medicare_employer NUMERIC NOT NULL DEFAULT 0,
  state_unemployment NUMERIC NOT NULL DEFAULT 0,
  federal_unemployment NUMERIC NOT NULL DEFAULT 0,
  
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payroll_tax_collections ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payroll tax collections"
ON public.payroll_tax_collections
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payroll tax collections"
ON public.payroll_tax_collections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payroll tax collections"
ON public.payroll_tax_collections
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payroll tax collections"
ON public.payroll_tax_collections
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_payroll_tax_collections_updated_at
BEFORE UPDATE ON public.payroll_tax_collections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();