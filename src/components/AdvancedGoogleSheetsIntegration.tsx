
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
  Target,
  TrendingUp,
  BarChart3,
  PieChart
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

      toast.success('🎉 Beautiful Executive Dashboard created successfully!');
    } catch (error) {
      console.error('Error creating advanced Google Sheet:', error);
      toast.error('Failed to create advanced Google Sheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-2 border-dashed border-gradient-to-r from-purple-400 to-blue-400 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <BarChart3 className="h-4 w-4 text-green-600" />
          </div>
          Executive Dashboard Suite
          <Badge variant={isConnected ? "default" : "destructive"} className="ml-2">
            {isConnected ? '✅ Connected' : '❌ Not Connected'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <div className="font-semibold mb-2 flex items-center gap-2 text-blue-800">
                <PieChart className="h-4 w-4 text-blue-600" />
                Create a Beautiful Executive Dashboard
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-medium text-purple-700">📊 Visual Dashboards:</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 💼 Executive Summary with KPIs</li>
                    <li>• 📈 Revenue Analytics & Forecasting</li>
                    <li>• 🎯 Lead Performance Dashboard</li>
                    <li>• 💰 Financial Summary & Profitability</li>
                  </ul>
                </div>
                <div className="space-y-1">
                  <div className="font-medium text-blue-700">✨ Professional Features:</div>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 🎨 Beautiful color-coded formatting</li>
                    <li>• 📊 Interactive charts and visuals</li>
                    <li>• 🔥 Performance indicators & trends</li>
                    <li>• 📱 Mobile-responsive design</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-purple-600" />
                Dashboard Type
              </label>
              <Select value={sheetType} onValueChange={(value: 'basic' | 'advanced') => setSheetType(value)}>
                <SelectTrigger className="border-purple-200 focus:border-purple-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">📋 Basic Export (Simple Data Tables)</SelectItem>
                  <SelectItem value="advanced">🎨 Executive Dashboard (Beautiful UI)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                Google Sheets API Access Token
              </label>
              <Input
                type="password"
                placeholder="Paste your Google Sheets API access token here"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                className="border-blue-200 focus:border-blue-400"
              />
              <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                💡 Get your token from Google Cloud Console with Sheets API enabled
              </div>
            </div>

            <Button 
              onClick={createAdvancedGoogleSheet}
              disabled={!accessToken || isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              size="lg"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Beautiful Dashboard...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Executive Dashboard Suite
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-green-800 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  Executive Dashboard Suite Ready!
                </div>
                <div className="text-xs text-green-700">
                  Beautiful visual dashboard with charts, KPIs, and professional formatting
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(spreadsheetUrl, '_blank')}
                className="bg-white border-green-300 hover:bg-green-50"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open Dashboard
              </Button>
            </div>

            <div className="text-xs text-gray-600 bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded border border-purple-200">
              <div className="font-semibold mb-2 text-purple-800">🎨 Your Beautiful Dashboard Includes:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <ul className="space-y-1">
                  <li>• <strong>📊 Executive Dashboard:</strong> KPIs & visual summaries</li>
                  <li>• <strong>📈 Revenue Analytics:</strong> Trends & forecasting</li>
                  <li>• <strong>🎯 Lead Performance:</strong> Source optimization</li>
                </ul>
                <ul className="space-y-1">
                  <li>• <strong>💰 Financial Summary:</strong> Profit & cost analysis</li>
                  <li>• <strong>🎨 Professional Design:</strong> Color-coded & formatted</li>
                  <li>• <strong>📱 Mobile Ready:</strong> Works on any device</li>
                </ul>
              </div>
            </div>

            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setIsConnected(false);
                setSpreadsheetId('');
                setSpreadsheetUrl('');
                localStorage.removeItem('advanced_google_sheets_config');
                toast.success('Executive dashboard disconnected');
              }}
              className="w-full"
            >
              <Settings className="h-3 w-3 mr-1" />
              Disconnect Dashboard
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
