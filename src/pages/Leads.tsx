import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { AddLeadDialog } from '../components/AddLeadDialog';
import { Plus, Search, Filter, MoreHorizontal } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export const Leads = () => {
  const { leads, isLoading, addLead, updateLead } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);

  const handleAddLead = (leadData: any) => {
    addLead({
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email || null,
      source: leadData.source,
      cost: parseFloat(leadData.cost) || 0,
      status: 'New',
      notes: null
    });
  };

  const handleUpdateLeadStatus = (leadId: string, newStatus: 'New' | 'Contacted' | 'Converted' | 'Lost') => {
    updateLead({ id: leadId, updates: { status: newStatus } });
  };

  const getAvailableStatusOptions = (currentStatus: string) => {
    const statusOptions = [];
    
    switch (currentStatus) {
      case 'New':
        statusOptions.push({ label: 'Mark as Contacted', value: 'Contacted' });
        statusOptions.push({ label: 'Mark as Lost', value: 'Lost' });
        break;
      case 'Contacted':
        statusOptions.push({ label: 'Mark as Converted', value: 'Converted' });
        statusOptions.push({ label: 'Mark as Lost', value: 'Lost' });
        statusOptions.push({ label: 'Back to New', value: 'New' });
        break;
      case 'Converted':
        statusOptions.push({ label: 'Mark as Lost', value: 'Lost' });
        break;
      case 'Lost':
        statusOptions.push({ label: 'Back to New', value: 'New' });
        statusOptions.push({ label: 'Mark as Contacted', value: 'Contacted' });
        break;
      default:
        break;
    }
    
    return statusOptions;
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCost = leads.reduce((sum, lead) => sum + lead.cost, 0);
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading leads...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-600 mt-2">Track and manage your lead pipeline</p>
        </div>
        <button 
          onClick={() => setIsAddLeadDialogOpen(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Converted</p>
          <p className="text-2xl font-bold text-green-600">{convertedLeads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="text-2xl font-bold text-purple-600">{conversionRate}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-2xl font-bold text-gray-900">${totalCost}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search leads..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Table with Dropdown Actions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {lead.cost > 0 ? `$${lead.cost}` : 'Free'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={lead.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {getAvailableStatusOptions(lead.status).map((option) => (
                          <DropdownMenuItem
                            key={option.value}
                            onClick={() => handleUpdateLeadStatus(lead.id, option.value as 'New' | 'Contacted' | 'Converted' | 'Lost')}
                            className="cursor-pointer"
                          >
                            {option.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddLeadDialog 
        open={isAddLeadDialogOpen} 
        onOpenChange={setIsAddLeadDialogOpen}
        onAddLead={handleAddLead}
      />
    </div>
  );
};
