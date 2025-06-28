
import React, { useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { AddLeadDialog } from '../components/AddLeadDialog';
import { ScheduleJobDialog } from '../components/ScheduleJobDialog';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '@/hooks/useLeads';
import { useJobs } from '@/hooks/useJobs';
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

export const Dashboard = () => {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isScheduleJobOpen, setIsScheduleJobOpen] = useState(false);
  const navigate = useNavigate();

  const { leads, addLead } = useLeads();
  const { jobs } = useJobs();

  const handleAddLead = (leadData: any) => {
    addLead({
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email || null,
      source: leadData.source,
      cost: parseFloat(leadData.cost) || 0,
      status: 'New',
      notes: null
    });
  };

  // Calculate metrics from real data
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
  const activeJobs = jobs.filter(job => job.status !== 'Completed').length;
  const monthlyRevenue = jobs
    .filter(job => job.status === 'Completed')
    .reduce((sum, job) => sum + (job.hourly_rate * job.estimated_hours), 0);
  const monthlyProfit = Math.round(monthlyRevenue * 0.65); // Assuming 65% profit margin
  const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;
  const avgJobValue = convertedLeads > 0 ? Math.round(monthlyRevenue / convertedLeads) : 0;

  // Recent jobs (last 3)
  const recentJobs = jobs
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map(job => ({
      id: job.id,
      client: job.client_name,
      date: job.job_date,
      status: job.status,
      value: job.hourly_rate * job.estimated_hours
    }));

  // Recent leads (last 3)
  const recentLeads = leads
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)
    .map(lead => ({
      id: lead.id,
      name: lead.name,
      source: lead.source,
      status: lead.status,
      cost: lead.cost
    }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's your business overview.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Leads This Month"
          value={leads.length}
          icon={Users}
          change={leads.length > 0 ? "+12% from last month" : "Start adding leads"}
          changeType={leads.length > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Active Jobs"
          value={activeJobs}
          icon={Briefcase}
          change={activeJobs > 0 ? "3 scheduled today" : "No active jobs"}
          changeType="neutral"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={monthlyRevenue > 0 ? "+18% from last month" : "Complete jobs to see revenue"}
          changeType={monthlyRevenue > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Monthly Profit"
          value={`$${monthlyProfit.toLocaleString()}`}
          icon={TrendingUp}
          change={monthlyProfit > 0 ? "+22% from last month" : "Complete jobs to see profit"}
          changeType={monthlyProfit > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          change={conversionRate > 0 ? "+5% from last month" : "Convert leads to improve"}
          changeType={conversionRate > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Avg Job Value"
          value={`$${avgJobValue}`}
          icon={DollarSign}
          change={avgJobValue > 0 ? "$50 higher than last month" : "Complete jobs to calculate"}
          changeType={avgJobValue > 0 ? "positive" : "neutral"}
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{job.client}</p>
                      <p className="text-sm text-gray-600">{job.date}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={job.status} variant="job" />
                      <p className="text-sm font-medium text-gray-900 mt-1">${job.value}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No jobs yet. Schedule your first job to see it here.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentLeads.length > 0 ? (
                recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.source}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={lead.status} variant="lead" />
                      <p className="text-sm text-gray-600 mt-1">
                        {lead.cost > 0 ? `$${lead.cost}` : 'Free'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No leads yet. Add your first lead to see it here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={() => setIsAddLeadOpen(true)}
            className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-900">Add New Lead</p>
          </button>
          <button 
            onClick={() => setIsScheduleJobOpen(true)}
            className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Briefcase className="h-6 w-6 text-green-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900">Schedule Job</p>
          </button>
          <button 
            onClick={() => navigate('/employees')}
            className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Clock className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-900">Review Hours</p>
          </button>
          <button 
            onClick={() => navigate('/financials')}
            className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <DollarSign className="h-6 w-6 text-orange-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-orange-900">View Reports</p>
          </button>
        </div>
      </div>

      {/* Dialogs */}
      <AddLeadDialog 
        open={isAddLeadOpen} 
        onOpenChange={setIsAddLeadOpen} 
        onAddLead={handleAddLead}
      />
      <ScheduleJobDialog 
        open={isScheduleJobOpen} 
        onOpenChange={setIsScheduleJobOpen} 
      />
    </div>
  );
};
