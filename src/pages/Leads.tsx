import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Phone, Mail, Calendar, DollarSign, User, Filter, Search, ArrowRight, MessageSquare, Trash2, Download, Settings } from 'lucide-react';
import { useLeads } from '@/hooks/useLeads';
import { useJobs } from '@/hooks/useJobs';
import { useClients } from '@/hooks/useClients';
import { AddLeadDialog } from '@/components/AddLeadDialog';
import { LeadContactCard } from '@/components/LeadContactCard';
import { LeadNotesDialog } from '@/components/LeadNotesDialog';
import { ScheduleJobDialog } from '@/components/ScheduleJobDialog';
import { FilterBar } from '@/components/FilterBar';
import { PaginationControls } from '@/components/PaginationControls';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const Leads = () => {
  const { 
    leads, 
    isLoading, 
    addLead, 
    updateLead, 
    deleteLead, 
    isAddingLead, 
    isUpdatingLead, 
    isDeletingLead 
  } = useLeads();
  
  const { convertLeadToJob, isConvertingLead, jobs } = useJobs();
  const { clients } = useClients();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [leadToDelete, setLeadToDelete] = useState<any>(null);
  const [deleteClientToo, setDeleteClientToo] = useState(false);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.phone.includes(searchTerm) ||
                         (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  const handleConvertToJob = async (lead: any) => {
    console.log('Converting lead to job:', lead);
    
    try {
      await convertLeadToJob({ 
        leadId: lead.id, 
        leadData: {
          name: lead.name,
          phone: lead.phone,
          email: lead.email,
          notes: lead.notes,
          estimated_value: lead.estimated_value
        }
      });
      
      console.log('Lead converted successfully');
      
      // Show success message and redirect option
      setTimeout(() => {
        if (confirm('Lead converted successfully! Would you like to go to the Jobs tab to schedule it?')) {
          window.location.href = '/jobs';
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error converting lead:', error);
    }
  };

  const handleScheduleJob = (lead: any) => {
    // Find the job created from this lead
    const relatedJob = jobs.find(job => job.lead_id === lead.id);
    if (relatedJob) {
      setSelectedLead({ ...lead, jobId: relatedJob.id });
      setIsScheduleDialogOpen(true);
    }
  };

  const handleStatusChange = (leadId: string, newStatus: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost') => {
    updateLead({ id: leadId, updates: { status: newStatus } });
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleAddNote = (lead: any) => {
    setSelectedLead(lead);
    setIsNotesDialogOpen(true);
  };

  const handleDeleteLead = (leadId: string, shouldDeleteClient = false) => {
    deleteLead({ id: leadId, deleteClient: shouldDeleteClient });
    setLeadToDelete(null);
    setDeleteClientToo(false);
  };

  const getLeadDeletionWarning = (lead: any) => {
    const associatedClient = clients.find(client => 
      client.name.toLowerCase() === lead.name.toLowerCase() && 
      client.phone === lead.phone
    );
    
    const relatedJobs = jobs.filter(job => job.lead_id === lead.id);

    let warningText = `Are you sure you want to delete "${lead.name}"?

This action will:
• Remove the lead from the leads list
• Remove lead references from any jobs (${relatedJobs.length} found)`;

    if (associatedClient) {
      warningText += `

⚠️  This lead has an associated client record. You can choose to:
• Delete ONLY the lead (client record remains)
• Delete BOTH the lead AND the client record

If you delete the client too, this will also:
• Remove the client from the client list
• Remove client references from all jobs
• This action cannot be undone`;
    }

    return warningText;
  };

  const exportLeadsToCSV = () => {
    if (!leads.length) return;
    
    const csvRows = [];
    const headers = [
      'Name', 'Phone', 'Email', 'Source', 'Status', 'Estimated Value', 
      'Lead Cost', 'Follow-up Date', 'Created Date', 'Notes'
    ];
    csvRows.push(headers.join(','));

    for (const lead of filteredLeads) {
      const values = [
        lead.name,
        lead.phone,
        lead.email || '',
        lead.source?.replace('_', ' ') || '',
        lead.status,
        lead.estimated_value || 0,
        lead.lead_cost || 0,
        lead.follow_up_date || '',
        new Date(lead.created_at).toLocaleDateString(),
        (lead.notes || '').replace(/"/g, '""') // Escape quotes in notes
      ].map(value => `"${value}"`);
      
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'leads_report.csv');
    a.click();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contacted': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'quoted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'converted': return 'bg-green-100 text-green-800 border-green-200';
      case 'lost': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'website': return 'bg-blue-50 text-blue-700';
      case 'referral': return 'bg-green-50 text-green-700';
      case 'google_ads': return 'bg-orange-50 text-orange-700';
      case 'facebook': return 'bg-indigo-50 text-indigo-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-blue-50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">Leads Management</h1>
        <div className="flex gap-2">
          <Button 
            onClick={exportLeadsToCSV}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Mobile-Friendly Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search leads by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="google_ads">Google Ads</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">
                Total: {filteredLeads.length} leads
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Optimized Lead Cards */}
      <div className="space-y-4">
        {paginatedLeads.map((lead) => {
          const relatedJob = jobs.find(job => job.lead_id === lead.id);
          
          return (
            <Card key={lead.id} className="bg-white rounded-lg shadow-sm border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{lead.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone className="h-3 w-3" />
                      <button 
                        onClick={() => handleCall(lead.phone)}
                        className="hover:text-blue-600 underline"
                      >
                        {lead.phone}
                      </button>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <button 
                          onClick={() => handleEmail(lead.email!)}
                          className="hover:text-blue-600 underline"
                        >
                          {lead.email}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-3 ml-4">
                    <StatusBadge status={lead.status} variant="lead" />
                    <Badge className="bg-gray-100 text-gray-700 capitalize">
                      {lead.source?.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {lead.estimated_value && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Estimated Value: ${lead.estimated_value.toLocaleString()}
                    </div>
                  )}

                  {lead.lead_cost && (
                    <div className="flex items-center text-sm text-red-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Lead Cost: ${lead.lead_cost.toLocaleString()}
                    </div>
                  )}
                  
                  {lead.follow_up_date && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Follow-up: {lead.follow_up_date}
                    </div>
                  )}
                  
                  {lead.notes && (
                    <div className="text-sm text-gray-600">
                      <p className="line-clamp-2">{lead.notes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select
                      value={lead.status}
                      onValueChange={(value: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost') => handleStatusChange(lead.id, value)}
                    >
                      <SelectTrigger className="flex-1 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="quoted">Quoted</SelectItem>
                        <SelectItem value="converted">Converted</SelectItem>
                        <SelectItem value="lost">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAddNote(lead)}
                        variant="outline"
                        className="text-xs px-3 py-2"
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Add Note
                      </Button>
                      
                      {lead.status === 'quoted' && (
                        <Button 
                          onClick={() => handleConvertToJob(lead)}
                          disabled={isConvertingLead}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2"
                        >
                          <ArrowRight className="h-3 w-3 mr-1" />
                          {isConvertingLead ? 'Converting...' : 'Convert to Job'}
                        </Button>
                      )}

                      {lead.status === 'converted' && (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            ✓ Converted
                          </Badge>
                          <Button 
                            onClick={() => window.location.href = '/jobs'}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2"
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Go to Jobs
                          </Button>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => setLeadToDelete(lead)}
                        variant="outline"
                        className="text-xs px-3 py-2 text-red-600 border-red-200 hover:bg-red-50"
                        disabled={isDeletingLead}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredLeads.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <User className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all' || sourceFilter !== 'all'
              ? 'Try adjusting your search or filters.'
              : 'Get started by adding your first lead.'}
          </p>
          <Button onClick={() => setIsAddDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Lead
          </Button>
        </div>
      )}

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredLeads.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* Dialogs */}
      <AddLeadDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />
      
      {selectedLead && (
        <LeadNotesDialog
          open={isNotesDialogOpen}
          onOpenChange={setIsNotesDialogOpen}
          lead={selectedLead}
        />
      )}

      {selectedLead && (
        <ScheduleJobDialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
          jobData={jobs.find(job => job.lead_id === selectedLead.id)}
        />
      )}

      {/* Enhanced Delete Confirmation Dialog */}
      <AlertDialog open={!!leadToDelete} onOpenChange={() => {
        setLeadToDelete(null);
        setDeleteClientToo(false);
      }}>
        <AlertDialogContent className="max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              ⚠️ Delete Lead
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm whitespace-pre-line leading-relaxed">
              {leadToDelete && getLeadDeletionWarning(leadToDelete)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {leadToDelete && clients.find(client => 
            client.name.toLowerCase() === leadToDelete.name.toLowerCase() && 
            client.phone === leadToDelete.phone
          ) && (
            <div className="my-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteClientToo}
                  onChange={(e) => setDeleteClientToo(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-yellow-800 font-medium">
                  Also delete the associated client record
                </span>
              </label>
              <p className="text-xs text-yellow-700 mt-1">
                This will remove the client from all parts of the system
              </p>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => leadToDelete && handleDeleteLead(leadToDelete.id, deleteClientToo)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteClientToo ? 'Delete Lead & Client' : 'Delete Lead Only'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
