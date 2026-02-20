import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { PlanProject } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const usePlanProjects = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['plan-projects', user?.id],
    queryFn: async () => {
      const { data, error } = await db.from('plan_projects').select('*').order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as PlanProject[];
    },
    enabled: !!user,
  });

  const createProject = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await db.from('plan_projects').insert({ user_id: user!.id, title }).select().single();
      if (error) throw error;
      return data as PlanProject;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-projects'] }),
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await db.from('plan_projects').update({ title }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-projects'] }),
  });

  const deleteProject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('plan_projects').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan-projects'] }),
  });

  return { projects, isLoading, createProject, updateProject, deleteProject };
};
