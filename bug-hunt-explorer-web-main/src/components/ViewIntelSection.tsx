
////////////////////////////////////////////////////////////////////////////////
// Copyright (c) GAHRANOX INFOSEC 2025
//
// @Author: Intelligence Display Team
//
// Purpose: Enhanced intelligence viewing component for security content display
// This component provides a comprehensive view of collected intelligence content
// displaying detailed security content, advisories, and articles with improved organization.
//
// 1) Displays all collected content in a clean, organized format
// 2) Shows detailed content information with metadata and content types
// 3) Implements responsive design with cybersecurity theming
// 4) Handles empty states and loading conditions gracefully
// 5) Validates content structure and displays full security content
// 6) Prevents duplicate content display and supports expandable content
////////////////////////////////////////////////////////////////////////////////

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Shield, Clock, Code, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import JsonViewer from '@/components/JsonViewer';

interface ViewIntelSectionProps {
  content: any[];
  platformName: string;
}

const ViewIntelSection = ({ content, platformName }: ViewIntelSectionProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (!content || content.length === 0) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-red-500/30 shadow-2xl">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-400/50" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">No Intelligence Available</h3>
          <p className="text-gray-300">
            No security content has been collected yet. Click "Scan Latest Intel" to gather data.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Remove duplicates based on URL and title
  const uniqueContent = content.filter((item, index, self) => 
    index === self.findIndex(other => 
      other.url === item.url || 
      (other.title.toLowerCase().trim() === item.title.toLowerCase().trim() && 
       Math.abs(new Date(other.extracted_at).getTime() - new Date(item.extracted_at).getTime()) < 24 * 60 * 60 * 1000)
    )
  );

  // Sort by date (newest first)
  const sortedContent = uniqueContent.sort((a, b) => 
    new Date(b.extracted_at).getTime() - new Date(a.extracted_at).getTime()
  );

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'security_advisory':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cve':
        return <Shield className="h-4 w-4" />;
      case 'vulnerability':
        return <AlertTriangle className="h-4 w-4" />;
      case 'security_note':
        return <FileText className="h-4 w-4" />;
      case 'research':
        return <Code className="h-4 w-4" />;
      case 'publication':
        return <FileText className="h-4 w-4" />;
      case 'bulletin':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'security_advisory':
        return 'bg-red-600/20 border-red-500 text-red-400';
      case 'cve':
        return 'bg-orange-600/20 border-orange-500 text-orange-400';
      case 'vulnerability':
        return 'bg-red-600/20 border-red-500 text-red-400';
      case 'security_note':
        return 'bg-blue-600/20 border-blue-500 text-blue-400';
      case 'research':
        return 'bg-purple-600/20 border-purple-500 text-purple-400';
      case 'publication':
        return 'bg-green-600/20 border-green-500 text-green-400';
      case 'bulletin':
        return 'bg-yellow-600/20 border-yellow-500 text-yellow-400';
      default:
        return 'bg-gray-600/20 border-gray-500 text-gray-400';
    }
  };

  // Clean JSON data without unwanted metadata fields
  const cleanJsonData = {
    platform: platformName,
    total_items: sortedContent.length,
    extraction_date: new Date().toISOString(),
    content_types: Array.from(new Set(sortedContent.map(item => item.content_type))),
    security_content: sortedContent.map(item => ({
      title: item.title,
      content: item.content,
      url: item.url,
      content_type: item.content_type,
      date: item.extracted_at
    }))
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-red-500/30">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center mb-2">
          <FileText className="h-6 w-6 text-red-400 mr-2" />
          Security Intelligence
        </h3>
        <p className="text-gray-300">
          Latest security content, advisories, and research collected from {platformName}
        </p>
        <Badge variant="secondary" className="mt-2 bg-red-600/20 border-red-500 text-red-400">
          {sortedContent.length} unique items collected
        </Badge>
      </div>

      {/* Clean JSON Data Display */}
      <Card className="bg-black/40 backdrop-blur-sm border-green-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <Code className="h-5 w-5 text-green-400 mr-2" />
            Clean JSON Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JsonViewer 
            data={cleanJsonData} 
            title={`${platformName} - Security Intelligence Data`}
          />
        </CardContent>
      </Card>

      {/* Content Cards */}
      <div className="grid gap-6">
        {sortedContent.map((item, index) => {
          const itemId = item.id || `${item.url}-${index}`;
          const isExpanded = expandedItems.has(itemId);
          const contentPreview = item.content ? item.content.substring(0, 300) : '';
          const hasMoreContent = item.content && item.content.length > 300;
          
          return (
            <Card 
              key={itemId}
              className="bg-black/40 backdrop-blur-sm border-red-500/30 shadow-xl hover:border-red-500/50 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-white flex items-start justify-between">
                  <span className="flex items-center flex-1">
                    {getContentTypeIcon(item.content_type)}
                    <span className="ml-2 line-clamp-2">{item.title}</span>
                  </span>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-red-400 hover:text-red-300 transition-colors ml-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-3 mt-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getContentTypeColor(item.content_type)}`}
                  >
                    {item.content_type?.replace('_', ' ').toUpperCase() || 'CONTENT'}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-400">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(item.extracted_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Content Preview/Full */}
                <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-red-400">Content:</h4>
                    {hasMoreContent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(itemId)}
                        className="text-gray-400 hover:text-white"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Show More
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {isExpanded ? item.content : contentPreview}
                      {!isExpanded && hasMoreContent && '...'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Statistics */}
      <Card className="bg-black/40 backdrop-blur-sm border-red-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center">
            <Shield className="h-5 w-5 text-red-400 mr-2" />
            Collection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">{sortedContent.length}</div>
              <div className="text-sm text-gray-400">Total Items</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {Array.from(new Set(sortedContent.map(item => item.content_type))).length}
              </div>
              <div className="text-sm text-gray-400">Content Types</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {Math.round(sortedContent.reduce((acc, item) => acc + (item.content?.length || 0), 0) / sortedContent.length) || 0}
              </div>
              <div className="text-sm text-gray-400">Avg Content Length</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-white">
                {sortedContent.filter(item => {
                  const date = new Date(item.extracted_at);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return date > weekAgo;
                }).length}
              </div>
              <div className="text-sm text-gray-400">Recent (7 days)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewIntelSection;
