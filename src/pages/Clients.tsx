
import React, { useState } from 'react';
import { AddClientDialog } from '../components/AddClientDialog';
import { Plus, MapPin, Phone, Mail, Star, DollarSign } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useJobs } from '@/hooks/useJobs';

export const Clients = () => {
  const { clients, isLoading } = useClients();
  const { jobs } = useJobs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Sample client for demo
  const sampleClient = {
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john@example.com',
    primary_address: '123 Main St, City, State 12345',
    secondary_address: '456 Oak Ave, City, State 12345',
    company_name: 'Smith Moving Co',
    preferred_contact_method: 'phone',
    notes: 'Preferred customer - always punctual'
  };

  // Calculate client metrics
  const getClientJobs = (clientName: string) => {
    return jobs.filter(job => job.client_name === clientName);
  };

  const getClientRevenue = (clientName: string) => {
    return jobs
      .filter(job => job.client_name === clientName && job.status === 'completed')
      .reduce((sum, job) => sum + (job.hourly_rate * (job.actual_duration_hours || 0)), 0);
  };

  const getCompletedJobsCount = (clientName: string) => {
    return jobs.filter(job => job.client_name === clientName && job.status === 'completed').length;
  };

  const getAverageJobValue = (clientName: string) => {
    const clientJobs = jobs.filter(job => job.client_name === clientName && job.status === 'completed');
    if (clientJobs.length === 0) return 0;
    
    const totalRevenue = clientJobs.reduce((sum, job) => sum + (job.hourly_rate * (job.actual_duration_hours || 0)), 0);
    return totalRevenue / clientJobs.length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Manage your client relationships and history</p>
        </div>
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Client
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Active Clients</p>
          <p className="text-2xl font-bold text-green-600">{clients.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Jobs</p>
          <p className="text-2xl font-bold text-blue-600">{jobs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">
            ${jobs.filter(job => job.status === 'completed').reduce((sum, job) => sum + (job.hourly_rate * (job.actual_duration_hours || 0)), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {clients.map((client) => {
          const clientJobs = getClientJobs(client.name);
          const completedJobs = getCompletedJobsCount(client.name);
          const totalRevenue = getClientRevenue(client.name);
          const avgJobValue = getAverageJobValue(client.name);
          
          return (
            <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    {client.company_name && (
                      <p className="text-sm text-gray-600">{client.company_name}</p>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm font-medium">{client.rating || 5.0}</span>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.phone}
                  </div>
                  
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                  )}
                  
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{client.primary_address}</span>
                  </div>
                </div>

                {/* Client Stats */}
                <div className="grid grid-cols-2 gap-4 py-3 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{completedJobs}</p>
                    <p className="text-xs text-gray-600">Completed Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Total Revenue</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Avg Job Value:</span>
                    <span className="font-medium text-purple-600">${avgJobValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Total Jobs:</span>
                    <span className="font-medium">{clientJobs.length}</span>
                  </div>
                </div>

                {client.notes && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">{client.notes}</p>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    Edit Client
                  </button>
                  <button className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                    View History
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No clients added yet</div>
          <p className="text-gray-400 mt-2">Start by adding your first client to track their information and job history</p>
        </div>
      )}

      <AddClientDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
};
