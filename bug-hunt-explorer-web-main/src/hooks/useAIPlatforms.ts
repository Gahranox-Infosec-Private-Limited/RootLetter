
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useAIFetchContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { 
      platformId: string; 
      directUrl?: string; 
      useAI?: boolean;
      prompt?: string;
    }) => {
      const endpoint = params.useAI ? 'ai-content-fetcher' : 'fetch-content';
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: params
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      const method = data.extractionMethod?.includes('ai') ? 'AI-powered' : 'Standard';
      toast.success(data.message || `Content fetched successfully using ${method} extraction!`);
      queryClient.invalidateQueries({ queryKey: ['platform-content'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch content');
    },
  });
};

export const useAIFetchDirectUrl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: { 
      platformId: string; 
      directUrl: string; 
      useAI?: boolean;
      prompt?: string;
    }) => {
      const endpoint = params.useAI ? 'ai-content-fetcher' : 'fetch-content';
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: params
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: (data) => {
      const method = data.extractionMethod?.includes('ai') ? 'AI-powered' : 'Standard';
      toast.success(data.message || `Content fetched from direct URL using ${method} extraction!`);
      queryClient.invalidateQueries({ queryKey: ['platform-content'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to fetch content from URL');
    },
  });
};
