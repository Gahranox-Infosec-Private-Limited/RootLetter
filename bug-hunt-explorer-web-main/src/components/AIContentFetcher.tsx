
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Brain, Link, Loader2, AlertCircle, Zap, Globe } from 'lucide-react';
import { useAIFetchContent, useAIFetchDirectUrl } from '@/hooks/useAIPlatforms';

interface AIContentFetcherProps {
  platformId: string;
  platformName: string;
}

const AIContentFetcher = ({ platformId, platformName }: AIContentFetcherProps) => {
  const [directUrl, setDirectUrl] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const fetchContentMutation = useAIFetchContent();
  const fetchDirectUrlMutation = useAIFetchDirectUrl();

  const handleFetchContent = () => {
    fetchContentMutation.mutate({ 
      platformId, 
      useAI,
      prompt: customPrompt || undefined
    });
  };

  const handleFetchDirectUrl = () => {
    if (!directUrl.trim()) return;
    
    try {
      new URL(directUrl);
      fetchDirectUrlMutation.mutate({ 
        platformId, 
        directUrl: directUrl.trim(),
        useAI,
        prompt: customPrompt || undefined
      });
    } catch (error) {
      console.error('Invalid URL provided');
    }
  };

  const isLoading = fetchContentMutation.isPending || fetchDirectUrlMutation.isPending;

  return (
    <div className="space-y-6">
      {/* AI Toggle Card */}
      <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent flex items-center justify-between">
            <span className="flex items-center">
              <Brain className="h-5 w-5 text-blue-400 mr-2" />
              Content Extraction Method
            </span>
            <Badge variant={useAI ? "default" : "secondary"} className="bg-gradient-to-r from-green-600 to-blue-600">
              {useAI ? 'AI-Powered' : 'Standard'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">Use AI-Enhanced Extraction</p>
              <p className="text-xs text-gray-400">
                AI can bypass blocking mechanisms and handle complex website structures
              </p>
            </div>
            <Switch
              checked={useAI}
              onCheckedChange={setUseAI}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>
          
          {useAI && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="flex items-center text-sm text-blue-300 mb-2">
                <Zap className="h-4 w-4 mr-2" />
                AI Features Enabled
              </div>
              <ul className="text-xs text-gray-300 space-y-1">
                <li>• Intelligent website strategy selection</li>
                <li>• Advanced anti-blocking techniques</li>
                <li>• Content structure analysis</li>
                <li>• Individual post extraction from archives</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Content Fetcher */}
      <Card className="bg-black/40 backdrop-blur-sm border-green-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <Globe className="h-5 w-5 text-green-400 mr-2" />
            Fetch Latest Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-300">
            Extract all blog posts and articles from {platformName} automatically.
          </div>
          
          <Button
            onClick={handleFetchContent}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Globe className="h-4 w-4 mr-2" />
            )}
            {useAI ? 'AI Scan Latest Intel' : 'Scan Latest Intel'}
          </Button>
        </CardContent>
      </Card>

      {/* Direct URL Fetcher */}
      <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <Link className="h-5 w-5 text-purple-400 mr-2" />
            Fetch Specific URL
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-300">
            Enter a direct URL to extract content from a specific page or article.
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
              disabled={isLoading || !directUrl.trim()}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Fetch'
              )}
            </Button>
          </div>
          
          {directUrl && (
            <div className="text-xs text-gray-400 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {useAI ? 'AI will automatically detect the best extraction strategy' : 'Standard extraction method will be used'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Options */}
      {useAI && (
        <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30 shadow-xl">
          <CardHeader>
            <CardTitle 
              className="text-lg bg-gradient-to-r from-orange-400 to-cyan-400 bg-clip-text text-transparent flex items-center cursor-pointer"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Brain className="h-5 w-5 text-orange-400 mr-2" />
              Advanced AI Options
              <span className="ml-auto text-sm">{showAdvanced ? '▼' : '▶'}</span>
            </CardTitle>
          </CardHeader>
          {showAdvanced && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">Custom AI Prompt</label>
                <Textarea
                  placeholder="e.g., Focus on extracting security research articles from the last month, or extract only posts about AI security..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-400 min-h-[80px]"
                />
                <p className="text-xs text-gray-400">
                  Provide specific instructions to guide the AI in content extraction
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIContentFetcher;
