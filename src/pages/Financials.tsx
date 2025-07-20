
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DateRangeFilter, DateRange } from '@/components/DateRangeFilter';
import { useDateFilter, filterDataByDateRange } from '@/hooks/useDateFilter';
import { useJobs } from '@/hooks/useJobs';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  CreditCard,
  Target,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  Area,
  AreaChart,
  ComposedChart
} from 'recharts';

export const Financials = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>('this_month');
  const { startDate, endDate } = useDateFilter(selectedPeriod);
  
  const { jobs } = useJobs();
  const { timeEntries } = useTimeEntries();
  const { clients } = useClients();
  const { employees } = useEmployees();

  const filteredJobs = useMemo(() => {
    return filterDataByDateRange(jobs, startDate, endDate, 'job_date');
  }, [jobs, startDate, endDate]);

  const filteredTimeEntries = useMemo(() => {
    return filterDataByDateRange(timeEntries, startDate, endDate, 'entry_date');
  }, [timeEntries, startDate, endDate]);

  const financialMetrics = useMemo(() => {
    const completedJobs = filteredJobs.filter(job => job.status === 'completed');
    
    const totalRevenue = completedJobs.reduce((sum, job) => {
      if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
        return sum + job.total_amount_received;
      }
      return sum + (job.actual_total || job.estimated_total || 0);
    }, 0);

    const totalExpenses = completedJobs.reduce((sum, job) => {
      const leadCost = job.lead_cost || 0;
      const laborCost = job.pricing_model === 'flat_rate' 
        ? (job.worker_hourly_rate || 0) * (job.hours_worked || 0) * (job.movers_needed || 1)
        : (job.estimated_total || 0) * 0.6;
      return sum + leadCost + laborCost;
    }, 0);

    const grossProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    const totalHours = filteredTimeEntries
      .filter(entry => entry.status === 'approved')
      .reduce((sum, entry) => sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0);

    const averageJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;

    return {
      totalRevenue,
      totalExpenses,
      grossProfit,
      profitMargin,
      totalHours,
      averageJobValue,
      completedJobs: completedJobs.length,
      activeJobs: filteredJobs.filter(job => ['scheduled', 'in_progress'].includes(job.status)).length
    };
  }, [filteredJobs, filteredTimeEntries]);

  const chartData = useMemo(() => {
    const monthlyData = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      const monthJobs = jobs.filter(job => {
        if (!job.job_date) return false;
        const jobDate = new Date(job.job_date);
        return jobDate.getMonth() === date.getMonth() && 
               jobDate.getFullYear() === date.getFullYear() &&
               job.status === 'completed';
      });
      
      const monthRevenue = monthJobs.reduce((sum, job) => 
        sum + (job.actual_total || job.estimated_total || 0), 0);
      
      const monthExpenses = monthJobs.reduce((sum, job) => {
        const leadCost = job.lead_cost || 0;
        const laborCost = (job.estimated_total || 0) * 0.6;
        return sum + leadCost + laborCost;
      }, 0);
      
      monthlyData.push({
        month: monthName,
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthRevenue - monthExpenses,
        jobs: monthJobs.length
      });
    }
    
    return monthlyData;
  }, [jobs]);

  const jobStatusData = useMemo(() => {
    const statusCounts = filteredJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count,
      color: status === 'completed' ? '#10B981' : 
             status === 'in_progress' ? '#F59E0B' : 
             status === 'scheduled' ? '#3B82F6' : '#EF4444'
    }));
  }, [filteredJobs]);

  const revenueSourceData = useMemo(() => {
    const sourceData = filteredJobs
      .filter(job => job.status === 'completed')
      .reduce((acc, job) => {
        const source = job.pricing_model || 'hourly';
        const revenue = job.actual_total || job.estimated_total || 0;
        acc[source] = (acc[source] || 0) + revenue;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(sourceData).map(([source, revenue]) => ({
      name: source.replace('_', ' ').toUpperCase(),
      value: revenue,
      color: source === 'flat_rate' ? '#8B5CF6' : '#06B6D4'
    }));
  }, [filteredJobs]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="h-full w-full bg-background">
      <ScrollArea className="h-full w-full">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <DateRangeFilter
              selectedRange={selectedPeriod}
              onRangeChange={setSelectedPeriod}
              className="w-auto"
            />
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  ${financialMetrics.totalRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-green-700">
                  {financialMetrics.completedJobs} completed jobs
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Gross Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">
                  ${financialMetrics.grossProfit.toLocaleString()}
                </div>
                <p className="text-xs text-blue-700">
                  {financialMetrics.profitMargin.toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Avg Job Value</CardTitle>
                <Target className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">
                  ${financialMetrics.averageJobValue.toFixed(0)}
                </div>
                <p className="text-xs text-purple-700">
                  Per completed job
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Active Jobs</CardTitle>
                <Calendar className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">
                  {financialMetrics.activeJobs}
                </div>
                <p className="text-xs text-orange-700">
                  Currently in progress
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Revenue & Profit Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`, 
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                      labelStyle={{ color: '#1e293b' }}
                      contentStyle={{ 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#10B981" name="Revenue" />
                    <Line type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} name="Profit" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Job Status Distribution */}
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Job Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={jobStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {jobStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, 'Jobs']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Sources */}
          <Card className="border-2 border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                Revenue by Pricing Model
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={revenueSourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Financial Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-800">Total Revenue</span>
                      <span className="text-lg font-bold text-green-900">
                        ${financialMetrics.totalRevenue.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium text-red-800">Total Expenses</span>
                      <span className="text-lg font-bold text-red-900">
                        ${financialMetrics.totalExpenses.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Net Profit</span>
                      <span className="text-lg font-bold text-blue-900">
                        ${financialMetrics.grossProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800">Profit Margin</span>
                      <span className="text-lg font-bold text-purple-900">
                        {financialMetrics.profitMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
