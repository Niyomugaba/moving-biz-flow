import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useJobs } from '@/hooks/useJobs';
import { Clock, User, Calendar, LogOut, CheckCircle, XCircle, AlertCircle, Truck, DollarSign, BarChart3, Plus, Home, RefreshCw } from 'lucide-react';

interface EmployeeData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  hourly_wage: number;
  status: string;
  hire_date: string;
  pin?: string;
}

interface EmployeeDashboardProps {
  employee: EmployeeData;
  onLogout: () => void;
}

export const EmployeeDashboard = ({ employee, onLogout }: EmployeeDashboardProps) => {
  const { toast } = useToast();
  const { timeEntries, addTimeEntry, isAddingTimeEntry, refetchTimeEntries } = useTimeEntries();
  const { jobs = [], refetchJobs } = useJobs();
  const queryClient = useQueryClient();

  // Force component re-render when timeEntries change
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  React.useEffect(() => {
    setLastUpdateTime(Date.now());
  }, [timeEntries]);
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [notes, setNotes] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60);
  };

  const handleSubmitHours = async () => {
    if (!startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please enter both start and end times.",
        variant: "destructive"
      });
      return;
    }

    const totalHours = calculateHours(startTime, endTime);
    if (totalHours <= 0) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time.",
        variant: "destructive"
      });
      return;
    }

    const regularHours = Math.min(totalHours, 8);
    const overtimeHours = Math.max(0, totalHours - 8);

    try {
      const today = new Date().toISOString().split('T')[0];
      await addTimeEntry({
        employee_id: employee.id,
        job_id: selectedJob || undefined,
        entry_date: today,
        clock_in_time: `${today}T${startTime}:00`,
        clock_out_time: `${today}T${endTime}:00`,
        regular_hours: regularHours,
        overtime_hours: overtimeHours > 0 ? overtimeHours : undefined,
        hourly_rate: employee.hourly_wage,
        overtime_rate: overtimeHours > 0 ? employee.hourly_wage * 1.5 : undefined,
        notes: notes || undefined
      });

      // Reset form after successful submission
      setStartTime('');
      setEndTime('');
      setSelectedJob('');
      setNotes('');
      
      toast({
        title: "Hours Submitted Successfully",
        description: "Your work hours have been submitted for approval.",
      });
    } catch (error) {
      console.error('Error submitting hours:', error);
      toast({
        title: "Error Submitting Hours",
        description: "There was an error submitting your hours. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      console.log('Starting refresh...');
      
      // Force fresh data by invalidating queries first
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      
      // Then refetch with force to bypass cache
      const [timeEntriesResult, jobsResult] = await Promise.all([
        refetchTimeEntries(),
        refetchJobs()
      ]);
      
      console.log('Refresh completed:', {
        timeEntries: timeEntriesResult.data?.length,
        jobs: jobsResult.data?.length
      });
      
      toast({
        title: "Data Refreshed",
        description: "Your dashboard has been updated with the latest information.",
      });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({
        title: "Refresh Failed", 
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh when component mounts or when active tab changes
  React.useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'earnings') {
      handleRefresh();
    }
  }, [activeTab]);

  // Filter time entries for this employee
  const employeeTimeEntries = timeEntries.filter(entry => entry.employee_id === employee.id);
  const paidEntries = employeeTimeEntries.filter(entry => entry.is_paid);
  const approvedEntries = employeeTimeEntries.filter(entry => entry.status === 'approved' && !entry.is_paid);
  const pendingEntries = employeeTimeEntries.filter(entry => entry.status === 'pending');
  
  // Calculate totals
  const totalHoursWorked = employeeTimeEntries.reduce((sum, entry) => 
    sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0
  );
  
  const totalEarned = paidEntries.reduce((sum, entry) => sum + (entry.total_pay || 0), 0);
  const pendingEarnings = approvedEntries.reduce((sum, entry) => sum + (entry.total_pay || 0), 0);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  const formatTimeDisplay = (timeString: string) => {
    const timePart = timeString.split('T')[1]?.split('.')[0] || timeString;
    const [hours, minutes] = timePart.split(':');
    
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 < 12 ? 'AM' : 'PM';
    
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getPaymentStatusBadge = (entry: any) => {
    if (entry.is_paid) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>;
    } else if (entry.status === 'approved') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Approved - Payment Pending</span>;
    } else if (entry.status === 'rejected') {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Rejected</span>;
    } else {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending Approval</span>;
    }
  };

  const TabButton = ({ id, icon: Icon, label, isActive, onClick }: any) => (
    <button
      onClick={() => onClick(id)}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${
        isActive 
          ? 'bg-purple-600 text-white shadow-lg' 
          : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-200'
      }`}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
                alt="Bantu Movers Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="text-2xl font-bold text-purple-800">Mover Dashboard</h1>
                <p className="text-sm text-purple-600">Welcome back, {employee.name}!</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="relative">
          <div className="grid grid-cols-4 gap-4 mb-8">
            <TabButton 
              id="dashboard" 
              icon={Home} 
              label="Dashboard" 
              isActive={activeTab === 'dashboard'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="submit" 
              icon={Plus} 
              label="Submit Hours" 
              isActive={activeTab === 'submit'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="earnings" 
              icon={DollarSign} 
              label="My Earnings" 
              isActive={activeTab === 'earnings'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="profile" 
              icon={User} 
              label="My Profile" 
              isActive={activeTab === 'profile'} 
              onClick={setActiveTab} 
            />
          </div>
          
          {/* Refresh button - positioned in top right corner */}
          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            className="absolute top-0 right-0 border-purple-300 text-purple-700 hover:bg-purple-50 bg-white shadow-md"
            disabled={isRefreshing}
            title="Refresh data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Current Time */}
            <Card className="bg-purple-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Current Time</h3>
                    <div className="text-3xl font-mono">
                      {currentTime.toLocaleTimeString()}
                    </div>
                    <div className="text-purple-100 mt-1">
                      {currentTime.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  </div>
                  <Clock className="h-16 w-16 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-700 text-sm font-medium">Total Hours</p>
                      <p className="text-2xl font-bold text-yellow-800">{totalHoursWorked.toFixed(1)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-700 text-sm font-medium">Total Paid</p>
                      <p className="text-2xl font-bold text-green-800">${totalEarned.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 text-sm font-medium">Pending Payment</p>
                      <p className="text-2xl font-bold text-blue-800">${pendingEarnings.toFixed(2)}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 text-sm font-medium">Pending Approval</p>
                      <p className="text-2xl font-bold text-purple-800">{pendingEntries.length}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">Recent Time Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {employeeTimeEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTimeDisplay(entry.clock_in_time)} - {entry.clock_out_time ? formatTimeDisplay(entry.clock_out_time) : 'In Progress'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {((entry.regular_hours || 0) + (entry.overtime_hours || 0)).toFixed(1)} hours
                        {entry.job_id && (
                          <span className="ml-2 text-purple-600">
                            • Job: {jobs.find(j => j.id === entry.job_id)?.job_number || 'Unknown'}
                          </span>
                        )}
                      </div>
                      {entry.manager_notes && (
                        <div className="text-sm text-red-600 mt-1">
                          Manager Note: {entry.manager_notes}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        ${(entry.total_pay || 0).toFixed(2)}
                      </div>
                      <div className="mt-1">
                        {getPaymentStatusBadge(entry)}
                      </div>
                    </div>
                  </div>
                ))}
                {employeeTimeEntries.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    No time entries yet. Submit your first entry!
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Submit Hours Tab */}
        {activeTab === 'submit' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-800">Submit Work Hours</CardTitle>
              <CardDescription>Enter your start and end times for today</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="job">Job (Optional)</Label>
                <Select value={selectedJob} onValueChange={setSelectedJob}>
                  <SelectTrigger className="border-purple-200 focus:border-purple-500">
                    <SelectValue placeholder="Select a job (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.job_number} - {job.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes about your work today..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="border-purple-200 focus:border-purple-500"
                />
              </div>

              {startTime && endTime && (
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-purple-800 font-medium">
                    Total Hours: <span className="text-lg">{calculateHours(startTime, endTime).toFixed(2)}</span>
                  </p>
                </div>
              )}

              <Button 
                onClick={handleSubmitHours}
                disabled={isAddingTimeEntry || !startTime || !endTime}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isAddingTimeEntry ? 'Submitting...' : 'Submit Hours'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">Earnings Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Total Paid Earnings</h3>
                    <p className="text-3xl font-bold text-green-600">${totalEarned.toFixed(2)}</p>
                    <p className="text-sm text-green-600 mt-1">{paidEntries.length} paid entries</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">Approved (Pending Payment)</h3>
                    <p className="text-3xl font-bold text-blue-600">${pendingEarnings.toFixed(2)}</p>
                    <p className="text-sm text-blue-600 mt-1">{approvedEntries.length} approved entries</p>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2">Pending Approval</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      ${pendingEntries.reduce((sum, e) => sum + (e.total_pay || 0), 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-yellow-600 mt-1">{pendingEntries.length} pending entries</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Earnings History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">Earnings History</CardTitle>
                <CardDescription>Detailed breakdown of all your work entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {employeeTimeEntries.map((entry) => (
                    <div key={entry.id} className={`p-4 rounded-lg border ${
                      entry.is_paid ? 'bg-green-50 border-green-200' :
                      entry.status === 'approved' ? 'bg-blue-50 border-blue-200' :
                      entry.status === 'rejected' ? 'bg-red-50 border-red-200' :
                      'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">
                            {new Date(entry.entry_date).toLocaleDateString()}
                            {entry.job_id && (
                              <span className="ml-2 text-sm text-gray-600">
                                • Job: {jobs.find(j => j.id === entry.job_id)?.job_number || 'Unknown'}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {((entry.regular_hours || 0) + (entry.overtime_hours || 0)).toFixed(1)} hours worked
                            {entry.regular_hours && entry.overtime_hours && entry.overtime_hours > 0 && (
                              <span className="ml-2">
                                ({entry.regular_hours}h regular + {entry.overtime_hours}h overtime)
                              </span>
                            )}
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-600 mt-1 italic">
                              Note: {entry.notes}
                            </div>
                          )}
                          {entry.manager_notes && (
                            <div className="text-sm text-red-600 mt-1">
                              Manager Note: {entry.manager_notes}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            ${(entry.total_pay || 0).toFixed(2)}
                          </div>
                          <div className="mt-1">
                            {getPaymentStatusBadge(entry)}
                          </div>
                          {entry.is_paid && entry.paid_at && (
                            <div className="text-xs text-green-600 mt-1">
                              Paid: {new Date(entry.paid_at).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {employeeTimeEntries.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      No earnings history yet.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-medium">Name:</span>
                    <span className="font-semibold text-purple-800">{employee.name}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-medium">Phone:</span>
                    <span className="font-semibold text-purple-800">{employee.phone}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-medium">Email:</span>
                    <span className="font-semibold text-purple-800">{employee.email || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {employee.pin && (
                    <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="text-purple-700 font-medium">PIN:</span>
                      <span className="font-semibold text-purple-800 font-mono">****{employee.pin.slice(-2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-medium">Hire Date:</span>
                    <span className="font-semibold text-purple-800">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-purple-700 font-medium">Status:</span>
                    <span className="font-semibold text-green-600 capitalize">{employee.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
