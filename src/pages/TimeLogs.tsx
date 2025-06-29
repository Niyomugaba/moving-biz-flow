import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Clock,
  Download,
  Plus,
  CheckCircle,
  XCircle,
  Edit
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useJobs } from '@/hooks/useJobs';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { AddTimeEntryDialog } from '@/components/AddTimeEntryDialog';
import { format } from 'date-fns';

export const TimeLogs = () => {
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const { employees } = useEmployees();
  const { jobs } = useJobs();

  const { 
    timeEntries, 
    isLoading, 
    approveTimeEntry, 
    isApprovingTimeEntry,
    rejectTimeEntry,
    isRejectingTimeEntry
  } = useTimeEntries();

  const totalHours = useMemo(() => {
    if (!timeEntries) return 0;
    return timeEntries.reduce((sum, entry) => {
      const clockIn = new Date(entry.clock_in_time);
      const clockOut = new Date(entry.clock_out_time);
      const duration = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
      return sum + duration;
    }, 0);
  }, [timeEntries]);

  const filteredEntries = useMemo(() => {
    let filtered = timeEntries || [];

    if (employeeFilter) {
      filtered = filtered.filter(entry => entry.employee_id === employeeFilter);
    }

    if (jobFilter) {
      filtered = filtered.filter(entry => entry.job_id === jobFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(entry => {
        const entryDate = format(new Date(entry.entry_date), 'yyyy-MM-dd');
        return entryDate === dateFilter;
      });
    }

    return filtered;
  }, [timeEntries, employeeFilter, jobFilter, dateFilter]);

  const calculateHours = (clockInTime: string, clockOutTime: string) => {
    if (!clockInTime || !clockOutTime) return 0;
    
    const clockIn = new Date(clockInTime);
    const clockOut = new Date(clockOutTime);
    const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
    
    return Math.max(0, totalMinutes / 60);
  };

  const exportToCSV = () => {
    const csvRows = [];
    const headers = Object.keys(timeEntries[0]);
    csvRows.push(headers.join(','));

    for (const entry of timeEntries) {
      const values = headers.map(header => {
        const value = entry[header];
        return `"${value}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'time_entries.csv');
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Time Logs
          </CardTitle>
        </div>
        <CardDescription>
          Manage and review employee time entries.
        </CardDescription>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Time Entries</CardTitle>
            <CardDescription>All time entries in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Hours Logged</CardTitle>
            <CardDescription>Total hours logged by all employees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours?.toFixed(2) || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Hours per Entry</CardTitle>
            <CardDescription>Average hours logged per time entry</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(timeEntries?.length ? (totalHours / timeEntries.length).toFixed(2) : 0) || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Employee
          </label>
          <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by employee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Employees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Job
          </label>
          <Select value={jobFilter} onValueChange={setJobFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by job" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Jobs</SelectItem>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.client_name} - {job.job_date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={() => {
            setEmployeeFilter('');
            setJobFilter('');
            setDateFilter('');
          }} variant="outline">
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Entries
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <AddTimeEntryDialog 
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
              />
              <Button onClick={() => setShowAddDialog(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => {
                  const hours = calculateHours(entry.clock_in_time, entry.clock_out_time || '');
                  
                  return (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {employees.find(e => e.id === entry.employee_id)?.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {jobs.find(j => j.id === entry.job_id)?.client_name || 'No Job'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(entry.entry_date), 'MM/dd/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(entry.clock_in_time), 'h:mm a')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.clock_out_time ? format(new Date(entry.clock_out_time), 'h:mm a') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hours.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {entry.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => approveTimeEntry(entry.id)}
                              disabled={isApprovingTimeEntry}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => rejectTimeEntry(entry.id)}
                              disabled={isRejectingTimeEntry}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEntry(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Review Time Entry Dialog */}
      {selectedEntry && (
        <ReviewTimeEntryDialog
          open={!!selectedEntry}
          onOpenChange={() => setSelectedEntry(null)}
          entry={selectedEntry}
        />
      )}
    </div>
  );
};

interface ReviewTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: any;
}

const ReviewTimeEntryDialog = ({ open, onOpenChange, entry }: ReviewTimeEntryDialogProps) => {
  const [notes, setNotes] = useState(entry.notes || '');
  const { employees } = useEmployees();
  const { jobs } = useJobs();

  const employee = employees.find(e => e.id === entry.employee_id);
  const job = jobs.find(j => j.id === entry.job_id);

  const handleSaveNotes = () => {
    // Implement save notes functionality here
    onOpenChange(false);
  };

  return (
    <div>
      
    </div>
  );
};
