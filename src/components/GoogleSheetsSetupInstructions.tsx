
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Key, FileSpreadsheet, RefreshCw, CheckCircle } from 'lucide-react';
import { GoogleOAuthHelper } from './GoogleOAuthHelper';

export const GoogleSheetsSetupInstructions = () => {
  return (
    <div className="space-y-4">
      <GoogleOAuthHelper />
      
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            Setup Complete - Ready to Use!
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg space-y-2">
            <div className="font-medium text-green-800 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Your Google Cloud Setup is Complete!
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>✅ Google Sheets API is enabled</li>
              <li>✅ OAuth 2.0 credentials are configured</li>
              <li>✅ Client ID and Secret are saved securely</li>
              <li>✅ Ready to generate access tokens</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <div className="font-medium">Generate Access Token</div>
                <div className="text-sm text-gray-600">
                  Use the "Generate Access Token" button above to get your token via OAuth 2.0 Playground.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <div className="font-medium">Paste Token & Create Sheet</div>
                <div className="text-sm text-gray-600">
                  Paste your access token in the Google Sheets integration and click "Create Advanced Financial Dashboard".
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-3 rounded-lg space-y-2">
            <div className="font-medium text-green-800 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              How Offline Sync Works
            </div>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Your data is exported to a Google Sheet with full functionality</li>
              <li>• You can edit the Google Sheet offline (Google Sheets works offline)</li>
              <li>• When you come back online, use "Two-Way Sync" to merge changes</li>
              <li>• Changes from both platforms are synchronized automatically</li>
              <li>• All your clients, jobs, and leads data stays in sync</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-800 mb-1">Pro Tips:</div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Don't delete the ID columns in Google Sheets - they're needed for sync</li>
              <li>• Use "Export" before making platform changes to avoid conflicts</li>
              <li>• Use "Import" after making Google Sheets changes</li>
              <li>• "Two-Way Sync" combines both export and import operations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
