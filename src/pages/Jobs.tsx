
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useJobs, Job } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { ScheduleJobDialog } from '@/components/ScheduleJobDialog';
import { EditJobDialog } from '@/components/EditJobDialog';
import { JobPaymentDialog } from '@/components/JobPaymentDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { StatusBadge } from '@/components/StatusBadge';
import { 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit,
  Plus,
  Search,
  Clock,
  User,
  Download
} from 'lucide-react';

const ITEMS_PER_PAGE = 12;

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
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'status' | 'client'>('date');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.client_phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.origin_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.destination_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort jobs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'value':
          return (b.estimated_total || 0) - (a.estimated_total || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        case 'client':
          return (a.client_name || '').localeCompare(b.client_name || '');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportJobsToCSV = () => {
    if (!jobs.length) return;
    
    const csvRows = [];
    const headers = [
      'Job Number', 'Client Name', 'Client Phone', 'Status', 'Job Date', 
      'Origin', 'Destination', 'Estimated Total', 'Actual Total', 'Created Date'
    ];
    csvRows.push(headers.join(','));

    for (const job of filteredJobs) {
      const values = [
        job.job_number || '',
        job.client_name || '',
        job.client_phone || '',
        job.status || '',
        job.job_date || '',
        job.origin_address || '',
        job.destination_address || '',
        job.estimated_total || 0,
        job.actual_total || 0,
        new Date(job.created_at).toLocaleDateString()
      ].map(value => `"${value}"`);
      
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'jobs_report.csv');
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
              <h1 className="text-2xl sm:text-3xl font-bold text-purple-800">Jobs</h1>
              <p className="text-purple-600">Manage your moving jobs and schedules</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={exportJobsToCSV}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
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
          </div>

          {/* Filters and Controls */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search jobs by client, job number, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'value' | 'status' | 'client')}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedJobs.map((job) => (
                <Card key={job.id} className="bg-white hover:shadow-lg transition-shadow border border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          {job.job_number}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-3 w-3" />
                          <span className="text-sm text-gray-600">{job.client_name}</span>
                        </div>
                        <StatusBadge status={job.status} variant="job" />
                      </div>
                      {canAccess(['owner', 'admin', 'manager']) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedJob({...job, is_paid: job.is_paid || false, estimated_duration_hours: job.estimated_duration_hours || 4});
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
                      {job.client_phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{job.client_phone}</span>
                        </div>
                      )}
                      
                      {job.job_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{new Date(job.job_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      {job.origin_address && (
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium">From:</p>
                            <p>{job.origin_address}</p>
                            {job.destination_address && (
                              <>
                                <p className="font-medium mt-1">To:</p>
                                <p>{job.destination_address}</p>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ${job.estimated_total || 0}
                        </p>
                        <p className="text-xs text-gray-500">Estimated</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                          <Clock className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {job.estimated_duration_hours || 4}h
                        </p>
                        <p className="text-xs text-gray-500">Duration</p>
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
                    <TableHead>Job</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Job Date</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{job.job_number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
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
                        <StatusBadge status={job.status} variant="job" />
                      </TableCell>
                      <TableCell>
                        {job.job_date ? new Date(job.job_date).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>${job.estimated_total || 0}</TableCell>
                      <TableCell>{job.estimated_duration_hours || 4}h</TableCell>
                      <TableCell>
                        {canAccess(['owner', 'admin', 'manager']) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedJob({...job, is_paid: job.is_paid || false, estimated_duration_hours: job.estimated_duration_hours || 4});
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
          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Briefcase className="h-16 w-16 mx-auto" />
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
