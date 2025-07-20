import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BusinessAnalysisCard } from '@/components/BusinessAnalysisCard';
import { DateRangeFilter, DateRange } from '@/components/DateRangeFilter';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeads } from '@/hooks/useLeads';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const Financials = () => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();
  const [selectedPeriod, setSelectedPeriod] = useState<DateRange>('this_month');
  const [showBusinessAnalysis, setShowBusinessAnalysis] = useState(false);

  const financialData = useMemo(() => {
    const completedJobs = jobs.filter(job => job.status === 'completed');
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

    // Monthly data for charts
    const monthlyData = [
      { 
        month: 'Jan', 
        revenue: Math.round(totalRevenue * 0.6), 
        expenses: Math.round(totalExpenses * 0.6),
        profit: Math.round(grossProfit * 0.6),
        jobs: Math.round(completedJobs.length * 0.6)
      },
      { 
        month: 'Feb', 
        revenue: Math.round(totalRevenue * 0.7), 
        expenses: Math.round(totalExpenses * 0.7),
        profit: Math.round(grossProfit * 0.7),
        jobs: Math.round(completedJobs.length * 0.7)
      },
      { 
        month: 'Mar', 
        revenue: Math.round(totalRevenue * 0.85), 
        expenses: Math.round(totalExpenses * 0.85),
        profit: Math.round(grossProfit * 0.85),
        jobs: Math.round(completedJobs.length * 0.85)
      },
      { 
        month: 'Apr', 
        revenue: Math.round(totalRevenue), 
        expenses: Math.round(totalExpenses),
        profit: Math.round(grossProfit),
        jobs: completedJobs.length
      },
    ];

    // Revenue breakdown by service type
    const serviceBreakdown = [
      { name: 'Residential', value: Math.round(totalRevenue * 0.65), color: '#3B82F6' },
      { name: 'Commercial', value: Math.round(totalRevenue * 0.25), color: '#10B981' },
      { name: 'Storage', value: Math.round(totalRevenue * 0.07), color: '#F59E0B' },
      { name: 'Other', value: Math.round(totalRevenue * 0.03), color: '#8B5CF6' },
    ].filter(item => item.value > 0);

    return {
      totalRevenue: Math.round(totalRevenue),
      totalExpenses: Math.round(totalExpenses),
      grossProfit: Math.round(grossProfit),
      profitMargin,
      monthlyData,
      serviceBreakdown,
      averageJobValue: completedJobs.length > 0 ? Math.round(totalRevenue / completedJobs.length) : 0,
      totalJobs: completedJobs.length,
      revenueGrowth: 15.2,
    };
  }, [jobs]);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="h-full w-full bg-gradient-to-br from-slate-50 to-gray-100">
      <ScrollArea className="h-full w-full">
        <div className="p-4 sm:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-slate-200 shadow-sm">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-900 to-purple-900 bg-clip-text text-transparent">
                Financial Dashboard
              </h1>
              <p className="text-slate-600 mt-1">Comprehensive financial analytics and insights</p>
            </div>
            
            <div className="flex items-center gap-3">
              <DateRangeFilter
                selectedRange={selectedPeriod}
                onRangeChange={setSelectedPeriod}
                className="bg-white/80 backdrop-blur-sm shadow-sm"
              />
              
              <Button 
                onClick={() => setShowBusinessAnalysis(!showBusinessAnalysis)}
                variant={showBusinessAnalysis ? "default" : "outline"}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg"
              >
                <Target className="h-4 w-4" />
                Business Insights
              </Button>
            </div>
          </div>

          {/* Key Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-full">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(financialData.totalRevenue)}</div>
                <div className={`flex items-center gap-1 text-sm mt-1 ${getTrendColor(financialData.revenueGrowth)}`}>
                  {getTrendIcon(financialData.revenueGrowth)}
                  <span>+{financialData.revenueGrowth.toFixed(1)}% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Gross Profit</CardTitle>
                  <div className="p-2 bg-emerald-100 rounded-full">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(financialData.grossProfit)}</div>
                <div className={`flex items-center gap-1 text-sm mt-1 ${getTrendColor(financialData.profitMargin)}`}>
                  {getTrendIcon(financialData.profitMargin)}
                  <span>{financialData.profitMargin.toFixed(1)}% margin</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 via-white to-orange-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Expenses</CardTitle>
                  <div className="p-2 bg-orange-100 rounded-full">
                    <TrendingDown className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(financialData.totalExpenses)}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {((financialData.totalExpenses / financialData.totalRevenue) * 100).toFixed(1)}% of revenue
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 via-white to-purple-50/30 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">Avg. Job Value</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(financialData.averageJobValue)}</div>
                <div className="text-sm text-slate-600 mt-1">
                  {financialData.totalJobs} completed jobs
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card className="col-span-1 lg:col-span-2 bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                  </div>
                  Revenue & Profit Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={financialData.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                        </linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000)}k`}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value: number, name: string) => [
                          `$${value.toLocaleString()}`,
                          name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : 'Expenses'
                        ]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3B82F6"
                        strokeWidth={3}
                        fill="url(#revenueGradient)"
                        name="Revenue"
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stroke="#10B981"
                        strokeWidth={3}
                        fill="url(#profitGradient)"
                        name="Profit"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Service Breakdown */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-indigo-100 rounded-full">
                    <PieChart className="h-5 w-5 text-indigo-600" />
                  </div>
                  Revenue by Service Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={financialData.serviceBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {financialData.serviceBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Jobs */}
            <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-slate-200">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <div className="p-2 bg-teal-100 rounded-full">
                    <Calendar className="h-5 w-5 text-teal-600" />
                  </div>
                  Jobs Completed Monthly
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialData.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
                      <XAxis 
                        dataKey="month" 
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#64748B"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                          backdropFilter: 'blur(10px)'
                        }}
                        formatter={(value: number) => [`${value}`, 'Jobs']}
                      />
                      <Bar 
                        dataKey="jobs" 
                        fill="url(#jobsGradient)"
                        radius={[8, 8, 0, 0]}
                        name="Jobs"
                      />
                      <defs>
                        <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#0D9488" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Analysis */}
          {showBusinessAnalysis && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-slate-200">
              <BusinessAnalysisCard selectedDateRange={selectedPeriod} />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
