import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PlanGroup, PlanTask, PlanDependency, GroupType, TaskStatus } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const usePlanData = (projectId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['plan-groups', projectId] });
    queryClient.invalidateQueries({ queryKey: ['plan-tasks', projectId] });
    queryClient.invalidateQueries({ queryKey: ['plan-deps', projectId] });
  };

  // Groups
  const { data: groups = [] } = useQuery({
    queryKey: ['plan-groups', projectId],
    queryFn: async () => {
      const { data, error } = await db.from('plan_groups').select('*').eq('project_id', projectId).order('order', { ascending: true });
      if (error) throw error;
      return (data || []) as PlanGroup[];
    },
    enabled: !!user && !!projectId,
  });

  const createGroup = useMutation({
    mutationFn: async ({ name, type }: { name: string; type: GroupType }) => {
      const maxOrder = groups.length > 0 ? Math.max(...groups.map(g => g.order)) + 1 : 0;
      const { data, error } = await db.from('plan_groups').insert({ project_id: projectId, user_id: user!.id, name, type, order: maxOrder }).select().single();
      if (error) throw error;
      return data as PlanGroup;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-groups', projectId] }),
  });

  const updateGroup = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await db.from('plan_groups').update({ name }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-groups', projectId] }),
  });

  const deleteGroup = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('plan_groups').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['plan-tasks', projectId],
    queryFn: async () => {
      const { data, error } = await db.from('plan_tasks').select('*').eq('project_id', projectId).order('row_order', { ascending: true });
      if (error) throw error;
      return (data || []) as PlanTask[];
    },
    enabled: !!user && !!projectId,
  });

  const createTask = useMutation({
    mutationFn: async (task: { name: string; group_id: string | null; start_date: string; end_date: string; status: TaskStatus; is_critical: boolean }) => {
      const maxOrder = tasks.length > 0 ? Math.max(...tasks.map(t => t.row_order)) + 1 : 0;
      const { data, error } = await db.from('plan_tasks').insert({ ...task, project_id: projectId, user_id: user!.id, row_order: maxOrder }).select().single();
      if (error) throw error;
      return data as PlanTask;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-tasks', projectId] }),
  });

  const updateTask = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlanTask> & { id: string }) => {
      const { error } = await db.from('plan_tasks').update(updates).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-tasks', projectId] }),
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('plan_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  // Dependencies
  const { data: dependencies = [] } = useQuery({
    queryKey: ['plan-deps', projectId],
    queryFn: async () => {
      // fetch all deps where either task is in this project
      const taskIds = tasks.map(t => t.id);
      if (taskIds.length === 0) return [];
      const { data, error } = await db.from('plan_dependencies').select('*').in('from_task_id', taskIds);
      if (error) throw error;
      return (data || []) as PlanDependency[];
    },
    enabled: !!user && !!projectId && tasks.length > 0,
  });

  const createDependency = useMutation({
    mutationFn: async ({ from_task_id, to_task_id }: { from_task_id: string; to_task_id: string }) => {
      const { error } = await db.from('plan_dependencies').insert({ from_task_id, to_task_id, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-deps', projectId] }),
  });

  const deleteDependency = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('plan_dependencies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-deps', projectId] }),
  });

  return { groups, tasks, dependencies, createGroup, updateGroup, deleteGroup, createTask, updateTask, deleteTask, createDependency, deleteDependency };
};
