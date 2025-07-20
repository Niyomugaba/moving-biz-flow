
import React from 'react';
import { MetricCard } from '@/components/MetricCard';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { QuickAccessLinks } from '@/components/QuickAccessLinks';
import { BusinessAnalysisCard } from '@/components/BusinessAnalysisCard';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeads } from '@/hooks/useLeads';
import { useTimeEntries } from '@/hooks/useTimeEntries';
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

  // Calculate real metrics from data
  const activeJobs = jobs.filter(job => ['scheduled', 'in_progress'].includes(job.status)).length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const totalRevenue = jobs
    .filter(job => job.status === 'completed' && job.is_paid)
    .reduce((sum, job) => sum + (job.actual_total || job.estimated_total), 0);
  
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  
  const totalHours = timeEntries
    .filter(entry => entry.status === 'approved')
    .reduce((sum, entry) => sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0);
  
  const pendingTimeEntries = timeEntries.filter(entry => entry.status === 'pending').length;

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
          value={activeJobs.toString()}
          icon={Calendar}
          className="bg-blue-50 border-blue-200"
        />
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          className="bg-green-50 border-green-200"
        />
        <MetricCard
          title="Active Employees"
          value={activeEmployees.toString()}
          icon={Users}
          className="bg-purple-50 border-purple-200"
        />
        <MetricCard
          title="New Leads"
          value={newLeads.toString()}
          icon={Phone}
          className="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Hours Logged"
          value={Math.round(totalHours).toString()}
          icon={Clock}
          className="bg-gray-50 border-gray-200"
        />
        <MetricCard
          title="Completed Jobs"
          value={completedJobs.toString()}
          icon={CheckCircle}
          className="bg-emerald-50 border-emerald-200"
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingTimeEntries.toString()}
          icon={AlertCircle}
          className="bg-yellow-50 border-yellow-200"
        />
        <MetricCard
          title="All Jobs"
          value={jobs.length.toString()}
          icon={TrendingUp}
          className="bg-indigo-50 border-indigo-200"
        />
      </div>

      {/* AI Business Analysis */}
      <div className="grid grid-cols-1 gap-6">
        <BusinessAnalysisCard />
      </div>
    </div>
  );
};
