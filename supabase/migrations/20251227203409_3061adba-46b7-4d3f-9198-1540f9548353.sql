-- Create day_data table for wake/sleep times
CREATE TABLE public.day_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  wake_time TIMESTAMPTZ,
  sleep_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create time_entries table
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  energy_level TEXT NOT NULL CHECK (energy_level IN ('positive', 'neutral', 'negative')),
  category TEXT NOT NULL CHECK (category IN ('personal', 'work')),
  client TEXT,
  custom_client TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.day_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- RLS policies for day_data
CREATE POLICY "Users can view their own day data" 
ON public.day_data FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own day data" 
ON public.day_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own day data" 
ON public.day_data FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own day data" 
ON public.day_data FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for time_entries
CREATE POLICY "Users can view their own entries" 
ON public.time_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries" 
ON public.time_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.time_entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.time_entries FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_day_data_updated_at
BEFORE UPDATE ON public.day_data
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at
BEFORE UPDATE ON public.time_entries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_day_data_user_date ON public.day_data(user_id, date);
CREATE INDEX idx_time_entries_user_date ON public.time_entries(user_id, date);