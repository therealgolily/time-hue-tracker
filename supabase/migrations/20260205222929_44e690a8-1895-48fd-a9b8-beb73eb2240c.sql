-- Add clock in/out columns to client_day_data table
ALTER TABLE public.client_day_data
ADD COLUMN clock_in_time timestamp with time zone,
ADD COLUMN clock_out_time timestamp with time zone;