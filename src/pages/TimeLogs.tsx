
import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Clock, CheckCircle, XCircle, Edit, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const TimeLogs = () => {
  const { timeEntries, isLoading, approveTimeEntry, rejectTimeEntry, updateTimeEntry } = useTimeEntries();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [editedHours, setEditedHours] = useState<number>(0);

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.employees?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.jobs?.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || entry.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const pendingCount = timeEntries.filter(entry => entry.status === 'pending').length;
  const approvedCount = timeEntries.filter(entry => entry.status === 'approved').length;
  const rejectedCount = timeEntries.filter(entry => entry.status === 'rejected').length;

  const handleReviewEntry = (entry: any) => {
    setSelectedEntry(entry);
    setEditedHours(entry.hours_worked);
    setManagerNotes(entry.manager_notes || '');
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedEntry) {
      // Update hours if they were edited
      if (editedHours !== selectedEntry.hours_worked) {
        updateTimeEntry({
          id: selectedEntry.id,
          updates: { hours_worked: editedHours }
        });
      }
      
      approveTimeEntry({
        id: selectedEntry.id,
        managerNotes: managerNotes || undefined
      });
      
      setIsReviewDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const handleReject = () => {
    if (selectedEntry && managerNotes.trim()) {
      rejectTimeEntry({
        id: selectedEntry.id,
        managerNotes: managerNotes
      });
      
      setIsReviewDialogOpen(false);
      setSelectedEntry(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading time logs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Logs Management</h1>
          <p className="text-gray-600 mt-2">Review and approve employee hour submissions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Submissions</p>
          <p className="text-2xl font-bold text-gray-900">{timeEntries.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by employee or client..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job/Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {entry.employees?.name || 'Unknown Employee'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {entry.jobs?.client_name || 'Unknown Client'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {entry.jobs?.job_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.entry_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.hours_worked}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${entry.hourly_rate}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(entry.hours_worked * entry.hourly_rate).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReviewEntry(entry)}
                      className="mr-2"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredEntries.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No time entries found matching your criteria.
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Review Time Entry</DialogTitle>
          </DialogHeader>
          
          {selectedEntry && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900">{selectedEntry.employees?.name}</h3>
                <p className="text-sm text-gray-600">{selectedEntry.jobs?.client_name} - {selectedEntry.jobs?.job_date}</p>
                <p className="text-sm text-gray-600">Submitted: {selectedEntry.entry_date}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hours Worked
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={editedHours}
                  onChange={(e) => setEditedHours(parseFloat(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Original: {selectedEntry.hours_worked}h
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manager Notes
                </label>
                <textarea
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Add notes about this time entry..."
                />
              </div>
              
              {selectedEntry.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employee Notes
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {selectedEntry.notes}
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={!managerNotes.trim()}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
