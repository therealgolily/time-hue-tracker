-- Update existing task statuses to the new taxonomy
UPDATE public.plan_tasks SET status = 'not_started' WHERE status = 'pending';
UPDATE public.plan_tasks SET status = 'complete' WHERE status = 'done';
UPDATE public.plan_tasks SET status = 'in_progress' WHERE status = 'delayed';
UPDATE public.plan_tasks SET status = 'almost_done' WHERE status = 'critical';
