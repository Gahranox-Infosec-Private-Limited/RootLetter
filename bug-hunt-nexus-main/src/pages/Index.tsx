
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Shield, Bug, Database, Building2, Loader2, Sparkles, Search, Newspaper } from 'lucide-react';
import { usePlatforms, useFetchContent } from '@/hooks/usePlatforms';

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();
  const fetchContentMutation = useFetchContent();

  // Security news websites data - these will be treated as platforms for content fetching
  const securityNewsData = [
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
    { id: 'cybercrimemagazine', name: 'Cybercrime Magazine', url: 'https://www.cybercrimemagazine.com', description: 'Cybercrime and cybersecurity magazine', category: 'Security News' }
  ];

  const getCategoryIcon = (category: string) => {
    if (!category) {
      return <Shield className="h-5 w-5 text-blue-600" />;
    }

    switch (category) {
      case 'Bug Bounty':
        return <Bug className="h-5 w-5 text-green-600" />;
      case 'Security Resource':
        return <Database className="h-5 w-5 text-purple-600" />;
      case 'Company Portal':
        return <Building2 className="h-5 w-5 text-orange-600" />;
      case 'Security News':
        return <Newspaper className="h-5 w-5 text-red-600" />;
      default:
        return <Shield className="h-5 w-5 text-blue-600" />;
    }
  };

  const getCategoryData = (category: string) => {
    if (!platforms || !Array.isArray(platforms)) {
      return [];
    }
    
    let filtered = platforms.filter(platform => platform?.category === category);
    
    // Remove duplicates from Security Resource category based on URL
    if (category === 'Security Resource') {
      const seen = new Set();
      filtered = filtered.filter(platform => {
        const url = platform.url?.toLowerCase() || '';
        if (seen.has(url)) {
          return false;
        }
        seen.add(url);
        return true;
      });
    }
    
    if (searchTerm) {
      return filtered.filter(platform =>
        platform.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        platform.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getSecurityNewsData = () => {
    if (searchTerm) {
      return securityNewsData.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return securityNewsData;
  };

  const PlatformCard = ({ platform }: { platform: any }) => {
    if (!platform) {
      return null;
    }

    const handleViewContent = () => {
      if (platform.id) {
        navigate(`/platform/${platform.id}`);
      }
    };

    const handleFetchContent = () => {
      if (platform.id) {
        fetchContentMutation.mutate(platform.id);
      }
    };

    return (
      <Card className="hover:shadow-xl transition-all duration-300 bg-gray-900/90 backdrop-blur-sm border-cyan-500/30 hover:border-cyan-400/50 group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(platform.category)}
              <CardTitle className="text-lg bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-green-300 transition-all duration-300">
                {platform.name || 'Unknown Platform'}
              </CardTitle>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-cyan-400 transition-colors" />
          </div>
          <CardDescription className="text-sm text-gray-300">
            {platform.description || 'No description available'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-cyan-900/50 to-green-900/50 border-cyan-500/30 text-cyan-300">
              {platform.url ? platform.url.replace('https://', '').split('/')[0] : 'No URL'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleViewContent}
              className="bg-gray-800/50 hover:bg-gray-700/80 border-cyan-500/30 hover:border-cyan-400/50 text-cyan-300 hover:text-cyan-200"
            >
              View Intel
            </Button>
            <Button 
              size="sm"
              onClick={handleFetchContent}
              disabled={fetchContentMutation.isPending}
              className="bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-700 hover:to-green-700 text-black font-medium"
            >
              {fetchContentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Scan Latest'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Security News Card component - now with same functionality as PlatformCard
  const SecurityNewsCard = ({ item }: { item: any }) => {
    const handleViewContent = () => {
      if (item.id) {
        navigate(`/platform/${item.id}`);
      }
    };

    const handleFetchContent = () => {
      if (item.id) {
        fetchContentMutation.mutate(item.id);
      }
    };

    return (
      <Card className="hover:shadow-xl transition-all duration-300 bg-gray-900/90 backdrop-blur-sm border-red-500/30 hover:border-red-400/50 group">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getCategoryIcon(item.category)}
              <CardTitle className="text-lg bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent group-hover:from-red-300 group-hover:to-orange-300 transition-all duration-300">
                {item.name}
              </CardTitle>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-red-400 transition-colors" />
          </div>
          <CardDescription className="text-sm text-gray-300">
            {item.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/30 text-red-300">
              {item.url.replace('https://', '').split('/')[0]}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleViewContent}
              className="bg-gray-800/50 hover:bg-gray-700/80 border-red-500/30 hover:border-red-400/50 text-red-300 hover:text-red-200"
            >
              View Intel
            </Button>
            <Button 
              size="sm"
              onClick={handleFetchContent}
              disabled={fetchContentMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-black font-medium"
            >
              {fetchContentMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Scan Latest'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (platformsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="text-center bg-gray-900/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-cyan-500/30">
          <Loader2 className="h-12 w-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-cyan-300">Initializing security platforms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Cybersecurity Header */}
        <div className="text-center mb-12 bg-gray-900/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-cyan-500/30">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-green-400 to-cyan-300 bg-clip-text text-transparent">
                🔒 Bug Hunt Explorer
              </h1>
              <Sparkles className="absolute -top-2 -right-8 h-6 w-6 text-yellow-400 animate-pulse" />
            </div>
          </div>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Advanced security intelligence platform for vulnerability research and threat analysis
            <span className="block mt-2 text-sm text-cyan-400 font-medium">
              ✨ Real-time threat data aggregation and security platform monitoring
            </span>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search cybersecurity resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{platforms?.length || 0}</p>
                  <p className="text-slate-400 text-sm">Total Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Bug className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{getCategoryData('Bug Bounty').length}</p>
                  <p className="text-slate-400 text-sm">Bug Bounty</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{getCategoryData('Security Resource').length}</p>
                  <p className="text-slate-400 text-sm">Security Resources</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Newspaper className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{securityNewsData.length}</p>
                  <p className="text-slate-400 text-sm">Security News</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="bounty" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 shadow-lg">
            <TabsTrigger value="bounty" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-green-600 data-[state=active]:text-black text-gray-300">
              <Bug className="h-4 w-4" />
              <span>Bug Bounty</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-green-600 data-[state=active]:text-black text-gray-300">
              <Database className="h-4 w-4" />
              <span>Security Resources</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-green-600 data-[state=active]:text-black text-gray-300">
              <Building2 className="h-4 w-4" />
              <span>Company Portals</span>
            </TabsTrigger>
            <TabsTrigger value="news" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-black text-gray-300">
              <Newspaper className="h-4 w-4" />
              <span>Security News</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bounty" className="space-y-6">
            <div className="flex items-center space-x-2 mb-6 bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30">
              <Shield className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                Bug Bounty & Vulnerability Disclosure Platforms
              </h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-cyan-900/50 to-green-900/50 border-cyan-500/30 text-cyan-300">
                {getCategoryData('Bug Bounty').length} platforms
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCategoryData('Bug Bounty').map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <div className="flex items-center space-x-2 mb-6 bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30">
              <Database className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                Security Resource Websites
              </h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-cyan-900/50 to-green-900/50 border-cyan-500/30 text-cyan-300">
                {getCategoryData('Security Resource').length} resources
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCategoryData('Security Resource').map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6">
            <div className="flex items-center space-x-2 mb-6 bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/30">
              <Building2 className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
                Enterprise Vulnerability Portals
              </h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-cyan-900/50 to-green-900/50 border-cyan-500/30 text-cyan-300">
                {getCategoryData('Company Portal').length} portals
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getCategoryData('Company Portal').map((platform) => (
                <PlatformCard key={platform.id} platform={platform} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="news" className="space-y-6">
            <div className="flex items-center space-x-2 mb-6 bg-gray-900/60 backdrop-blur-sm rounded-xl p-4 border border-red-500/30">
              <Newspaper className="h-6 w-6 text-red-400" />
              <h2 className="text-2xl font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Security News & Intelligence Sources
              </h2>
              <Badge variant="secondary" className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-500/30 text-red-300">
                {getSecurityNewsData().length} sources
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getSecurityNewsData().map((item) => (
                <SecurityNewsCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
