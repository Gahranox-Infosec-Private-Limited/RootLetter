
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Define explicit type for platform objects
interface Platform {
  id: string;
  name: string;
  url: string;
  description: string | null;
  category: string;
  icon?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const usePlatforms = () => {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async (): Promise<Platform[]> => {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Add security news platforms to the existing platforms data
      const securityNewsPlatforms: Platform[] = [
        { id: 'thehackernews', name: 'The Hacker News', url: 'https://thehackernews.com', description: 'Latest cybersecurity news and threat intelligence', category: 'Security News' },
        { id: 'darkreading', name: 'Dark Reading', url: 'https://www.darkreading.com', description: 'Cybersecurity news for IT professionals', category: 'Security News' },
        { id: 'securityweek', name: 'SecurityWeek', url: 'https://www.securityweek.com', description: 'Security industry news and analysis', category: 'Security News' },
        { id: 'krebsonsecurity', name: 'Krebs on Security', url: 'https://krebsonsecurity.com', description: 'In-depth security news and investigation', category: 'Security News' },
        { id: 'cso', name: 'CSO (IDG)', url: 'https://www.csoonline.com', description: 'Security news for IT leaders', category: 'Security News' },
        { id: 'infosecurity', name: 'Infosecurity Magazine', url: 'https://www.infosecurity-magazine.com', description: 'Global information security news', category: 'Security News' },
        { id: 'cybersecuritydive', name: 'Cybersecurity Dive', url: 'https://cybersecuritydive.com', description: 'Enterprise cybersecurity news', category: 'Security News' },
        { id: 'cyberscoop', name: 'CyberScoop', url: 'https://www.cyberscoop.com', description: 'Government and private sector cybersecurity news', category: 'Security News' },
        { id: 'threatpost', name: 'Threatpost', url: 'https://threatpost.com', description: 'Latest cybersecurity threats and vulnerabilities', category: 'Security News' },
        { id: 'schneier', name: 'Schneier on Security', url: 'https://www.schneier.com', description: 'Bruce Schneier\'s security blog', category: 'Security News' },
        { id: 'troyhunt', name: 'Troy Hunt\'s Blog', url: 'https://www.troyhunt.com', description: 'Security researcher and data breach expert', category: 'Security News' },
        { id: 'wired', name: 'Wired Security', url: 'https://www.wired.com/category/security', description: 'Technology and security news', category: 'Security News' },
        { id: 'helpnetsecurity', name: 'Help Net Security', url: 'https://www.helpnetsecurity.com', description: 'Information security news and resources', category: 'Security News' },
        { id: 'cybercrimemagazine', name: 'Cybercrime Magazine', url: 'https://cybercrimemagazine.com', description: 'Cybercrime and cybersecurity magazine', category: 'Security News' }
      ];
      
      // Combine database platforms with security news platforms
      const dbPlatforms: Platform[] = (data || []).map(platform => ({
        id: platform.id,
        name: platform.name,
        url: platform.url,
        description: platform.description,
        category: platform.category,
        icon: platform.icon,
        created_at: platform.created_at,
        updated_at: platform.updated_at
      }));
      
      return [...dbPlatforms, ...securityNewsPlatforms];
    },
  });
};

export const usePlatformContent = (platformId: string | undefined) => {
  return useQuery({
    queryKey: ['platform-content', platformId],
    queryFn: async () => {
      if (!platformId) return [];
      
      // Calculate the date 2 months ago
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      
      console.log(`Fetching content for platform ${platformId} from ${twoMonthsAgo.toISOString()}`);
      
      // Query content using platform_id (works for both string and UUID) from the last 2 months
      const { data, error } = await supabase
        .from('fetched_content')
        .select('*')
        .eq('platform_id', platformId)
        .gte('extracted_at', twoMonthsAgo.toISOString())
        .order('extracted_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching content for platform:', error);
        return [];
      }
      
      console.log(`Found ${data?.length || 0} content items for platform ${platformId}`);
      return data || [];
    },
    enabled: !!platformId,
  });
};

export const useFetchContent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (platformId: string) => {
      const { data, error } = await supabase.functions.invoke('fetch-platform-content', {
        body: { platformId }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data, platformId) => {
      // Invalidate and refetch platform content
      queryClient.invalidateQueries({ queryKey: ['platform-content', platformId] });
    },
  });
};
