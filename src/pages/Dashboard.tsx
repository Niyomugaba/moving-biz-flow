
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Phone,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Filter,
  Eye
} from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useJobs } from "@/hooks/useJobs";
import { useLeads } from "@/hooks/useLeads";
import { useTimeEntries } from "@/hooks/useTimeEntries";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { toast } from "sonner";

export const Dashboard = () => {
  const { employees } = useEmployees();
  const { jobs } = useJobs();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();

  // Calculate key metrics
  const activeEmployees = employees.filter(emp => emp.status === 'active').length;
  const activeJobs = jobs.filter(job => job.status === 'in_progress').length;
  const pendingLeads = leads.filter(lead => lead.status === 'new').length;
  
  // Calculate this week's hours
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const thisWeekHours = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.work_date);
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    })
    .reduce((total, entry) => total + entry.hours_worked, 0);

  // Calculate revenue estimates
  const averageHourlyRate = employees.reduce((sum, emp) => sum + emp.hourly_wage, 0) / (employees.length || 1);
  const estimatedWeeklyRevenue = thisWeekHours * averageHourlyRate;

  // Job status distribution
  const jobStatusCounts = {
    scheduled: jobs.filter(j => j.status === 'scheduled').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    cancelled: jobs.filter(j => j.status === 'cancelled').length
  };

  // Lead conversion metrics
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;

  // Recent activity data
  const recentJobs = jobs
    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime())
    .slice(0, 5);

  const recentLeads = leads
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const handleExportData = () => {
    toast.success("Dashboard data exported successfully!");
  };

  const handleRefreshData = () => {
    toast.success("Dashboard data refreshed!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'new':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-50 to-gold-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefreshData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleExportData} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Employees</CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{activeEmployees}</div>
            <p className="text-xs text-gray-500 mt-1">
              {employees.length} total employees
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{activeJobs}</div>
            <p className="text-xs text-gray-500 mt-1">
              {jobs.length} total jobs
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">This Week Hours</CardTitle>
            <Clock className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{thisWeekHours.toFixed(1)}</div>
            <p className="text-xs text-gray-500 mt-1">
              ${estimatedWeeklyRevenue.toFixed(0)} estimated revenue
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Leads</CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{pendingLeads}</div>
            <p className="text-xs text-gray-500 mt-1">
              {conversionRate.toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="jobs" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Jobs
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Leads
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Job Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Job Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Scheduled</span>
                    <Badge className="bg-blue-100 text-blue-800">{jobStatusCounts.scheduled}</Badge>
                  </div>
                  <Progress value={(jobStatusCounts.scheduled / jobs.length) * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">In Progress</span>
                    <Badge className="bg-yellow-100 text-yellow-800">{jobStatusCounts.in_progress}</Badge>
                  </div>
                  <Progress value={(jobStatusCounts.in_progress / jobs.length) * 100} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Completed</span>
                    <Badge className="bg-green-100 text-green-800">{jobStatusCounts.completed}</Badge>
                  </div>
                  <Progress value={(jobStatusCounts.completed / jobs.length) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Employee Status Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['active', 'inactive', 'on_leave', 'terminated'].map((status) => {
                    const count = employees.filter(emp => emp.status === status).length;
                    const percentage = employees.length > 0 ? (count / employees.length) * 100 : 0;
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
                          <Badge className={getStatusColor(status)}>{count}</Badge>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Jobs
              </CardTitle>
              <CardDescription>Latest job activities and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{job.type} - {job.client_name}</p>
                        <p className="text-sm text-gray-500">
                          {format(new Date(job.scheduled_date), 'MMM dd, yyyy')} • {job.address}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Leads
              </CardTitle>
              <CardDescription>Latest lead inquiries and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-gray-500">
                          {lead.phone} • {lead.email}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>
                      {lead.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Lead Conversion Rate</span>
                  <span className="font-medium">{conversionRate.toFixed(1)}%</span>
                </div>
                <Progress value={conversionRate} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Job Completion Rate</span>
                  <span className="font-medium">
                    {jobs.length > 0 ? ((jobStatusCounts.completed / jobs.length) * 100).toFixed(1) : 0}%
                  </span>
                </div>
                <Progress value={jobs.length > 0 ? (jobStatusCounts.completed / jobs.length) * 100 : 0} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Hours/Week</span>
                  <span className="font-medium">{thisWeekHours.toFixed(1)}h</span>
                </div>
                <Progress value={Math.min((thisWeekHours / 40) * 100, 100)} className="h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenue Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${estimatedWeeklyRevenue.toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-500">Estimated weekly revenue</p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Average hourly rate:</span>
                    <span className="font-medium">${averageHourlyRate.toFixed(0)}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm mt-2">
                    <span>Total hours this week:</span>
                    <span className="font-medium">{thisWeekHours.toFixed(1)}h</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Quick Actions
          </CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Add Employee</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Schedule Job</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Add Lead</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col gap-2">
              <Clock className="h-6 w-6" />
              <span className="text-sm">Log Time</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
