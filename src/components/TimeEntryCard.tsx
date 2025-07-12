import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, User, Calendar, DollarSign, Edit, CheckCircle, XCircle, CreditCard, Gift } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeEntries';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onApprove: (id: string) => void;
  onReject: ({ id, reason }: { id: string; reason?: string }) => void;
  onResetStatus: (id: string) => void;
  onMarkAsPaid: (id: string) => void;
  onMarkAsUnpaid: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<TimeEntry>) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
  isMarkingAsPaid?: boolean;
  isMarkingAsUnpaid?: boolean;
}

export const TimeEntryCard = ({ 
  entry, 
  onApprove, 
  onReject, 
  onResetStatus,
  onMarkAsPaid,
  onMarkAsUnpaid,
  onUpdateEntry,
  isApproving = false,
  isRejecting = false,
  isMarkingAsPaid = false,
  isMarkingAsUnpaid = false
}: TimeEntryCardProps) => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [editedEntry, setEditedEntry] = useState(entry);
  const [rejectReason, setRejectReason] = useState('');

  const employee = employees.find(emp => emp.id === entry.employee_id);
  const job = jobs.find(j => j.id === entry.job_id);

  // Filter jobs to ensure no empty values
  const validJobs = jobs.filter(job => job.id && job.id.trim() !== '');

  // Calculate totals for display
  const calculatePreviewTotals = () => {
    const regularPay = (editedEntry.regular_hours || 0) * (editedEntry.hourly_rate || 0);
    const overtimePay = (editedEntry.overtime_hours || 0) * (editedEntry.overtime_rate || editedEntry.hourly_rate || 0);
    const yourTipToEmployee = editedEntry.tip_amount || 0; // YOUR tip to the employee
    const totalPay = regularPay + overtimePay + yourTipToEmployee;
    
    return {
      regularPay,
      overtimePay,
      yourTipToEmployee,
      totalPay
    };
  };

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
    try {
      return format(new Date(timeString), 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const totalHours = (entry.regular_hours || 0) + (entry.overtime_hours || 0);

  const handleSaveEdit = () => {
    console.log('Saving edited entry:', editedEntry);
    
    // Only pass the changed fields
    const updates: Partial<TimeEntry> = {};
    
    if (editedEntry.regular_hours !== entry.regular_hours) {
      updates.regular_hours = editedEntry.regular_hours;
    }
    if (editedEntry.overtime_hours !== entry.overtime_hours) {
      updates.overtime_hours = editedEntry.overtime_hours;
    }
    if (editedEntry.tip_amount !== entry.tip_amount) {
      updates.tip_amount = editedEntry.tip_amount;
    }
    if (editedEntry.job_id !== entry.job_id) {
      updates.job_id = editedEntry.job_id;
    }
    if (editedEntry.notes !== entry.notes) {
      updates.notes = editedEntry.notes;
    }
    
    console.log('Updates to apply:', updates);
    onUpdateEntry(entry.id, updates);
    setEditDialogOpen(false);
  };

  const handleRejectWithReason = () => {
    console.log('Rejecting entry with reason:', rejectReason);
    onReject({ id: entry.id, reason: rejectReason });
    setRejectDialogOpen(false);
    setRejectReason('');
  };

  const handleApprove = () => {
    console.log('Approving entry:', entry.id);
    onApprove(entry.id);
  };

  const handleMarkAsPaid = () => {
    console.log('Marking as paid:', entry.id);
    onMarkAsPaid(entry.id);
  };

  const handleMarkAsUnpaid = () => {
    console.log('Marking as unpaid:', entry.id);
    onMarkAsUnpaid(entry.id);
  };

  const handleResetStatus = () => {
    console.log('Resetting status:', entry.id);
    onResetStatus(entry.id);
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
                  <strong>Total Pay:</strong> ${entry.total_pay.toFixed(2)}
                </>
              )}
            </span>
          </div>

          {entry.tip_amount && entry.tip_amount > 0 && (
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-blue-500" />
              <span className="text-blue-600">
                <strong>Your Tip to Employee:</strong> ${entry.tip_amount.toFixed(2)}
              </span>
            </div>
          )}

          {entry.job_id && job && (
            <div className="text-gray-600">
              <strong>Job:</strong> {job.job_number} - {job.client_name}
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
                      min="0"
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
                      min="0"
                      value={editedEntry.overtime_hours || 0}
                      onChange={(e) => setEditedEntry({...editedEntry, overtime_hours: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tip_amount">Your Tip to Employee ($)</Label>
                  <Input
                    id="tip_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editedEntry.tip_amount || 0}
                    onChange={(e) => setEditedEntry({...editedEntry, tip_amount: parseFloat(e.target.value) || 0})}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is YOUR tip to the employee (comes from your revenue)</p>
                </div>
                <div>
                  <Label htmlFor="job_assignment">Assign to Job</Label>
                  <Select 
                    value={editedEntry.job_id || 'unassigned'} 
                    onValueChange={(value) => setEditedEntry({...editedEntry, job_id: value === 'unassigned' ? null : value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select job (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No Job Assignment</SelectItem>
                      {validJobs.map((job) => (
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
                
                {/* Live calculation preview */}
                {(editedEntry.regular_hours || editedEntry.overtime_hours || editedEntry.tip_amount) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Pay Preview</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      {editedEntry.regular_hours > 0 && (
                        <div>Regular: {editedEntry.regular_hours}h × ${editedEntry.hourly_rate} = ${calculatePreviewTotals().regularPay.toFixed(2)}</div>
                      )}
                      {editedEntry.overtime_hours > 0 && (
                        <div>Overtime: {editedEntry.overtime_hours}h × ${editedEntry.overtime_rate || editedEntry.hourly_rate} = ${calculatePreviewTotals().overtimePay.toFixed(2)}</div>
                      )}
                      {editedEntry.tip_amount > 0 && (
                        <div className="text-blue-600">Your Tip: ${editedEntry.tip_amount.toFixed(2)}</div>
                      )}
                      <div className="font-bold border-t pt-1">
                        Total Pay: ${calculatePreviewTotals().totalPay.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
                
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

          {entry.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={handleApprove}
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
              onClick={handleMarkAsPaid}
              disabled={isMarkingAsPaid}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              {isMarkingAsPaid ? 'Processing...' : 'Mark as Paid'}
            </Button>
          )}

          {entry.status === 'approved' && entry.is_paid && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAsUnpaid}
              disabled={isMarkingAsUnpaid}
              className="border-red-500 text-red-600 hover:bg-red-50"
            >
              <CreditCard className="h-4 w-4 mr-1" />
              {isMarkingAsUnpaid ? 'Processing...' : 'Mark as Unpaid'}
            </Button>
          )}
          
          {(entry.status === 'approved' || entry.status === 'rejected') && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetStatus}
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
