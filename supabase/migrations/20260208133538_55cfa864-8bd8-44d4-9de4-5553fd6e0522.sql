-- Add hourly wage fields to contractors table
ALTER TABLE public.contractors
ADD COLUMN pay_type text NOT NULL DEFAULT 'monthly',
ADD COLUMN hourly_rate numeric DEFAULT 0,
ADD COLUMN hours_per_week numeric DEFAULT 0;