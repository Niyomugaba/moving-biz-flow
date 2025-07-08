
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useJobs } from '@/hooks/useJobs';

interface EditJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: any;
}

export const EditJobDialog = ({ open, onOpenChange, job }: EditJobDialogProps) => {
  const [formData, setFormData] = useState({
    client_name: '',
    client_phone: '',
    client_email: '',
    origin_address: '',
    destination_address: '',
    job_date: '',
    start_time: '',
    hourly_rate: 50,
    movers_needed: 2,
    estimated_total: 100,
    actual_total: 0,
    truck_size: '',
    special_requirements: '',
    is_paid: false,
    payment_method: '',
    paid_at: null as string | null,
    status: 'scheduled'
  });

  const { updateJob, isUpdatingJob } = useJobs();

  useEffect(() => {
    if (job && open) {
      setFormData({
        client_name: job.client_name || '',
        client_phone: job.client_phone || '',
        client_email: job.client_email || '',
        origin_address: job.origin_address || '',
        destination_address: job.destination_address || '',
        job_date: job.job_date || '',
        start_time: job.start_time || '',
        hourly_rate: job.hourly_rate || 50,
        movers_needed: job.movers_needed || 2,
        estimated_total: job.estimated_total || 100,
        actual_total: job.actual_total || 0,
        truck_size: job.truck_size || '',
        special_requirements: job.special_requirements || '',
        is_paid: job.is_paid || false,
        payment_method: job.payment_method || '',
        paid_at: job.paid_at || null,
        status: job.status || 'scheduled'
      });
    }
  }, [job, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!job) return;

    const updates = {
      ...formData,
      estimated_total: Number(formData.estimated_total),
      actual_total: Number(formData.actual_total),
      hourly_rate: Number(formData.hourly_rate),
      movers_needed: Number(formData.movers_needed),
      truck_size: formData.truck_size || null,
      special_requirements: formData.special_requirements || null,
      paid_at: formData.is_paid && formData.paid_at ? formData.paid_at : null,
      payment_method: formData.is_paid ? formData.payment_method : null
    };

    console.log('Updating job with data:', updates);
    
    updateJob({ id: job.id, updates });
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-calculate estimated total when hourly rate or movers changes
    if (field === 'hourly_rate' || field === 'movers_needed') {
      const rate = field === 'hourly_rate' ? Number(value) : formData.hourly_rate;
      const movers = field === 'movers_needed' ? Number(value) : formData.movers_needed;
      
      const calculatedTotal = rate * movers * 2; // Assume 2 hours minimum
      const maxTotal = 999999.99;
      
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        estimated_total: Math.min(calculatedTotal, maxTotal)
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job - {job?.job_number}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="actual_total">Actual Total ($)</Label>
              <Input
                id="actual_total"
                type="number"
                value={formData.actual_total}
                onChange={(e) => handleInputChange('actual_total', e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Job Status</Label>
            <Select onValueChange={(value) => handleInputChange('status', value)} value={formData.status}>
              <SelectTrigger>
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="rescheduled">Rescheduled</SelectItem>
                <SelectItem value="pending_schedule">Pending Schedule</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="truck_size">Truck Size</Label>
            <Select onValueChange={(value) => handleInputChange('truck_size', value)} value={formData.truck_size}>
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
            <Checkbox
              id="is_paid"
              checked={formData.is_paid}
              onCheckedChange={(checked) => handleInputChange('is_paid', checked)}
            />
            <Label htmlFor="is_paid">Mark as Paid</Label>
          </div>

          {formData.is_paid && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select onValueChange={(value) => handleInputChange('payment_method', value)} value={formData.payment_method}>
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
            <Button type="submit" disabled={isUpdatingJob}>
              {isUpdatingJob ? 'Updating...' : 'Update Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
