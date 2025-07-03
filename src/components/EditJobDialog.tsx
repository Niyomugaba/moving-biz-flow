
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useJobs, Job } from '@/hooks/useJobs';
import { TruckExpenseDialog } from './TruckExpenseDialog';

interface EditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}

export const EditJobDialog = ({ open, onOpenChange, job }: EditJobDialogProps) => {
  const { updateJob } = useJobs();
  const [showTruckExpenses, setShowTruckExpenses] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState('');
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [completionData, setCompletionData] = useState({
    hours: '',
    isPaid: false,
    paymentMethod: '',
    notes: '',
    satisfaction: ''
  });
  const [formData, setFormData] = useState({
    status: job?.status || 'scheduled',
    actualHours: job?.actual_duration_hours?.toString() || '',
    actualTotal: job?.actual_total?.toString() || '',
    completionNotes: job?.completion_notes || '',
    customerSatisfaction: job?.customer_satisfaction?.toString() || '',
    isPaid: job?.is_paid || false,
    paymentMethod: job?.payment_method || '',
    jobDate: job?.job_date || '',
    startTime: job?.start_time || ''
  });

  React.useEffect(() => {
    if (job) {
      setFormData({
        status: job.status,
        actualHours: job.actual_duration_hours?.toString() || '',
        actualTotal: job.actual_total?.toString() || '',
        completionNotes: job.completion_notes || '',
        customerSatisfaction: job.customer_satisfaction?.toString() || '',
        isPaid: job.is_paid,
        paymentMethod: job.payment_method || '',
        jobDate: job.job_date || '',
        startTime: job.start_time || ''
      });
      setRescheduleDate(undefined);
      setScheduleTime('');
      setShowCompletionPrompt(false);
      setCompletionData({
        hours: '',
        isPaid: false,
        paymentMethod: '',
        notes: '',
        satisfaction: ''
      });
    }
  }, [job]);

  const handleStatusChange = (newStatus: Job['status']) => {
    if (newStatus === 'completed') {
      setShowCompletionPrompt(true);
      return;
    }
    setFormData({ ...formData, status: newStatus });
  };

  const handleCompletionSubmit = () => {
    if (!completionData.hours || !job) return;

    const hours = parseFloat(completionData.hours);
    const totalHourlyRate = job.hourly_rate * job.movers_needed;
    const calculatedTotal = totalHourlyRate * hours + (job.truck_service_fee || 0);

    const updates: Partial<Job> = {
      status: 'completed' as const,
      actual_duration_hours: hours,
      actual_total: calculatedTotal,
      completion_notes: completionData.notes || null,
      customer_satisfaction: completionData.satisfaction ? parseInt(completionData.satisfaction) : null,
      is_paid: completionData.isPaid,
      payment_method: completionData.isPaid ? completionData.paymentMethod : null,
      paid_at: completionData.isPaid ? new Date().toISOString() : null
    };

    updateJob({ id: job.id, updates });
    setShowCompletionPrompt(false);
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const updates: Partial<Job> = {
      status: formData.status as Job['status']
    };

    // Handle scheduling from pending_schedule status
    if (job.status === 'pending_schedule' && formData.status === 'scheduled') {
      updates.job_date = formData.jobDate;
      updates.start_time = formData.startTime;
    }

    // If rescheduled, update the job date
    if (formData.status === 'rescheduled' && rescheduleDate) {
      updates.job_date = rescheduleDate.toISOString().split('T')[0];
      if (scheduleTime) {
        updates.start_time = scheduleTime;
      }
    }

    // Handle other status updates
    if (formData.status !== 'completed') {
      updates.actual_duration_hours = formData.actualHours ? parseFloat(formData.actualHours) : null;
      updates.actual_total = formData.actualTotal ? parseFloat(formData.actualTotal) : null;
      updates.completion_notes = formData.completionNotes || null;
      updates.customer_satisfaction = formData.customerSatisfaction ? parseInt(formData.customerSatisfaction) : null;
      updates.is_paid = formData.isPaid;
      updates.payment_method = formData.paymentMethod || null;
      updates.paid_at = formData.isPaid && !job.paid_at ? new Date().toISOString() : job.paid_at;
    }

    updateJob({ id: job.id, updates });
    onOpenChange(false);
  };

  const handleTruckExpenses = (expenses: { rentalCost: number; gasCost: number }) => {
    if (!job) return;
    
    updateJob({ 
      id: job.id, 
      updates: { 
        truck_rental_cost: expenses.rentalCost,
        truck_gas_cost: expenses.gasCost
      } 
    });
  };

  if (!job) return null;

  const totalHourlyRate = job.hourly_rate * job.movers_needed;
  const calculatedTotal = formData.actualHours 
    ? totalHourlyRate * parseFloat(formData.actualHours) + (job.truck_service_fee || 0)
    : 0;

  const isPendingSchedule = job.status === 'pending_schedule';
  const isConvertedLead = Boolean(job.lead_id);

  // Completion Prompt Dialog
  if (showCompletionPrompt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Job - {job.client_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours Worked *
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={completionData.hours}
                onChange={(e) => setCompletionData({ ...completionData, hours: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter hours worked"
                required
              />
            </div>

            {completionData.hours && (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <div className="text-sm text-purple-700 space-y-1">
                  <div>Movers: ${totalHourlyRate}/hour × {completionData.hours} hours = ${(totalHourlyRate * parseFloat(completionData.hours)).toFixed(2)}</div>
                  {job.truck_service_fee && (
                    <div>Truck service fee: +${job.truck_service_fee}.00</div>
                  )}
                  <div className="font-medium">Total: ${(totalHourlyRate * parseFloat(completionData.hours) + (job.truck_service_fee || 0)).toFixed(2)}</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer Satisfaction (1-5)
              </label>
              <select
                value={completionData.satisfaction}
                onChange={(e) => setCompletionData({ ...completionData, satisfaction: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Not rated</option>
                <option value="1">1 - Very Poor</option>
                <option value="2">2 - Poor</option>
                <option value="3">3 - Average</option>
                <option value="4">4 - Good</option>
                <option value="5">5 - Excellent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Notes
              </label>
              <textarea
                value={completionData.notes}
                onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                rows={3}
                placeholder="Any notes about the job completion..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPaid"
                  checked={completionData.isPaid}
                  onChange={(e) => setCompletionData({ ...completionData, isPaid: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
                  Mark as paid
                </label>
              </div>

              {completionData.isPaid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={completionData.paymentMethod}
                    onChange={(e) => setCompletionData({ ...completionData, paymentMethod: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select method...</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCompletionPrompt(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleCompletionSubmit}
                disabled={!completionData.hours}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Complete Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isPendingSchedule ? 'Schedule Job' : 'Edit Job'} - {job.client_name}
              {isConvertedLead && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Converted Lead
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isPendingSchedule ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Date *
                  </label>
                  <input
                    type="date"
                    value={formData.jobDate}
                    onChange={(e) => setFormData({ ...formData, jobDate: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value as Job['status'])}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="pending_schedule">Pending Schedule</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rescheduled">Rescheduled</option>
                </select>
              </div>
            )}

            {formData.status === 'rescheduled' && !isPendingSchedule && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !rescheduleDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {rescheduleDate ? format(rescheduleDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={rescheduleDate}
                        onSelect={setRescheduleDate}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </>
            )}

            {/* Truck Expenses Section - only show for completed jobs */}
            {formData.status === 'completed' && job.truck_service_fee && (
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Truck Expenses</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTruckExpenses(true)}
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    {job.truck_rental_cost || job.truck_gas_cost ? 'Update' : 'Add'} Expenses
                  </Button>
                </div>
                {(job.truck_rental_cost || job.truck_gas_cost) && (
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Rental cost:</span>
                        <span>${(job.truck_rental_cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gas cost:</span>
                        <span>${(job.truck_gas_cost || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-1 font-medium">
                        <span>Truck profit:</span>
                        <span className={`${((job.truck_service_fee || 0) - (job.truck_rental_cost || 0) - (job.truck_gas_cost || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ${((job.truck_service_fee || 0) - (job.truck_rental_cost || 0) - (job.truck_gas_cost || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700">
                {isPendingSchedule ? 'Schedule Job' : 'Update Job'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <TruckExpenseDialog
        open={showTruckExpenses}
        onOpenChange={setShowTruckExpenses}
        job={job}
        onSave={handleTruckExpenses}
      />
    </>
  );
};
