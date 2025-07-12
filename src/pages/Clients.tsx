import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useClients } from "@/hooks/useClients";
import { useLeads } from "@/hooks/useLeads";
import { useClientStats } from "@/hooks/useClientStats";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddClientDialog } from "@/components/AddClientDialog";
import { EditClientDialog } from "@/components/EditClientDialog";
import { 
  Search, 
  Plus,
  Phone,
  Mail,
  Users,
  Building,
  Star,
  Download,
  Trash2,
  Edit,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Clients = () => {
  const { clients, isLoading, deleteClient } = useClients();
  const { leads } = useLeads();
  const { clientStats } = useClientStats();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [clientToEdit, setClientToEdit] = useState<any>(null);
  const isMobile = useIsMobile();

  // Merge clients with lead status information - stats are already merged in useClients
  const clientsWithStatus = useMemo(() => {
    console.log('Processing clients for display:', clients);
    console.log('Available client stats:', clientStats);
    
    return clients.map(client => {
      const associatedLead = leads.find(lead => 
        lead.name.toLowerCase() === client.name.toLowerCase() && 
        lead.phone === client.phone
      );
      
      const result = {
        ...client,
        leadStatus: associatedLead?.status || 'direct',
        leadCost: associatedLead?.lead_cost || 0,
      };
      
      console.log(`Client ${client.name} display data:`, {
        jobs_completed: result.total_jobs_completed,
        revenue: result.total_revenue,
        leadStatus: result.leadStatus
      });
      
      return result;
    });
  }, [clients, leads, clientStats]);

  // Filter clients
  const filteredClients = useMemo(() => {
    return clientsWithStatus.filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.company_name && client.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [clientsWithStatus, searchTerm]);

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Company', 'Lead Status', 'Lead Cost', 'Total Jobs', 'Total Revenue', 'Created Date'],
      ...filteredClients.map(client => [
        client.name,
        client.phone,
        client.email || '',
        client.company_name || '',
        client.leadStatus,
        client.leadCost,
        client.total_jobs_completed || 0,
        client.total_revenue || 0,
        format(new Date(client.created_at), 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clients-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Client data exported successfully!');
  };

  const handleEditClient = (client: any) => {
    setClientToEdit(client);
    setShowEditDialog(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await deleteClient(clientId);
      setClientToDelete(null);
      toast.success('Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Failed to delete client');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      case 'direct':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading clients...</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="p-4 space-y-6 bg-gradient-to-br from-purple-25 to-gold-25 min-h-screen">
        {/* Mobile Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Client Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">Manage your customer relationships</p>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Client Cards */}
        <div className="space-y-3">
          {filteredClients.map((client) => (
            <Card key={client.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{client.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {client.phone}
                  </div>
                  {client.email && (
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setClientToDelete(client.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <Badge className={getStatusColor(client.leadStatus)}>
                    {client.leadStatus}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <AddClientDialog 
          open={showAddDialog} 
          onOpenChange={setShowAddDialog}
        />

        <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Client</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this client? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-25 to-gold-25 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Client Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your customer relationships and track their journey
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Clients</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{clientsWithStatus.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Converted Leads</CardTitle>
            <Star className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">
              {clientsWithStatus.filter(c => c.leadStatus === 'converted').length}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <Building className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">
              ${clientsWithStatus.reduce((sum, c) => sum + (c.total_revenue || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Lead Cost</CardTitle>
            <Star className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">
              ${clientsWithStatus.reduce((sum, c) => sum + (c.leadCost || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Clients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clients by name, phone, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Clients ({filteredClients.length})
          </CardTitle>
          <CardDescription>
            {searchTerm && `Filtered by: "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="font-semibold">Client Info</TableHead>
                  <TableHead className="font-semibold">Contact</TableHead>
                  <TableHead className="font-semibold">Lead Status</TableHead>
                  <TableHead className="font-semibold">Lead Cost</TableHead>
                  <TableHead className="font-semibold">Jobs/Revenue</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No clients found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client, index) => (
                    <TableRow key={client.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                      <TableCell>
                        <div>
                          <div className="font-medium cursor-pointer hover:text-purple-700">
                            {client.name}
                          </div>
                          {client.company_name && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {client.company_name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            <button 
                              onClick={() => handleCall(client.phone)}
                              className="hover:text-blue-600 underline"
                            >
                              {client.phone}
                            </button>
                          </div>
                          {client.email && (
                            <div className="text-sm flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              <button 
                                onClick={() => handleEmail(client.email!)}
                                className="hover:text-blue-600 underline"
                              >
                                {client.email}
                              </button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(client.leadStatus)}>
                          {client.leadStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-red-600">
                          ${(client.leadCost || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-green-600">
                            ${(client.total_revenue || 0).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.total_jobs_completed || 0} jobs completed
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditClient(client)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCall(client.phone)}
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          {client.email && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEmail(client.email!)}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setClientToDelete(client.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddClientDialog 
        open={showAddDialog} 
        onOpenChange={setShowAddDialog}
      />

      <EditClientDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog}
        client={clientToEdit}
      />

      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this client? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clientToDelete && handleDeleteClient(clientToDelete)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
