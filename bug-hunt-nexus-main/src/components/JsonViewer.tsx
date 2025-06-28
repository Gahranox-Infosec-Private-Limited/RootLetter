
////////////////////////////////////////////////////////////////////////////////
// Copyright (c) GAHRANOX INFOSEC 2025
//
// @Author: Data Visualization Team
//
// Purpose: Advanced JSON data viewer component for security intelligence
// This component provides interactive visualization of complex JSON data structures
// with collapsible sections, syntax highlighting, and copy functionality.
//
// 1) Renders JSON data with hierarchical collapsible structure
// 2) Provides syntax highlighting for different data types
// 3) Implements copy-to-clipboard functionality with user feedback
// 4) Handles complex nested objects and arrays safely
// 5) Validates input data and prevents rendering errors
// 6) Applies cybersecurity theming with professional appearance
////////////////////////////////////////////////////////////////////////////////

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, ChevronDown, ChevronRight, Shield } from 'lucide-react';

interface JsonViewerProps {
  data: any;
  title?: string;
}

const JsonViewer = ({ data, title = "JSON Data" }: JsonViewerProps) => {
  const [copied, setCopied] = useState(false);
  const [collapsed, setCollapsed] = useState<{ [key: string]: boolean }>({});

  /**
   * Handles copying JSON data to clipboard with error handling
   */
  const handleCopy = async () => {
    try {
      if (!data) {
        console.warn('No data available to copy');
        return;
      }

      const jsonString = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  /**
   * Toggles collapse state for nested objects and arrays
   * @param key - Unique key for the collapsible section
   */
  const toggleCollapse = (key: string) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  /**
   * Recursively renders JSON values with proper formatting and syntax highlighting
   * @param value - The value to render
   * @param key - The key for the value
   * @param depth - Current nesting depth
   * @returns Rendered React node
   */
  const renderJsonValue = (value: any, key: string, depth: number = 0): React.ReactNode => {
    // Handle null values
    if (value === null) {
      return <span className="text-gray-400">null</span>;
    }
    
    // Handle string values
    if (typeof value === 'string') {
      return <span className="text-green-400">"{value}"</span>;
    }
    
    // Handle numeric values
    if (typeof value === 'number') {
      return <span className="text-blue-400">{value}</span>;
    }
    
    // Handle boolean values
    if (typeof value === 'boolean') {
      return <span className="text-purple-400">{value.toString()}</span>;
    }
    
    // Handle array values
    if (Array.isArray(value)) {
      const collapseKey = `${key}-${depth}`;
      const isCollapsed = collapsed[collapseKey];
      
      return (
        <div>
          <button
            onClick={() => toggleCollapse(collapseKey)}
            className="text-gray-300 hover:text-cyan-400 inline-flex items-center transition-colors"
            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} array with ${value.length} items`}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-1">[{value.length} items]</span>
          </button>
          {!isCollapsed && (
            <div className="ml-4 border-l-2 border-cyan-500/30 pl-4">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-400">{index}:</span>{' '}
                  {renderJsonValue(item, `${key}-${index}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // Handle object values
    if (typeof value === 'object') {
      const collapseKey = `${key}-${depth}`;
      const isCollapsed = collapsed[collapseKey];
      const keys = Object.keys(value);
      
      return (
        <div>
          <button
            onClick={() => toggleCollapse(collapseKey)}
            className="text-gray-300 hover:text-cyan-400 inline-flex items-center transition-colors"
            aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} object with ${keys.length} keys`}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span className="ml-1">{`{${keys.length} keys}`}</span>
          </button>
          {!isCollapsed && (
            <div className="ml-4 border-l-2 border-cyan-500/30 pl-4">
              {keys.map((objKey) => (
                <div key={objKey} className="my-1">
                  <span className="text-cyan-400 font-medium">"{objKey}":</span>{' '}
                  {renderJsonValue(value[objKey], `${key}-${objKey}`, depth + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    
    // Fallback for any other type
    return <span className="text-gray-300">{String(value)}</span>;
  };

  // Validate data before rendering
  if (!data) {
    return (
      <Card className="w-full bg-gray-900/80 backdrop-blur-sm border-cyan-500/30 shadow-2xl">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="text-gray-400">No data available to display</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-900/80 backdrop-blur-sm border-cyan-500/30 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-cyan-600 to-green-600 text-black rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-black/30 text-white border-white/20">
              {Array.isArray(data) ? `${data.length} items` : 'Object'}
            </Badge>
            <Button
              onClick={handleCopy}
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-black hover:bg-white/20"
              aria-label="Copy JSON data to clipboard"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="bg-black/80 rounded-lg p-4 overflow-auto max-h-96 border border-cyan-500/20">
          <pre className="text-sm text-gray-100 font-mono leading-relaxed">
            {renderJsonValue(data, 'root')}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};

export default JsonViewer;
