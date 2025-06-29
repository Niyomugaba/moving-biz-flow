
import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useLeads } from '@/hooks/useLeads';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Calendar, Users, Briefcase, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export const Dashboard = () => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();

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

  // Top metrics data with custom colors
  const metrics = [
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      change: '+12%',
      icon: DollarSign,
      bgColor: 'bg-yellow-400',
      textColor: 'text-yellow-900'
    },
    {
      title: 'Active Jobs',
      value: jobs.filter(job => job.status === 'scheduled' || job.status === 'in_progress').length.toString(),
      change: '+3',
      icon: Briefcase,
      bgColor: 'bg-purple-600',
      textColor: 'text-white'
    },
    {
      title: 'New Leads',
      value: newLeads.toString(),
      change: '+8',
      icon: Users,
      bgColor: 'bg-purple-500',
      textColor: 'text-white'
    },
    {
      title: 'Pending Reviews',
      value: pendingTimeEntries.toString(),
      change: '-2',
      icon: Calendar,
      bgColor: 'bg-yellow-500',
      textColor: 'text-yellow-900'
    }
  ];

  // Recent activity data
  const recentJobs = jobs.slice(0, 5);
  const recentLeads = leads.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50">
      <div className="space-y-8 p-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">Dashboard</h1>
          <p className="text-purple-700 text-lg">Welcome back! Here's your business overview.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className={`${metric.bgColor} rounded-xl shadow-lg p-6 border-2 border-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${metric.textColor} opacity-90`}>{metric.title}</p>
                  <p className={`text-3xl font-bold ${metric.textColor} mt-2`}>{metric.value}</p>
                  <p className={`text-sm mt-2 ${metric.textColor} opacity-80`}>
                    {metric.change}
                  </p>
                </div>
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <metric.icon className={`h-8 w-8 ${metric.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Jobs */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100">
            <div className="p-6 border-b border-purple-100 bg-purple-600 rounded-t-xl">
              <h2 className="text-xl font-bold text-white flex items-center">
                <Briefcase className="h-6 w-6 mr-3" />
                Recent Jobs
              </h2>
            </div>
            <div className="p-6">
              {recentJobs.length > 0 ? (
                <div className="space-y-4">
                  {recentJobs.map((job, index) => (
                    <div key={job.id || index} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div>
                        <p className="font-semibold text-purple-900">{job.client_name}</p>
                        <p className="text-sm text-purple-600">{job.job_date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          job.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                          job.status === 'in_progress' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          job.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {job.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-purple-600 font-medium">No recent jobs</p>
                  <p className="text-sm text-purple-400 mt-2">Jobs will appear here once you start scheduling</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-yellow-100">
            <div className="p-6 border-b border-yellow-100 bg-yellow-400 rounded-t-xl">
              <h2 className="text-xl font-bold text-yellow-900 flex items-center">
                <Users className="h-6 w-6 mr-3" />
                Recent Leads
              </h2>
            </div>
            <div className="p-6">
              {recentLeads.length > 0 ? (
                <div className="space-y-4">
                  {recentLeads.map((lead, index) => (
                    <div key={lead.id || index} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                      <div>
                        <p className="font-semibold text-yellow-900">{lead.name}</p>
                        <p className="text-sm text-yellow-700">{lead.phone}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600 mb-1">${(lead.estimated_value || 0).toLocaleString()}</p>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          lead.status === 'converted' ? 'bg-green-100 text-green-800 border border-green-200' :
                          lead.status === 'quoted' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                          'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {lead.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-yellow-300 mx-auto mb-4" />
                  <p className="text-yellow-700 font-medium">No recent leads</p>
                  <p className="text-sm text-yellow-500 mt-2">New leads will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-purple-100">
          <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-purple-700 rounded-t-xl">
            <h2 className="text-xl font-bold text-white flex items-center">
              <TrendingUp className="h-6 w-6 mr-3" />
              Business Overview
            </h2>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                <div className="p-3 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Briefcase className="h-8 w-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-purple-600 mb-1">{totalJobs}</p>
                <p className="text-sm font-medium text-purple-500">Total Jobs</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="p-3 bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">{completedJobs}</p>
                <p className="text-sm font-medium text-green-500">Completed</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="p-3 bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-3xl font-bold text-yellow-600 mb-1">{activeEmployees}</p>
                <p className="text-sm font-medium text-yellow-500">Active Staff</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-100">
                <div className="p-3 bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">{leads.length}</p>
                <p className="text-sm font-medium text-orange-500">Total Leads</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
