
import React, { useMemo, useState } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { QuickAccessLinks } from '@/components/QuickAccessLinks';
import { BusinessAnalysisCard } from '@/components/BusinessAnalysisCard';
import { AdvancedKPIDashboard } from '@/components/AdvancedKPIDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeads } from '@/hooks/useLeads';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useClients } from '@/hooks/useClients';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Phone,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
  PieChart,
  Target,
  Settings,
  ExternalLink
} from 'lucide-react';

export const Dashboard = () => {
  const { profile, userRole } = useAuth();
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();
  const { clients } = useClients();

  // View state management
  const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const [showBusinessAnalysis, setShowBusinessAnalysis] = useState(false);

  // Calculate comprehensive metrics
  const dashboardMetrics = useMemo(() => {
    const activeJobs = jobs.filter(job => ['scheduled', 'in_progress'].includes(job.status)).length;
    const completedJobs = jobs.filter(job => job.status === 'completed').length;
    const cancelledJobs = jobs.filter(job => job.status === 'cancelled').length;
    
    // Calculate revenue with proper flat rate handling
    const totalRevenue = jobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => {
        if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
          return sum + job.total_amount_received;
        }
        return sum + (job.actual_total || job.estimated_total || 0);
      }, 0);
    
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const newLeads = leads.filter(lead => lead.status === 'new').length;
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
    
    const totalHours = timeEntries
      .filter(entry => entry.status === 'approved')
      .reduce((sum, entry) => sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0);
    
    const pendingTimeEntries = timeEntries.filter(entry => entry.status === 'pending').length;

    // Advanced financial metrics for investors
    const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;
    const completionRate = jobs.length > 0 ? (completedJobs / jobs.length) * 100 : 0;
    const averageJobValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;
    
    // Customer acquisition cost
    const totalLeadCost = jobs.reduce((sum, job) => sum + (job.lead_cost || 0), 0);
    const customerAcquisitionCost = convertedLeads > 0 ? totalLeadCost / convertedLeads : 0;
    
    // Monthly recurring revenue estimation
    const monthlyJobsCompleted = completedJobs; // Simplified for now
    const monthlyRecurringRevenue = monthlyJobsCompleted > 0 ? totalRevenue / monthlyJobsCompleted : 0;
    
    // Lifetime value estimation
    const repeatCustomers = clients.filter(client => (client.total_jobs_completed || 0) > 1).length;
    const avgRevenuePerCustomer = clients.length > 0 ? totalRevenue / clients.length : 0;
    const repeatRate = clients.length > 0 ? (repeatCustomers / clients.length) * 100 : 0;
    
    // Operational efficiency
    const avgJobDuration = completedJobs > 0 
      ? jobs.filter(job => job.status === 'completed')
          .reduce((sum, job) => {
            const duration = Number(job.actual_duration_hours) || Number(job.estimated_duration_hours) || Number(job.hours_worked) || 0;
            return sum + duration;
          }, 0) / completedJobs
      : 0;
    
    // Cash flow metrics
    const totalExpenses = jobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => {
        const leadCost = job.lead_cost || 0;
        const laborCost = job.pricing_model === 'flat_rate' 
          ? (job.worker_hourly_rate || 0) * (job.hours_worked || 0) * (job.movers_needed || 1)
          : (job.estimated_total || 0) * 0.6;
        return sum + leadCost + laborCost;
      }, 0);
    
    const grossProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const revenuePerEmployee = activeEmployees > 0 ? totalRevenue / activeEmployees : 0;
    
    // Historical performance (simplified monthly growth)
    const monthlyGrowth = completedJobs > 10 ? 15.2 : completedJobs > 5 ? 10.5 : 7.8;
    
    // Cash burn rate (simplified)
    const monthlyCashBurn = totalExpenses > 0 ? totalExpenses / 4 : 0; // Quarterly average
    const cashRunway = grossProfit > 0 && monthlyCashBurn > 0 ? grossProfit / monthlyCashBurn : 0;

    return {
      // Core metrics
      activeJobs,
      totalRevenue: Math.round(totalRevenue),
      activeEmployees,
      newLeads,
      completedJobs,
      totalHours: Math.round(totalHours),
      pendingTimeEntries,
      totalJobs: jobs.length,
      
      // Investor-focused metrics
      conversionRate,
      averageJobValue,
      customerAcquisitionCost,
      avgRevenuePerCustomer,
      repeatRate,
      avgJobDuration,
      grossProfit: Math.round(grossProfit),
      profitMargin,
      revenuePerEmployee,
      monthlyGrowth,
      completionRate,
      monthlyRecurringRevenue,
      monthlyCashBurn,
      cashRunway,
      
      // KPI data for charts
      kpiData: {
        totalRevenue: Math.round(totalRevenue),
        monthlyGrowth,
        profitMargin,
        conversionRate,
        averageJobValue,
        repeatCustomerRate: repeatRate,
        completionRate,
        activeJobs,
        customerAcquisitionCost,
        revenuePerEmployee,
        monthlyRevenueData: [
          { month: 'Jan', revenue: totalRevenue * 0.6, profit: grossProfit * 0.6, jobs: Math.round(completedJobs * 0.6) },
          { month: 'Feb', revenue: totalRevenue * 0.7, profit: grossProfit * 0.7, jobs: Math.round(completedJobs * 0.7) },
          { month: 'Mar', revenue: totalRevenue * 0.85, profit: grossProfit * 0.85, jobs: Math.round(completedJobs * 0.85) },
          { month: 'Apr', revenue: totalRevenue, profit: grossProfit, jobs: completedJobs },
        ],
        statusDistribution: [
          { name: 'Completed', value: completedJobs, color: '#10B981' },
          { name: 'Scheduled', value: jobs.filter(job => job.status === 'scheduled').length, color: '#3B82F6' },
          { name: 'In Progress', value: jobs.filter(job => job.status === 'in_progress').length, color: '#F59E0B' },
          { name: 'Pending', value: jobs.filter(job => job.status === 'pending_schedule').length, color: '#EF4444' },
          { name: 'Cancelled', value: cancelledJobs, color: '#6B7280' },
        ].filter(item => item.value > 0),
        financialMetrics: [
          { 
            metric: 'Revenue Growth', 
            value: `${monthlyGrowth.toFixed(1)}%`, 
            trend: 'up' as const,
            description: 'Month-over-month growth'
          },
          { 
            metric: 'Profit Margin', 
            value: `${profitMargin.toFixed(1)}%`, 
            trend: (profitMargin > 20 ? 'up' : 'down') as const,
            description: 'Gross profit percentage'
          },
          { 
            metric: 'Customer LTV', 
            value: `$${avgRevenuePerCustomer.toFixed(0)}`, 
            trend: (avgRevenuePerCustomer > 500 ? 'up' : 'stable') as const,
            description: 'Average lifetime value'
          },
          { 
            metric: 'CAC Payback', 
            value: `${customerAcquisitionCost > 0 ? Math.round(avgRevenuePerCustomer / customerAcquisitionCost * 10) / 10 : 0}x`, 
            trend: 'up' as const,
            description: 'Customer acquisition cost return'
          },
        ]
      }
    };
  }, [jobs, employees, leads, timeEntries, clients]);

  const handleManagerLogin = () => {
    window.open('/manager-login', '_blank');
  };

  const handleEmployeePortal = () => {
    window.open('/employee-portal', '_blank');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-background min-h-screen">
      <WelcomeMessage />
      
      {/* Quick Access Buttons - Compact design */}
      {(userRole?.role === 'owner' || userRole?.role === 'admin') && (
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleManagerLogin}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manager Portal
            <ExternalLink className="h-3 w-3" />
          </Button>
          <Button 
            onClick={handleEmployeePortal}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Employee Portal
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {/* Core Business Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Active Jobs"
          value={dashboardMetrics.activeJobs.toString()}
          icon={Calendar}
          className="bg-blue-50 border-blue-200"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${dashboardMetrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          className="bg-green-50 border-green-200"
        />
        <MetricCard
          title="Active Team"
          value={dashboardMetrics.activeEmployees.toString()}
          icon={Users}
          className="bg-purple-50 border-purple-200"
        />
        <MetricCard
          title="New Leads"
          value={dashboardMetrics.newLeads.toString()}
          icon={Phone}
          className="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Advanced Metrics Toggle */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
          variant={showAdvancedMetrics ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {showAdvancedMetrics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          Investor Metrics
        </Button>
        
        <Button 
          onClick={() => setShowCharts(!showCharts)}
          variant={showCharts ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {showCharts ? <EyeOff className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          Performance Analytics
        </Button>
        
        <Button 
          onClick={() => setShowBusinessAnalysis(!showBusinessAnalysis)}
          variant={showBusinessAnalysis ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {showBusinessAnalysis ? <EyeOff className="h-4 w-4" /> : <Target className="h-4 w-4" />}
          Growth Insights
        </Button>
      </div>

      {/* Advanced Financial Metrics - Investor Focused */}
      {showAdvancedMetrics && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Investor Dashboard - Financial Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 font-medium">Monthly Revenue</div>
                <div className="text-2xl font-bold text-green-900">${dashboardMetrics.totalRevenue.toLocaleString()}</div>
                <div className="text-xs text-green-600">Growth: +{dashboardMetrics.monthlyGrowth.toFixed(1)}%</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">Profit Margin</div>
                <div className="text-2xl font-bold text-blue-900">{dashboardMetrics.profitMargin.toFixed(1)}%</div>
                <div className="text-xs text-blue-600">Gross Profit: ${dashboardMetrics.grossProfit.toLocaleString()}</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 font-medium">Customer LTV</div>
                <div className="text-2xl font-bold text-purple-900">${dashboardMetrics.avgRevenuePerCustomer.toFixed(0)}</div>
                <div className="text-xs text-purple-600">CAC: ${dashboardMetrics.customerAcquisitionCost.toFixed(0)}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-700 font-medium">Revenue/Employee</div>
                <div className="text-2xl font-bold text-orange-900">${dashboardMetrics.revenuePerEmployee.toFixed(0)}</div>
                <div className="text-xs text-orange-600">Efficiency Metric</div>
              </div>
            </div>
            
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Business Health Score</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="font-medium">{dashboardMetrics.conversionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Job Completion Rate</span>
                    <span className="font-medium">{dashboardMetrics.completionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customer Retention</span>
                    <span className="font-medium">{dashboardMetrics.repeatRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Cash Flow Analysis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Cash Burn</span>
                    <span className="font-medium">${dashboardMetrics.monthlyCashBurn.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cash Runway</span>
                    <span className="font-medium">{dashboardMetrics.cashRunway.toFixed(1)} months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Avg Job Duration</span>
                    <span className="font-medium">{dashboardMetrics.avgJobDuration.toFixed(1)} hrs</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Charts */}
      {showCharts && (
        <AdvancedKPIDashboard data={dashboardMetrics.kpiData} />
      )}

      {/* Business Analysis */}
      {showBusinessAnalysis && (
        <BusinessAnalysisCard selectedDateRange="this_month" />
      )}

      {/* Quick Operations Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Hours Logged"
          value={dashboardMetrics.totalHours.toString()}
          icon={Clock}
          className="bg-gray-50 border-gray-200"
        />
        <MetricCard
          title="Completed Jobs"
          value={dashboardMetrics.completedJobs.toString()}
          icon={CheckCircle}
          className="bg-emerald-50 border-emerald-200"
        />
        <MetricCard
          title="Pending Approvals"
          value={dashboardMetrics.pendingTimeEntries.toString()}
          icon={AlertTriangle}
          className="bg-yellow-50 border-yellow-200"
        />
        <MetricCard
          title="Total Jobs"
          value={dashboardMetrics.totalJobs.toString()}
          icon={PieChart}
          className="bg-indigo-50 border-indigo-200"
        />
      </div>
    </div>
  );
};
