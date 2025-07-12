import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { useJobs } from '@/hooks/useJobs';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Clock, Zap, DollarSign, AlertCircle } from 'lucide-react';

interface AddTimeEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTimeEntryDialog = ({ open, onOpenChange }: AddTimeEntryDialogProps) => {
  const { employees } = useEmployees();
  const { jobs } = useJobs();
  const { addTimeEntry, isAddingTimeEntry } = useTimeEntries();
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('no-job');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [clockInTime, setClockInTime] = useState('');
  const [clockOutTime, setClockOutTime] = useState('');
  const [tipAmount, setTipAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  const selectedJob = jobs.find(job => job.id === selectedJobId);
  
  // Auto-populate job data when job is selected
  useEffect(() => {
    if (selectedJob && selectedJob.id !== 'no-job') {
      console.log('Selected job changed:', selectedJob);
      
      // Set job date
      setEntryDate(selectedJob.job_date);
      
      // Set start time from job
      setClockInTime(selectedJob.start_time);
      
      // Auto-calculate end time if hours_worked is available
      if (selectedJob.hours_worked && selectedJob.start_time) {
        const [hours, minutes] = selectedJob.start_time.split(':');
        const startTime = new Date();
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(endTime.getHours() + selectedJob.hours_worked);
        
        const endTimeString = endTime.toTimeString().slice(0, 5);
        setClockOutTime(endTimeString);
        
        console.log('Auto-calculated end time:', endTimeString);
      }
      
      // Add helpful note about the job
      setNotes(`Work completed for job ${selectedJob.job_number} - ${selectedJob.client_name}`);
    }
  }, [selectedJob]);

  // Filter jobs to prioritize completed ones and ensure they have valid IDs
  const validJobs = jobs.filter(job => job.id && job.id.trim() !== '');
  const completedJobs = validJobs.filter(job => job.status === 'completed');
  const otherJobs = validJobs.filter(job => job.status !== 'completed');
  const sortedJobs = [...completedJobs, ...otherJobs];
  
  const calculateHours = () => {
    if (!clockInTime || !clockOutTime) return 0;
    
    try {
      const clockIn = new Date(`${entryDate}T${clockInTime}`);
      const clockOut = new Date(`${entryDate}T${clockOutTime}`);
      const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
      
      return Math.max(0, totalMinutes / 60);
    } catch (error) {
      console.error('Error calculating hours:', error);
      return 0;
    }
  };

  const totalHours = calculateHours();
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);

