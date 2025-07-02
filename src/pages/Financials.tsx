
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangeFilter, DateRange } from "@/components/DateRangeFilter";
import { filterDataByDateRange } from "@/hooks/useDateFilter";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { useEmployees } from "@/hooks/useEmployees";
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, Target } from "lucide-react";

export const Financials = () => {
  const { jobs } = useJobs();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();
  const { employees } = useEmployees();
  
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('this_month');

  const filteredData = useMemo(() => {
    return {
      jobs: filterDataByDateRange(jobs, selectedDateRange, 'job_date'),
      leads: filterDataByDateRange(leads, selectedDateRange, 'created_at'),
      timeEntries: filterDataByDateRange(timeEntries, selectedDateRange, 'entry_date')
    };
  }, [jobs, leads, timeEntries, selectedDateRange]);

  const financialMetrics = useMemo(() => {
    // Calculate real revenue (only paid jobs)
    const paidRevenue = filteredData.jobs
      .filter(job => job.status === 'completed' && job.is_paid)
      .reduce((sum, job) => {
        const jobRevenue = job.actual_total || (job.hourly_rate * job.movers_needed * (job.actual_duration_hours || 0));
        return sum + jobRevenue;
      }, 0);

    // Calculate unpaid revenue
    const unpaidRevenue = filteredData.jobs
      .filter(job => job.status === 'completed' && !job.is_paid)
      .reduce((sum, job) => {
        const jobRevenue = job.actual_total || (job.hourly_rate * job.movers_needed * (job.actual_duration_hours || 0));
        return sum + jobRevenue;
      }, 0);

    // Calculate total lead costs
    const totalLeadCosts = filteredData.leads.reduce((sum, lead) => sum + (lead.lead_cost || 0), 0);

    // Calculate payroll costs
    const totalPayroll = filteredData.timeEntries
      .filter(entry => entry.is_paid)
      .reduce((sum, entry) => sum + (entry.total_pay || 0), 0);

    // Calculate gross profit
    const grossProfit = paidRevenue - totalPayroll - totalLeadCosts;
    const profitMargin = paidRevenue > 0 ? (grossProfit / paidRevenue) * 100 : 0;

    // Calculate ROI
    const roi = totalLeadCosts > 0 ? ((grossProfit / totalLeadCosts) * 100) : 0;

    // Lead conversion metrics
    const convertedLeads = filteredData.leads.filter(lead => lead.status === 'converted').length;
    const conversionRate = filteredData.leads.length > 0 ? (convertedLeads / filteredData.leads.length) * 100 : 0;

    return {
      paidRevenue,
      unpaidRevenue,
      totalRevenue: paidRevenue + unpaidRevenue,
      totalLeadCosts,
      totalPayroll,
      grossProfit,
      profitMargin,
      roi,
      conversionRate,
      convertedLeads
    };
  }, [filteredData]);

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
      </div>

      {/* Date Range Filter */}
      <DateRangeFilter
        selectedRange={selectedDateRange}
        onRangeChange={setSelectedDateRange}
      />

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
              Money in the bank
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

      {/* Cost and Profit Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              Marketing investment
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
              Employee wages paid
            </p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${financialMetrics.grossProfit >= 0 ? 'border-l-green-500' : 'border-l-red-500'} hover:shadow-lg transition-shadow`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Gross Profit</CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-600">ROI</CardTitle>
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
            <CardTitle>Lead Performance - {getRangeDisplayText()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Leads</span>
                <span className="font-medium">{filteredData.leads.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Converted Leads</span>
                <span className="font-medium text-green-600">
                  {financialMetrics.convertedLeads}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-medium">
                  {financialMetrics.conversionRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost Per Lead</span>
                <span className="font-medium">
                  ${filteredData.leads.length > 0 ? (financialMetrics.totalLeadCosts / filteredData.leads.length).toFixed(0) : '0'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
