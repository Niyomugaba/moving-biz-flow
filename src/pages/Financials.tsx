
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { BusinessAnalysisCard } from "@/components/BusinessAnalysisCard";
import { filterDataByDateRange, useDateFilter } from "@/hooks/useDateFilter";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useEmployees } from "@/hooks/useEmployees";
import { useClients } from "@/hooks/useClients";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { exportFinancialDataToExcel } from "@/utils/excelExport";
import { OfflineFinancialManager } from "@/components/OfflineFinancialManager";
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Target, Minus, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export const Financials = () => {
  const { jobs } = useJobs();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();
  const { employees } = useEmployees();
  const { clients } = useClients();
  const isOnline = useOnlineStatus();
  
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('this_month');
  const { startDate, endDate } = useDateFilter(selectedDateRange);

  const filteredData = useMemo(() => {
    return {
      jobs: filterDataByDateRange(jobs, startDate, endDate, 'job_date'),
      leads: filterDataByDateRange(leads, startDate, endDate, 'created_at'),
      timeEntries: filterDataByDateRange(timeEntries, startDate, endDate, 'entry_date')
    };
  }, [jobs, leads, timeEntries, startDate, endDate]);

  const financialMetrics = useMemo(() => {
    const paidRevenue = filteredData.jobs
      .filter(job => job.status === 'completed' && job.is_paid)
      .reduce((sum, job) => {
        // Use total_amount_received for flat rate jobs, otherwise calculate normally
        if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
          return sum + job.total_amount_received;
        }
        const jobRevenue = job.actual_total || (job.hourly_rate * job.movers_needed * (job.actual_duration_hours || 0));
        return sum + jobRevenue;
      }, 0);

    const unpaidRevenue = filteredData.jobs
      .filter(job => job.status === 'completed' && !job.is_paid)
      .reduce((sum, job) => {
        if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
          return sum + job.total_amount_received;
        }
        const jobRevenue = job.actual_total || (job.hourly_rate * job.movers_needed * (job.actual_duration_hours || 0));
        return sum + jobRevenue;
      }, 0);

    const totalLeadCosts = filteredData.leads.reduce((sum, lead) => sum + (lead.lead_cost || 0), 0);

    const totalPayroll = filteredData.timeEntries
      .filter(entry => entry.is_paid)
      .reduce((sum, entry) => {
        const regularPay = (entry.regular_hours || 0) * (entry.hourly_rate || 0);
        const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || entry.hourly_rate || 0);
        return sum + regularPay + overtimePay;
      }, 0);

    const totalEmployeeTips = filteredData.timeEntries
      .filter(entry => entry.is_paid)
      .reduce((sum, entry) => sum + (entry.tip_amount || 0), 0);

    const totalExpenses = totalPayroll + totalEmployeeTips + totalLeadCosts;
    const grossProfit = paidRevenue - totalExpenses;
    const profitMargin = paidRevenue > 0 ? (grossProfit / paidRevenue) * 100 : 0;
    const roi = totalLeadCosts > 0 ? ((grossProfit / totalLeadCosts) * 100) : 0;
    const convertedLeads = filteredData.leads.filter(lead => lead.status === 'converted').length;
    const conversionRate = filteredData.leads.length > 0 ? (convertedLeads / filteredData.leads.length) * 100 : 0;

    return {
      paidRevenue,
      unpaidRevenue,
      totalRevenue: paidRevenue + unpaidRevenue,
      totalLeadCosts,
      totalPayroll,
      totalEmployeeTips,
      totalExpenses,
      grossProfit,
      profitMargin,
      roi,
      conversionRate,
      convertedLeads
    };
  }, [filteredData]);

  const handleExcelExport = () => {
    try {
      const exportData = {
        jobs: filteredData.jobs,
        leads: filteredData.leads,
        clients: clients,
        timeEntries: filteredData.timeEntries,
        employees: employees,
        dateRange: getRangeDisplayText()
      };
      
      const filename = exportFinancialDataToExcel(exportData);
      toast.success(`Financial report exported successfully as ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export financial report');
    }
  };

  const getRangeDisplayText = () => {
    const rangeLabels = {
      'today': 'Today',
      'this_week': 'This Week',
      'this_month': 'This Month', 
      'this_quarter': 'This Quarter',
      'this_year': 'This Year',
      'since_inception': 'Since Inception'
    };
    return rangeLabels[selectedDateRange];
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-25 to-gold-25 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Financial Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive financial analysis and business performance metrics - {getRangeDisplayText()}
          </p>
        </div>
        <Button 
          onClick={handleExcelExport}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={!isOnline && (!jobs.length || !clients.length)}
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      {/* Offline Manager */}
      <OfflineFinancialManager
        jobs={jobs}
        leads={leads}
        clients={clients}
        timeEntries={timeEntries}
        employees={employees}
        isOnline={isOnline}
      />

      {/* Date Range Filter */}
      <DateRangeFilter
        selectedRange={selectedDateRange}
        onRangeChange={setSelectedDateRange}
      />

      {/* AI Business Analysis */}
      <BusinessAnalysisCard />

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              ${financialMetrics.paidRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Money collected from customers
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Unpaid Revenue</CardTitle>
            <Calendar className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">
              ${financialMetrics.unpaidRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Outstanding invoices
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">
              ${financialMetrics.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Paid + Unpaid combined
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense and Profit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Lead Costs</CardTitle>
            <Target className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              ${financialMetrics.totalLeadCosts.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Marketing expenses
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Payroll Costs</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">
              ${financialMetrics.totalPayroll.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Employee wages only
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Employee Tips</CardTitle>
            <Minus className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              ${financialMetrics.totalEmployeeTips.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Tips paid to employees
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${financialMetrics.grossProfit >= 0 ? 'border-l-green-500' : 'border-l-red-500'} hover:shadow-lg transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Profit</CardTitle>
            {financialMetrics.grossProfit >= 0 ? 
              <TrendingUp className="h-5 w-5 text-green-600" /> : 
              <TrendingDown className="h-5 w-5 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialMetrics.grossProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              ${financialMetrics.grossProfit.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {financialMetrics.profitMargin.toFixed(1)}% margin
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${financialMetrics.roi >= 0 ? 'border-l-green-500' : 'border-l-red-500'} hover:shadow-lg transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Marketing ROI</CardTitle>
            <DollarSign className={`h-5 w-5 ${financialMetrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${financialMetrics.roi >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {financialMetrics.roi.toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Return on marketing spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Business Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown - {getRangeDisplayText()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jobs Completed</span>
                <span className="font-medium">
                  {filteredData.jobs.filter(j => j.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Jobs Paid</span>
                <span className="font-medium text-green-600">
                  {filteredData.jobs.filter(j => j.is_paid).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Job Value</span>
                <span className="font-medium">
                  ${filteredData.jobs.length > 0 ? (financialMetrics.totalRevenue / filteredData.jobs.length).toFixed(0) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Rate</span>
                <span className="font-medium">
                  {filteredData.jobs.filter(j => j.status === 'completed').length > 0 
                    ? ((filteredData.jobs.filter(j => j.is_paid).length / filteredData.jobs.filter(j => j.status === 'completed').length) * 100).toFixed(1)
                    : '0'
                  }%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown - {getRangeDisplayText()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="font-medium text-red-600">
                  ${financialMetrics.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payroll (Wages)</span>
                <span className="font-medium">
                  ${financialMetrics.totalPayroll.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Employee Tips</span>
                <span className="font-medium">
                  ${financialMetrics.totalEmployeeTips.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Marketing Costs</span>
                <span className="font-medium">
                  ${financialMetrics.totalLeadCosts.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
