-- Add unique constraint for user_id + name combination to enable upsert
ALTER TABLE public.tax_deductions ADD CONSTRAINT tax_deductions_user_id_name_key UNIQUE (user_id, name);