
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, Loader2, AlertCircle } from 'lucide-react';
import { useFetchDirectUrl } from '@/hooks/usePlatforms';

interface DirectUrlFetchProps {
  platformId: string;
  platformName: string;
}

const DirectUrlFetch = ({ platformId, platformName }: DirectUrlFetchProps) => {
  const [directUrl, setDirectUrl] = useState('');
  const fetchDirectUrlMutation = useFetchDirectUrl();

  const handleFetchDirectUrl = () => {
    if (!directUrl.trim()) return;
    
    try {
      new URL(directUrl); // Validate URL
      fetchDirectUrlMutation.mutate({ 
        platformId, 
        directUrl: directUrl.trim() 
      });
    } catch (error) {
      // Handle invalid URL
      console.error('Invalid URL provided');
    }
  };

  return (
    <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30 shadow-xl">
      <CardHeader>
        <CardTitle className="text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
          <Link className="h-5 w-5 text-blue-400 mr-2" />
          Fetch Specific Article
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-300">
          Enter a direct URL to extract content from a specific blog post or article from {platformName}.
        </div>
        
        <div className="flex space-x-2">
          <Input
            type="url"
            placeholder="https://example.com/blog/article-title"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
          />
          <Button
            onClick={handleFetchDirectUrl}
            disabled={fetchDirectUrlMutation.isPending || !directUrl.trim()}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            {fetchDirectUrlMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Fetch'
            )}
          </Button>
        </div>
        
        {directUrl && (
          <div className="text-xs text-gray-400 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            Make sure the URL is a direct link to a blog post or article page.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DirectUrlFetch;
