
import React, { useState } from 'react';
import { AddLeadDialog } from '../components/AddLeadDialog';
import { StatusBadge } from '../components/StatusBadge';
import { LeadContactCard } from '../components/LeadContactCard';
import { Plus, Phone, Mail, Calendar, DollarSign, MapPin, ChevronDown, Grid3X3, Table } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useClients } from '@/hooks/useClients';
import { useToast } from '@/hooks/use-toast';
import {
  Table as TableComponent,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Leads = () => {
  const { leads, isLoading, updateLead } = useLeads();
  const { addClient } = useClients();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Calculate metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter(lead => lead.status === 'new').length;
  const quotedLeads = leads.filter(lead => lead.status === 'quoted').length;
  const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
  const lostLeads = leads.filter(lead => lead.status === 'lost').length;
  const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0;

  const handleConvertToClient = async (lead: any) => {
    try {
      // Create new client from lead data
      const clientData = {
        name: lead.name,
        phone: lead.phone,
        email: lead.email || null,
        primary_address: 'Address not provided',
        company_name: null,
        secondary_address: null,
        notes: `Converted from lead. Original notes: ${lead.notes || 'None'}`,
        preferred_contact_method: 'phone',
      };

      console.log('Converting lead to client:', clientData);

      // Add client
      addClient(clientData);

      // Update lead status to converted
      updateLead({
        id: lead.id,
        updates: { status: 'converted' }
      });

      toast({
        title: "Lead Converted to Client",
        description: `${lead.name} has been converted to a client successfully.`,
      });
    } catch (error) {
      console.error('Lead conversion error:', error);
      toast({
        title: "Conversion Failed",
        description: "Failed to convert lead to client. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsNoHire = async (lead: any) => {
    try {
      // Update lead status to lost (no hire)
      updateLead({
        id: lead.id,
        updates: { status: 'lost' }
      });

      toast({
        title: "Lead Marked as No Hire",
        description: `${lead.name} has been marked as no hire.`,
      });
    } catch (error) {
      console.error('Lead status update error:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update lead status. Please try again.",
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

  const renderTableView = () => (
    <div className="bg-white rounded-lg shadow-sm border">
      <TableComponent>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Value</TableHead>
            <TableHead>Follow Up</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead) => (
            <TableRow key={lead.id}>
              <TableCell className="font-medium">{lead.name}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center text-sm">
                    <Phone className="h-3 w-3 mr-1" />
                    {lead.phone}
                  </div>
                  {lead.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-3 w-3 mr-1" />
                      {lead.email}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} variant="lead" />
              </TableCell>
              <TableCell className="capitalize">
                {lead.source.replace('_', ' ')}
              </TableCell>
              <TableCell className="font-semibold text-green-600">
                ${(lead.estimated_value || 0).toLocaleString()}
              </TableCell>
              <TableCell>
                {lead.follow_up_date ? (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1" />
                    {lead.follow_up_date}
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <LeadContactCard lead={lead}>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </LeadContactCard>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        Convert
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleConvertToClient(lead)}>
                        Convert to Client
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleMarkAsNoHire(lead)}>
                        Mark as No Hire
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
              <LeadContactCard lead={lead}>
                <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Contact
                </button>
              </LeadContactCard>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1">
                    Convert
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleConvertToClient(lead)}>
                    Convert to Client
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMarkAsNoHire(lead)}>
                    Mark as No Hire
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">Track and convert potential customers</p>
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
            Add New Lead
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
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
          <p className="text-sm text-gray-600">No Hire</p>
          <p className="text-2xl font-bold text-red-600">{lostLeads}</p>
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

      {/* Leads Display */}
      {viewMode === 'table' ? renderTableView() : renderCardView()}

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
