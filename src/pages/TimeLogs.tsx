import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import {
  Clock,
  Download,
  Plus,
  Filter,
  Archive
} from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useJobs } from '@/hooks/useJobs';
import { useTimeEntries, TimeEntry } from '@/hooks/useTimeEntries';
import { AddTimeEntryDialog } from '@/components/AddTimeEntryDialog';
import { TimeEntryCard } from '@/components/TimeEntryCard';
import { FilterBar } from '@/components/FilterBar';
import { PaginationControls } from '@/components/PaginationControls';

export const TimeLogs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  const { employees } = useEmployees();
  const { jobs } = useJobs();

  const { 
    timeEntries, 
    isLoading, 
    approveTimeEntry, 
    rejectTimeEntry,
    markAsPaid,
    markAsUnpaid,
    updateTimeEntry,
    isApprovingTimeEntry,
    isRejectingTimeEntry,
    isMarkingAsPaid,
    isMarkingAsUnpaid
  } = useTimeEntries();

  const totalHours = useMemo(() => {
    if (!timeEntries) return 0;
    return timeEntries.reduce((sum, entry) => {
      return sum + ((entry.regular_hours || 0) + (entry.overtime_hours || 0));
    }, 0);
  }, [timeEntries]);

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'paid', label: 'Paid' }
  ];

  const filteredEntries = useMemo(() => {
    let filtered = timeEntries || [];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        const employee = employees.find(e => e.id === entry.employee_id);
        const job = jobs.find(j => j.id === entry.job_id);
        return (
          employee?.name.toLowerCase().includes(searchLower) ||
          employee?.employee_number.toLowerCase().includes(searchLower) ||
          job?.job_number.toLowerCase().includes(searchLower) ||
          job?.client_name.toLowerCase().includes(searchLower) ||
          entry.notes?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid') {
        filtered = filtered.filter(entry => entry.is_paid);
      } else {
        filtered = filtered.filter(entry => entry.status === statusFilter);
      }
    }

    return filtered;
  }, [timeEntries, searchTerm, statusFilter, employees, jobs]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const handleResetStatus = (id: string) => {
    console.log('Resetting status to pending for entry:', id);
    updateTimeEntry({ 
      id, 
      updates: { 
        status: 'pending',
        approved_at: null,
        approved_by: null,
        manager_notes: null,
        is_paid: false,
        paid_at: null
      }
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    if (!timeEntries.length) return;
    
    const csvRows = [];
    const headers = [
      'Date', 'Employee', 'Job', 'Clock In', 'Clock Out', 
      'Regular Hours', 'Overtime Hours', 'Total Pay', 'Status', 'Paid'
    ];
    csvRows.push(headers.join(','));

    for (const entry of filteredEntries) {
      const employee = employees.find(e => e.id === entry.employee_id);
      const job = jobs.find(j => j.id === entry.job_id);
      
      const values = [
        entry.entry_date,
        employee?.name || 'Unknown',
        job?.job_number || 'No Job',
        new Date(entry.clock_in_time).toLocaleTimeString(),
        entry.clock_out_time ? new Date(entry.clock_out_time).toLocaleTimeString() : 'N/A',
        entry.regular_hours || 0,
        entry.overtime_hours || 0,
        entry.total_pay || 0,
        entry.status,
        entry.is_paid ? 'Yes' : 'No'
      ].map(value => `"${value}"`);
      
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

  const handleReject = (timeEntry: TimeEntry) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      rejectTimeEntry(timeEntry.id); // Pass only the ID as string
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading time entries...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Time Logs Management
          </CardTitle>
          <div className="flex gap-2">
            <Button onClick={exportToCSV} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => setShowAddDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          </div>
        </div>
        <CardDescription>
          Review, approve, and manage employee time entries and payments.
        </CardDescription>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {timeEntries?.filter(e => e.status === 'pending').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Approved (Unpaid)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {timeEntries?.filter(e => e.status === 'approved' && !e.is_paid).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        statusOptions={statusOptions}
        onClearFilters={handleClearFilters}
        placeholder="Search by employee, job, or notes..."
      />

      {/* Time Entries Grid */}
      <div className="grid gap-4">
        {paginatedEntries.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No time entries found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          paginatedEntries.map((entry) => (
            <TimeEntryCard
              key={entry.id}
              entry={entry}
              onApprove={approveTimeEntry}
              onReject={(id: string, reason?: string) => rejectTimeEntry(id)}
              onResetStatus={handleResetStatus}
              onMarkAsPaid={markAsPaid}
              onMarkAsUnpaid={markAsUnpaid}
              onUpdateEntry={(id: string, updates) => updateTimeEntry({ id, updates })}
              isApproving={isApprovingTimeEntry}
              isRejecting={isRejectingTimeEntry}
              isMarkingAsPaid={isMarkingAsPaid}
              isMarkingAsUnpaid={isMarkingAsUnpaid}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredEntries.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredEntries.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(items) => {
            setItemsPerPage(items);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Add Time Entry Dialog */}
      <AddTimeEntryDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};
