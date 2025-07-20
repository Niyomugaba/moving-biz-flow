
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJobs, Job } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { ScheduleJobDialog } from '@/components/ScheduleJobDialog';
import { EditJobDialog } from '@/components/EditJobDialog';
import { JobPaymentDialog } from '@/components/JobPaymentDialog';
import { StatusBadge } from '@/components/StatusBadge';
import { PaginationControls } from '@/components/PaginationControls';
import { 
  Calendar, 
  MapPin, 
  Phone, 
  DollarSign, 
  Users, 
  Clock, 
  Edit, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export const Jobs = () => {
  const { jobs, isLoading, addJob, updateJob, deleteJob } = useJobs();
  const { canAccess } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'value'>('date');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.origin_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.destination_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.job_date || b.created_at).getTime() - new Date(a.job_date || a.created_at).getTime();
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'value':
          return (b.estimated_total || 0) - (a.estimated_total || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [jobs, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
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
        <div className="p-4 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">Jobs</h1>
              <p className="text-purple-600">Manage and track all moving jobs</p>
            </div>
            {canAccess(['owner', 'admin', 'manager']) && (
              <Button 
                onClick={() => setShowScheduleDialog(true)}
                className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Schedule Job
              </Button>
            )}
          </div>

          {/* Filters and Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs by number, client, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending_schedule">Pending Schedule</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'status' | 'value')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
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
                Total: {filteredJobs.length} jobs
              </p>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'cards' ? (
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <Card key={job.id} className="bg-white hover:shadow-lg transition-shadow border border-blue-200">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(job.status)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {job.job_number}
                          </h3>
                          <StatusBadge status={job.status} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">{job.client_name}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>{job.job_date ? new Date(job.job_date).toLocaleDateString() : 'Not scheduled'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-gray-600">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">
                              ${job.actual_total || job.estimated_total || 0}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm">
                                <span className="font-medium">From:</span> {job.origin_address || 'Not specified'}
                              </p>
                              <p className="text-sm">
                                <span className="font-medium">To:</span> {job.destination_address || 'Not specified'}
                              </p>
                            </div>
                          </div>
                          
                          {job.client_phone && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-4 w-4" />
                              <span className="text-sm">{job.client_phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {canAccess(['owner', 'admin', 'manager']) && (
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJob({
                                ...job,
                                is_paid: job.is_paid || false,
                                estimated_duration_hours: job.estimated_duration_hours || 2
                              });
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {job.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJob({
                                  ...job,
                                  is_paid: job.is_paid || false,
                                  estimated_duration_hours: job.estimated_duration_hours || 2
                                });
                                setShowPaymentDialog(true);
                              }}
                            >
                              <DollarSign className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
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
                    <TableHead>Job Number</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Addresses</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="font-medium">{job.job_number}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.client_name}</p>
                          {job.client_phone && (
                            <p className="text-xs text-gray-500">{job.client_phone}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={job.status} />
                      </TableCell>
                      <TableCell>
                        {job.job_date ? new Date(job.job_date).toLocaleDateString() : 'Not scheduled'}
                      </TableCell>
                      <TableCell>
                        ${job.actual_total || job.estimated_total || 0}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          <p><span className="font-medium">From:</span> {job.origin_address || 'TBD'}</p>
                          <p><span className="font-medium">To:</span> {job.destination_address || 'TBD'}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {canAccess(['owner', 'admin', 'manager']) && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedJob({
                                  ...job,
                                  is_paid: job.is_paid || false,
                                  estimated_duration_hours: job.estimated_duration_hours || 2
                                });
                                setShowEditDialog(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            
                            {job.status === 'completed' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedJob({
                                    ...job,
                                    is_paid: job.is_paid || false,
                                    estimated_duration_hours: job.estimated_duration_hours || 2
                                  });
                                  setShowPaymentDialog(true);
                                }}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* No Results */}
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'Get started by scheduling your first job.'}
              </p>
              <Button onClick={() => setShowScheduleDialog(true)} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Your First Job
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredJobs.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={filteredJobs.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}

          {/* Dialogs */}
          <ScheduleJobDialog
            open={showScheduleDialog}
            onOpenChange={setShowScheduleDialog}
          />

          {showEditDialog && selectedJob && (
            <EditJobDialog
              open={showEditDialog}
              onOpenChange={setShowEditDialog}
              job={selectedJob}
            />
          )}

          {showPaymentDialog && selectedJob && (
            <JobPaymentDialog
              open={showPaymentDialog}
              onOpenChange={setShowPaymentDialog}
              job={selectedJob}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
