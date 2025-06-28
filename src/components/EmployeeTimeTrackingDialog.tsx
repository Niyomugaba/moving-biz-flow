
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useEmployees } from '@/hooks/useEmployees';
import { useJobs } from '@/hooks/useJobs';
import { useTimeEntries } from '@/hooks/useTimeEntries';

interface EmployeeTimeTrackingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EmployeeTimeTrackingDialog = ({ open, onOpenChange }: EmployeeTimeTrackingDialogProps) => {
  const { employees } = useEmployees();
  const { jobs } = useJobs();
  const { addTimeEntry } = useTimeEntries();
  const [step, setStep] = useState<'pin' | 'timeEntry'>('pin');
  const [pin, setPin] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [timeEntryData, setTimeEntryData] = useState({
    jobId: '',
    hoursWorked: '',
    notes: ''
  });

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Find employee by their ID (using last 4 digits as PIN)
    const employee = employees.find(emp => emp.id.slice(-4) === pin);
    if (employee) {
      setSelectedEmployee(employee);
      setStep('timeEntry');
    } else {
      alert('Invalid PIN. Please try again.');
    }
  };

  const handleTimeEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedJob = jobs.find(job => job.id === timeEntryData.jobId);
    
    if (selectedJob && selectedEmployee) {
      addTimeEntry({
        employee_id: selectedEmployee.id,
        job_id: timeEntryData.jobId,
        hours_worked: parseFloat(timeEntryData.hoursWorked),
        hourly_rate: selectedEmployee.hourly_wage,
        entry_date: new Date().toISOString().split('T')[0],
        notes: timeEntryData.notes || null
      });
      
      // Reset form
      setStep('pin');
      setPin('');
      setSelectedEmployee(null);
      setTimeEntryData({
        jobId: '',
        hoursWorked: '',
        notes: ''
      });
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setStep('pin');
    setPin('');
    setSelectedEmployee(null);
    setTimeEntryData({
      jobId: '',
      hoursWorked: '',
      notes: ''
    });
    onOpenChange(false);
  };

  const completedJobs = jobs.filter(job => job.status === 'Completed');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Employee Time Tracking</DialogTitle>
        </DialogHeader>
        
        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Your 4-Digit PIN
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Your PIN is the last 4 digits of your employee ID
              </p>
              <input
                type="password"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-center text-2xl tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••"
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Continue
              </Button>
            </div>
          </form>
        )}

        {step === 'timeEntry' && selectedEmployee && (
          <form onSubmit={handleTimeEntrySubmit} className="space-y-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                Welcome, <strong>{selectedEmployee.name}</strong>!
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Job
              </label>
              <select
                required
                value={timeEntryData.jobId}
                onChange={(e) => setTimeEntryData({ ...timeEntryData, jobId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a completed job...</option>
                {completedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.client_name} - {job.job_date}
                  </option>
                ))}
              </select>
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
                required
                value={timeEntryData.hoursWorked}
                onChange={(e) => setTimeEntryData({ ...timeEntryData, hoursWorked: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={timeEntryData.notes}
                onChange={(e) => setTimeEntryData({ ...timeEntryData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep('pin')} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1">
                Submit Hours
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
