
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/MetricCard';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { RoleGuard } from '@/components/RoleGuard';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BarChart3, DollarSign, Users, Calendar, Phone, Clock, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  // Fetch dashboard metrics
  const { data: metrics = {
    totalJobs: 0,
    activeEmployees: 0,
    newLeads: 0,
    pendingTimeEntries: 0,
    recentJobs: [],
    totalRevenue: 0
  }, isLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const [
        { count: totalJobs },
        { count: activeEmployees },
        { count: newLeads },
        { count: pendingTimeEntries },
        { data: recentJobs },
        { data: monthlyRevenue }
      ] = await Promise.all([
        supabase.from('jobs').select('*', { count: 'exact', head: true }),
        supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
        supabase.from('time_entries').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('jobs').select('*').eq('status', 'completed').order('updated_at', { ascending: false }).limit(5),
        supabase.from('jobs').select('actual_total').eq('is_paid', true).not('actual_total', 'is', null)
      ]);

      const totalRevenue = monthlyRevenue?.reduce((sum, job) => sum + (job.actual_total || 0), 0) || 0;

      return {
        totalJobs: totalJobs || 0,
        activeEmployees: activeEmployees || 0,
        newLeads: newLeads || 0,
        pendingTimeEntries: pendingTimeEntries || 0,
        recentJobs: recentJobs || [],
        totalRevenue
      };
    }
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <WelcomeMessage />
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <RoleGuard allowedRoles={['owner', 'admin', 'manager']}>
          <MetricCard
            title="Total Jobs"
            value={metrics.totalJobs}
            icon={Calendar}
            description="All time jobs"
          />
        </RoleGuard>
        
        <RoleGuard allowedRoles={['owner', 'admin', 'manager']}>
          <MetricCard
            title="Active Employees"
            value={metrics.activeEmployees}
            icon={Users}
            description="Currently employed"
          />
        </RoleGuard>
        
        <RoleGuard allowedRoles={['owner', 'admin', 'manager']}>
          <MetricCard
            title="New Leads"
            value={metrics.newLeads}
            icon={Phone}
            description="Awaiting contact"
          />
        </RoleGuard>
        
        <RoleGuard allowedRoles={['owner', 'admin', 'manager']}>
          <MetricCard
            title="Pending Approvals"
            value={metrics.pendingTimeEntries}
            icon={Clock}
            description="Time entries to review"
          />
        </RoleGuard>
      </div>

      {/* Revenue Metrics - Owner and Admin only */}
      <RoleGuard allowedRoles={['owner', 'admin']}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`$${metrics.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            description="From completed jobs"
            className="bg-green-50 border-green-200"
          />
          
          <MetricCard
            title="Average Job Value"
            value={`$${metrics.totalJobs > 0 ? (metrics.totalRevenue / metrics.totalJobs).toFixed(0) : '0'}`}
            icon={TrendingUp}
            description="Per completed job"
            className="bg-blue-50 border-blue-200"
          />
        </div>
      </RoleGuard>

      {/* Recent Activity */}
      <RoleGuard allowedRoles={['owner', 'admin', 'manager']}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Recent Completed Jobs
            </CardTitle>
            <CardDescription>Latest 5 completed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.recentJobs?.length > 0 ? (
              <div className="space-y-3">
                {metrics.recentJobs.map((job: any) => (
                  <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{job.job_number}</p>
                      <p className="text-sm text-gray-600">{job.client_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(job.job_date).toLocaleDateString()}
                      </p>
                    </div>
                    <RoleGuard allowedRoles={['owner', 'admin']}>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${job.actual_total?.toLocaleString() || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {job.is_paid ? 'Paid' : 'Pending Payment'}
                        </p>
                      </div>
                    </RoleGuard>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent jobs found.</p>
            )}
          </CardContent>
        </Card>
      </RoleGuard>

      {/* Quick Actions */}
      <RoleGuard allowedRoles={['owner', 'admin', 'manager']}>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/jobs" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
                <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Schedule Job</p>
              </a>
              
              <a href="/employees" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Add Employee</p>
              </a>
              
              <a href="/leads" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
                <Phone className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Follow Up Leads</p>
              </a>
              
              <a href="/time-logs" className="p-4 bg-amber-50 rounded-lg text-center hover:bg-amber-100 transition-colors">
                <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Review Time Logs</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </RoleGuard>
    </div>
  );
};
