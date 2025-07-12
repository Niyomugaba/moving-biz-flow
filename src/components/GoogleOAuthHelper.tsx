
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Key, Copy } from 'lucide-react';
import { GOOGLE_OAUTH_CONFIG, generateOAuthUrl } from '@/config/googleAuth';
import { toast } from 'sonner';

export const GoogleOAuthHelper = () => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const openOAuthPlayground = () => {
    const oauthUrl = generateOAuthUrl();
    window.open(oauthUrl, '_blank');
  };

  return (
    <Card className="border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-green-600" />
          Your Google OAuth Credentials
          <Badge variant="default" className="bg-green-100 text-green-800">
            Configured
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Client ID</label>
            <div className="flex items-center gap-2">
              <div className="text-xs bg-gray-100 p-2 rounded flex-1 font-mono">
                {GOOGLE_OAUTH_CONFIG.clientId.substring(0, 20)}...
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(GOOGLE_OAUTH_CONFIG.clientId, 'Client ID')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Secret</label>
            <div className="flex items-center gap-2">
              <div className="text-xs bg-gray-100 p-2 rounded flex-1 font-mono">
                GOCSPX-***************
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(GOOGLE_OAUTH_CONFIG.clientSecret, 'Client Secret')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg space-y-3">
          <div className="font-medium text-green-800">Quick Access Token Generation</div>
          <p className="text-sm text-green-700">
            Click below to generate an access token using OAuth 2.0 Playground with your saved credentials:
          </p>
          <Button 
            onClick={openOAuthPlayground}
            className="bg-green-600 hover:bg-green-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Generate Access Token
          </Button>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-800 mb-2">Next Steps:</div>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Click "Generate Access Token" above</li>
            <li>Select "https://www.googleapis.com/auth/spreadsheets" scope</li>
            <li>Click "Authorize APIs" and complete the flow</li>
            <li>Click "Exchange authorization code for tokens"</li>
            <li>Copy the Access Token and paste it in the Google Sheets integration</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
