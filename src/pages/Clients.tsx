import React, { useState } from 'react';
import { AddClientDialog } from '../components/AddClientDialog';
import { Plus, Search, Phone, Mail, MapPin, Star } from 'lucide-react';
import { useClients } from '@/hooks/useClients';
import { useJobs } from '@/hooks/useJobs';

export const Clients = () => {
  const { clients, isLoading, addClient } = useClients();
  const { jobs } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClientDialogOpen, setIsAddClientDialogOpen] = useState(false);

  const handleAddClient = (clientData: any) => {
    addClient({
      name: clientData.name,
      phone: clientData.phone,
      email: clientData.email || null,
      address: clientData.address
    });
  };

  const getClientJobStats = (clientId: string, clientName: string) => {
    const clientJobs = jobs.filter(job => 
      job.client_id === clientId || job.client_name === clientName
    );
    
    const totalJobs = clientJobs.length;
    const totalSpent = clientJobs
      .filter(job => job.status === 'Completed')
      .reduce((sum, job) => sum + (job.hourly_rate * job.actual_hours), 0);
    
    const lastJob = clientJobs
      .sort((a, b) => new Date(b.job_date).getTime() - new Date(a.job_date).getTime())[0];
    
    return {
      totalJobs,
      totalSpent,
      lastJobDate: lastJob ? lastJob.job_date : 'No jobs yet'
    };
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.phone.includes(searchTerm)
  );

  const totalClients = clients.length;
  const totalRevenue = clients.reduce((sum, client) => {
    const { totalSpent } = getClientJobStats(client.id, client.name);
    return sum + totalSpent;
  }, 0);
  
  const vipClients = clients.filter(client => {
    const { totalSpent } = getClientJobStats(client.id, client.name);
    return totalSpent > 2000;
  }).length;
  
  const averageJobValue = totalClients > 0 && jobs.length > 0
    ? Math.round(totalRevenue / jobs.filter(job => job.status === 'Completed').length)
    : 0;

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
          onClick={() => setIsAddClientDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">VIP Clients</p>
          <p className="text-2xl font-bold text-purple-600">{vipClients}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Avg Job Value</p>
          <p className="text-2xl font-bold text-blue-600">${averageJobValue}</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients by name, email, or phone..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Client Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredClients.map((client) => {
          const { totalJobs, totalSpent, lastJobDate } = getClientJobStats(client.id, client.name);
          const isVIP = totalSpent > 2000;
          
          return (
            <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                    <p className="text-sm text-gray-500">Last job: {lastJobDate}</p>
                  </div>
                  {isVIP && (
                    <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  )}
                </div>
                
                <div className="space-y-3 mb-4">
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
                    <span>{client.address}</span>
                  </div>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{totalJobs}</p>
                      <p className="text-xs text-gray-500">Total Jobs</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-green-600">
                        ${totalSpent.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Total Spent</p>
                    </div>
                  </div>
                </div>

                {isVIP && (
                  <div className="mb-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                      VIP Client
                    </span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                    Edit Client
                  </button>
                  <button className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                    View Jobs
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddClientDialog 
        open={isAddClientDialogOpen} 
        onOpenChange={setIsAddClientDialogOpen}
        onAddClient={handleAddClient}
      />
    </div>
  );
};
