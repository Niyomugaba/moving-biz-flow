
import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { ScheduleJobDialog } from '../components/ScheduleJobDialog';
import { EditJobDialog } from '../components/EditJobDialog';
import { Plus, Calendar, MapPin, Users, Edit, DollarSign, Phone, Mail, CheckCircle } from 'lucide-react';
import { useJobs, Job } from '@/hooks/useJobs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Jobs = () => {
  const { jobs, isLoading, updateJob } = useJobs();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleMarkDone = (job: Job) => {
    const hours = prompt('Enter total hours worked:');
    if (hours && !isNaN(parseFloat(hours))) {
      const actualHours = parseFloat(hours);
      const totalHourlyRate = job.hourly_rate * job.movers_needed;
      const calculatedTotal = totalHourlyRate * actualHours;
      
      updateJob({ 
        id: job.id, 
        updates: { 
          status: 'completed',
          actual_duration_hours: actualHours,
          actual_total: calculatedTotal
        } 
      });
    }
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  // Calculate revenue using actual totals when available
  const totalRevenue = jobs
    .filter(job => job.status === 'completed' && job.is_paid)
    .reduce((sum, job) => {
      const jobRevenue = job.actual_total || (job.hourly_rate * job.movers_needed * (job.actual_duration_hours || 0));
      return sum + jobRevenue;
    }, 0);

  const activeJobs = jobs.filter(job => job.status !== 'completed').length;
  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const paidJobs = jobs.filter(job => job.is_paid).length;
  
  const unpaidRevenue = jobs
    .filter(job => job.status === 'completed' && !job.is_paid)
    .reduce((sum, job) => {
      const jobRevenue = job.actual_total || (job.hourly_rate * job.movers_needed * (job.actual_duration_hours || 0));
      return sum + jobRevenue;
    }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-purple-25 to-gold-25 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">Jobs Management</h1>
          <p className="text-gray-600 mt-2">Schedule and track all moving jobs with financial insights</p>
        </div>
        <button 
          onClick={() => setIsScheduleDialogOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Schedule New Job
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-700">{jobs.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{activeJobs}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
            <p className="text-xs text-gray-500">{paidJobs} paid</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Paid Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Unpaid Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${unpaidRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map((job) => {
          const totalHourlyRate = job.hourly_rate * job.movers_needed;
          const jobTotal = job.actual_total || (totalHourlyRate * (job.actual_duration_hours || 0));
          const isCompleted = job.status === 'completed';
          
          return (
            <Card key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="cursor-pointer hover:text-purple-700">
                    <h3 className="text-lg font-semibold text-gray-900">{job.client_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone className="h-3 w-3" />
                      <button 
                        onClick={() => handleCall(job.client_phone)}
                        className="hover:text-blue-600 underline"
                      >
                        {job.client_phone}
                      </button>
                    </div>
                    {job.client_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <button 
                          onClick={() => handleEmail(job.client_email!)}
                          className="hover:text-blue-600 underline"
                        >
                          {job.client_email}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={job.status} variant="job" />
                    <Badge className={job.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {job.is_paid ? 'PAID' : 'UNPAID'}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {job.job_date} at {job.start_time}
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{job.origin_address}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {job.movers_needed} movers needed
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Rate per mover:</span>
                    <span className="font-medium">${job.hourly_rate}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Total hourly rate:</span>
                    <span className="font-medium">${totalHourlyRate}/hr</span>
                  </div>
                  {isCompleted && job.actual_duration_hours && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Hours worked:</span>
                      <span className="font-medium">{job.actual_duration_hours}h</span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Total cost:</span>
                      <div className="text-right">
                        <span className={`font-semibold ${job.is_paid ? 'text-green-600' : 'text-orange-600'}`}>
                          ${jobTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                  {job.payment_method && job.is_paid && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Payment method:</span>
                      <span className="font-medium text-green-600 capitalize">
                        {job.payment_method.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {job.completion_notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{job.completion_notes}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {job.status !== 'completed' && (
                    <Button 
                      onClick={() => handleMarkDone(job)}
                      variant="outline"
                      className="flex-1 hover:bg-green-50 hover:border-green-300 text-green-600"
                    >
                      <CheckCircle className="h-3 w-3 mr-2" />
                      Mark Done
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleEditJob(job)}
                    variant="outline"
                    className="flex-1 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit Job
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No jobs scheduled yet</div>
          <p className="text-gray-400 mt-2">Start by scheduling your first moving job</p>
        </div>
      )}

      <ScheduleJobDialog 
        open={isScheduleDialogOpen} 
        onOpenChange={setIsScheduleDialogOpen} 
      />

      <EditJobDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        job={selectedJob}
      />
    </div>
  );
};
