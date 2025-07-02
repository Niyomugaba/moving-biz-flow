import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Calendar, DollarSign, Edit, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeEntries';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onResetStatus: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<TimeEntry>) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isMarkingAsPaid?: boolean;
}

export const TimeEntryCard = ({ 
  entry, 
  onApprove, 
  onReject, 
  onResetStatus,
  onMarkAsPaid,
  onUpdateEntry,
  isApproving = false,
  isRejecting = false,
  isMarkingAsPaid = false
}: TimeEntryCardProps) => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);
  const [rejectReason, setRejectReason] = useState('');

  // Find the employee for this entry
  const employee = employees.find(emp => emp.id === entry.employee_id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return entry.is_paid ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string, isPaid: boolean) => {
    if (status === 'approved' && isPaid) return 'PAID';
    if (status === 'approved' && !isPaid) return 'APPROVED';
    return status.toUpperCase();
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const totalHours = (entry.regular_hours || 0) + (entry.overtime_hours || 0);

  const handleSaveEdit = () => {
    const regularPay = (editedEntry.regular_hours || 0) * editedEntry.hourly_rate;
    const overtimePay = (editedEntry.overtime_hours || 0) * (editedEntry.overtime_rate || editedEntry.hourly_rate * 1.5);
    const totalPay = regularPay + overtimePay;

    onUpdateEntry(entry.id, {
      ...editedEntry,
      total_pay: totalPay
    });
    setEditDialogOpen(false);
  };

  const handleRejectWithReason = () => {
    onReject(entry.id, rejectReason);
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">
              {employee ? `${employee.name} (${employee.employee_number})` : `Employee ID: ${entry.employee_id.slice(0, 8)}`}
            </span>
          </div>
          <Badge className={getStatusColor(entry.status)}>
            {getStatusText(entry.status, entry.is_paid)}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(entry.entry_date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>
              <strong>Clock In:</strong> {formatTime(entry.clock_in_time)}
              {entry.clock_out_time && (
                <>
                  {' • '}
                  <strong>Clock Out:</strong> {formatTime(entry.clock_out_time)}
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>
              <strong>Hours:</strong> {totalHours.toFixed(1)}h
              {entry.total_pay && (
                <>
                  {' • '}
                  <strong>Pay:</strong> ${entry.total_pay.toFixed(2)}
                </>
              )}
            </span>
          </div>

          {entry.job_id && (
            <div className="text-gray-600">
              <strong>Job:</strong> {jobs.find(j => j.id === entry.job_id)?.job_number || 'Unknown Job'}
            </div>
          )}

          {entry.notes && (
            <div className="text-gray-600 italic">
              <strong>Notes:</strong> {entry.notes}
            </div>
          )}

          {entry.manager_notes && (
            <div className="text-red-600 text-sm">
              <strong>Manager Notes:</strong> {entry.manager_notes}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          {/* Edit Button - Always available */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Time Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="regular_hours">Regular Hours</Label>
                    <Input
                      id="regular_hours"
                      type="number"
                      step="0.25"
                      value={editedEntry.regular_hours || 0}
                      onChange={(e) => setEditedEntry({...editedEntry, regular_hours: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="overtime_hours">Overtime Hours</Label>
                    <Input
                      id="overtime_hours"
                      type="number"
                      step="0.25"
                      value={editedEntry.overtime_hours || 0}
                      onChange={(e) => setEditedEntry({...editedEntry, overtime_hours: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="job_assignment">Assign to Job</Label>
                  <Select 
                    value={editedEntry.job_id || ''} 
                    onValueChange={(value) => setEditedEntry({...editedEntry, job_id: value || null})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No Job Assignment</SelectItem>
                      {jobs.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.job_number} - {job.client_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editedEntry.notes || ''}
                    onChange={(e) => setEditedEntry({...editedEntry, notes: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveEdit} className="flex-1">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Status-based action buttons */}
          {entry.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(entry.id)}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
              
              <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={isRejecting}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Reject Time Entry</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="reject_reason">Reason for Rejection</Label>
                      <Textarea
                        id="reject_reason"
                        placeholder="Explain why this time entry is being rejected..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleRejectWithReason} 
                        variant="destructive" 
                        className="flex-1"
                        disabled={isRejecting}
                      >
                        {isRejecting ? 'Rejecting...' : 'Confirm Rejection'}
                      </Button>
                      <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
          
          {entry.status === 'approved' && !entry.is_paid && (
            <Button
              size="sm"
              onClick={() => onMarkAsPaid(entry.id)}
              disabled={isMarkingAsPaid}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              {isMarkingAsPaid ? 'Processing...' : 'Mark as Paid'}
            </Button>
          )}
          
          {(entry.status === 'approved' || entry.status === 'rejected') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResetStatus(entry.id)}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              Reset to Pending
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
