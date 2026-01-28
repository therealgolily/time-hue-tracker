-- Create tax_deductions table for storing pre-tax deductions like 401k, health insurance, HSA, etc.
CREATE TABLE public.tax_deductions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'annual',
  amount NUMERIC NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'other',
  reduces_federal BOOLEAN NOT NULL DEFAULT true,
  reduces_state BOOLEAN NOT NULL DEFAULT true,
  reduces_fica BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tax_deductions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tax deductions" 
ON public.tax_deductions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tax deductions" 
ON public.tax_deductions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tax deductions" 
ON public.tax_deductions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tax deductions" 
ON public.tax_deductions 
FOR DELETE 
USING (auth.uid() = user_id);