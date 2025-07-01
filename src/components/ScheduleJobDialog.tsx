
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useJobs } from '@/hooks/useJobs';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScheduleJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleJobDialog = ({ open, onOpenChange }: ScheduleJobDialogProps) => {
  const { addJob, isAddingJob } = useJobs();
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    originAddress: '',
    destinationAddress: '',
    jobDate: '',
    startTime: '',
    hourlyRate: '',
    moversNeeded: '2',
    truckSize: '',
    notes: '',
    isPaid: false,
    paymentMethod: '',
    estimatedDuration: '4'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const hourlyRate = parseFloat(formData.hourlyRate);
      const moversNeeded = parseInt(formData.moversNeeded);
      const estimatedDuration = parseFloat(formData.estimatedDuration);
      const estimatedTotal = hourlyRate * moversNeeded * estimatedDuration;

      const jobData = {
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        client_email: formData.clientEmail || null,
        origin_address: formData.originAddress,
        destination_address: formData.destinationAddress,
        job_date: formData.jobDate,
        start_time: formData.startTime,
        hourly_rate: hourlyRate,
        movers_needed: moversNeeded,
        estimated_duration_hours: estimatedDuration,
        estimated_total: estimatedTotal,
        truck_size: formData.truckSize || null,
        special_requirements: formData.notes || null,
        is_paid: formData.isPaid,
        payment_method: formData.isPaid ? formData.paymentMethod : null,
        paid_at: formData.isPaid ? new Date().toISOString() : null
      };

      console.log('Submitting job data:', jobData);
      
      await addJob(jobData);

      // Reset form
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        originAddress: '',
        destinationAddress: '',
        jobDate: '',
        startTime: '',
        hourlyRate: '',
        moversNeeded: '2',
        truckSize: '',
        notes: '',
        isPaid: false,
        paymentMethod: '',
        estimatedDuration: '4'
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const totalRate = formData.hourlyRate && formData.moversNeeded
    ? (parseFloat(formData.hourlyRate) * parseInt(formData.moversNeeded)).toFixed(2)
    : '0.00';

  const estimatedTotal = formData.hourlyRate && formData.moversNeeded && formData.estimatedDuration
    ? (parseFloat(formData.hourlyRate) * parseInt(formData.moversNeeded) * parseFloat(formData.estimatedDuration)).toFixed(2)
    : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'sm:max-w-full h-full max-h-screen' : 'sm:max-w-2xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>Schedule New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter client name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client Email (Optional)
            </label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="client@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin Address *
            </label>
            <textarea
              required
              value={formData.originAddress}
              onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="123 Main St, City, State 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Address *
            </label>
            <textarea
              required
              value={formData.destinationAddress}
              onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="456 Oak Ave, City, State 67890"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Date *
              </label>
              <input
                type="date"
                required
                value={formData.jobDate}
                onChange={(e) => setFormData({ ...formData, jobDate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate ($ per mover) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="90.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Movers *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.moversNeeded}
                onChange={(e) => setFormData({ ...formData, moversNeeded: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Duration (hours) *
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                value={formData.estimatedDuration}
                onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="4"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Truck Size (Optional)
            </label>
            <select
              value={formData.truckSize}
              onChange={(e) => setFormData({ ...formData, truckSize: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select truck size...</option>
              <option value="small">Small (10-14 ft)</option>
              <option value="medium">Medium (16-20 ft)</option>
              <option value="large">Large (22-26 ft)</option>
            </select>
          </div>

          {/* Total Rate Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Hourly Rate:</span>
              <span className="text-2xl font-bold text-blue-600">${totalRate}/hour</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-lg font-medium text-gray-900">Estimated Total:</span>
              <span className="text-2xl font-bold text-green-600">${estimatedTotal}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              ${formData.hourlyRate || '0'} × {formData.moversNeeded} movers × {formData.estimatedDuration} hours = ${estimatedTotal}
            </p>
          </div>

          {/* Payment Section */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-2 mb-3">
              <input
                type="checkbox"
                id="isPaid"
                checked={formData.isPaid}
                onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked, paymentMethod: e.target.checked ? formData.paymentMethod : '' })}
                className="rounded border-gray-300"
              />
              <label htmlFor="isPaid" className="text-sm font-medium text-gray-700">
                Mark as paid
              </label>
            </div>

            {formData.isPaid && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  required={formData.isPaid}
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select payment method...</option>
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Special Requirements (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Any special instructions or requirements..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="flex-1"
              disabled={isAddingJob}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isAddingJob}
            >
              {isAddingJob ? 'Scheduling...' : 'Schedule Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
