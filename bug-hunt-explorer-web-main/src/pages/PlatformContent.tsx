import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw, Shield, AlertTriangle, Zap } from 'lucide-react';
import { usePlatforms, useFetchContent, usePlatformContent } from '@/hooks/usePlatforms';
import ContentAnalytics from '@/components/ContentAnalytics';
import ViewIntelSection from '@/components/ViewIntelSection';

const PlatformContent = () => {
  const { platformId } = useParams<{ platformId: string }>();
  const { data: platforms = [] } = usePlatforms();
  const { data: platformContent, isLoading: contentLoading } = usePlatformContent(platformId);
  const fetchContentMutation = useFetchContent();

  const platform = platforms.find(p => p.id === platformId);

  const handleFetchContent = () => {
    fetchContentMutation.mutate({ platformId: platform.id });
  };

  // Simply display all content without any filtering
  const validContent = platformContent || [];

  // For analytics, get unique content by date
  const getUniqueContentByDate = (content: any[]) => {
    const dateMap = new Map();
    content.forEach(item => {
      const date = new Date(item.extracted_at).toDateString();
      if (!dateMap.has(date)) {
        dateMap.set(date, item);
      }
    });
    return Array.from(dateMap.values());
  };

  const uniqueContent = validContent.length > 0 ? getUniqueContentByDate(validContent) : [];

  if (!platform) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black flex items-center justify-center">
        <div className="text-center bg-black/80 p-8 rounded-xl shadow-2xl border border-red-500/30">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-400 mb-4">Platform Not Found</h1>
          <p className="text-gray-300 mb-6">The requested security platform could not be located.</p>
          <Link to="/">
            <Button variant="outline" className="bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Base
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Cybersecurity Header */}
        <div className="flex items-center justify-between mb-8 bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-red-500/30">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm" className="bg-red-600/20 border-red-500 text-red-400 hover:bg-red-600/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center">
                <Shield className="h-8 w-8 text-red-400 mr-3" />
                {platform?.name || 'Security Platform'}
              </h1>
              <p className="text-gray-300 mt-2">{platform?.description || 'Security intelligence source'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm bg-red-600/20 border-red-500 text-red-400">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {platform?.category || 'Security'}
            </Badge>
          </div>
        </div>

        {/* Platform Info Card */}
        <Card className="mb-8 bg-black/40 backdrop-blur-sm border-red-500/30 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center">
                <Zap className="h-5 w-5 text-red-400 mr-2" />
                Intelligence Source
              </span>
              {platform?.url && (
                <a 
                  href={platform.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </CardTitle>
            <CardDescription className="text-gray-300">
              Target: {platform?.url || 'Security platform'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Content Fetcher */}
        <Card className="mb-8 bg-black/40 backdrop-blur-sm border-green-500/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
              <RefreshCw className="h-5 w-5 text-green-400 mr-2" />
              Fetch Latest Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300">
              Extract all security content, advisories, and articles from {platform?.name || 'this platform'} from the last 2 months.
            </div>
            
            <Button
              onClick={handleFetchContent}
              disabled={fetchContentMutation.isPending}
              className="w-full bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700"
            >
              {fetchContentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Scan Latest Intel
            </Button>
          </CardContent>
        </Card>

        {/* Content Analytics */}
        {uniqueContent && uniqueContent.length > 0 && (
          <ContentAnalytics content={uniqueContent} />
        )}

        {/* Content Loading State */}
        {contentLoading ? (
          <div className="flex items-center justify-center py-12 bg-black/40 backdrop-blur-sm rounded-xl border border-red-500/30">
            <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            <span className="ml-3 text-gray-300">Scanning for threats...</span>
          </div>
        ) : validContent && validContent.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center mb-6">
              <Shield className="h-6 w-6 text-red-400 mr-2" />
              Security Intelligence ({validContent.length} items)
            </h2>
            <ViewIntelSection content={validContent} platformName={platform?.name || 'Security Platform'} />
          </div>
        ) : (
          <Card className="text-center py-12 bg-black/40 backdrop-blur-sm border-red-500/30 shadow-2xl">
            <CardContent>
              <div className="space-y-4">
                <div className="text-gray-300">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-red-400/50" />
                  <p className="text-lg font-medium">No intelligence available</p>
                  <p className="text-sm">
                    Use the content fetcher above to gather recent security content from {platform?.name || 'this platform'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PlatformContent;
