
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useJobs, Job } from '@/hooks/useJobs';

interface EditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: Job | null;
}

export const EditJobDialog = ({ open, onOpenChange, job }: EditJobDialogProps) => {
  const { updateJob } = useJobs();
  const [formData, setFormData] = useState({
    status: job?.status || 'scheduled',
    actualDurationHours: job?.actual_duration_hours?.toString() || '',
    actualTotal: job?.actual_total?.toString() || '',
    completionNotes: job?.completion_notes || '',
    customerSatisfaction: job?.customer_satisfaction?.toString() || '',
    isPaid: job?.is_paid || false,
    paymentMethod: job?.payment_method || ''
  });

  React.useEffect(() => {
    if (job) {
      setFormData({
        status: job.status,
        actualDurationHours: job.actual_duration_hours?.toString() || '',
        actualTotal: job.actual_total?.toString() || '',
        completionNotes: job.completion_notes || '',
        customerSatisfaction: job.customer_satisfaction?.toString() || '',
        isPaid: job.is_paid,
        paymentMethod: job.payment_method || ''
      });
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const updates: Partial<Job> = {
      status: formData.status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled',
      actual_duration_hours: formData.actualDurationHours ? parseFloat(formData.actualDurationHours) : null,
      actual_total: formData.actualTotal ? parseFloat(formData.actualTotal) : null,
      completion_notes: formData.completionNotes || null,
      customer_satisfaction: formData.customerSatisfaction ? parseInt(formData.customerSatisfaction) : null,
      is_paid: formData.isPaid,
      payment_method: formData.paymentMethod || null,
      paid_at: formData.isPaid && !job.paid_at ? new Date().toISOString() : job.paid_at
    };

    updateJob({ id: job.id, updates });
    onOpenChange(false);
  };

  if (!job) return null;

  const estimatedTotal = job.hourly_rate * job.estimated_duration_hours;
  const calculatedActual = formData.actualDurationHours 
    ? job.hourly_rate * parseFloat(formData.actualDurationHours)
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job - {job.client_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rescheduled">Rescheduled</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Hours Worked
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={formData.actualDurationHours}
                onChange={(e) => setFormData({ ...formData, actualDurationHours: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Est: ${job.estimated_duration_hours}h`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actual Total Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.actualTotal}
                onChange={(e) => setFormData({ ...formData, actualTotal: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Est: $${estimatedTotal.toFixed(2)}`}
              />
            </div>
          </div>

          {formData.actualDurationHours && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                <div>Rate-based calculation: ${calculatedActual.toFixed(2)}</div>
                {formData.actualTotal && parseFloat(formData.actualTotal) !== calculatedActual && (
                  <div className="text-orange-600 mt-1">
                    ⚠️ Actual total differs from rate calculation
                  </div>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Satisfaction (1-5)
            </label>
            <select
              value={formData.customerSatisfaction}
              onChange={(e) => setFormData({ ...formData, customerSatisfaction: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              value={formData.completionNotes}
              onChange={(e) => setFormData({ ...formData, completionNotes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any notes about the job completion..."
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
                Mark as paid
              </label>
            </div>

            {formData.isPaid && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Update Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
