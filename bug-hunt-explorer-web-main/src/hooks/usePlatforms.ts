import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('name');
      
      if (error) {
        throw error;
      }
      
      return data;
    },
  });
};

export const useFetchContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { platformId: string; directUrl?: string }) => {
      const { data, error } = await supabase.functions.invoke('fetch-content', {
        body: params
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Content fetched successfully!');
      queryClient.invalidateQueries({ queryKey: ['platform-content'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch content');
    },
  });
};

export const usePlatformContent = (platformId?: string) => {
  return useQuery({
    queryKey: ['platform-content', platformId],
    queryFn: async () => {
      if (!platformId) return null;
      
      // Get ALL content for this platform, not just the last 7 days
      const { data, error } = await supabase
        .from('fetched_content')
        .select('*')
        .eq('platform_id', platformId)
        .order('extracted_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!platformId,
  });
};

export const useFetchDirectUrl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { platformId: string; directUrl: string }) => {
      const { data, error } = await supabase.functions.invoke('fetch-content', {
        body: params
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Content fetched from direct URL successfully!');
      queryClient.invalidateQueries({ queryKey: ['platform-content'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch content from URL');
    },
  });
};