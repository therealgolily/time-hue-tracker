-- Create table to track two-step auth state
CREATE TABLE public.auth_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  auth_level TEXT NOT NULL DEFAULT 'none' CHECK (auth_level IN ('none', 'partial', 'full')),
  partial_expires_at TIMESTAMP WITH TIME ZONE,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  lockout_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own auth session
CREATE POLICY "Users can view their own auth session"
ON public.auth_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own auth session
CREATE POLICY "Users can insert their own auth session"
ON public.auth_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own auth session
CREATE POLICY "Users can update their own auth session"
ON public.auth_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own auth session
CREATE POLICY "Users can delete their own auth session"
ON public.auth_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_auth_sessions_updated_at
BEFORE UPDATE ON public.auth_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();