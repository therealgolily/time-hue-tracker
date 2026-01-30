-- Add status column to payments for tracking pending vs received
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'received';

-- Add description column for one-time payment context
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS description text;

-- Add index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

COMMENT ON COLUMN public.payments.status IS 'Payment status: received (already paid) or pending (expected future payment)';
COMMENT ON COLUMN public.payments.description IS 'Optional description for one-time or special payments';