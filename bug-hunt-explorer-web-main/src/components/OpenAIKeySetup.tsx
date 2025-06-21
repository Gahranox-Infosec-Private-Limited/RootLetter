
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Key } from 'lucide-react';

const OpenAIKeySetup = () => {
  return (
    <Card className="bg-black/40 backdrop-blur-sm border-yellow-500/30 shadow-xl mb-6">
      <CardHeader>
        <CardTitle className="text-lg bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent flex items-center">
          <Key className="h-5 w-5 text-yellow-400 mr-2" />
          OpenAI API Configuration Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
          <div className="space-y-2">
            <p className="text-gray-300 text-sm">
              To use AI-powered content extraction with function calling, you need to configure your OpenAI API key.
            </p>
            <p className="text-gray-400 text-xs">
              This enables advanced features like bypassing website blocks and intelligent content parsing.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenAIKeySetup;
