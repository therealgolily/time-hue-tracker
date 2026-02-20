import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface TalkingPoint {
  id: string;
  text: string;
}

export interface PrepSession {
  id: string;
  user_id: string;
  title: string;
  rich_text_content: string | null;
  talking_points: TalkingPoint[];
  meeting_datetime: string | null;
  created_at: string;
  updated_at: string;
}

const parseTalkingPoints = (raw: unknown): TalkingPoint[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is TalkingPoint =>
      typeof item === 'object' && item !== null && 'id' in item && 'text' in item
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const usePrepSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['prep-sessions', user?.id],
    queryFn: async () => {
      const { data, error } = await db
        .from('prep_sessions')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return ((data || []) as PrepSession[]).map((s) => ({
        ...s,
        talking_points: parseTalkingPoints(s.talking_points),
      }));
    },
    enabled: !!user,
  });

  const createSession = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await db
        .from('prep_sessions')
        .insert({ user_id: user!.id, title })
        .select()
        .single();
      if (error) throw error;
      return { ...(data as PrepSession), talking_points: [] } as PrepSession;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prep-sessions'] }),
  });

  const updateSession = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PrepSession> & { id: string }) => {
      const { error } = await db
        .from('prep_sessions')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prep-sessions'] }),
  });

  const deleteSession = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await db.from('prep_sessions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prep-sessions'] }),
  });

  return { sessions, isLoading, createSession, updateSession, deleteSession };
};
