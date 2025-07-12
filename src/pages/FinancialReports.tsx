import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, TrendingUp, DollarSign, Users, Calendar, FileSpreadsheet } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useLeads } from '@/hooks/useLeads';
import { useClients } from '@/hooks/useClients';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useEmployees } from '@/hooks/useEmployees';
import { exportFinancialDataToExcel } from '@/utils/excelExport';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';
import { AdvancedGoogleSheetsIntegration } from '@/components/AdvancedGoogleSheetsIntegration';

export const FinancialReports = () => {
  const { jobs } = useJobs();
  const { leads } = useLeads();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();
  const { employees } = useEmployees();
  const [timeFilter, setTimeFilter] = useState('all');

  const getDateRange = () => {
    const now = new Date();
    switch (timeFilter) {
      case 'thisMonth':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last3Months':
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        return { start: threeMonthsAgo, end: now };
      case 'thisYear':
        return { start: new Date(now.getFullYear(), 0, 1), end: now };
      default:
        return null;
    }
  };

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => job.status === 'completed' && job.is_paid);
    
    const dateRange = getDateRange();
    if (dateRange) {
      filtered = filtered.filter(job => {
        const jobDate = parseISO(job.job_date);
        return isWithinInterval(jobDate, dateRange);
      });
    }

    return filtered;
  }, [jobs, timeFilter]);

  const handleExcelExport = () => {
    try {
      const exportData = {
        jobs: filteredJobs,
        leads: leads,
        clients: clients,
        timeEntries: timeEntries,
        employees: employees,
        dateRange: getTimeFilterLabel()
      };
      
      const filename = exportFinancialDataToExcel(exportData);
      toast.success(`Comprehensive financial report exported as ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export financial report');
    }
  };

  const getTimeFilterLabel = () => {
    switch (timeFilter) {
      case 'thisMonth': return 'This Month';
      case 'last3Months': return 'Last 3 Months';
      case 'thisYear': return 'This Year';
      default: return 'All Time';
    }
  };

  const profitAnalysis = useMemo(() => {
    const analysis = {
      totalRevenue: 0,
      totalJobs: filteredJobs.length,
      averageJobValue: 0,
      sourceBreakdown: {} as Record<string, { revenue: number, jobs: number, leads: number }>,
      clientBreakdown: {} as Record<string, { revenue: number, jobs: number }>
    };

    // Calculate total revenue and source breakdown
    filteredJobs.forEach(job => {
      analysis.totalRevenue += job.actual_total || job.estimated_total;
      
      // Find the lead that created this job
      const lead = leads.find(l => l.id === job.lead_id);
      const source = lead?.source || 'direct';
      
      if (!analysis.sourceBreakdown[source]) {
        analysis.sourceBreakdown[source] = { revenue: 0, jobs: 0, leads: 0 };
      }
      
      analysis.sourceBreakdown[source].revenue += job.actual_total || job.estimated_total;
      analysis.sourceBreakdown[source].jobs++;
      
      // Client breakdown
      const clientKey = job.client_name;
      if (!analysis.clientBreakdown[clientKey]) {
        analysis.clientBreakdown[clientKey] = { revenue: 0, jobs: 0 };
      }
      analysis.clientBreakdown[clientKey].revenue += job.actual_total || job.estimated_total;
      analysis.clientBreakdown[clientKey].jobs++;
    });

    // Count leads by source
    leads.forEach(lead => {
      const source = lead.source;
      if (!analysis.sourceBreakdown[source]) {
        analysis.sourceBreakdown[source] = { revenue: 0, jobs: 0, leads: 0 };
      }
      analysis.sourceBreakdown[source].leads++;
    });

    analysis.averageJobValue = analysis.totalJobs > 0 ? analysis.totalRevenue / analysis.totalJobs : 0;

    return analysis;
  }, [filteredJobs, leads]);

  const exportFinancialReport = () => {
    const csvRows = [];
    const headers = [
      'Report Type', 'Job Number', 'Client Name', 'Job Date', 'Revenue', 
      'Lead Source', 'Status', 'Payment Method', 'Lead Cost'
    ];
    csvRows.push(headers.join(','));

    filteredJobs.forEach(job => {
      const lead = leads.find(l => l.id === job.lead_id);
      const values = [
        'Job Revenue',
        job.job_number,
        job.client_name,
        job.job_date,
        job.actual_total || job.estimated_total,
        lead?.source?.replace('_', ' ') || 'direct',
        job.status,
        job.payment_method || 'N/A',
        0 // Lead cost would need to be tracked separately
      ].map(value => `"${value}"`);
      
      csvRows.push(values.join(','));
    });

    // Add source summary
    csvRows.push(['', '', '', '', '', '', '', '', '']);
    csvRows.push(['"Source Summary"', '', '', '', '', '', '', '', '']);
    Object.entries(profitAnalysis.sourceBreakdown).forEach(([source, data]) => {
      csvRows.push([
        '"Source"',
        `"${source.replace('_', ' ')}"`,
        '',
        '',
        `"${data.revenue}"`,
        `"${data.jobs} jobs"`,
        `"${data.leads} leads"`,
        '',
        ''
      ].join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `financial_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    a.click();
  };

  const getSourceDisplayName = (source: string) => {
    return source.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600">Track your profit sources and business performance</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportFinancialReport} variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleExcelExport} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Advanced Google Sheets Integration */}
      <AdvancedGoogleSheetsIntegration
        jobs={filteredJobs}
        leads={leads}
        clients={clients}
        timeEntries={timeEntries}
        employees={employees}
        isOnline={true}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="thisMonth">This Month</SelectItem>
            <SelectItem value="last3Months">Last 3 Months</SelectItem>
            <SelectItem value="thisYear">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${profitAnalysis.totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Completed Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitAnalysis.totalJobs}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Average Job Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${profitAnalysis.averageJobValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Source */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Lead Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(profitAnalysis.sourceBreakdown)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .map(([source, data]) => (
              <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="capitalize">
                    {getSourceDisplayName(source)}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    {data.jobs} jobs from {data.leads} leads
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${data.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {data.leads > 0 ? `${((data.jobs / data.leads) * 100).toFixed(1)}% conversion` : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(profitAnalysis.clientBreakdown)
              .sort(([,a], [,b]) => b.revenue - a.revenue)
              .slice(0, 10)
              .map(([clientName, data]) => (
              <div key={clientName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="font-medium">{clientName}</div>
                  <div className="text-sm text-gray-600">
                    {data.jobs} job{data.jobs !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="font-semibold text-green-600">
                  ${data.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
