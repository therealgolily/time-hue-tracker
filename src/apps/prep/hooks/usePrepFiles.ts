import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface PrepFile {
  id: string;
  session_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const usePrepFiles = (sessionId: string | null) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['prep-files', sessionId],
    queryFn: async () => {
      const { data, error } = await db
        .from('prep_files')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as PrepFile[];
    },
    enabled: !!user && !!sessionId,
  });

  const uploadFile = useMutation({
    mutationFn: async (file: File) => {
      if (!user || !sessionId) throw new Error('No user or session');
      const sanitized = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filePath = `${user.id}/${sessionId}/${Date.now()}_${sanitized}`;

      const { error: uploadError } = await supabase.storage
        .from('prep-files')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { error: dbError } = await db.from('prep_files').insert({
        user_id: user.id,
        session_id: sessionId,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type,
      });
      if (dbError) throw dbError;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prep-files', sessionId] }),
  });

  const deleteFile = useMutation({
    mutationFn: async (file: PrepFile) => {
      await supabase.storage.from('prep-files').remove([file.file_path]);
      const { error } = await db.from('prep_files').delete().eq('id', file.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['prep-files', sessionId] }),
  });

  const getFileUrl = async (filePath: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from('prep-files')
      .createSignedUrl(filePath, 3600);
    if (error) throw error;
    return data.signedUrl;
  };

  return { files, isLoading, uploadFile, deleteFile, getFileUrl };
};
