
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Key, FileSpreadsheet, RefreshCw } from 'lucide-react';

export const GoogleSheetsSetupInstructions = () => {
  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-600" />
          Google Sheets Setup Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">1</Badge>
            <div>
              <div className="font-medium">Enable Google Sheets API</div>
              <div className="text-sm text-gray-600">
                Go to <a href="https://console.cloud.google.com/" target="_blank" className="text-blue-600 underline">Google Cloud Console</a> and enable the Sheets API for your project.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">2</Badge>
            <div>
              <div className="font-medium">Create OAuth 2.0 Credentials</div>
              <div className="text-sm text-gray-600">
                Create OAuth 2.0 client credentials and add your domain to authorized origins.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">3</Badge>
            <div>
              <div className="font-medium">Get Access Token</div>
              <div className="text-sm text-gray-600">
                Use OAuth 2.0 playground or your app to get an access token with <code className="bg-gray-100 px-1">https://www.googleapis.com/auth/spreadsheets</code> scope.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Badge variant="outline" className="mt-1">4</Badge>
            <div>
              <div className="font-medium">Paste Token & Create Sheet</div>
              <div className="text-sm text-gray-600">
                Paste your access token above and click "Create New Google Sheet" to get started.
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
  );
};
