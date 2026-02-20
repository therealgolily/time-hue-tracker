
-- Plan app tables

CREATE TABLE public.plan_projects (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Project',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan projects" ON public.plan_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plan projects" ON public.plan_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plan projects" ON public.plan_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plan projects" ON public.plan_projects FOR DELETE USING (auth.uid() = user_id);

-- Groups

CREATE TABLE public.plan_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.plan_projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'phase',
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan groups" ON public.plan_groups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plan groups" ON public.plan_groups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plan groups" ON public.plan_groups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plan groups" ON public.plan_groups FOR DELETE USING (auth.uid() = user_id);

-- Tasks

CREATE TABLE public.plan_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.plan_projects(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.plan_groups(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  is_critical boolean NOT NULL DEFAULT false,
  row_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan tasks" ON public.plan_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plan tasks" ON public.plan_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own plan tasks" ON public.plan_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plan tasks" ON public.plan_tasks FOR DELETE USING (auth.uid() = user_id);

-- Dependencies

CREATE TABLE public.plan_dependencies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_task_id uuid NOT NULL REFERENCES public.plan_tasks(id) ON DELETE CASCADE,
  to_task_id uuid NOT NULL REFERENCES public.plan_tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.plan_dependencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own plan dependencies" ON public.plan_dependencies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own plan dependencies" ON public.plan_dependencies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own plan dependencies" ON public.plan_dependencies FOR DELETE USING (auth.uid() = user_id);

-- Triggers

CREATE TRIGGER update_plan_projects_updated_at BEFORE UPDATE ON public.plan_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plan_tasks_updated_at BEFORE UPDATE ON public.plan_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
