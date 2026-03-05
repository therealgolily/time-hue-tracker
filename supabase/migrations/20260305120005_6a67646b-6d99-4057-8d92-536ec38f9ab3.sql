
CREATE TABLE public.plan_deadlines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.plan_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  deadline_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_deadlines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan deadlines" ON public.plan_deadlines FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plan deadlines" ON public.plan_deadlines FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plan deadlines" ON public.plan_deadlines FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plan deadlines" ON public.plan_deadlines FOR DELETE USING (auth.uid() = user_id);
