
import React, { useState } from 'react';
import { AddLeadDialog } from '../components/AddLeadDialog';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Phone, Mail, Calendar, DollarSign, MapPin } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';

export const Leads = () => {
  const { leads, isLoading, updateLead } = useLeads();
  const { addClient } = useClients();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Calculate metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const quotedLeads = leads.filter(lead => lead.status === 'quoted').length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0;

  const handleConvertLead = async (lead: any) => {
    try {
      // Create new client from lead data
      const clientData = {
        name: lead.name,
        phone: lead.phone,
        email: lead.email,
        primary_address: '', // This would need to be collected from the lead
        company_name: null,
        secondary_address: null,
        notes: `Converted from lead. Original notes: ${lead.notes || 'None'}`,
        preferred_contact_method: 'phone',
        rating: null,
        total_revenue: 0,
        total_jobs_completed: 0
      };

      // Add client
      addClient(clientData);

      // Update lead status to converted
      updateLead({
        id: lead.id,
        updates: { status: 'converted' }
      });

      toast({
        title: "Lead Converted Successfully",
        description: `${lead.name} has been converted to a client.`,
      });
    } catch (error) {
      toast({
        title: "Conversion Failed",
        description: "Failed to convert lead to client. Please try again.",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">Track and convert potential customers</p>
        </div>
        <button 
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Lead
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">New</p>
          <p className="text-2xl font-bold text-blue-600">{newLeads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Quoted</p>
          <p className="text-2xl font-bold text-yellow-600">{quotedLeads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Converted</p>
          <p className="text-2xl font-bold text-green-600">{convertedLeads}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Value</p>
          <p className="text-2xl font-bold text-purple-600">${totalValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Conversion</p>
          <p className="text-2xl font-bold text-indigo-600">{conversionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {leads.map((lead) => (
          <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                <StatusBadge status={lead.status} variant="lead" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {lead.phone}
                </div>
                
                {lead.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {lead.email}
                  </div>
                )}
                
                {lead.follow_up_date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Follow up: {lead.follow_up_date}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estimated Value:</span>
                  <span className="font-semibold text-green-600">
                    ${(lead.estimated_value || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">Source:</span>
                  <span className="text-sm font-medium text-gray-900 capitalize">
                    {lead.source.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {lead.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{lead.notes}</p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Contact
                </button>
                <button 
                  onClick={() => handleConvertLead(lead)}
                  disabled={lead.status === 'converted'}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    lead.status === 'converted' 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}
                >
                  {lead.status === 'converted' ? 'Converted' : 'Convert'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {leads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No leads yet</div>
          <p className="text-gray-400 mt-2">Start by adding your first lead to track potential customers</p>
        </div>
      )}

      <AddLeadDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
    </div>
  );
};
