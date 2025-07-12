
import { format } from 'date-fns';

export interface OfflineFinancialData {
  jobs: any[];
  leads: any[];
  clients: any[];
  timeEntries: any[];
  employees: any[];
  lastSync: string;
  dataVersion: number;
}

const STORAGE_KEY = 'bantu_movers_offline_data';
const DATA_VERSION = 1;

export const saveOfflineData = (data: Omit<OfflineFinancialData, 'lastSync' | 'dataVersion'>) => {
  try {
    const offlineData: OfflineFinancialData = {
      ...data,
      lastSync: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      dataVersion: DATA_VERSION
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offlineData));
    console.log('✅ Financial data saved offline successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to save offline data:', error);
    return false;
  }
};

export const getOfflineData = (): OfflineFinancialData | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    
    const data = JSON.parse(stored) as OfflineFinancialData;
    
    // Check data version compatibility
    if (data.dataVersion !== DATA_VERSION) {
      console.warn('⚠️ Offline data version mismatch, clearing cache');
      clearOfflineData();
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to load offline data:', error);
    return null;
  }
};

export const clearOfflineData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Offline data cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear offline data:', error);
    return false;
  }
};

export const isDataStale = (data: OfflineFinancialData, maxAgeHours: number = 24): boolean => {
  const lastSync = new Date(data.lastSync);
  const now = new Date();
  const hoursDiff = (now.getTime() - lastSync.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff > maxAgeHours;
};

export const getDataSizeInfo = (): { sizeKB: number; itemCount: number } => {
  const data = getOfflineData();
  if (!data) return { sizeKB: 0, itemCount: 0 };
  
  const sizeBytes = new Blob([JSON.stringify(data)]).size;
  const sizeKB = Math.round(sizeBytes / 1024);
  const itemCount = data.jobs.length + data.leads.length + data.clients.length + 
                   data.timeEntries.length + data.employees.length;
  
  return { sizeKB, itemCount };
};

// Export offline data to Excel when online isn't available
export const exportOfflineDataToExcel = async () => {
  const data = getOfflineData();
  if (!data) {
    throw new Error('No offline data available');
  }
  
  // Dynamically import the Excel export function to avoid loading it unless needed
  const { exportFinancialDataToExcel } = await import('./excelExport');
  
  const exportData = {
    jobs: data.jobs,
    leads: data.leads,
    clients: data.clients,
    timeEntries: data.timeEntries,
    employees: data.employees,
    dateRange: `Offline Data (Last Sync: ${data.lastSync})`
  };
  
  return exportFinancialDataToExcel(exportData);
};
