
import React, { useState } from 'react';
import { Plus, Search, Phone, Mail, MapPin, Star } from 'lucide-react';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalJobs: number;
  totalSpent: number;
  lastJobDate: string;
  tags: string[];
  notes: string;
}

export const Clients = () => {
  const [clients, setClients] = useState<Client[]>([
    {
      id: 1,
      name: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john@email.com',
      address: '123 Main St, Anytown, ST 12345',
      totalJobs: 2,
      totalSpent: 1850,
      lastJobDate: '2024-01-15',
      tags: ['VIP', 'Repeat Customer'],
      notes: 'Always pays on time, prefers morning appointments'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      phone: '(555) 234-5678',
      email: 'sarah@email.com',
      address: '456 Oak Ave, Business District, ST 12345',
      totalJobs: 1,
      totalSpent: 1200,
      lastJobDate: '2024-01-10',
      tags: ['Business', 'Follow-Up'],
      notes: 'Office manager, may need future office moves'
    },
    {
      id: 3,
      name: 'Mike Davis',
      phone: '(555) 345-6789',
      email: 'mike@email.com',
      address: '789 Pine St, Suburbia, ST 12345',
      totalJobs: 1,
      totalSpent: 950,
      lastJobDate: '2024-01-08',
      tags: ['Review Requested'],
      notes: 'Long distance move, very satisfied with service'
    },
    {
      id: 4,
      name: 'Emily Chen',
      phone: '(555) 456-7890',
      email: 'emily@email.com',
      address: '321 Elm St, Downtown, ST 12345',
      totalJobs: 3,
      totalSpent: 2750,
      lastJobDate: '2024-01-05',
      tags: ['VIP', 'Referral Source'],
      notes: 'Has referred 3 customers, excellent relationship'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const totalClients = clients.length;
  const vipClients = clients.filter(client => client.tags.includes('VIP')).length;
  const totalRevenue = clients.reduce((sum, client) => sum + client.totalSpent, 0);
  const averageJobValue = totalClients > 0 
    ? Math.round(totalRevenue / clients.reduce((sum, client) => sum + client.totalJobs, 0))
    : 0;

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VIP':
        return 'bg-purple-100 text-purple-800';
      case 'Repeat Customer':
        return 'bg-blue-100 text-blue-800';
      case 'Business':
        return 'bg-green-100 text-green-800';
      case 'Follow-Up':
        return 'bg-yellow-100 text-yellow-800';
      case 'Review Requested':
        return 'bg-orange-100 text-orange-800';
      case 'Referral Source':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
          <p className="text-gray-600 mt-2">Manage your client relationships and history</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
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
        {filteredClients.map((client) => (
          <div key={client.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-sm text-gray-500">Last job: {client.lastJobDate}</p>
                </div>
                {client.tags.includes('VIP') && (
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                )}
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {client.phone}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {client.email}
                </div>
                
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{client.address}</span>
                </div>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{client.totalJobs}</p>
                    <p className="text-xs text-gray-500">Total Jobs</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">
                      ${client.totalSpent.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Total Spent</p>
                  </div>
                </div>
              </div>

              {client.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {client.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${getTagColor(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {client.notes && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{client.notes}</p>
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
        ))}
      </div>
    </div>
  );
};
