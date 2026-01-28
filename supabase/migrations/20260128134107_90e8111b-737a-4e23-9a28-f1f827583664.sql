-- Create trip_expenses table for tracking business travel
CREATE TABLE public.trip_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trip_name TEXT NOT NULL,
  client_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  purpose TEXT,
  flights NUMERIC NOT NULL DEFAULT 0,
  lodging NUMERIC NOT NULL DEFAULT 0,
  ground_transport NUMERIC NOT NULL DEFAULT 0,
  meals NUMERIC NOT NULL DEFAULT 0,
  per_diem NUMERIC NOT NULL DEFAULT 0,
  other_expenses NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trip expenses"
ON public.trip_expenses
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trip expenses"
ON public.trip_expenses
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trip expenses"
ON public.trip_expenses
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trip expenses"
ON public.trip_expenses
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_trip_expenses_updated_at
BEFORE UPDATE ON public.trip_expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();