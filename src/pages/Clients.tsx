
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useClients, Client } from '@/hooks/useClients';
import { useAuth } from '@/hooks/useAuth';
import { AddClientDialog } from '@/components/AddClientDialog';
import { EditClientDialog } from '@/components/EditClientDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit,
  Plus,
  Search,
  Building,
  Star,
  Download
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

export const Clients = () => {
  const { clients, isLoading, addClient, updateClient, deleteClient } = useClients();
  const { canAccess } = useAuth();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'revenue' | 'jobs'>('name');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort clients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'revenue':
          return (b.total_revenue || 0) - (a.total_revenue || 0);
        case 'jobs':
          return (b.total_jobs_completed || 0) - (a.total_jobs_completed || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [clients, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getRatingStars = (rating: number | null) => {
    if (!rating) return null;
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-3 w-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const exportClientsToCSV = () => {
    if (!clients.length) return;
    
    const csvRows = [];
    const headers = [
      'Name', 'Phone', 'Email', 'Company', 'Primary Address', 'Jobs Completed', 
      'Total Revenue', 'Rating', 'Preferred Contact', 'Created Date'
    ];
    csvRows.push(headers.join(','));

    for (const client of filteredClients) {
      const values = [
        client.name || '',
        client.phone || '',
        client.email || '',
        client.company_name || '',
        client.primary_address || '',
        client.total_jobs_completed || 0,
        client.total_revenue || 0,
        client.rating || '',
        client.preferred_contact_method || '',
        new Date(client.created_at).toLocaleDateString()
      ].map(value => `"${value}"`);
      
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'clients_report.csv');
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-blue-50">
      <ScrollArea className="h-full w-full">
        <div className="space-y-6 p-4 md:p-6 min-h-screen">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">Clients</h1>
              <p className="text-purple-600">Manage your client relationships</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={exportClientsToCSV}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              {canAccess(['owner', 'admin', 'manager']) && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Client
                </Button>
              )}
            </div>
          </div>

          {/* Filters and Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients by name, email, phone, or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'date' | 'revenue' | 'jobs')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="date">Date Added</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="jobs">Jobs</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={viewMode} onValueChange={(value) => setViewMode(value as 'cards' | 'table')}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">
                Total: {filteredClients.length} clients
              </p>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedClients.map((client) => (
                <Card key={client.id} className="bg-white hover:shadow-lg transition-shadow border border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {client.name}
                        </CardTitle>
                        {client.company_name && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                            <Building className="h-3 w-3" />
                            <span>{client.company_name}</span>
                          </div>
                        )}
                        {client.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {getRatingStars(client.rating)}
                          </div>
                        )}
                      </div>
                      {canAccess(['owner', 'admin', 'manager']) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setShowEditDialog(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{client.phone}</span>
                        </div>
                      )}
                      
                      {client.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm truncate">{client.email}</span>
                        </div>
                      )}
                      
                      {client.primary_address && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span className="text-sm leading-relaxed">{client.primary_address}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${client.total_revenue || 0}
                        </p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {client.total_jobs_completed || 0}
                        </p>
                        <p className="text-xs text-gray-500">Jobs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white border border-blue-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Jobs</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(client.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {client.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {client.phone}
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{client.company_name || '-'}</TableCell>
                      <TableCell>${client.total_revenue || 0}</TableCell>
                      <TableCell>{client.total_jobs_completed || 0}</TableCell>
                      <TableCell>
                        {client.rating ? (
                          <div className="flex items-center gap-1">
                            {getRatingStars(client.rating)}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {canAccess(['owner', 'admin', 'manager']) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* No Results */}
          {filteredClients.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Users className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? 'Try adjusting your search.'
                  : 'Get started by adding your first client.'}
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Client
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredClients.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredClients.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}

          {/* Dialogs */}
          <AddClientDialog
            open={showAddDialog}
            onOpenChange={setShowAddDialog}
          />

          {showEditDialog && selectedClient && (
            <EditClientDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              client={selectedClient}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
