
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, User, CheckCircle } from 'lucide-react';
import { Job } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { format } from 'date-fns';

interface JobPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}

export const JobPaymentDialog = ({ open, onOpenChange, job }: JobPaymentDialogProps) => {
  const { employees } = useEmployees();
  const { addTimeEntry, isAddingTimeEntry } = useTimeEntries();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!job) return null;

  // Find dummy employees for this job
  const dummyEmployees = employees.filter(emp => 
    emp.notes?.includes(`Dummy employee created for job ${job.id}`) ||
    emp.position === 'dummy_worker'
  );

  const handleCreateTimeEntries = async () => {
    if (!job.hours_worked || !job.worker_hourly_rate || dummyEmployees.length === 0) {
      return;
    }

    setIsProcessing(true);

    try {
      // Create time entries for each dummy employee
      for (const employee of dummyEmployees) {
        const jobDate = new Date(job.job_date);
        const [hours, minutes] = job.start_time.split(':');
        const clockInTime = new Date(jobDate);
        clockInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const clockOutTime = new Date(clockInTime);
        clockOutTime.setHours(clockOutTime.getHours() + job.hours_worked);

        const regularHours = Math.min(job.hours_worked, 8);
        const overtimeHours = Math.max(0, job.hours_worked - 8);

        await new Promise(resolve => {
          addTimeEntry({
            employee_id: employee.id,
            job_id: job.id,
            entry_date: job.job_date,
            clock_in_time: clockInTime.toISOString(),
            clock_out_time: clockOutTime.toISOString(),
            regular_hours: regularHours,
            overtime_hours: overtimeHours,
            hourly_rate: job.worker_hourly_rate,
            overtime_rate: job.worker_hourly_rate * 1.5,
            notes: `Auto-generated payment for job ${job.job_number}`,
            tip_amount: 0
          });
          setTimeout(resolve, 500); // Small delay between entries
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error creating time entries:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPay = job.hours_worked && job.worker_hourly_rate ? 
    (Math.min(job.hours_worked, 8) * job.worker_hourly_rate + 
     Math.max(0, job.hours_worked - 8) * job.worker_hourly_rate * 1.5) * dummyEmployees.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Create Payment Entries - {job.job_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Job Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Client:</strong> {job.client_name}
                </div>
                <div>
                  <strong>Date:</strong> {format(new Date(job.job_date), 'MMM dd, yyyy')}
                </div>
                <div>
                  <strong>Hours Worked:</strong> {job.hours_worked || 'Not set'}
                </div>
                <div>
                  <strong>Hourly Rate:</strong> ${job.worker_hourly_rate || 'Not set'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dummy Employees */}
          <div>
            <h4 className="font-medium mb-2">Employees ({dummyEmployees.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dummyEmployees.map((employee) => (
                <Card key={employee.id}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{employee.name}</span>
                        <Badge variant="outline" className="text-xs">
                          Dummy Worker
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        ${employee.hourly_wage}/hr
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Payment Summary */}
          {job.hours_worked && job.worker_hourly_rate && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Payment Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Regular Hours (per employee):</strong> {Math.min(job.hours_worked, 8)}h
                  </div>
                  <div>
                    <strong>Overtime Hours (per employee):</strong> {Math.max(0, job.hours_worked - 8)}h
                  </div>
                  <div>
                    <strong>Pay per Employee:</strong> ${((Math.min(job.hours_worked, 8) * job.worker_hourly_rate) + (Math.max(0, job.hours_worked - 8) * job.worker_hourly_rate * 1.5)).toFixed(2)}
                  </div>
                  <div>
                    <strong>Total Payment:</strong> ${totalPay.toFixed(2)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCreateTimeEntries}
              disabled={isProcessing || isAddingTimeEntry || !job.hours_worked || !job.worker_hourly_rate || dummyEmployees.length === 0}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? 'Creating Entries...' : 'Create Time Entries'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>

          {(!job.hours_worked || !job.worker_hourly_rate) && (
            <div className="text-amber-600 text-sm bg-amber-50 p-3 rounded">
              <strong>Note:</strong> Hours worked and hourly rate must be set in the job details before creating payment entries.
            </div>
          )}

          {dummyEmployees.length === 0 && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
              <strong>Warning:</strong> No dummy employees found for this job. Make sure dummy employees were created when the job was set up.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
