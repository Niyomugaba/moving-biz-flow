
import React, { useMemo } from 'react';
import { MetricCard } from '@/components/MetricCard';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { QuickAccessLinks } from '@/components/QuickAccessLinks';
import { BusinessAnalysisCard } from '@/components/BusinessAnalysisCard';
import { AdvancedKPIDashboard } from '@/components/AdvancedKPIDashboard';
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
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export const Dashboard = () => {
  const { profile, userRole } = useAuth();
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();
  const { clients } = useClients();

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

    // Calculate advanced metrics for KPI dashboard
    const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;
    const completionRate = jobs.length > 0 ? (completedJobs / jobs.length) * 100 : 0;
    const averageJobValue = completedJobs > 0 ? totalRevenue / completedJobs : 0;

    // Calculate monthly growth (mock data for demo - you can enhance this with actual historical data)
    const monthlyGrowth = 12.5; // This would come from comparing current vs previous month

    // Calculate profit margin (simplified calculation)
    const totalExpenses = jobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => {
        const leadCost = job.lead_cost || 0;
        // Simplified labor cost calculation
        const laborCost = job.pricing_model === 'flat_rate' 
          ? (job.worker_hourly_rate || 0) * (job.hours_worked || 0) * (job.movers_needed || 1)
          : (job.estimated_total || 0) * 0.6; // Estimated 60% labor cost for per-person jobs
        return sum + leadCost + laborCost;
      }, 0);
    
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0;

    // Repeat customer calculation
    const repeatCustomerRate = clients.length > 0 
      ? (clients.filter(client => (client.total_jobs_completed || 0) > 1).length / clients.length) * 100 
      : 0;

    // Generate mock monthly data for charts
    const monthlyRevenueData = [
      { month: 'Jan', revenue: totalRevenue * 0.7, profit: totalRevenue * 0.7 * (profitMargin / 100) },
      { month: 'Feb', revenue: totalRevenue * 0.8, profit: totalRevenue * 0.8 * (profitMargin / 100) },
      { month: 'Mar', revenue: totalRevenue * 0.9, profit: totalRevenue * 0.9 * (profitMargin / 100) },
      { month: 'Apr', revenue: totalRevenue, profit: totalRevenue * (profitMargin / 100) },
    ];

    // Status distribution data
    const statusDistribution = [
      { name: 'Completed', value: completedJobs, color: '#10B981' },
      { name: 'Scheduled', value: jobs.filter(job => job.status === 'scheduled').length, color: '#3B82F6' },
      { name: 'In Progress', value: jobs.filter(job => job.status === 'in_progress').length, color: '#F59E0B' },
      { name: 'Pending', value: jobs.filter(job => job.status === 'pending_schedule').length, color: '#EF4444' },
      { name: 'Cancelled', value: cancelledJobs, color: '#6B7280' },
    ];

    // Top performing metrics with proper typing
    const topPerformingMetrics = [
      { 
        metric: 'Conversion Rate', 
        value: `${conversionRate.toFixed(1)}%`, 
        trend: (conversionRate > 35 ? 'up' : 'down') as 'up' | 'down' | 'stable'
      },
      { 
        metric: 'Avg Job Value', 
        value: `$${averageJobValue.toFixed(0)}`, 
        trend: (averageJobValue > 400 ? 'up' : 'down') as 'up' | 'down' | 'stable'
      },
      { 
        metric: 'Profit Margin', 
        value: `${profitMargin.toFixed(1)}%`, 
        trend: (profitMargin > 25 ? 'up' : 'down') as 'up' | 'down' | 'stable'
      },
    ];

    return {
      // Basic metrics
      activeJobs,
      totalRevenue: Math.round(totalRevenue),
      activeEmployees,
      newLeads,
      completedJobs,
      totalHours: Math.round(totalHours),
      pendingTimeEntries,
      totalJobs: jobs.length,
      
      // Advanced KPI data
      kpiData: {
        totalRevenue: Math.round(totalRevenue),
        monthlyGrowth,
        profitMargin,
        conversionRate,
        averageJobValue,
        repeatCustomerRate,
        completionRate,
        activeJobs,
        monthlyRevenueData,
        statusDistribution: statusDistribution.filter(item => item.value > 0),
        topPerformingMetrics
      }
    };
  }, [jobs, employees, leads, timeEntries, clients]);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <WelcomeMessage />
      
      {/* Quick Access Links - Only show for owners/admins */}
      {(userRole?.role === 'owner' || userRole?.role === 'admin') && (
        <QuickAccessLinks />
      )}
      
      {/* Key Metrics Grid */}
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
          title="Active Employees"
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

      {/* Secondary Metrics */}
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
          icon={AlertCircle}
          className="bg-yellow-50 border-yellow-200"
        />
        <MetricCard
          title="All Jobs"
          value={dashboardMetrics.totalJobs.toString()}
          icon={TrendingUp}
          className="bg-indigo-50 border-indigo-200"
        />
      </div>

      {/* Advanced KPI Dashboard */}
      <AdvancedKPIDashboard data={dashboardMetrics.kpiData} />

      {/* Enhanced AI Business Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <BusinessAnalysisCard selectedDateRange="this_month" />
      </div>
    </div>
  );
};
