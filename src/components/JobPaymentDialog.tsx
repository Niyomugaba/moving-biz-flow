
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, DollarSign, User, CheckCircle, AlertCircle } from 'lucide-react';
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  if (!job) return null;

  // Find dummy employees for this job
  const dummyEmployees = employees.filter(emp => 
    emp.notes?.includes(`Dummy employee created for job ${job.id}`) ||
    emp.position === 'dummy_worker'
  );

  // Validation function
  const validateJobData = () => {
    const errors: string[] = [];
    
    if (!job.hours_worked || job.hours_worked <= 0) {
      errors.push('Hours worked must be greater than 0');
    }
    
    if (!job.worker_hourly_rate || job.worker_hourly_rate <= 0) {
      errors.push('Worker hourly rate must be greater than 0');
    }
    
    if (dummyEmployees.length === 0) {
      errors.push('No dummy employees found for this job');
    }
    
    if (!job.job_date) {
      errors.push('Job date is required');
    }
    
    if (!job.start_time) {
      errors.push('Start time is required');
    }
    
    setValidationErrors(errors);
    return errors.length === 0;
  };

  const calculatePaymentDetails = () => {
    if (!job.hours_worked || !job.worker_hourly_rate) {
      return {
        regularHours: 0,
        overtimeHours: 0,
        regularPay: 0,
        overtimePay: 0,
        totalPayPerEmployee: 0,
        totalPayAllEmployees: 0
      };
    }

    const regularHours = Math.min(job.hours_worked, 8);
    const overtimeHours = Math.max(0, job.hours_worked - 8);
    const regularPay = regularHours * job.worker_hourly_rate;
    const overtimePay = overtimeHours * (job.worker_hourly_rate * 1.5);
    const totalPayPerEmployee = regularPay + overtimePay;
    const totalPayAllEmployees = totalPayPerEmployee * dummyEmployees.length;

    return {
      regularHours,
      overtimeHours,
      regularPay,
      overtimePay,
      totalPayPerEmployee,
      totalPayAllEmployees
    };
  };

  const paymentDetails = calculatePaymentDetails();

  const handleCreateTimeEntries = async () => {
    console.log('Starting time entry creation process for job:', job.id);
    
    if (!validateJobData()) {
      console.error('Validation failed:', validationErrors);
      return;
    }

    setIsProcessing(true);

    try {
      const jobDate = new Date(job.job_date);
      const [hours, minutes] = job.start_time.split(':');
      const clockInTime = new Date(jobDate);
      clockInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const clockOutTime = new Date(clockInTime);
      clockOutTime.setHours(clockOutTime.getHours() + job.hours_worked);

      console.log('Creating time entries for', dummyEmployees.length, 'employees');
      console.log('Job details:', {
        date: job.job_date,
        startTime: job.start_time,
        hoursWorked: job.hours_worked,
        hourlyRate: job.worker_hourly_rate
      });

      // Create time entries for each dummy employee
      const creationPromises = dummyEmployees.map(async (employee, index) => {
        const timeEntryData = {
          employee_id: employee.id,
          job_id: job.id,
          entry_date: job.job_date,
          clock_in_time: clockInTime.toISOString(),
          clock_out_time: clockOutTime.toISOString(),
          regular_hours: paymentDetails.regularHours,
          overtime_hours: paymentDetails.overtimeHours > 0 ? paymentDetails.overtimeHours : undefined,
          hourly_rate: job.worker_hourly_rate,
          overtime_rate: paymentDetails.overtimeHours > 0 ? job.worker_hourly_rate * 1.5 : undefined,
          notes: `Auto-generated payment for job ${job.job_number}`,
          tip_amount: 0 // Default to 0 - you can add YOUR tips to employees later
        };

        console.log(`Creating time entry ${index + 1}/${dummyEmployees.length} for employee:`, employee.name, timeEntryData);

        return new Promise<void>((resolve, reject) => {
          addTimeEntry(timeEntryData);
          // Add a small delay between each entry to avoid overwhelming the system
          setTimeout(() => resolve(), 500);
        });
      });

      await Promise.all(creationPromises);
      
      console.log('All time entries created successfully');
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error creating time entries:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = validationErrors.length === 0;

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
          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Please fix the following issues:</span>
                </div>
                <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Job Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Client:</strong> {job.client_name}
                </div>
                <div>
                  <strong>Date:</strong> {job.job_date ? format(new Date(job.job_date), 'MMM dd, yyyy') : 'Not set'}
                </div>
                <div>
                  <strong>Hours Worked:</strong> {job.hours_worked || 'Not set'}
                </div>
                <div>
                  <strong>Hourly Rate:</strong> {job.worker_hourly_rate ? `$${job.worker_hourly_rate}` : 'Not set'}
                </div>
                <div>
                  <strong>Start Time:</strong> {job.start_time || 'Not set'}
                </div>
                <div>
                  <strong>Status:</strong> 
                  <Badge variant="outline" className="ml-2">
                    {job.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dummy Employees */}
          <div>
            <h4 className="font-medium mb-2">Employees ({dummyEmployees.length})</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {dummyEmployees.length === 0 ? (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-3">
                    <div className="text-yellow-700 text-sm">
                      No dummy employees found for this job. Make sure dummy employees were created when the job was set up.
                    </div>
                  </CardContent>
                </Card>
              ) : (
                dummyEmployees.map((employee) => (
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
                ))
              )}
            </div>
          </div>

          {/* Payment Summary */}
          {job.hours_worked && job.worker_hourly_rate && dummyEmployees.length > 0 && (
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Payment Summary (Base Pay Only)</span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Regular Hours (per employee):</strong> {paymentDetails.regularHours}h
                  </div>
                  <div>
                    <strong>Overtime Hours (per employee):</strong> {paymentDetails.overtimeHours}h
                  </div>
                  <div>
                    <strong>Regular Pay (per employee):</strong> ${paymentDetails.regularPay.toFixed(2)}
                  </div>
                  <div>
                    <strong>Overtime Pay (per employee):</strong> ${paymentDetails.overtimePay.toFixed(2)}
                  </div>
                  <div>
                    <strong>Base Pay per Employee:</strong> ${paymentDetails.totalPayPerEmployee.toFixed(2)}
                  </div>
                  <div>
                    <strong>Total Base Pay:</strong> ${paymentDetails.totalPayAllEmployees.toFixed(2)}
                  </div>
                </div>
                <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                  <strong>Note:</strong> You can add your own tips to employees later in the time entries section. This creates base pay entries only.
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleCreateTimeEntries}
              disabled={isProcessing || isAddingTimeEntry || !isFormValid}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {isProcessing ? 'Creating Entries...' : 'Create Base Pay Entries'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
