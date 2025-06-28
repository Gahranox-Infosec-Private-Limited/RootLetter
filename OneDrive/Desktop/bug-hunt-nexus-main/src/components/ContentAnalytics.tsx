
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import React from 'react';

interface ContentAnalyticsProps {
  content: any[];
}

const ContentAnalytics = ({ content }: ContentAnalyticsProps) => {
  // Content type distribution
  const contentTypes = content.reduce((acc, item) => {
    const type = item.content_type || 'general';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalContent = content.length;
  const avgContentPerDay = totalContent / 7;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Statistics Cards */}
      <div className="space-y-4">
        <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent flex items-center">
              <TrendingUp className="h-5 w-5 text-cyan-400 mr-2" />
              Intelligence Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-gray-300">Total Content</span>
                </div>
                <p className="text-2xl font-bold text-green-400">{totalContent}</p>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Daily Avg</span>
                </div>
                <p className="text-2xl font-bold text-blue-400">{avgContentPerDay.toFixed(1)}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <AlertTriangle className="h-4 w-4 text-orange-400 mr-1" />
                Content Types
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(contentTypes).map(([type, count]: [string, number]) => (
                  <Badge 
                    key={type} 
                    variant="outline" 
                    className="bg-gray-800/50 border-cyan-500/30 text-cyan-300"
                  >
                    {type}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Summary Card */}
      <Card className="bg-black/40 backdrop-blur-sm border-cyan-500/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">
            Content Summary
          </CardTitle>
          <CardDescription className="text-gray-300">
            Latest security intelligence overview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Recent Articles</span>
              <span className="text-lg font-bold text-green-400">{totalContent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Content Types</span>
              <span className="text-lg font-bold text-blue-400">{Object.keys(contentTypes).length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">Average/Day</span>
              <span className="text-lg font-bold text-purple-400">{avgContentPerDay.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalytics;
