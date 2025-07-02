
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { useJobs } from '@/hooks/useJobs';
import { useClients } from '@/hooks/useClients';

interface ScheduleJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadData?: {
    name: string;
    phone: string;
    email?: string;
  };
}

export const ScheduleJobDialog = ({ open, onOpenChange, leadData }: ScheduleJobDialogProps) => {
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: leadData?.name || '',
    client_phone: leadData?.phone || '',
    client_email: leadData?.email || '',
    origin_address: '',
    destination_address: '',
    job_date: '',
    start_time: '',
    hourly_rate: 50,
    movers_needed: 2,
    estimated_total: 100,
    truck_size: '',
    special_requirements: '',
    is_paid: false,
    payment_method: '',
    paid_at: null as string | null
  });

  const { addJob, isAddingJob } = useJobs();
  const { clients } = useClients();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const jobData = {
      ...formData,
      estimated_total: Number(formData.estimated_total),
      hourly_rate: Number(formData.hourly_rate),
      movers_needed: Number(formData.movers_needed),
      truck_size: formData.truck_size || null,
      special_requirements: formData.special_requirements || null,
      paid_at: formData.is_paid && formData.paid_at ? formData.paid_at : null
    };

    console.log('Submitting job data:', jobData);
    addJob(jobData);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate estimated total when hourly rate or duration changes
    if (field === 'hourly_rate' || field === 'movers_needed') {
      const rate = field === 'hourly_rate' ? Number(value) : formData.hourly_rate;
      const movers = field === 'movers_needed' ? Number(value) : formData.movers_needed;
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        estimated_total: rate * movers * 2 // Default 2 hour minimum
      }));
    }
  };

  const handleClientSelect = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setFormData(prev => ({
        ...prev,
        client_id: clientId,
        client_name: client.name,
        client_phone: client.phone,
        client_email: client.email || ''
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Job</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Existing Client (Optional)</Label>
              <Select onValueChange={handleClientSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose existing client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} - {client.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Client Name *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => handleInputChange('client_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_phone">Client Phone *</Label>
              <Input
                id="client_phone"
                value={formData.client_phone}
                onChange={(e) => handleInputChange('client_phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_email">Client Email</Label>
            <Input
              id="client_email"
              type="email"
              value={formData.client_email}
              onChange={(e) => handleInputChange('client_email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="origin_address">Origin Address *</Label>
            <Input
              id="origin_address"
              value={formData.origin_address}
              onChange={(e) => handleInputChange('origin_address', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination_address">Destination Address *</Label>
            <Input
              id="destination_address"
              value={formData.destination_address}
              onChange={(e) => handleInputChange('destination_address', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="job_date">Job Date *</Label>
              <Input
                id="job_date"
                type="date"
                value={formData.job_date}
                onChange={(e) => handleInputChange('job_date', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => handleInputChange('start_time', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Hourly Rate ($) *</Label>
              <Input
                id="hourly_rate"
                type="number"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="movers_needed">Movers Needed *</Label>
              <Input
                id="movers_needed"
                type="number"
                value={formData.movers_needed}
                onChange={(e) => handleInputChange('movers_needed', e.target.value)}
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estimated_total">Estimated Total ($) *</Label>
              <Input
                id="estimated_total"
                type="number"
                value={formData.estimated_total}
                onChange={(e) => handleInputChange('estimated_total', e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="truck_size">Truck Size</Label>
            <Select onValueChange={(value) => handleInputChange('truck_size', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select truck size..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small Truck</SelectItem>
                <SelectItem value="medium">Medium Truck</SelectItem>
                <SelectItem value="large">Large Truck</SelectItem>
                <SelectItem value="extra_large">Extra Large Truck</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="special_requirements">Special Requirements</Label>
            <Textarea
              id="special_requirements"
              value={formData.special_requirements}
              onChange={(e) => handleInputChange('special_requirements', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_paid"
              checked={formData.is_paid}
              onChange={(e) => handleInputChange('is_paid', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_paid">Mark as Paid</Label>
          </div>

          {formData.is_paid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select onValueChange={(value) => handleInputChange('payment_method', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid_at">Payment Date</Label>
                <Input
                  id="paid_at"
                  type="datetime-local"
                  value={formData.paid_at || ''}
                  onChange={(e) => handleInputChange('paid_at', e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isAddingJob}>
              {isAddingJob ? 'Scheduling...' : 'Schedule Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
