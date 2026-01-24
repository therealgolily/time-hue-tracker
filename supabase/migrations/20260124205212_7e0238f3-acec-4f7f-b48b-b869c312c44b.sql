-- Create a table for client tracker day data
CREATE TABLE public.client_day_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  wake_time TIMESTAMP WITH TIME ZONE,
  sleep_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create a table for client tracker time entries
CREATE TABLE public.client_time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  tracker_client TEXT NOT NULL,
  custom_client TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.client_day_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_time_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for client_day_data
CREATE POLICY "Users can view their own client day data" 
ON public.client_day_data 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client day data" 
ON public.client_day_data 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client day data" 
ON public.client_day_data 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client day data" 
ON public.client_day_data 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for client_time_entries
CREATE POLICY "Users can view their own client time entries" 
ON public.client_time_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own client time entries" 
ON public.client_time_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own client time entries" 
ON public.client_time_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own client time entries" 
ON public.client_time_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on client_day_data
CREATE TRIGGER update_client_day_data_updated_at
BEFORE UPDATE ON public.client_day_data
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on client_time_entries
CREATE TRIGGER update_client_time_entries_updated_at
BEFORE UPDATE ON public.client_time_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();