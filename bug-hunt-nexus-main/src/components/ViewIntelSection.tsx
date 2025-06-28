
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Code, Download } from 'lucide-react';
import JsonViewer from '@/components/JsonViewer';
import PaginatedContent from '@/components/PaginatedContent';

interface ViewIntelSectionProps {
  content: any[];
  platformName: string;
}

const ViewIntelSection = ({ content, platformName }: ViewIntelSectionProps) => {
  if (!content || content.length === 0) {
    return (
      <Card className="bg-black/40 backdrop-blur-sm border-red-500/30 shadow-2xl">
        <CardContent className="p-8 text-center">
          <Shield className="h-16 w-16 mx-auto mb-4 text-red-400/50" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">No Intelligence Available</h3>
          <p className="text-gray-300">
            No security content has been collected yet. Click "Extract Latest Intelligence" to gather data.
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

  // Clean JSON data without unwanted metadata fields
  const cleanJsonData = {
    platform: platformName,
    total_items: sortedContent.length,
    extraction_date: new Date().toISOString(),
    content_types: Array.from(new Set(sortedContent.map(item => item.content_type))),
    date_range: {
      from: sortedContent.length > 0 ? new Date(Math.min(...sortedContent.map(item => new Date(item.extracted_at).getTime()))).toISOString() : null,
      to: sortedContent.length > 0 ? new Date(Math.max(...sortedContent.map(item => new Date(item.extracted_at).getTime()))).toISOString() : null
    },
    security_content: sortedContent.map(item => ({
      title: item.title,
      content: item.content,
      url: item.url,
      content_type: item.content_type,
      date_posted: item.extracted_at
    }))
  };

  // Download JSON functionality
  const downloadAsJson = () => {
    const jsonData = JSON.stringify(cleanJsonData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platformName.toLowerCase().replace(/\s+/g, '-')}-intel-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-red-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center mb-2">
              <FileText className="h-6 w-6 text-red-400 mr-2" />
              Security Intelligence - Last 2 Months
            </h3>
            <p className="text-gray-300">
              Latest security content, advisories, and research collected from {platformName}
            </p>
          </div>
          <Button 
            onClick={downloadAsJson}
            size="sm"
            className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* JSON Data Display - FIRST */}
      <Card className="bg-black/40 backdrop-blur-sm border-green-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
            <Code className="h-5 w-5 text-green-400 mr-2" />
            JSON Intelligence Data Export
          </CardTitle>
        </CardHeader>
        <CardContent>
          <JsonViewer 
            data={cleanJsonData} 
            title={`${platformName} - Security Intelligence Export (Last 2 Months)`}
          />
        </CardContent>
      </Card>

      {/* All Content Display - SECOND */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent flex items-center">
          <Shield className="h-5 w-5 text-cyan-400 mr-2" />
          Historical Intelligence Content
        </h4>
        
        <PaginatedContent content={sortedContent} showAllContent={true} />
      </div>

      {/* Summary Statistics */}
      <Card className="bg-black/40 backdrop-blur-sm border-red-500/30 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent flex items-center">
            <Shield className="h-5 w-5 text-red-400 mr-2" />
            Collection Summary (Last 2 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewIntelSection;
