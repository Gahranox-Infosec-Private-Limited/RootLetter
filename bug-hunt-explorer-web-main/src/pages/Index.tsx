
////////////////////////////////////////////////////////////////////////////////
// Copyright (c) GAHRANOX INFOSEC 2025
//
// @Author: Security Development Team
//
// Purpose: Main landing page component for Bug Hunt Explorer platform
// This component displays security platforms categorized by type and provides
// navigation to platform-specific content pages. It serves as the primary
// entry point for users to access various cybersecurity platforms and resources.
//
// 1) Displays platforms in categorized tabs (Bug Bounty, Security Resources, Company Portals)
// 2) Provides platform overview cards with action buttons
// 3) Handles content fetching mutations for real-time data updates
// 4) Implements responsive design with cybersecurity theming
// 5) Manages navigation to individual platform content pages
// 6) Provides loading states and error handling for platform data
////////////////////////////////////////////////////////////////////////////////

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, Bug, Database, Building2, Loader2, Sparkles } from 'lucide-react';
import { usePlatforms, useFetchContent } from '@/hooks/usePlatforms';

const Index = () => {
  const navigate = useNavigate();
  const { data: platforms = [], isLoading: platformsLoading } = usePlatforms();
  const fetchContentMutation = useFetchContent();

  /**
   * Returns appropriate icon component based on platform category
   * @param category - Platform category string
   * @returns React icon component
   */
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
      default:
        return <Shield className="h-5 w-5 text-blue-600" />;
    }
  };

  /**
   * Filters platforms by category with validation
   * @param category - Category to filter by
   * @returns Filtered platform array
   */
  const getCategoryData = (category: string) => {
    if (!platforms || !Array.isArray(platforms)) {
      return [];
    }
    return platforms.filter(platform => platform?.category === category);
  };

  /**
   * Platform card component with enhanced security theming
   * @param platform - Platform object containing platform details
   */
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

  // Loading state with enhanced cybersecurity theming
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

        <Tabs defaultValue="bounty" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-gray-900/80 backdrop-blur-sm border border-cyan-500/30 shadow-lg">
            <TabsTrigger value="bounty" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-green-600 data-[state=active]:text-black text-gray-300">
              <Bug className="h-4 w-4" />
              <span>Bug Bounty Platforms</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-green-600 data-[state=active]:text-black text-gray-300">
              <Database className="h-4 w-4" />
              <span>Security Resources</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-green-600 data-[state=active]:text-black text-gray-300">
              <Building2 className="h-4 w-4" />
              <span>Company Portals</span>
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
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
