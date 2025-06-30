
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useJobs } from '@/hooks/useJobs';
import { useClients } from '@/hooks/useClients';
import { useIsMobile } from '@/hooks/use-mobile';

interface ScheduleJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleJobDialog = ({ open, onOpenChange }: ScheduleJobDialogProps) => {
  const { addJob } = useJobs();
  const { clients } = useClients();
  const isMobile = useIsMobile();
  const [useExistingClient, setUseExistingClient] = useState(true); // Default to true for better UX
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    originAddress: '',
    destinationAddress: '',
    jobDate: '',
    startTime: '',
    hourlyRate: '',
    moversNeeded: '',
    estimatedHours: '',
    notes: '',
    paid: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let clientData;
    if (useExistingClient && formData.clientId) {
      const selectedClient = clients.find(c => c.id === formData.clientId);
      clientData = {
        client_id: formData.clientId,
        client_name: selectedClient?.name || '',
        client_phone: selectedClient?.phone || '',
        client_email: selectedClient?.email || null,
      };
    } else {
      clientData = {
        client_id: null,
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        client_email: formData.clientEmail || null,
      };
    }

    const estimatedHours = parseFloat(formData.estimatedHours);
    const hourlyRate = parseFloat(formData.hourlyRate);

    addJob({
      ...clientData,
      origin_address: formData.originAddress,
      destination_address: formData.destinationAddress,
      job_date: formData.jobDate,
      start_time: formData.startTime,
      hourly_rate: hourlyRate,
      movers_needed: parseInt(formData.moversNeeded),
      estimated_duration_hours: estimatedHours,
      estimated_total: estimatedHours * hourlyRate,
      actual_duration_hours: null,
      actual_total: null,
      status: 'scheduled',
      special_requirements: formData.notes || null,
      is_paid: formData.paid,
      paid_at: formData.paid ? new Date().toISOString() : null,
      truck_size: null,
      completion_notes: null,
      customer_satisfaction: null,
      payment_method: null
    });

    // Reset form
    setFormData({
      clientId: '',
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      originAddress: '',
      destinationAddress: '',
      jobDate: '',
      startTime: '',
      hourlyRate: '',
      moversNeeded: '',
      estimatedHours: '',
      notes: '',
      paid: false
    });
    setUseExistingClient(true);
    onOpenChange(false);
  };

  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(c => c.id === clientId);
    if (selectedClient) {
      setFormData({
        ...formData,
        clientId,
        originAddress: selectedClient.primary_address
      });
    }
  };

  const totalCost = formData.hourlyRate && formData.estimatedHours 
    ? (parseFloat(formData.hourlyRate) * parseFloat(formData.estimatedHours)).toFixed(2)
    : '0.00';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'sm:max-w-full h-full max-h-screen' : 'sm:max-w-2xl max-h-[90vh]'} overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>Schedule New Job</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="useExistingClient"
              checked={useExistingClient}
              onChange={(e) => setUseExistingClient(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="useExistingClient" className="text-sm font-medium text-gray-700">
              Use existing client
            </label>
          </div>

          {useExistingClient ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Client
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => handleClientSelect(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a client...</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-4`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Phone
                </label>
                <input
                  type="tel"
                  required
                  value={formData.clientPhone}
                  onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className={isMobile ? '' : 'md:col-span-2'}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Email (Optional)
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin Address
            </label>
            <textarea
              required
              value={formData.originAddress}
              onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destination Address
            </label>
            <textarea
              required
              value={formData.destinationAddress}
              onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Date
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
                Start Time
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
                Hourly Rate ($)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Movers Needed
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
                Estimated Hours
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                required
                value={formData.estimatedHours}
                onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Total Cost Display */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Estimated Total:</span>
              <span className="text-2xl font-bold text-blue-600">${totalCost}</span>
            </div>
          </div>

          {/* Payment Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="paid"
              checked={formData.paid}
              onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="paid" className="text-sm font-medium text-gray-700">
              Mark as paid
            </label>
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
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Schedule Job
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
