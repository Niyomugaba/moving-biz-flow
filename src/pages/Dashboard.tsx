
import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeads } from '@/hooks/useLeads';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Calendar, Users, Briefcase, DollarSign } from 'lucide-react';

export const Dashboard = () => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();

  // Sample data for demo
  const sampleJob = {
    id: '1',
    client_name: 'Jane Doe',
    origin: '123 Oak St',
    destination: '456 Pine Ave',
    date: '2024-01-15',
    status: 'scheduled' as const,
    estimated_hours: 4,
    hourly_rate: 120
  };

  const sampleEmployee = {
    name: 'Mike Johnson',
    position: 'Senior Mover',
    status: 'active' as const,
    hourly_wage: 25
  };

  const sampleLead = {
    name: 'Sarah Wilson',
    phone: '(555) 234-5678',
    source: 'website' as const,
    status: 'new' as const,
    estimated_value: 800
  };

  // Calculate metrics
  const totalJobs = jobs.length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  
  // Calculate monthly revenue from completed jobs
  const monthlyRevenue = jobs
    .filter(job => job.status === 'completed')
    .reduce((sum, job) => {
      const hours = job.actual_duration_hours || job.estimated_duration_hours;
      return sum + (hours * job.hourly_rate);
    }, 0);

  // Calculate pending time entries
  const pendingTimeEntries = timeEntries.filter(entry => entry.status === 'pending').length;

  // Top metrics data
  const metrics = [
    {
      title: 'This Month Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: '+12%',
      icon: DollarSign,
      color: 'text-green-600' as const
    },
    {
      title: 'Active Jobs',
      value: jobs.filter(job => job.status === 'scheduled' || job.status === 'in_progress').length.toString(),
      change: '+3',
      icon: Briefcase,
      color: 'text-blue-600' as const
    },
    {
      title: 'New Leads',
      value: newLeads.toString(),
      change: '+8',
      icon: Users,
      color: 'text-purple-600' as const
    },
    {
      title: 'Pending Reviews',
      value: pendingTimeEntries.toString(),
      change: '-2',
      icon: Calendar,
      color: 'text-orange-600' as const
    }
  ];

  // Recent activity data (using actual data or samples)
  const recentJobs = jobs.slice(0, 5);
  const recentLeads = leads.slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your moving business.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={index}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
          </div>
          <div className="p-6">
            {recentJobs.length > 0 ? (
              <div className="space-y-4">
                {recentJobs.map((job, index) => (
                  <div key={job.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{job.client_name}</p>
                      <p className="text-sm text-gray-600">{job.job_date}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        job.status === 'completed' ? 'bg-green-100 text-green-800' :
                        job.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        job.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent jobs</p>
                <p className="text-sm text-gray-400 mt-1">Jobs will appear here once you start scheduling</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
          </div>
          <div className="p-6">
            {recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead, index) => (
                  <div key={lead.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-600">{lead.phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">${(lead.estimated_value || 0).toLocaleString()}</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        lead.status === 'converted' ? 'bg-green-100 text-green-800' :
                        lead.status === 'quoted' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent leads</p>
                <p className="text-sm text-gray-400 mt-1">New leads will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Stats</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalJobs}</p>
              <p className="text-sm text-gray-600">Total Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
              <p className="text-sm text-gray-600">Completed Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{activeEmployees}</p>
              <p className="text-sm text-gray-600">Active Employees</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{leads.length}</p>
              <p className="text-sm text-gray-600">Total Leads</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
