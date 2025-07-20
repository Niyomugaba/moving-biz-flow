import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobs } from "@/hooks/useJobs";
import { useJobArchive } from "@/hooks/useJobArchive";
import { useIsMobile } from "@/hooks/use-mobile";
import { JobFilters } from "@/components/JobFilters";
import { ScheduleJobDialog } from "@/components/ScheduleJobDialog";
import { EditJobDialog } from "@/components/EditJobDialog";
import { AddLeadCostDialog } from "@/components/AddLeadCostDialog";
import { 
  Search, 
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Target,
  TrendingUp,
  Eye,
  Archive
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Jobs = () => {
  const { jobs, isLoading, deleteJob } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const isMobile = useIsMobile();
  const [showAddLeadCostDialog, setShowAddLeadCostDialog] = useState(false);
  const [selectedJobForLeadCost, setSelectedJobForLeadCost] = useState<any>(null);

  // Use the archive hook
  const { displayedJobs, showArchived, toggleArchiveView, archivedCount, activeCount } = useJobArchive(jobs);

  // Filter jobs by status and search term
  const filteredJobs = useMemo(() => {
    let filtered = displayedJobs;
    
    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(job => job.status === selectedStatus);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client_phone.includes(searchTerm) ||
        (job.client_email && job.client_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        job.origin_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.destination_address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [displayedJobs, selectedStatus, searchTerm]);

  // Calculate metrics for current view
  const metrics = useMemo(() => {
    const currentJobs = showArchived ? jobs.filter(job => 
      (job.status === 'completed' && job.is_paid) || job.status === 'cancelled'
    ) : jobs.filter(job => 
      !((job.status === 'completed' && job.is_paid) || job.status === 'cancelled')
    );

    const totalRevenue = currentJobs
      .filter(job => job.status === 'completed')
      .reduce((sum, job) => {
        if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
          return sum + job.total_amount_received;
        }
        return sum + (job.actual_total || job.estimated_total || 0);
      }, 0);

    const completedCount = currentJobs.filter(job => job.status === 'completed').length;
    const averageJobValue = completedCount > 0 ? totalRevenue / completedCount : 0;

    return {
      totalJobs: currentJobs.length,
      completedJobs: completedCount,
      pendingJobs: currentJobs.filter(job => job.status === 'pending_schedule').length,
      scheduledJobs: currentJobs.filter(job => job.status === 'scheduled').length,
      inProgressJobs: currentJobs.filter(job => job.status === 'in_progress').length,
      cancelledJobs: currentJobs.filter(job => job.status === 'cancelled').length,
      totalRevenue: Math.round(totalRevenue),
      averageJobValue: Math.round(averageJobValue)
    };
  }, [jobs, showArchived]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pending_schedule':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBadge = (job: any) => {
    const jobDate = new Date(job.job_date);
    const today = new Date();
    const daysDiff = Math.ceil((jobDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (job.status === 'pending_schedule') {
      return <Badge variant="destructive" className="ml-2">Needs Scheduling</Badge>;
    }
    
    if (job.status === 'scheduled' && daysDiff <= 1) {
      return <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-300">Due Soon</Badge>;
    }
    
    return null;
  };

  const handleEditJob = (job: any) => {
    setJobToEdit(job);
    setShowEditDialog(true);
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      setJobToDelete(null);
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleAddLeadCost = (job: any) => {
    setSelectedJobForLeadCost(job);
    setShowAddLeadCostDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading jobs...</div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="p-4 space-y-6 bg-gradient-to-br from-purple-25 to-gold-25 min-h-screen">
        {/* Mobile Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Job Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            {showArchived ? 'Archived Jobs' : 'Active Jobs'} ({filteredJobs.length})
          </p>
        </div>

        {/* Mobile Filters */}
        <JobFilters
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          showArchived={showArchived}
          onToggleArchive={toggleArchiveView}
          archivedCount={archivedCount}
          activeCount={activeCount}
        />

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Job Cards */}
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-purple-700">{job.job_number}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(job.job_date), 'MMM dd, yyyy')}
                    <Clock className="h-3 w-3 ml-2" />
                    {job.start_time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                  {getPriorityBadge(job)}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="font-medium">{job.client_name} - {job.client_phone}</div>
                <div className="text-gray-600 flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{job.origin_address.length > 40 ? `${job.origin_address.substring(0, 40)}...` : job.origin_address}</span>
                </div>
                <div className="text-gray-600 flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  <span>{job.destination_address.length > 40 ? `${job.destination_address.substring(0, 40)}...` : job.destination_address}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="h-3 w-3" />
                    {job.movers_needed} movers
                  </div>
                  <div className="font-semibold text-green-600">
                    ${(job.actual_total || job.estimated_total || 0).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-3 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                  <Edit className="h-3 w-3" />
                </Button>
                {!job.lead_id && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleAddLeadCost(job)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Add Lead Cost"
                  >
                    <Target className="h-3 w-3" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setJobToDelete(job.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile Add Job Button */}
        {!showArchived && (
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            onClick={() => setShowScheduleDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Job
          </Button>
        )}

        
        <ScheduleJobDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
        />

        <EditJobDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          job={jobToEdit}
        />

        {selectedJobForLeadCost && (
          <AddLeadCostDialog
            open={showAddLeadCostDialog}
            onOpenChange={setShowAddLeadCostDialog}
            jobData={selectedJobForLeadCost}
          />
        )}

        <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Job</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this job? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
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
            Job Management
          </h1>
          <p className="text-gray-600 mt-2">
            {showArchived ? 'Archived jobs' : 'Active jobs'} - {filteredJobs.length} of {showArchived ? archivedCount : activeCount} jobs
          </p>
        </div>
        {!showArchived && (
          <Button
            onClick={() => setShowScheduleDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Schedule New Job
          </Button>
        )}
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
            {showArchived ? <Archive className="h-5 w-5 text-purple-600" /> : <Eye className="h-5 w-5 text-purple-600" />}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">{metrics.totalJobs}</div>
            <p className="text-sm text-gray-500 mt-1">
              {showArchived ? 'Archived & Cancelled' : 'Active Jobs'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">${metrics.totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-500 mt-1">
              ${metrics.averageJobValue.toLocaleString()} avg value
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            <CheckCircle className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{metrics.completedJobs}</div>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.totalJobs > 0 ? Math.round((metrics.completedJobs / metrics.totalJobs) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Status Mix</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{metrics.pendingJobs + metrics.scheduledJobs}</div>
            <p className="text-sm text-gray-500 mt-1">
              {metrics.pendingJobs} pending, {metrics.scheduledJobs} scheduled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <JobFilters
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        showArchived={showArchived}
        onToggleArchive={toggleArchiveView}
        archivedCount={archivedCount}
        activeCount={activeCount}
      />

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search by job number, client, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {showArchived ? 'Archived Jobs' : 'Active Jobs'} ({filteredJobs.length})
          </CardTitle>
          <CardDescription>
            {searchTerm && `Filtered by: "${searchTerm}"`}
            {selectedStatus !== 'all' && ` | Status: ${selectedStatus.replace('_', ' ')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <TableHead className="font-semibold">Job Details</TableHead>
                  <TableHead className="font-semibold">Client</TableHead>
                  <TableHead className="font-semibold">Schedule</TableHead>
                  <TableHead className="font-semibold">Pricing</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <Calendar className="h-12 w-12 text-gray-300" />
                        <p className="text-lg font-medium">No jobs found</p>
                        <p className="text-sm">Try adjusting your filters or search terms</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job, index) => (
                    <TableRow key={job.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25/30'}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-purple-700 flex items-center gap-2">
                            {job.job_number}
                            {getPriorityBadge(job)}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.origin_address.length > 30 ? `${job.origin_address.substring(0, 30)}...` : job.origin_address}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.destination_address.length > 30 ? `${job.destination_address.substring(0, 30)}...` : job.destination_address}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.movers_needed} movers
                            {job.pricing_model === 'flat_rate' && (
                              <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                                Flat Rate
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{job.client_name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {job.client_phone}
                          </div>
                          {job.client_email && (
                            <div className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {job.client_email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(job.job_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            {job.start_time}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-green-600">
                            ${(job.pricing_model === 'flat_rate' && job.total_amount_received 
                              ? job.total_amount_received 
                              : job.actual_total || job.estimated_total || 0
                            ).toLocaleString()}
                          </div>
                          {job.pricing_model !== 'flat_rate' && (
                            <div className="text-sm text-gray-500">
                              ${job.hourly_rate}/hr
                            </div>
                          )}
                          {job.is_paid && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Paid
                            </Badge>
                          )}
                          {job.lead_cost && job.lead_cost > 0 && (
                            <div className="text-xs text-orange-600">
                              Lead: ${job.lead_cost}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditJob(job)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          {!job.lead_id && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAddLeadCost(job)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              title="Add Lead Cost"
                            >
                              <Target className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setJobToDelete(job.id)}
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

      
      <ScheduleJobDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
      />

      <EditJobDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        job={jobToEdit}
      />

      {selectedJobForLeadCost && (
        <AddLeadCostDialog
          open={showAddLeadCostDialog}
          onOpenChange={setShowAddLeadCostDialog}
          jobData={selectedJobForLeadCost}
        />
      )}

      <AlertDialog open={!!jobToDelete} onOpenChange={() => setJobToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => jobToDelete && handleDeleteJob(jobToDelete)}
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
