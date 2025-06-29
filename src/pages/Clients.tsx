import React, { useState } from 'react';
import { AddClientDialog } from '../components/AddClientDialog';
import { useClients } from '@/hooks/useClients';
import { useJobs } from '@/hooks/useJobs';
import { Phone, Mail, MapPin, Calendar, DollarSign, Plus, Star, Grid3X3, Table } from 'lucide-react';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export const Clients = () => {
  const { clients, isLoading: clientsLoading, addClient } = useClients();
  const { jobs } = useJobs();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Sample client for demo
  const sampleClient = {
    name: 'John Smith',
    phone: '(555) 123-4567',
    email: 'john@example.com',
    primary_address: '123 Main St, Anytown, ST 12345',
  };

  const clientsWithStats = clients.map(client => {
    const clientJobs = jobs.filter(job => job.client_id === client.id || job.client_name === client.name);
    const completedJobs = clientJobs.filter(job => job.status === 'completed');
    const totalRevenue = completedJobs.reduce((sum, job) => {
      return sum + (job.actual_duration_hours || job.estimated_duration_hours) * job.hourly_rate;
    }, 0);
    
    return {
      ...client,
      totalJobs: clientJobs.length,
      completedJobs: completedJobs.length,
      totalRevenue
    };
  });

  // Calculate metrics
  const totalClients = clients.length;
  const activeClients = clientsWithStats.filter(client => {
    const recentJobs = jobs.filter(job => 
      (job.client_id === client.id || job.client_name === client.name) &&
      new Date(job.job_date) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
    );
    return recentJobs.length > 0;
  }).length;
  
  const totalRevenue = clientsWithStats.reduce((sum, client) => sum + client.totalRevenue, 0);
  const avgJobValue = totalRevenue / Math.max(jobs.filter(job => job.status === 'completed').length, 1);

  const handleAddClient = (clientData: any) => {
    addClient(clientData);
  };

  if (clientsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading clients...</div>
      </div>
    );
  }

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <TableComponent>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Jobs</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientsWithStats.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1" />
                    {client.phone}
                  </div>
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {client.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2">{client.primary_address}</span>
                </div>
              </TableCell>
              <TableCell>{client.company_name || '-'}</TableCell>
              <TableCell>
                <div className="text-center">
                  <div className="text-sm font-medium">{client.totalJobs} total</div>
                  <div className="text-xs text-green-600">{client.completedJobs} completed</div>
                </div>
              </TableCell>
              <TableCell className="font-semibold text-purple-600">
                ${client.totalRevenue.toLocaleString()}
              </TableCell>
              <TableCell>
                {client.rating ? (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm">{client.rating}</span>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View History
                  </Button>
                  <Button variant="outline" size="sm">
                    Schedule Job
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableComponent>
    </div>
  );

  const renderCardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {clientsWithStats.map((client) => (
        <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
              <div className="flex items-center">
                {client.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600">{client.rating}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
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

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p className="font-semibold text-lg text-blue-600">{client.totalJobs}</p>
                  <p className="text-gray-600">Total Jobs</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg text-green-600">{client.completedJobs}</p>
                  <p className="text-gray-600">Completed</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p className="font-semibold text-lg text-purple-600">${client.totalRevenue.toLocaleString()}</p>
                <p className="text-gray-600 text-sm">Total Revenue</p>
              </div>
            </div>

            {client.company_name && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Company:</strong> {client.company_name}
                </p>
              </div>
            )}

            {client.notes && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">{client.notes}</p>
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                View History
              </button>
              <button className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                Schedule Job
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Manage your customer relationships and history</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Table className="h-4 w-4" />
              Table
            </button>
          </div>
          
          <button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Client
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900">{totalClients}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Active Clients</p>
          <p className="text-2xl font-bold text-green-600">{activeClients}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Revenue</p>
          <p className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Avg Job Value</p>
          <p className="text-2xl font-bold text-indigo-600">${avgJobValue.toLocaleString()}</p>
        </div>
      </div>

      {/* Clients Display */}
      {viewMode === 'table' ? renderTableView() : renderCardView()}

      {clients.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No clients yet</div>
          <p className="text-gray-400 mt-2">Start by adding your first client to track customer relationships</p>
        </div>
      )}

      <AddClientDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        onAddClient={handleAddClient}
      />
    </div>
  );
};
