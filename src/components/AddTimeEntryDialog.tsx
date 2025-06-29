
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useEmployees } from '@/hooks/useEmployees';
import { useJobs } from '@/hooks/useJobs';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Clock, Plus } from 'lucide-react';

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
  const [breakMinutes, setBreakMinutes] = useState('30');
  const [notes, setNotes] = useState('');

  const selectedEmployee = employees.find(emp => emp.id === selectedEmployeeId);
  
  const calculateHours = () => {
    if (!clockInTime || !clockOutTime) return 0;
    
    const clockIn = new Date(`${entryDate}T${clockInTime}`);
    const clockOut = new Date(`${entryDate}T${clockOutTime}`);
    const totalMinutes = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60);
    const workMinutes = totalMinutes - (parseInt(breakMinutes) || 0);
    
    return Math.max(0, workMinutes / 60);
  };

  const totalHours = calculateHours();
  const regularHours = Math.min(totalHours, 8);
  const overtimeHours = Math.max(0, totalHours - 8);

  const handleSubmit = () => {
    if (!selectedEmployeeId || !clockInTime || !clockOutTime || !selectedEmployee) {
      return;
    }

    // Create proper datetime strings without forcing UTC
    const clockInDateTime = `${entryDate}T${clockInTime}:00`;
    const clockOutDateTime = `${entryDate}T${clockOutTime}:00`;

    addTimeEntry({
      employee_id: selectedEmployeeId,
      job_id: selectedJobId === 'no-job' ? undefined : selectedJobId,
      entry_date: entryDate,
      clock_in_time: clockInDateTime,
      clock_out_time: clockOutDateTime,
      regular_hours: regularHours,
      overtime_hours: overtimeHours > 0 ? overtimeHours : undefined,
      break_duration_minutes: parseInt(breakMinutes) || 0,
      hourly_rate: selectedEmployee.hourly_wage,
      overtime_rate: overtimeHours > 0 ? selectedEmployee.hourly_wage * 1.5 : undefined,
      notes: notes || undefined
    });

    // Reset form
    setSelectedEmployeeId('');
    setSelectedJobId('no-job');
    setEntryDate(new Date().toISOString().split('T')[0]);
    setClockInTime('');
    setClockOutTime('');
    setBreakMinutes('30');
    setNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Manually Add Time Entry
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name} (${employee.hourly_wage}/hr)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job (Optional)
            </label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger>
                <SelectValue placeholder="Select job (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-job">No job assigned</SelectItem>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Break Duration (minutes)
            </label>
            <Input
              type="number"
              min="0"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(e.target.value)}
              placeholder="30"
            />
          </div>

          {totalHours > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">Time Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>Total Hours: {totalHours.toFixed(2)}</div>
                <div>Regular Hours: {regularHours.toFixed(2)}</div>
                {overtimeHours > 0 && (
                  <div>Overtime Hours: {overtimeHours.toFixed(2)}</div>
                )}
                {selectedEmployee && (
                  <div className="font-medium">
                    Total Pay: ${((regularHours * selectedEmployee.hourly_wage) + 
                    (overtimeHours * selectedEmployee.hourly_wage * 1.5)).toFixed(2)}
                  </div>
                )}
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

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedEmployeeId || !clockInTime || !clockOutTime || isAddingTimeEntry}
              className="flex-1"
            >
              {isAddingTimeEntry ? 'Adding...' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
