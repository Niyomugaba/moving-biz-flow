
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdvancedGoogleSheetsManager } from '@/utils/googleSheetsAdvanced';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  RefreshCw, 
  ExternalLink,
  Settings,
  Sparkles,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedGoogleSheetsIntegrationProps {
  jobs: any[];
  leads: any[];
  clients: any[];
  timeEntries: any[];
  employees: any[];
  isOnline: boolean;
}

export const AdvancedGoogleSheetsIntegration: React.FC<AdvancedGoogleSheetsIntegrationProps> = ({
  jobs, leads, clients, timeEntries, employees, isOnline
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetType, setSheetType] = useState<'basic' | 'advanced'>('advanced');

  const createAdvancedGoogleSheet = async () => {
    if (!accessToken) {
      toast.error('Please provide Google Sheets API access token');
      return;
    }

    setIsLoading(true);
    try {
      const sheetsManager = new AdvancedGoogleSheetsManager({
        spreadsheetId: '',
        accessToken
      });

      const exportData = {
        jobs,
        leads,
        clients,
        timeEntries,
        employees
      };

      const newSpreadsheetId = await sheetsManager.createFinancialReportsSheet(exportData);
      const newSpreadsheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`;
      
      setSpreadsheetId(newSpreadsheetId);
      setSpreadsheetUrl(newSpreadsheetUrl);
      setIsConnected(true);

      // Save config
      localStorage.setItem('advanced_google_sheets_config', JSON.stringify({ 
        spreadsheetId: newSpreadsheetId, 
        spreadsheetUrl: newSpreadsheetUrl,
        accessToken,
        lastSync: new Date().toISOString()
      }));

      toast.success('Advanced Financial Dashboard Google Sheet created successfully!');
    } catch (error) {
      console.error('Error creating advanced Google Sheet:', error);
      toast.error('Failed to create advanced Google Sheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Advanced Google Sheets Dashboard
          <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
            {isConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <div className="font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                Create a Google Sheet that looks exactly like your Financial Reports
              </div>
              <ul className="space-y-1 text-xs">
                <li>• 📊 Interactive dashboard with real-time calculations</li>
                <li>• 📋 Dropdown filters for time periods (All Time, This Month, etc.)</li>
                <li>• 💰 Revenue metrics with formulas that auto-update</li>
                <li>• 📈 Lead source performance tracking</li>
                <li>• 🎯 Payment status monitoring</li>
                <li>• 📱 Mobile-friendly design with conditional formatting</li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sheet Type</label>
              <Select value={sheetType} onValueChange={(value: 'basic' | 'advanced') => setSheetType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic Export (Simple Data)</SelectItem>
                  <SelectItem value="advanced">Advanced Dashboard (Full UI Replica)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Sheets API Access Token</label>
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
              onClick={createAdvancedGoogleSheet}
              disabled={!accessToken || isLoading}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Advanced Dashboard...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Advanced Financial Dashboard
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium">Advanced Financial Dashboard</div>
                <div className="text-xs text-gray-500">
                  Interactive Google Sheet with dropdowns, formulas, and real-time calculations
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(spreadsheetUrl, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Dashboard
              </Button>
            </div>

            <div className="text-xs text-gray-600 bg-purple-50 p-3 rounded">
              <div className="font-medium mb-1">Features in your Google Sheet:</div>
              <ul className="space-y-1">
                <li>• <strong>Interactive Dashboard:</strong> Just like your web interface</li>
                <li>• <strong>Smart Dropdowns:</strong> Time filters that update all calculations</li>
                <li>• <strong>Live Formulas:</strong> Revenue, conversion rates, ROI calculations</li>
                <li>• <strong>Conditional Formatting:</strong> Color-coded performance indicators</li>
                <li>• <strong>Multi-Sheet Setup:</strong> Separate tabs for Jobs, Leads, Clients</li>
                <li>• <strong>Mobile Responsive:</strong> Works on phone, tablet, desktop</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setIsConnected(false);
                setSpreadsheetId('');
                setSpreadsheetUrl('');
                localStorage.removeItem('advanced_google_sheets_config');
                toast.success('Advanced dashboard disconnected');
              }}
            >
              <Settings className="h-3 w-3 mr-1" />
              Disconnect
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
