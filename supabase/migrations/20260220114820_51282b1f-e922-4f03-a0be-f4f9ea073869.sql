
-- Prep sessions table
CREATE TABLE public.prep_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Session',
  rich_text_content TEXT,
  talking_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  meeting_datetime TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prep_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prep sessions" ON public.prep_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prep sessions" ON public.prep_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own prep sessions" ON public.prep_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prep sessions" ON public.prep_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_prep_sessions_updated_at
BEFORE UPDATE ON public.prep_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prep files table
CREATE TABLE public.prep_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID NOT NULL REFERENCES public.prep_sessions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.prep_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own prep files" ON public.prep_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own prep files" ON public.prep_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own prep files" ON public.prep_files FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for prep files
INSERT INTO storage.buckets (id, name, public) VALUES ('prep-files', 'prep-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload prep files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'prep-files' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own prep files storage" ON storage.objects FOR SELECT USING (
  bucket_id = 'prep-files' AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own prep files storage" ON storage.objects FOR DELETE USING (
  bucket_id = 'prep-files' AND auth.uid()::text = (storage.foldername(name))[1]
);
