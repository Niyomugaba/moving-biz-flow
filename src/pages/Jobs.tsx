
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useJobs } from '@/hooks/useJobs';
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
import { Job } from '@/integrations/supabase/types';

const ITEMS_PER_PAGE = 10;

export const Jobs = () => {
  const { jobs, loading, scheduleJob, updateJob, deleteJob } = useJobs();
  const { canAccess } = useAuth();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'status' | 'value'>('date');

  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(job => {
      const matchesSearch = job.job_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase());
      
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

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleScheduleJob = async (jobData: Partial<Job>) => {
    await scheduleJob(jobData);
    setShowScheduleDialog(false);
  };

  const handleEditJob = async (jobData: Partial<Job>) => {
    if (selectedJob) {
      await updateJob(selectedJob.id, jobData);
      setShowEditDialog(false);
      setSelectedJob(null);
    }
  };

  const handlePaymentUpdate = async (paymentData: any) => {
    if (selectedJob) {
      await updateJob(selectedJob.id, paymentData);
      setShowPaymentDialog(false);
      setSelectedJob(null);
    }
  };

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

  if (loading) {
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
              <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
              <p className="text-gray-600">Manage and track all moving jobs</p>
            </div>
            {canAccess(['owner', 'admin', 'manager']) && (
              <Button 
                onClick={() => setShowScheduleDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Schedule Job
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
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
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="value">Value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Jobs List */}
          <div className="space-y-4">
            {paginatedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardContent className="p-6">
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
                              <span className="font-medium">From:</span> {job.pickup_address || 'Not specified'}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">To:</span> {job.delivery_address || 'Not specified'}
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
                            setSelectedJob(job);
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
                              setSelectedJob(job);
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

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          {/* Dialogs */}
          {showScheduleDialog && (
            <ScheduleJobDialog
              isOpen={showScheduleDialog}
              onClose={() => setShowScheduleDialog(false)}
              onSchedule={handleScheduleJob}
            />
          )}

          {showEditDialog && selectedJob && (
            <EditJobDialog
              isOpen={showEditDialog}
              onClose={() => {
                setShowEditDialog(false);
                setSelectedJob(null);
              }}
              job={selectedJob}
              onUpdate={handleEditJob}
            />
          )}

          {showPaymentDialog && selectedJob && (
            <JobPaymentDialog
              isOpen={showPaymentDialog}
              onClose={() => {
                setShowPaymentDialog(false);
                setSelectedJob(null);
              }}
              job={selectedJob}
              onUpdate={handlePaymentUpdate}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
