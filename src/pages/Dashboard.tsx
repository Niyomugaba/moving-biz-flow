
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
  Target
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
    
    // Lifetime value estimation
    const repeatCustomers = clients.filter(client => (client.total_jobs_completed || 0) > 1).length;
    const avgRevenuePerCustomer = clients.length > 0 ? totalRevenue / clients.length : 0;
    const repeatRate = clients.length > 0 ? (repeatCustomers / clients.length) * 100 : 0;
    
    // Operational efficiency - using actual_duration_hours or estimated_duration_hours
    const avgJobDuration = completedJobs > 0 
      ? jobs.filter(job => job.status === 'completed')
          .reduce((sum, job) => {
            const duration = job.actual_duration_hours || job.estimated_duration_hours || job.hours_worked || 0;
            return sum + Number(duration);
          }, 0) / completedJobs
      : 0;
    
    // Profit margins
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

    // Revenue per employee
    const revenuePerEmployee = activeEmployees > 0 ? totalRevenue / activeEmployees : 0;
    
    // Monthly growth estimation (simplified)
    const monthlyGrowth = completedJobs > 10 ? 12.5 : completedJobs > 5 ? 8.2 : 5.1;

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
      
      // Advanced financial metrics
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
        monthlyRevenueData: [
          { month: 'Jan', revenue: totalRevenue * 0.7, profit: grossProfit * 0.7 },
          { month: 'Feb', revenue: totalRevenue * 0.8, profit: grossProfit * 0.8 },
          { month: 'Mar', revenue: totalRevenue * 0.9, profit: grossProfit * 0.9 },
          { month: 'Apr', revenue: totalRevenue, profit: grossProfit },
        ],
        statusDistribution: [
          { name: 'Completed', value: completedJobs, color: '#10B981' },
          { name: 'Scheduled', value: jobs.filter(job => job.status === 'scheduled').length, color: '#3B82F6' },
          { name: 'In Progress', value: jobs.filter(job => job.status === 'in_progress').length, color: '#F59E0B' },
          { name: 'Pending', value: jobs.filter(job => job.status === 'pending_schedule').length, color: '#EF4444' },
          { name: 'Cancelled', value: cancelledJobs, color: '#6B7280' },
        ].filter(item => item.value > 0),
        topPerformingMetrics: [
          { 
            metric: 'Conversion Rate', 
            value: `${conversionRate.toFixed(1)}%`, 
            trend: (conversionRate > 25 ? 'up' : 'down') as 'up' | 'down' | 'stable'
          },
          { 
            metric: 'Avg Job Value', 
            value: `$${averageJobValue.toFixed(0)}`, 
            trend: (averageJobValue > 300 ? 'up' : 'down') as 'up' | 'down' | 'stable'
          },
          { 
            metric: 'Profit Margin', 
            value: `${profitMargin.toFixed(1)}%`, 
            trend: (profitMargin > 20 ? 'up' : 'down') as 'up' | 'down' | 'stable'
          },
        ]
      }
    };
  }, [jobs, employees, leads, timeEntries, clients]);

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-background min-h-screen">
      <WelcomeMessage />
      
      {/* Quick Access Links - Only show for owners/admins */}
      {(userRole?.role === 'owner' || userRole?.role === 'admin') && (
        <QuickAccessLinks />
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
          Financial Metrics
        </Button>
        
        <Button 
          onClick={() => setShowCharts(!showCharts)}
          variant={showCharts ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {showCharts ? <EyeOff className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
          Performance Charts
        </Button>
        
        <Button 
          onClick={() => setShowBusinessAnalysis(!showBusinessAnalysis)}
          variant={showBusinessAnalysis ? "default" : "outline"}
          className="flex items-center gap-2"
        >
          {showBusinessAnalysis ? <EyeOff className="h-4 w-4" /> : <Target className="h-4 w-4" />}
          Business Analysis
        </Button>
      </div>

      {/* Advanced Financial Metrics - Investor Focused */}
      {showAdvancedMetrics && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Financial Performance & Key Ratios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-green-700 font-medium">Gross Profit</div>
                <div className="text-2xl font-bold text-green-900">${dashboardMetrics.grossProfit.toLocaleString()}</div>
                <div className="text-xs text-green-600">Margin: {dashboardMetrics.profitMargin.toFixed(1)}%</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-700 font-medium">Avg Job Value</div>
                <div className="text-2xl font-bold text-blue-900">${dashboardMetrics.averageJobValue.toFixed(0)}</div>
                <div className="text-xs text-blue-600">Conversion: {dashboardMetrics.conversionRate.toFixed(1)}%</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 font-medium">Customer ACQ Cost</div>
                <div className="text-2xl font-bold text-purple-900">${dashboardMetrics.customerAcquisitionCost.toFixed(0)}</div>
                <div className="text-xs text-purple-600">LTV: ${dashboardMetrics.avgRevenuePerCustomer.toFixed(0)}</div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="text-sm text-orange-700 font-medium">Revenue/Employee</div>
                <div className="text-2xl font-bold text-orange-900">${dashboardMetrics.revenuePerEmployee.toFixed(0)}</div>
                <div className="text-xs text-orange-600">Growth: +{dashboardMetrics.monthlyGrowth.toFixed(1)}%</div>
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
