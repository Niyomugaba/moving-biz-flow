
import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Calendar, MapPin, Users } from 'lucide-react';

interface Job {
  id: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  address: string;
  date: string;
  time: string;
  hourlyRate: number;
  moversNeeded: number;
  assignedEmployees: string[];
  status: 'Scheduled' | 'In Progress' | 'Completed';
  estimatedHours: number;
  notes: string;
}

export const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([
    {
      id: 1,
      clientName: 'John Smith',
      clientPhone: '(555) 123-4567',
      clientEmail: 'john@email.com',
      address: '123 Main St, Anytown, ST 12345',
      date: '2024-01-20',
      time: '09:00',
      hourlyRate: 85,
      moversNeeded: 3,
      assignedEmployees: ['Mike Johnson', 'Sarah Davis', 'Tom Wilson'],
      status: 'Scheduled',
      estimatedHours: 6,
      notes: '2BR apartment to 3BR house, piano needs special care'
    },
    {
      id: 2,
      clientName: 'Sarah Johnson',
      clientPhone: '(555) 234-5678',
      clientEmail: 'sarah@email.com',
      address: '456 Oak Ave, Business District, ST 12345',
      date: '2024-01-18',
      time: '14:00',
      hourlyRate: 95,
      moversNeeded: 4,
      assignedEmployees: ['Mike Johnson', 'Sarah Davis', 'Tom Wilson', 'Alex Brown'],
      status: 'In Progress',
      estimatedHours: 8,
      notes: 'Office relocation, heavy equipment, elevator available'
    },
    {
      id: 3,
      clientName: 'Mike Davis',
      clientPhone: '(555) 345-6789',
      clientEmail: 'mike@email.com',
      address: '789 Pine St, Suburbia, ST 12345',
      date: '2024-01-15',
      time: '08:00',
      hourlyRate: 90,
      moversNeeded: 2,
      assignedEmployees: ['Tom Wilson', 'Alex Brown'],
      status: 'Completed',
      estimatedHours: 5,
      notes: 'Long distance move, 3BR house, fragile items'
    }
  ]);

  const totalRevenue = jobs
    .filter(job => job.status === 'Completed')
    .reduce((sum, job) => sum + (job.hourlyRate * job.estimatedHours), 0);

  const activeJobs = jobs.filter(job => job.status !== 'Completed').length;
  const completedJobs = jobs.filter(job => job.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600 mt-2">Schedule and track all moving jobs</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Schedule New Job
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <p className="text-sm text-gray-600">Revenue (Completed)</p>
          <p className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</p>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{job.clientName}</h3>
                <StatusBadge status={job.status} variant="job" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {job.date} at {job.time}
                </div>
                
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{job.address}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {job.moversNeeded} movers needed
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">${job.hourlyRate}/hr</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Est. Hours:</span>
                  <span className="font-medium">{job.estimatedHours}h</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-600">Est. Total:</span>
                  <span className="font-semibold text-green-600">
                    ${(job.hourlyRate * job.estimatedHours).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Assigned Team:</p>
                <div className="flex flex-wrap gap-1">
                  {job.assignedEmployees.map((employee, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {employee}
                    </span>
                  ))}
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
    </div>
  );
};
