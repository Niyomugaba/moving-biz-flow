
import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, Star, CheckCircle, Clock } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeads } from '@/hooks/useLeads';
import { useClients } from '@/hooks/useClients';

export const Dashboard = () => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const { leads } = useLeads();
  const { clients } = useClients();

  // Calculations
  const activeJobs = jobs.filter(job => job.status === 'scheduled' || job.status === 'in_progress').length;
  const completedJobsThisMonth = jobs.filter(job => {
    const jobDate = new Date(job.job_date);
    const currentDate = new Date();
    return job.status === 'completed' && 
           jobDate.getMonth() === currentDate.getMonth() && 
           jobDate.getFullYear() === currentDate.getFullYear();
  }).length;

  const monthlyRevenue = jobs
    .filter(job => {
      const jobDate = new Date(job.job_date);
      const currentDate = new Date();
      return job.status === 'completed' && 
             jobDate.getMonth() === currentDate.getMonth() && 
             jobDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, job) => sum + (job.hourly_rate * (job.actual_duration_hours || 0)), 0);

  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const averageJobValue = jobs.filter(job => job.status === 'completed').length > 0 
    ? jobs.filter(job => job.status === 'completed')
          .reduce((sum, job) => sum + (job.hourly_rate * (job.actual_duration_hours || 0)), 0) / 
      jobs.filter(job => job.status === 'completed').length 
    : 0;

  const totalLeadValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your moving business.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Active Jobs"
          value={activeJobs.toString()}
          icon={<Calendar className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-5 w-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Active Employees"
          value={activeEmployees.toString()}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 5, isPositive: false }}
        />
        <MetricCard
          title="New Leads"
          value={newLeads.toString()}
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{completedJobsThisMonth}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Job Value</p>
              <p className="text-2xl font-bold text-gray-900">${averageJobValue.toLocaleString()}</p>
            </div>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lead Conversion</p>
              <p className="text-2xl font-bold text-gray-900">{convertedLeads}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-gray-900">${totalLeadValue.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
          <div className="space-y-3">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{job.client_name}</p>
                  <p className="text-sm text-gray-600">{job.job_date}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  job.status === 'completed' ? 'bg-green-100 text-green-800' :
                  job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {leads.slice(0, 5).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-600">{lead.phone}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                    lead.status === 'quoted' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">${(lead.estimated_value || 0).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
