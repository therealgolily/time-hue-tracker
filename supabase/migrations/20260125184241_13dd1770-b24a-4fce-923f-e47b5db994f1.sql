-- Create table for life events
CREATE TABLE public.life_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.life_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for life_events
CREATE POLICY "Users can view their own life events"
ON public.life_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own life events"
ON public.life_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own life events"
ON public.life_events FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own life events"
ON public.life_events FOR DELETE
USING (auth.uid() = user_id);