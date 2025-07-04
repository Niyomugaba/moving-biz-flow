import React, { useState, useMemo } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { ScheduleJobDialog } from '../components/ScheduleJobDialog';
import { EditJobDialog } from '../components/EditJobDialog';
import { FilterBar } from '../components/FilterBar';
import { PaginationControls } from '../components/PaginationControls';
import { Plus, Calendar, MapPin, Users, Edit, CheckCircle, Phone, Mail, Truck, Archive, Eye, Undo, Trash2, UserCheck, Play, Clock } from 'lucide-react';
import { useJobs, Job } from '@/hooks/useJobs';
import { useJobArchive } from '@/hooks/useJobArchive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const Jobs = () => {
  const { jobs, isLoading, updateJob, deleteJob } = useJobs();
  const { 
    displayedJobs, 
    showArchived, 
    toggleArchiveView, 
    archivedCount, 
    activeCount 
  } = useJobArchive(jobs);
  
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentJobId, setPaymentJobId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  
  // Filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Filter jobs based on current view and search/status filters
  const filteredJobs = useMemo(() => {
    console.log('All jobs:', jobs);
    console.log('Displayed jobs:', displayedJobs);
    console.log('Jobs with pending_schedule:', jobs.filter(job => job.status === 'pending_schedule'));
    console.log('Jobs with lead_id:', jobs.filter(job => job.lead_id));
    
    return displayedJobs.filter(job => {
      const matchesSearch = job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.origin_address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [displayedJobs, searchTerm, statusFilter, jobs]);

  // Paginate filtered jobs
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEditJob = (job: Job) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleScheduleConvertedLead = (job: Job) => {
    console.log('Opening schedule dialog for converted lead:', job);
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleQuickStatusUpdate = (job: Job, newStatus: Job['status']) => {
    updateJob({ id: job.id, updates: { status: newStatus } });
  };

  const handleRecallJob = (job: Job) => {
    if (confirm(`Recall job ${job.job_number} back to active status?`)) {
      // Set status back to scheduled if it was cancelled, or back to completed if it was paid
      const newStatus = job.status === 'cancelled' ? 'scheduled' : 'completed';
      const updates: Partial<Job> = { status: newStatus };
      
      // If recalling a paid job, unmark as paid to make it active again
      if (job.status === 'completed' && job.is_paid) {
        updates.is_paid = false;
      }
      
      updateJob({ id: job.id, updates });
    }
  };

  const handleDeleteJob = (job: Job) => {
    deleteJob(job.id);
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const calculateJobProfit = (job: Job) => {
    if (job.status !== 'completed' || !job.actual_total) return 0;
    
    // Calculate labor costs more accurately
    const actualHours = job.actual_duration_hours || 0;
    const regularHours = Math.min(actualHours, 8 * job.movers_needed); // Max 8 hours per person regular
    const overtimeHours = Math.max(0, actualHours - (8 * job.movers_needed));
    
    const regularLaborCost = regularHours * job.hourly_rate;
    const overtimeLaborCost = overtimeHours * job.hourly_rate * 1.5; // 1.5x for overtime
    const totalLaborCost = regularLaborCost + overtimeLaborCost;
    
    const truckExpenses = (job.truck_rental_cost || 0) + (job.truck_gas_cost || 0);
    const totalExpenses = totalLaborCost + truckExpenses;
    
    return job.actual_total - totalExpenses;
  };

  // Calculate revenue using ALL jobs, not just displayed jobs
  const totalRevenue = jobs
    .filter(job => job.status === 'completed' && job.is_paid)
    .reduce((sum, job) => sum + (job.actual_total || 0), 0);

  const totalProfit = jobs
    .filter(job => job.status === 'completed' && job.is_paid)
    .reduce((sum, job) => sum + calculateJobProfit(job), 0);

  const truckRevenue = jobs
    .filter(job => job.status === 'completed' && job.is_paid && job.truck_service_fee)
    .reduce((sum, job) => sum + (job.truck_service_fee || 0), 0);

  const truckExpenses = jobs
    .filter(job => job.status === 'completed' && job.truck_service_fee)
    .reduce((sum, job) => sum + (job.truck_rental_cost || 0) + (job.truck_gas_cost || 0), 0);

  const truckProfit = truckRevenue - truckExpenses;

  const completedJobs = jobs.filter(job => job.status === 'completed').length;
  const paidJobs = jobs.filter(job => job.is_paid).length;
  
  const unpaidRevenue = jobs
    .filter(job => job.status === 'completed' && !job.is_paid)
    .reduce((sum, job) => {
      const jobRevenue = job.actual_total || 0;
      return sum + jobRevenue;
    }, 0);

  const jobStatusOptions = [
    { value: 'pending_schedule', label: 'Pending Schedule' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'rescheduled', label: 'Rescheduled' }
  ];

  const handleMarkAsPaid = (job: Job) => {
    setPaymentJobId(job.id);
    setPaymentMethod('');
    setShowPaymentDialog(true);
  };

  const handleMarkAsUnpaid = (job: Job) => {
    if (confirm(`Mark job ${job.job_number} as unpaid?`)) {
      updateJob({ 
        id: job.id, 
        updates: { 
          is_paid: false,
          payment_method: null,
          paid_at: null
        } 
      });
    }
  };

  const handlePaymentSubmit = () => {
    if (!paymentJobId || !paymentMethod) return;

    updateJob({ 
      id: paymentJobId, 
      updates: { 
        is_paid: true,
        payment_method: paymentMethod,
        paid_at: new Date().toISOString()
      } 
    });

    setShowPaymentDialog(false);
    setPaymentJobId(null);
    setPaymentMethod('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-purple-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-purple-800">Jobs Management</h1>
          <p className="text-purple-600 mt-2">Schedule and track all moving jobs with financial insights</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsScheduleDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Schedule New Job
          </button>
        </div>
      </div>

      {/* Archive Toggle */}
      <Card className="border-2 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="archive-mode"
                  checked={showArchived}
                  onCheckedChange={toggleArchiveView}
                />
                <Label htmlFor="archive-mode" className="flex items-center gap-2">
                  {showArchived ? <Archive className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showArchived ? 'Viewing Archives' : 'Viewing Active Jobs'}
                </Label>
              </div>
              {showArchived && (
                <div className="text-sm text-gray-600">
                  Archives include completed & paid jobs, and cancelled jobs
                </div>
              )}
            </div>
            <div className="flex gap-4 text-sm text-gray-600">
              <span>Active Jobs: <strong>{activeCount}</strong></span>
              <span>Archived Jobs: <strong>{archivedCount}</strong></span>
              <span>Converted Leads: <strong>{jobs.filter(job => job.lead_id && job.status === 'pending_schedule').length}</strong></span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              {showArchived ? 'Archived Jobs' : 'Total Jobs'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-700">{displayedJobs.length}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">
              {showArchived ? 'All Completed' : 'Active Jobs'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">
              {showArchived ? displayedJobs.length : displayedJobs.filter(job => job.status !== 'completed').length}
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
            <p className="text-xs text-gray-500">{paidJobs} paid</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Paid Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Unpaid Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">${unpaidRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">${totalProfit.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              Truck: ${truckProfit.toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={[
          { value: 'pending_schedule', label: 'Pending Schedule' },
          { value: 'scheduled', label: 'Scheduled' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'cancelled', label: 'Cancelled' },
          { value: 'rescheduled', label: 'Rescheduled' }
        ]}
        onClearFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
          setCurrentPage(1);
        }}
        placeholder="Search by client name, job number, or address..."
      />

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedJobs.map((job) => {
          const totalHourlyRate = job.hourly_rate * job.movers_needed;
          const jobTotal = job.actual_total || 0;
          const isCompleted = job.status === 'completed';
          const isCancelled = job.status === 'cancelled';
          const isPendingSchedule = job.status === 'pending_schedule';
          const isConvertedLead = Boolean(job.lead_id);
          const isArchived = (job.status === 'completed' && job.is_paid) || job.status === 'cancelled';
          const jobProfit = calculateJobProfit(job);
          const truckJobProfit = job.truck_service_fee ? 
            (job.truck_service_fee - (job.truck_rental_cost || 0) - (job.truck_gas_cost || 0)) : 0;
          
          console.log(`Job ${job.job_number}:`, {
            status: job.status,
            isPendingSchedule,
            isConvertedLead,
            lead_id: job.lead_id
          });
          
          return (
            <Card key={job.id} className="bg-white rounded-lg shadow-sm border border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="cursor-pointer hover:text-purple-700">
                    <h3 className="text-lg font-semibold text-gray-900">{job.client_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Phone className="h-3 w-3" />
                      <button 
                        onClick={() => window.open(`tel:${job.client_phone}`, '_self')}
                        className="hover:text-purple-600 underline"
                      >
                        {job.client_phone}
                      </button>
                    </div>
                    {job.client_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-3 w-3" />
                        <button 
                          onClick={() => window.open(`mailto:${job.client_email!}`, '_self')}
                          className="hover:text-purple-600 underline"
                        >
                          {job.client_email}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={job.status} variant="job" />
                    <Badge className={job.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {job.is_paid ? 'PAID' : 'UNPAID'}
                    </Badge>
                    {job.truck_service_fee && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Truck className="h-3 w-3 mr-1" />
                        TRUCK
                      </Badge>
                    )}
                    {showArchived && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Archive className="h-3 w-3 mr-1" />
                        ARCHIVED
                      </Badge>
                    )}
                    {isPendingSchedule && (
                      <Badge className="bg-orange-100 text-orange-800">
                        NEEDS SCHEDULING
                      </Badge>
                    )}
                    {isConvertedLead && (
                      <Badge className="bg-blue-100 text-blue-800">
                        <UserCheck className="h-3 w-3 mr-1" />
                        CONVERTED LEAD
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {isPendingSchedule ? (
                      <span className="text-orange-600 font-medium">Ready to be scheduled</span>
                    ) : (
                      <span>{job.job_date} at {job.start_time}</span>
                    )}
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      {job.origin_address === 'Origin address to be confirmed' ? (
                        <span className="text-orange-600 italic">Address to be confirmed</span>
                      ) : (
                        job.origin_address
                      )}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    {job.movers_needed} movers needed
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Rate per mover:</span>
                    <span className="font-medium">${job.hourly_rate}/hr</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Total hourly rate:</span>
                    <span className="font-medium">${totalHourlyRate}/hr</span>
                  </div>
                  {job.truck_service_fee && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Truck service fee:</span>
                      <span className="font-medium">+${job.truck_service_fee}</span>
                    </div>
                  )}
                  {isCompleted && job.actual_duration_hours && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Hours worked:</span>
                      <span className="font-medium">{job.actual_duration_hours}h</span>
                    </div>
                  )}
                  {isCompleted && jobTotal > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm mt-1">
                        <span className="text-gray-600">Total cost:</span>
                        <div className="text-right">
                          <span className={`font-semibold ${job.is_paid ? 'text-green-600' : 'text-orange-600'}`}>
                            ${jobTotal.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      {job.is_paid && (
                        <>
                          <div className="flex justify-between items-center text-sm mt-1">
                            <span className="text-gray-600">Job profit:</span>
                            <span className={`font-medium ${jobProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ${jobProfit.toFixed(2)}
                            </span>
                          </div>
                          {job.truck_service_fee && (job.truck_rental_cost || job.truck_gas_cost) && (
                            <div className="flex justify-between items-center text-sm mt-1">
                              <span className="text-gray-600">Truck profit:</span>
                              <span className={`font-medium ${truckJobProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ${truckJobProfit.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                  {!isCompleted && (
                    <div className="text-sm text-orange-600 mt-1 italic">
                      Total will be calculated after completion
                    </div>
                  )}
                  {job.payment_method && job.is_paid && (
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span className="text-gray-600">Payment method:</span>
                      <span className="font-medium text-green-600 capitalize">
                        {job.payment_method.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>

                {job.completion_notes && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-purple-700">{job.completion_notes}</p>
                  </div>
                )}

                {!showArchived && (
                  <div className="mt-4 space-y-2">
                    {isPendingSchedule ? (
                      <Button 
                        onClick={() => handleScheduleConvertedLead(job)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Calendar className="h-3 w-3 mr-2" />
                        {isConvertedLead ? 'Schedule Converted Lead' : 'Schedule Job'}
                      </Button>
                    ) : (
                      <>
                        {/* Quick Status Action Buttons */}
                        <div className="flex gap-2">
                          {job.status === 'scheduled' && (
                            <Button 
                              onClick={() => handleQuickStatusUpdate(job, 'in_progress')}
                              variant="outline"
                              className="flex-1 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                            >
                              <Play className="h-3 w-3 mr-2" />
                              Start Job
                            </Button>
                          )}
                          
                          {job.status === 'in_progress' && (
                            <Button 
                              onClick={() => handleEditJob(job)}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-3 w-3 mr-2" />
                              Complete Job
                            </Button>
                          )}
                          
                          {job.status !== 'completed' && job.status !== 'in_progress' && (
                            <Button 
                              onClick={() => handleEditJob(job)}
                              variant="outline"
                              className="flex-1 hover:bg-green-50 hover:border-green-300 text-green-600"
                            >
                              <CheckCircle className="h-3 w-3 mr-2" />
                              Mark Complete
                            </Button>
                          )}
                          
                          <Button 
                            onClick={() => handleEditJob(job)}
                            variant="outline"
                            className="flex-1 hover:bg-purple-50 hover:border-purple-300 text-purple-600"
                          >
                            <Edit className="h-3 w-3 mr-2" />
                            Edit
                          </Button>
                        </div>

                        {/* Payment Status Buttons for Completed Jobs */}
                        {job.status === 'completed' && (
                          <div className="flex gap-2">
                            {!job.is_paid ? (
                              <Button 
                                onClick={() => handleMarkAsPaid(job)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-3 w-3 mr-2" />
                                Mark as Paid
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleMarkAsUnpaid(job)}
                                variant="outline"
                                className="flex-1 hover:bg-red-50 hover:border-red-300 text-red-600"
                              >
                                <Clock className="h-3 w-3 mr-2" />
                                Mark as Unpaid
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex gap-2">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline"
                            className="flex-1 hover:bg-red-50 hover:border-red-300 text-red-600"
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Job</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete job {job.job_number}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteJob(job.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                )}

                {showArchived && (
                  <div className="mt-4 flex gap-2">
                    <Button 
                      onClick={() => handleRecallJob(job)}
                      variant="outline"
                      className="flex-1 hover:bg-blue-50 hover:border-blue-300 text-blue-600"
                    >
                      <Undo className="h-3 w-3 mr-2" />
                      Recall Job
                    </Button>
                    <Button 
                      onClick={() => handleEditJob(job)}
                      variant="outline"
                      className="flex-1 hover:bg-purple-50 hover:border-purple-300 text-purple-600"
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Review
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline"
                          className="hover:bg-red-50 hover:border-red-300 text-red-600"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Job</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete job {job.job_number}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteJob(job)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-purple-600 text-lg">
            No {showArchived ? 'archived' : 'active'} jobs found
          </div>
          <p className="text-purple-400 mt-2">
            {showArchived 
              ? 'Complete and mark jobs as paid to see them in archives'
              : 'Start by scheduling your first moving job or convert leads to jobs'
            }
          </p>
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
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Payment Method Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
              >
                <option value="">Select payment method...</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPaymentDialog(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handlePaymentSubmit}
                disabled={!paymentMethod}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Mark as Paid
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ScheduleJobDialog 
        open={isScheduleDialogOpen} 
        onOpenChange={setIsScheduleDialogOpen} 
      />

      <EditJobDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        job={selectedJob}
      />
    </div>
  );
};
