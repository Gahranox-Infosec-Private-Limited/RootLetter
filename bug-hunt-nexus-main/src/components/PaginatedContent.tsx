
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Clock, ChevronDown, ChevronUp, AlertTriangle, Shield } from 'lucide-react';

interface PaginatedContentProps {
  content: any[];
  itemsPerPage?: number;
  showAllContent?: boolean;
}

const PaginatedContent = ({ content, itemsPerPage = 10, showAllContent = false }: PaginatedContentProps) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
        return <FileText className="h-4 w-4" />;
      case 'publication':
        return <FileText className="h-4 w-4" />;
      case 'bulletin':
        return <AlertTriangle className="h-4 w-4" />;
      case 'blog_post':
        return <FileText className="h-4 w-4" />;
      case 'news_article':
        return <FileText className="h-4 w-4" />;
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
      case 'blog_post':
        return 'bg-cyan-600/20 border-cyan-500 text-cyan-400';
      case 'news_article':
        return 'bg-indigo-600/20 border-indigo-500 text-indigo-400';
      default:
        return 'bg-gray-600/20 border-gray-500 text-gray-400';
    }
  };

  if (content.length === 0) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-red-500/30 shadow-2xl">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-400/50" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">No Content Available</h3>
          <p className="text-gray-300">
            No security content has been collected yet. Click "Extract Latest Intelligence" to gather data.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Display all content if showAllContent is true, otherwise use pagination
  const displayContent = showAllContent ? content : content.slice(0, itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Content Grid */}
      <div className="grid gap-6">
        {displayContent.map((item, index) => {
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

      {/* Total Content Info */}
      {showAllContent && (
        <div className="text-center text-sm text-gray-400">
          Showing all {content.length} items
        </div>
      )}
    </div>
  );
};

export default PaginatedContent;
