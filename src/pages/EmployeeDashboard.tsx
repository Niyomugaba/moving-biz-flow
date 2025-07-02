
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useJobs } from '@/hooks/useJobs';
import { Clock, User, Calendar, LogOut, CheckCircle, XCircle, AlertCircle, Truck, DollarSign, BarChart3, Plus, Home } from 'lucide-react';

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
  const { timeEntries, addTimeEntry, isAddingTimeEntry } = useTimeEntries();
  const { jobs = [] } = useJobs();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleSubmitHours = () => {
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

    const today = new Date().toISOString().split('T')[0];
    addTimeEntry({
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

    setStartTime('');
    setEndTime('');
    setSelectedJob('');
    setNotes('');
  };

  // Filter time entries for this employee
  const employeeTimeEntries = timeEntries.filter(entry => entry.employee_id === employee.id);
  const paidEntries = employeeTimeEntries.filter(entry => entry.is_paid);
  
  // Calculate totals
  const totalHoursWorked = employeeTimeEntries.reduce((sum, entry) => 
    sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0
  );
  
  const totalEarned = paidEntries.reduce((sum, entry) => sum + (entry.total_pay || 0), 0);
  
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
            <div className="grid md:grid-cols-3 gap-4">
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
                      <p className="text-green-700 text-sm font-medium">Total Earned</p>
                      <p className="text-2xl font-bold text-green-800">${totalEarned.toFixed(2)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-purple-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-700 text-sm font-medium">Pending Hours</p>
                      <p className="text-2xl font-bold text-purple-800">
                        {employeeTimeEntries.filter(e => e.status === 'pending').length}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent>
                {employeeTimeEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <div className="font-medium text-gray-900">
                        {new Date(entry.entry_date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatTimeDisplay(entry.clock_in_time)} - {entry.clock_out_time ? formatTimeDisplay(entry.clock_out_time) : 'In Progress'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {((entry.regular_hours || 0) + (entry.overtime_hours || 0)).toFixed(1)} hrs
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(entry.status)}`}>
                        {getStatusIcon(entry.status)}
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))}
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
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">Total Paid Earnings</h3>
                    <p className="text-3xl font-bold text-green-600">${totalEarned.toFixed(2)}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-semibold text-yellow-800 mb-2">Pending Earnings</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                      ${employeeTimeEntries
                        .filter(e => e.status === 'approved' && !e.is_paid)
                        .reduce((sum, e) => sum + (e.total_pay || 0), 0)
                        .toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-800">Job Earnings Breakdown</CardTitle>
                <CardDescription>Your earnings from paid jobs</CardDescription>
              </CardHeader>
              <CardContent>
                {paidEntries.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    No paid earnings yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paidEntries.map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <div className="font-medium text-green-800">
                            {new Date(entry.entry_date).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-green-600">
                            {((entry.regular_hours || 0) + (entry.overtime_hours || 0)).toFixed(1)} hours worked
                          </div>
                          {entry.notes && (
                            <div className="text-sm text-gray-600 mt-1">{entry.notes}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-700 text-lg">
                            ${(entry.total_pay || 0).toFixed(2)}
                          </div>
                          <div className="text-xs text-green-600">
                            Paid {entry.paid_at ? new Date(entry.paid_at).toLocaleDateString() : ''}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
