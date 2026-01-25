-- Create table for calendar events
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for calendar_events
CREATE POLICY "Users can view their own calendar events"
ON public.calendar_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
ON public.calendar_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
ON public.calendar_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
ON public.calendar_events FOR DELETE
USING (auth.uid() = user_id);

-- Create table for countdowns
CREATE TABLE public.countdowns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.countdowns ENABLE ROW LEVEL SECURITY;

-- RLS policies for countdowns
CREATE POLICY "Users can view their own countdowns"
ON public.countdowns FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own countdowns"
ON public.countdowns FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own countdowns"
ON public.countdowns FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own countdowns"
ON public.countdowns FOR DELETE
USING (auth.uid() = user_id);