  const validateForm = () => {
    const errors: string[] = [];
    
    if (!selectedEmployeeId) {
      errors.push('Employee is required');
    }
    
    if (!entryDate) {
      errors.push('Date is required');
    }
    
    if (!clockInTime) {
      errors.push('Start time is required');
    }
    
    if (!clockOutTime) {
      errors.push('End time is required');
    }
    
    if (clockInTime && clockOutTime && totalHours <= 0) {
      errors.push('End time must be after start time');
    }
    
    if (parseFloat(tipAmount) < 0) {
      errors.push('Tip amount cannot be negative');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const calculatePayPreview = () => {
    if (!selectedEmployee || totalHours <= 0) return null;
    
    const hourlyRate = selectedJob?.worker_hourly_rate || selectedEmployee.hourly_wage;
    const regularPay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * 1.5;
    const tipAmountNum = parseFloat(tipAmount) || 0;
    const totalPay = regularPay + overtimePay + tipAmountNum;
    
    return {
      hourlyRate,
      regularPay,
      overtimePay,
      tipAmountNum,
      totalPay
    };
  };

  const payPreview = calculatePayPreview();

  const handleSubmit = () => {
    console.log('Form submission started');
    
    if (!validateForm()) {
      console.error('Form validation failed:', validationErrors);
      return;
    }

    if (!selectedEmployee) {
      console.error('No employee selected');
      return;
    }

    // Create proper ISO timestamp strings
    const clockInDateTime = new Date(`${entryDate}T${clockInTime}`).toISOString();
    const clockOutDateTime = new Date(`${entryDate}T${clockOutTime}`).toISOString();

    // Use job's worker hourly rate if available, otherwise employee's wage
    const hourlyRate = selectedJob?.worker_hourly_rate || selectedEmployee.hourly_wage;

    const timeEntryData = {
      employee_id: selectedEmployeeId,
      job_id: selectedJobId === 'no-job' ? undefined : selectedJobId,
      entry_date: entryDate,
      clock_in_time: clockInDateTime,
      clock_out_time: clockOutDateTime,
      regular_hours: regularHours,
      overtime_hours: overtimeHours > 0 ? overtimeHours : undefined,
      tip_amount: parseFloat(tipAmount) || 0,
      hourly_rate: hourlyRate,
      overtime_rate: overtimeHours > 0 ? hourlyRate * 1.5 : undefined,
      notes: notes || undefined
    };

    console.log('Creating time entry with data:', timeEntryData);

    addTimeEntry(timeEntryData);

    // Reset form
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setSelectedEmployeeId('');
    setSelectedJobId('no-job');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setClockInTime('');
    setClockOutTime('');
    setTipAmount('0');
    setNotes('');
    setValidationErrors([]);
  };

  const handleQuickFill = () => {
    if (selectedJob && selectedJob.hours_worked) {
      const defaultStartTime = selectedJob.start_time || '08:00';
      setClockInTime(defaultStartTime);
      
      const [hours, minutes] = defaultStartTime.split(':');
      const startTime = new Date();
      startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + selectedJob.hours_worked);
      
      const endTimeString = endTime.toTimeString().slice(0, 5);
      setClockOutTime(endTimeString);
      
      console.log('Quick fill applied:', { start: defaultStartTime, end: endTimeString });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Manually Add Time Entry
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-800">Please fix the following errors:</span>
              </div>
              <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job (Optional) *
            </label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select job (recommended)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-job">No job assigned</SelectItem>
                {completedJobs.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50">
                      ✅ Completed Jobs (Recommended)
                    </div>
                    {completedJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        <div className="flex items-center gap-2">
                          <span>{job.job_number} - {job.client_name}</span>
                          {job.hours_worked && (
                            <span className="text-xs text-green-600">
                              ({job.hours_worked}h @ ${job.worker_hourly_rate || job.hourly_rate}/hr)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </>
                )}
                {otherJobs.length > 0 && (
                  <>
                    <div className="px-2 py-1 text-xs font-medium text-gray-500">
                      Other Jobs
                    </div>
                    {otherJobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.job_number} - {job.client_name} ({job.status})
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.filter(emp => emp.id && emp.id.trim() !== '').map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    <div className="flex items-center gap-2">
                      <span>{employee.name}</span>
                      <span className="text-xs text-gray-500">
                        (${selectedJob?.worker_hourly_rate || employee.hourly_wage}/hr)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <Input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <Input
                type="time"
                value={clockInTime}
                onChange={(e) => setClockInTime(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <Input
                type="time"
                value={clockOutTime}
                onChange={(e) => setClockOutTime(e.target.value)}
              />
            </div>
          </div>

          {selectedJob && selectedJob.hours_worked && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-sm text-blue-700">
                  <strong>Job Info:</strong> {selectedJob.hours_worked} hours scheduled
                  {selectedJob.worker_hourly_rate && (
                    <span> @ ${selectedJob.worker_hourly_rate}/hr</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleQuickFill}
                  className="text-xs"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Quick Fill
                </Button>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Tip Amount (Optional)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          {/* Time and Pay Summary */}
          {totalHours > 0 && payPreview && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Time & Pay Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Total Hours: {totalHours.toFixed(2)}</div>
                <div>Regular Hours: {regularHours.toFixed(2)} × ${payPreview.hourlyRate} = ${payPreview.regularPay.toFixed(2)}</div>
                {overtimeHours > 0 && (
                  <div>Overtime Hours: {overtimeHours.toFixed(2)} × ${(payPreview.hourlyRate * 1.5).toFixed(2)} = ${payPreview.overtimePay.toFixed(2)}</div>
                )}
                {payPreview.tipAmountNum > 0 && (
                  <div className="text-green-600">Tip: ${payPreview.tipAmountNum.toFixed(2)}</div>
                )}
                <div className="font-medium border-t pt-1">
                  <strong>Total Pay: ${payPreview.totalPay.toFixed(2)}</strong>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this time entry..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4 sticky bottom-0 bg-white">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedEmployeeId || !clockInTime || !clockOutTime || isAddingTimeEntry || validationErrors.length > 0}
            className="flex-1"
          >
            {isAddingTimeEntry ? 'Adding...' : 'Add Entry'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
