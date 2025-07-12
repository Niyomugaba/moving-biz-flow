
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  saveOfflineData, 
  getOfflineData, 
  clearOfflineData, 
  isDataStale, 
  getDataSizeInfo,
  exportOfflineDataToExcel,
  OfflineFinancialData 
} from '@/utils/offlineStorage';
import { 
  WifiOff, 
  Wifi, 
  Download, 
  RefreshCw, 
  Database, 
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OfflineFinancialManagerProps {
  jobs: any[];
  leads: any[];
  clients: any[];
  timeEntries: any[];
  employees: any[];
  isOnline: boolean;
}

export const OfflineFinancialManager: React.FC<OfflineFinancialManagerProps> = ({
  jobs, leads, clients, timeEntries, employees, isOnline
}) => {
  const [offlineData, setOfflineData] = useState<OfflineFinancialData | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Load offline data on component mount
    const stored = getOfflineData();
    setOfflineData(stored);

    // Save current data when online
    if (isOnline && jobs.length > 0) {
      const success = saveOfflineData({ jobs, leads, clients, timeEntries, employees });
      if (success) {
        const updated = getOfflineData();
        setOfflineData(updated);
      }
    }
  }, [jobs, leads, clients, timeEntries, employees, isOnline]);

  const handleSaveOffline = () => {
    const success = saveOfflineData({ jobs, leads, clients, timeEntries, employees });
    if (success) {
      const updated = getOfflineData();
      setOfflineData(updated);
      toast.success('Financial data saved for offline use');
    } else {
      toast.error('Failed to save data offline');
    }
  };

  const handleExportOffline = async () => {
    setIsExporting(true);
    try {
      const filename = await exportOfflineDataToExcel();
      toast.success(`Offline data exported as ${filename}`);
    } catch (error) {
      console.error('Offline export failed:', error);
      toast.error('Failed to export offline data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearOffline = () => {
    const success = clearOfflineData();
    if (success) {
      setOfflineData(null);
      toast.success('Offline data cleared');
    } else {
      toast.error('Failed to clear offline data');
    }
  };

  const dataInfo = getDataSizeInfo();
  const isStale = offlineData ? isDataStale(offlineData) : false;

  return (
    <Card className="border-2 border-dashed border-gray-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          Offline Financial Manager
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Offline Data Status</div>
            {offlineData ? (
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Data Available</span>
                </div>
                <div className="text-xs text-gray-500">
                  Last sync: {offlineData.lastSync}
                </div>
                {isStale && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs">Data is stale (24h+)</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-400">
                <Database className="h-4 w-4" />
                <span className="text-sm">No offline data</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Storage Info</div>
            <div className="text-sm">
              <div>Size: {dataInfo.sizeKB} KB</div>
              <div>Records: {dataInfo.itemCount.toLocaleString()}</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Quick Actions</div>
            <div className="flex flex-wrap gap-2">
              {isOnline && (
                <Button size="sm" onClick={handleSaveOffline} variant="outline">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sync
                </Button>
              )}
              {offlineData && (
                <Button 
                  size="sm" 
                  onClick={handleExportOffline}
                  disabled={isExporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <FileSpreadsheet className="h-3 w-3 mr-1" />
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Offline Capabilities</h4>
              <p className="text-xs text-gray-600">
                Your financial data is automatically saved locally and can be exported to Excel even without internet connection.
              </p>
            </div>
            <div className="flex gap-2">
              {offlineData && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" disabled={!offlineData}>
                      Clear Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear Offline Data</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all offline financial data. You can re-sync when back online.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearOffline}>
                        Clear Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
