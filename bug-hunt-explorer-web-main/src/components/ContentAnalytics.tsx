
////////////////////////////////////////////////////////////////////////////////
// Copyright (c) GAHRANOX INFOSEC 2025
//
// @Author: Security Analytics Team
//
// Purpose: Content analytics dashboard component for security intelligence metrics
// This component analyzes and displays statistical information about collected
// security content including temporal patterns, volume metrics, and activity trends.
//
// 1) Calculates and displays 7-day content collection statistics
// 2) Provides visual metrics for threat intelligence volume
// 3) Shows peak activity periods and daily averages
// 4) Implements responsive card layout with cybersecurity theming
// 5) Validates input data and handles edge cases
// 6) Tracks latest scan timestamps and content freshness
////////////////////////////////////////////////////////////////////////////////

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calendar, FileText, Clock, Shield, AlertTriangle, Zap, Activity } from 'lucide-react';

interface ContentAnalyticsProps {
  content: any[];
}

const ContentAnalytics = ({ content }: ContentAnalyticsProps) => {
  /**
   * Generates analytics data for the last 7 days with validation
   * @returns Array of daily data objects with date and count
   */
  const getLast7DaysData = () => {
    if (!content || !Array.isArray(content)) {
      return [];
    }

    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        count: 0
      };
    }).reverse();

    content.forEach(item => {
      if (item && item.extracted_at) {
        try {
          const itemDate = new Date(item.extracted_at).toISOString().split('T')[0];
          const dayData = last7Days.find(day => day.date === itemDate);
          if (dayData) {
            dayData.count++;
          }
        } catch (error) {
          console.warn('Invalid date format in content item:', item.extracted_at);
        }
      }
    });

    return last7Days;
  };

  const weekData = getLast7DaysData();
  const totalContent = content ? content.length : 0;
  const avgPerDay = weekData.length > 0 ? Math.round(totalContent / 7) : 0;
  const maxDay = weekData.length > 0 
    ? weekData.reduce((max, day) => day.count > max.count ? day : max, weekData[0])
    : { count: 0, displayDate: 'N/A' };

  // Get latest scan timestamp with validation
  const getLatestScanDate = () => {
    if (!content || content.length === 0) {
      return 'No data';
    }

    try {
      const latestItem = content[0];
      if (latestItem && latestItem.extracted_at) {
        return new Date(latestItem.extracted_at).toLocaleDateString();
      }
      return 'Invalid date';
    } catch (error) {
      console.warn('Error parsing latest scan date:', error);
      return 'Parse error';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Intelligence Metric */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-red-600/50 backdrop-blur-sm hover:border-red-500/70 transition-all duration-300 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-400 flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Total Intel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalContent}</div>
          <p className="text-xs text-gray-400 mt-1">Last 7 days</p>
        </CardContent>
      </Card>

      {/* Daily Average Metric */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-green-600/50 backdrop-blur-sm hover:border-green-500/70 transition-all duration-300 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-400 flex items-center">
            <Activity className="h-4 w-4 mr-2" />
            Daily Average
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{avgPerDay}</div>
          <p className="text-xs text-gray-400 mt-1">Reports per day</p>
        </CardContent>
      </Card>

      {/* Peak Activity Metric */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-orange-600/50 backdrop-blur-sm hover:border-orange-500/70 transition-all duration-300 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-orange-400 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Peak Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{maxDay.count}</div>
          <p className="text-xs text-gray-400 mt-1">{maxDay.displayDate}</p>
        </CardContent>
      </Card>

      {/* Latest Scan Metric */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-purple-600/50 backdrop-blur-sm hover:border-purple-500/70 transition-all duration-300 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-purple-400 flex items-center">
            <Zap className="h-4 w-4 mr-2" />
            Latest Scan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm font-bold text-white">
            {getLatestScanDate()}
          </div>
          <p className="text-xs text-gray-400 mt-1">Most recent</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentAnalytics;
