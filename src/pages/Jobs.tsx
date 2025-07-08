import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useJobs } from "@/hooks/useJobs";
import { useIsMobile } from "@/hooks/use-mobile";
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
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Target
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export const Jobs = () => {
  const { jobs, isLoading, deleteJob } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [jobToEdit, setJobToEdit] = useState<any>(null);
  const isMobile = useIsMobile();
  const [showAddLeadCostDialog, setShowAddLeadCostDialog] = useState(false);
  const [selectedJobForLeadCost, setSelectedJobForLeadCost] = useState<any>(null);

  const filteredJobs = useMemo(() => {
    return jobs.filter(job =>
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client_phone.includes(searchTerm) ||
      (job.client_email && job.client_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      job.origin_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.destination_address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobs, searchTerm]);

  const totalRevenue = useMemo(() => {
    return jobs.reduce((sum, job) => sum + (job.actual_total || job.estimated_total), 0);
  }, [jobs]);

  const completedJobsCount = useMemo(() => {
    return jobs.filter(job => job.status === 'completed').length;
  }, [jobs]);

  const pendingJobsCount = useMemo(() => {
    return jobs.filter(job => job.status === 'pending_schedule').length;
  }, [jobs]);

  const averageJobValue = useMemo(() => {
    if (completedJobsCount === 0) return 0;
    return totalRevenue / completedJobsCount;
  }, [totalRevenue, completedJobsCount]);

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
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      case 'pending_schedule':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <p className="text-gray-600 text-sm mt-1">Manage your scheduled jobs</p>
        </div>

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
            <Card key={job.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{job.job_number}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(job.job_date), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {job.start_time}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                {job.client_name} - {job.client_phone}
              </div>
              <div className="text-sm text-gray-600">
                {job.origin_address.length > 40 ? `${job.origin_address.substring(0, 40)}...` : job.origin_address}
              </div>
              <div className="text-sm text-gray-600">
                {job.destination_address.length > 40 ? `${job.destination_address.substring(0, 40)}...` : job.destination_address}
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditJob(job)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setJobToDelete(job.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Mobile Add Job Button */}
        <Button
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          onClick={() => setShowScheduleDialog(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Job
        </Button>

        <ScheduleJobDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
        />

        <EditJobDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          job={jobToEdit}
        />

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
            Manage your scheduled jobs and track their progress
          </p>
        </div>
        <Button
          onClick={() => setShowScheduleDialog(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Job
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
            <Calendar className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{jobs.length}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed Jobs</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{completedJobsCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Jobs</CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{pendingJobsCount}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">${totalRevenue.toLocaleString()}</div>
            <p className="text-sm text-gray-500">
              <TrendingUp className="h-4 w-4 inline-block mr-1 align-middle" />
              ${averageJobValue.toLocaleString()} avg job value
            </p>
          </CardContent>
        </Card>
      </div>

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
              placeholder="Search jobs by job number, client, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Jobs ({filteredJobs.length})
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
                      No jobs found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredJobs.map((job, index) => (
                    <TableRow key={job.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-purple-700">
                            {job.job_number}
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
                            ${job.estimated_total.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${job.hourly_rate}/hr
                          </div>
                          {job.is_paid && (
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Paid
                            </Badge>
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
