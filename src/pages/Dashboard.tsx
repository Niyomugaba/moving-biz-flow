
import React, { useState } from 'react';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { AddLeadDialog } from '../components/AddLeadDialog';
import { ScheduleJobDialog } from '../components/ScheduleJobDialog';
import { useNavigate } from 'react-router-dom';
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

  // Mock data - in real app this would come from your backend
  const metrics = {
    totalLeads: 45,
    convertedLeads: 28,
    activeJobs: 12,
    monthlyRevenue: 18750,
    monthlyProfit: 12400,
    conversionRate: 62
  };

  const recentJobs = [
    {
      id: 1,
      client: 'John Smith',
      date: '2024-01-15',
      status: 'Scheduled',
      value: 850
    },
    {
      id: 2,
      client: 'Sarah Johnson',
      date: '2024-01-14',
      status: 'In Progress',
      value: 1200
    },
    {
      id: 3,
      client: 'Mike Davis',
      date: '2024-01-13',
      status: 'Completed',
      value: 950
    }
  ];

  const recentLeads = [
    {
      id: 1,
      name: 'Emma Wilson',
      source: 'Google Ads',
      status: 'New',
      cost: 25
    },
    {
      id: 2,
      name: 'Robert Brown',
      source: 'Referral',
      status: 'Contacted',
      cost: 0
    },
    {
      id: 3,
      name: 'Lisa Garcia',
      source: 'Thumbtack',
      status: 'Converted',
      cost: 35
    }
  ];

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
          value={metrics.totalLeads}
          icon={Users}
          change="+12% from last month"
          changeType="positive"
        />
        <MetricCard
          title="Active Jobs"
          value={metrics.activeJobs}
          icon={Briefcase}
          change="3 scheduled today"
          changeType="neutral"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${metrics.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="+18% from last month"
          changeType="positive"
        />
        <MetricCard
          title="Monthly Profit"
          value={`$${metrics.monthlyProfit.toLocaleString()}`}
          icon={TrendingUp}
          change="+22% from last month"
          changeType="positive"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics.conversionRate}%`}
          icon={TrendingUp}
          change="+5% from last month"
          changeType="positive"
        />
        <MetricCard
          title="Avg Job Value"
          value={`$${Math.round(metrics.monthlyRevenue / metrics.convertedLeads)}`}
          icon={DollarSign}
          change="$50 higher than last month"
          changeType="positive"
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
              {recentJobs.map((job) => (
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
              ))}
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
              {recentLeads.map((lead) => (
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
              ))}
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
      />
      <ScheduleJobDialog 
        open={isScheduleJobOpen} 
        onOpenChange={setIsScheduleJobOpen} 
      />
    </div>
  );
};
