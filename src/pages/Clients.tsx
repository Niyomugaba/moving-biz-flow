
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Star,
  Clock,
  CheckCircle
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
  const [sortBy, setSortBy] = useState<'name' | 'jobs' | 'revenue' | 'recent'>('name');

  const filteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           client.primary_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    });

    // Sort clients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'jobs':
          return (b.total_jobs_completed || 0) - (a.total_jobs_completed || 0);
        case 'revenue':
          return (b.total_revenue || 0) - (a.total_revenue || 0);
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
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

  const handleAddClient = async (clientData: {
    name: string;
    phone: string;
    email?: string;
    primary_address: string;
    company_name?: string;
    preferred_contact_method?: string;
  }) => {
    await addClient(clientData);
    setShowAddDialog(false);
  };

  const handleEditClient = async (clientData: Partial<Client>) => {
    if (selectedClient) {
      await updateClient({ id: selectedClient.id, updates: clientData });
      setShowEditDialog(false);
      setSelectedClient(null);
    }
  };

  const getClientTypeIcon = (totalJobs: number) => {
    if (totalJobs === 0) return <Clock className="h-4 w-4 text-gray-500" />;
    if (totalJobs === 1) return <CheckCircle className="h-4 w-4 text-blue-500" />;
    return <Star className="h-4 w-4 text-yellow-500" />;
  };

  const getClientTypeLabel = (totalJobs: number) => {
    if (totalJobs === 0) return 'New Client';
    if (totalJobs === 1) return 'One-time Client';
    return 'Repeat Client';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      <ScrollArea className="h-full w-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
              <p className="text-gray-600">Manage your client relationships</p>
            </div>
            {canAccess(['owner', 'admin', 'manager']) && (
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'jobs' | 'revenue' | 'recent')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="jobs">Jobs Completed</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clients Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {client.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getClientTypeIcon(client.total_jobs_completed || 0)}
                        <span className="text-sm text-gray-600">
                          {getClientTypeLabel(client.total_jobs_completed || 0)}
                        </span>
                      </div>
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
                    {client.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm truncate">{client.email}</span>
                      </div>
                    )}
                    
                    {client.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{client.phone}</span>
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
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {client.total_jobs_completed || 0}
                      </p>
                      <p className="text-xs text-gray-500">Jobs</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${(client.total_revenue || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Revenue</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={filteredClients.length}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />

          {/* Dialogs */}
          {showAddDialog && (
            <AddClientDialog
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              onAdd={handleAddClient}
            />
          )}

          {showEditDialog && selectedClient && (
            <EditClientDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              client={selectedClient}
              onUpdate={handleEditClient}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
