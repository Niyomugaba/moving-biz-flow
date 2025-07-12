
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GoogleSheetsSync, SyncResult } from '@/utils/googleSheetsSync';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RefreshCw, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

interface GoogleSheetsIntegrationProps {
  clients: any[];
  jobs: any[];
  leads: any[];
  isOnline: boolean;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  clients, jobs, leads, isOnline
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    // Load saved Google Sheets config
    const savedConfig = localStorage.getItem('google_sheets_config');
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setSpreadsheetId(config.spreadsheetId || '');
      setSpreadsheetUrl(config.spreadsheetUrl || '');
      setIsConnected(!!config.spreadsheetId);
      setLastSync(config.lastSync || null);
    }
  }, []);

  const saveConfig = (config: any) => {
    localStorage.setItem('google_sheets_config', JSON.stringify({
      ...config,
      lastSync: new Date().toISOString()
    }));
  };

  const handleGoogleAuth = () => {
    const clientId = ''; // You'll need to provide this
    const redirectUri = window.location.origin;
    const scope = 'https://www.googleapis.com/auth/spreadsheets';
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `response_type=token&` +
      `include_granted_scopes=true`;

    window.location.href = authUrl;
  };

  const createNewGoogleSheet = async () => {
    if (!accessToken) {
      toast.error('Please authenticate with Google first');
      return;
    }

    setIsLoading(true);
    try {
      const sheetsSync = new GoogleSheetsSync({
        spreadsheetId: '',
        clientSheetName: 'Clients',
        jobsSheetName: 'Jobs',
        leadsSheetName: 'Leads'
      }, accessToken);

      const newSpreadsheetId = await sheetsSync.createInitialSheet();
      const newSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`;
      
      setSpreadsheetId(newSpreadsheetId);
      setSpreadsheetUrl(newSpreadsheetUrl);
      setIsConnected(true);
      setLastSync(new Date().toISOString());

      saveConfig({ 
        spreadsheetId: newSpreadsheetId, 
        spreadsheetUrl: newSpreadsheetUrl,
        lastSync: new Date().toISOString()
      });

      toast.success('Google Sheet created and synced successfully!');
    } catch (error) {
      console.error('Error creating Google Sheet:', error);
      toast.error('Failed to create Google Sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToGoogleSheets = async () => {
    if (!spreadsheetId || !accessToken) {
      toast.error('Please setup Google Sheets integration first');
      return;
    }

    setIsLoading(true);
    try {
      const sheetsSync = new GoogleSheetsSync({
        spreadsheetId,
        clientSheetName: 'Clients',
        jobsSheetName: 'Jobs',
        leadsSheetName: 'Leads'
      }, accessToken);

      await sheetsSync.exportAllDataToSheets(spreadsheetId);
      setLastSync(new Date().toISOString());
      saveConfig({ spreadsheetId, spreadsheetUrl, lastSync: new Date().toISOString() });
      
      toast.success('Data exported to Google Sheets successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export to Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const importFromGoogleSheets = async () => {
    if (!spreadsheetId || !accessToken) {
      toast.error('Please setup Google Sheets integration first');
      return;
    }

    setIsLoading(true);
    try {
      const sheetsSync = new GoogleSheetsSync({
        spreadsheetId,
        clientSheetName: 'Clients',
        jobsSheetName: 'Jobs',
        leadsSheetName: 'Leads'
      }, accessToken);

      const result: SyncResult = await sheetsSync.importChangesFromSheets(spreadsheetId);
      
      if (result.success) {
        setLastSync(new Date().toISOString());
        saveConfig({ spreadsheetId, spreadsheetUrl, lastSync: new Date().toISOString() });
        toast.success(result.message);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import from Google Sheets');
    } finally {
      setIsLoading(false);
    }
  };

  const performTwoWaySync = async () => {
    if (!spreadsheetId || !accessToken) {
      toast.error('Please setup Google Sheets integration first');
      return;
    }

    setIsLoading(true);
    try {
      const sheetsSync = new GoogleSheetsSync({
        spreadsheetId,
        clientSheetName: 'Clients',
        jobsSheetName: 'Jobs',
        leadsSheetName: 'Leads'
      }, accessToken);

      const result: SyncResult = await sheetsSync.performTwoWaySync(spreadsheetId);
      
      if (result.success) {
        setLastSync(new Date().toISOString());
        saveConfig({ spreadsheetId, spreadsheetUrl, lastSync: new Date().toISOString() });
        toast.success(result.message);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to perform two-way sync');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-blue-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-green-600" />
          Google Sheets Integration
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Connect to Google Sheets to work offline and sync your data bidirectionally.
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Access Token</label>
              <Input
                type="password"
                placeholder="Paste your Google Sheets API access token here"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
              />
              <div className="text-xs text-gray-500">
                Get your token from Google Cloud Console with Sheets API enabled
              </div>
            </div>

            <Button 
              onClick={createNewGoogleSheet}
              disabled={!accessToken || isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Sheet...
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Create New Google Sheet
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Connected Google Sheet</div>
                {lastSync && (
                  <div className="text-xs text-gray-500">
                    Last sync: {new Date(lastSync).toLocaleString()}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(spreadsheetUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Sheet
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={exportToGoogleSheets}
                disabled={isLoading || !isOnline}
                size="sm"
              >
                <Upload className="h-3 w-3 mr-1" />
                Export to Sheets
              </Button>

              <Button
                variant="outline"
                onClick={importFromGoogleSheets}
                disabled={isLoading || !isOnline}
                size="sm"
              >
                <Download className="h-3 w-3 mr-1" />
                Import from Sheets
              </Button>

              <Button
                onClick={performTwoWaySync}
                disabled={isLoading || !isOnline}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Two-Way Sync
              </Button>
            </div>

            <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded">
              <div className="font-medium mb-1">How it works:</div>
              <ul className="space-y-1">
                <li>• <strong>Export:</strong> Push current data to Google Sheets</li>
                <li>• <strong>Import:</strong> Pull changes from Google Sheets to platform</li>
                <li>• <strong>Two-Way Sync:</strong> Export first, then import changes</li>
                <li>• <strong>Offline Work:</strong> Edit the Google Sheet offline, sync when online</li>
              </ul>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Settings className="h-3 w-3 mr-1" />
                  Disconnect
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disconnect Google Sheets</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove the connection to your Google Sheet. The sheet will remain in your Google Drive, but won't sync automatically.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setIsConnected(false);
                      setSpreadsheetId('');
                      setSpreadsheetUrl('');
                      setLastSync(null);
                      localStorage.removeItem('google_sheets_config');
                      toast.success('Google Sheets disconnected');
                    }}
                  >
                    Disconnect
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
