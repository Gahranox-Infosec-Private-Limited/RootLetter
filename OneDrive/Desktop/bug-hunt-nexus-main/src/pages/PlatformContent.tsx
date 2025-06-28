
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Loader2, RefreshCw, Shield, AlertTriangle, Zap } from 'lucide-react';
import { usePlatforms, useFetchContent, usePlatformContent } from '@/hooks/usePlatforms';
import ViewIntelSection from '@/components/ViewIntelSection';
import { useToast } from '@/hooks/use-toast';

const PlatformContent = () => {
  const { platformId } = useParams<{ platformId: string }>();
  const { data: platforms = [] } = usePlatforms();
  const { data: platformContent, isLoading: contentLoading, refetch } = usePlatformContent(platformId);
  const fetchContentMutation = useFetchContent();
  const { toast } = useToast();

  const platform = platforms.find(p => p.id === platformId);

  const handleFetchContent = async () => {
    if (platform?.id) {
      console.log(`Fetching content for platform: ${platform.id}`)
      try {
        const result = await fetchContentMutation.mutateAsync(platform.id);
        
        if (result.success && result.items > 0) {
          toast({
            title: "Content Extracted Successfully",
            description: `Found ${result.items} new security articles from ${platform.name}`,
            duration: 5000,
          });
          // Refetch the content to show the new data
          refetch();
        } else {
          toast({
            title: "Extraction Complete",
            description: result.message || `Scanned ${platform.name} but found no new content`,
            variant: "destructive",
            duration: 5000,
          });
        }
      } catch (error) {
        toast({
          title: "Extraction Failed",
          description: `Failed to extract content from ${platform.name}. Please try again.`,
          variant: "destructive",
          duration: 5000,
        });
      }
    }
  };

  const validContent = platformContent || [];

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

        <Card className="mb-8 bg-black/40 backdrop-blur-sm border-green-500/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
              <RefreshCw className="h-5 w-5 text-green-400 mr-2" />
              Extract Latest Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-300">
              Scan and extract the latest cybersecurity news, advisories, and articles from {platform?.name || 'this platform'}. Our advanced extraction system will gather recent security content and intelligence reports.
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
              {fetchContentMutation.isPending ? 'Extracting Intelligence...' : 'Extract Latest Intelligence'}
            </Button>
          </CardContent>
        </Card>

        {contentLoading ? (
          <div className="flex items-center justify-center py-12 bg-black/40 backdrop-blur-sm rounded-xl border border-red-500/30">
            <Loader2 className="h-8 w-8 animate-spin text-red-400" />
            <span className="ml-3 text-gray-300">Loading intelligence data...</span>
          </div>
        ) : validContent && validContent.length > 0 ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center mb-6">
                <Shield className="h-6 w-6 text-red-400 mr-2" />
                Security Intelligence ({validContent.length} items)
              </h2>
              <ViewIntelSection content={validContent} platformName={platform?.name || 'Security Platform'} />
            </div>
          </div>
        ) : (
          <Card className="text-center py-12 bg-black/40 backdrop-blur-sm border-red-500/30 shadow-2xl">
            <CardContent>
              <div className="space-y-4">
                <div className="text-gray-300">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-red-400/50" />
                  <p className="text-lg font-medium">No intelligence available</p>
                  <p className="text-sm">
                    Click "Extract Latest Intelligence" above to gather recent security content from {platform?.name || 'this platform'}
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
