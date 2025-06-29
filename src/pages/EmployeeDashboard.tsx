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
import { Clock, User, Calendar, LogOut, CheckCircle, XCircle, AlertCircle, Truck } from 'lucide-react';

interface EmployeeData {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  hourly_wage: number;
  status: string;
  hire_date: string;
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
      // Handle case where end time is next day
      endDate.setDate(endDate.getDate() + 1);
    }
    const diffMs = endDate.getTime() - startDate.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
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

    addTimeEntry({
      employee_id: employee.id,
      job_id: selectedJob || undefined,
      entry_date: new Date().toISOString().split('T')[0],
      clock_in_time: `${new Date().toISOString().split('T')[0]}T${startTime}:00`,
      clock_out_time: `${new Date().toISOString().split('T')[0]}T${endTime}:00`,
      regular_hours: regularHours,
      overtime_hours: overtimeHours > 0 ? overtimeHours : undefined,
      hourly_rate: employee.hourly_wage,
      overtime_rate: overtimeHours > 0 ? employee.hourly_wage * 1.5 : undefined,
      notes: notes || undefined
    });

    // Reset form
    setStartTime('');
    setEndTime('');
    setSelectedJob('');
    setNotes('');
  };

  // Filter time entries for this employee
  const employeeTimeEntries = timeEntries.filter(entry => entry.employee_id === employee.id);

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
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mover Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {employee.name}!</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Current Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Current Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-mono text-center p-4">
            {currentTime.toLocaleTimeString()}
          </div>
          <div className="text-center text-gray-600">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Work Hours</CardTitle>
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="job">Job (Optional)</Label>
            <Select value={selectedJob} onValueChange={setSelectedJob}>
              <SelectTrigger>
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
            />
          </div>

          {startTime && endTime && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Total Hours: <span className="font-semibold">{calculateHours(startTime, endTime).toFixed(2)}</span>
              </p>
            </div>
          )}

          <Button 
            onClick={handleSubmitHours}
            disabled={isAddingTimeEntry || !startTime || !endTime}
            className="w-full"
          >
            {isAddingTimeEntry ? 'Submitting...' : 'Submit Hours'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Your Submitted Hours</CardTitle>
          <CardDescription>Hours you've submitted and their approval status</CardDescription>
        </CardHeader>
        <CardContent>
          {employeeTimeEntries.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No hours submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {employeeTimeEntries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {new Date(entry.entry_date).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(entry.clock_in_time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      })} - {entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit',
                        hour12: true 
                      }) : 'In Progress'}
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-gray-500 mt-1">{entry.notes}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {((entry.regular_hours || 0) + (entry.overtime_hours || 0)).toFixed(2)} hrs
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusColor(entry.status)}`}>
                      {getStatusIcon(entry.status)}
                      {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                    </div>
                    {entry.manager_notes && (
                      <div className="text-xs text-gray-500 mt-1 max-w-32">
                        Manager: {entry.manager_notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Your Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{employee.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium">{employee.phone}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{employee.email || 'Not provided'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hourly Rate:</span>
            <span className="font-medium">${employee.hourly_wage}/hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Hire Date:</span>
            <span className="font-medium">
              {new Date(employee.hire_date).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
