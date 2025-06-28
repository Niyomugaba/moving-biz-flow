
import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { ScheduleJobDialog } from '../components/ScheduleJobDialog';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';

export const Jobs = () => {
  const { jobs, isLoading } = useJobs();
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  const totalRevenue = jobs
    .filter(job => job.status === 'Completed' && job.paid)
    .reduce((sum, job) => sum + (job.hourly_rate * job.actual_hours), 0);

  const activeJobs = jobs.filter(job => job.status !== 'Completed').length;
  const completedJobs = jobs.filter(job => job.status === 'Completed').length;
  const paidJobs = jobs.filter(job => job.paid).length;
  const unpaidRevenue = jobs
    .filter(job => job.status === 'Completed' && !job.paid)
    .reduce((sum, job) => sum + (job.hourly_rate * job.actual_hours), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600 mt-2">Schedule and track all moving jobs</p>
        </div>
        <button 
          onClick={() => setIsScheduleDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Schedule New Job
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Active Jobs</p>
          <p className="text-2xl font-bold text-orange-600">{activeJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Paid Revenue</p>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Unpaid Revenue</p>
          <p className="text-2xl font-bold text-red-600">${unpaidRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{job.client_name}</h3>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={job.status} variant="job" />
                  {job.paid ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Unpaid
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {job.job_date} at {job.job_time}
                </div>
                
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{job.address}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {job.movers_needed} movers needed
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">${job.hourly_rate}/hr</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Hours Worked:</span>
                  <span className="font-medium">{job.actual_hours}h</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className={`font-semibold ${job.paid ? 'text-green-600' : 'text-orange-600'}`}>
                    ${(job.hourly_rate * job.actual_hours).toLocaleString()}
                  </span>
                </div>
              </div>

              {job.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{job.notes}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Edit Job
                </button>
                <button className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
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
    </div>
  );
};
