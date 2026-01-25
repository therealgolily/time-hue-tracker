-- Create table for debt calculator data
CREATE TABLE public.debt_calculator_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.debt_calculator_data ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own debt calculator data" 
ON public.debt_calculator_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt calculator data" 
ON public.debt_calculator_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debt calculator data" 
ON public.debt_calculator_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt calculator data" 
ON public.debt_calculator_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_debt_calculator_data_updated_at
BEFORE UPDATE ON public.debt_calculator_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();