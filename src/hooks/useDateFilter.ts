
import { useMemo } from 'react';
import { DateRange } from '@/components/DateRangeFilter';

export const useDateFilter = (dateRange: DateRange) => {
  return useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateRange) {
      case 'today':
        return {
          startDate: today,
          endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
        };
        
      case 'this_week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        return { startDate: weekStart, endDate: weekEnd };
        
      case 'this_month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        return { startDate: monthStart, endDate: monthEnd };
        
      case 'this_quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
        const quarterEnd = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        quarterEnd.setHours(23, 59, 59, 999);
        return { startDate: quarterStart, endDate: quarterEnd };
        
      case 'this_year':
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear(), 11, 31);
        yearEnd.setHours(23, 59, 59, 999);
        return { startDate: yearStart, endDate: yearEnd };
        
      case 'since_inception':
      default:
        return { startDate: null, endDate: null };
    }
  }, [dateRange]);
};

export const filterDataByDateRange = <T extends { created_at?: string; job_date?: string; entry_date?: string }>(
  data: T[], 
  dateRange: DateRange,
  dateField: 'created_at' | 'job_date' | 'entry_date' = 'created_at'
): T[] => {
  const { startDate, endDate } = useDateFilter(dateRange);
  
  if (!startDate || !endDate) {
    return data; // Return all data for 'since_inception'
  }
  
  return data.filter(item => {
    const itemDate = item[dateField];
    if (!itemDate) return false;
    
    const date = new Date(itemDate);
    return date >= startDate && date <= endDate;
  });
};
