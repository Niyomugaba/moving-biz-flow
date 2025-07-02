
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useJobs } from '@/hooks/useJobs';
import { useClients } from '@/hooks/useClients';
import { toast } from 'sonner';

interface ScheduleJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ScheduleJobDialog = ({ open, onOpenChange }: ScheduleJobDialogProps) => {
  const { addJob } = useJobs();
  const { clients, addClient } = useClients();
  
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    originAddress: '',
    destinationAddress: '',
    jobDate: '',
    startTime: '',
    hourlyRate: '50',
    moversNeeded: '2',
    estimatedHours: '4',
    truckSize: '',
    truckServiceFee: '',
    specialRequirements: '',
    isPaid: false,
    paymentMethod: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      originAddress: '',
      destinationAddress: '',
      jobDate: '',
      startTime: '',
      hourlyRate: '50',
      moversNeeded: '2',
      estimatedHours: '4',
      truckSize: '',
      truckServiceFee: '',
      specialRequirements: '',
      isPaid: false,
      paymentMethod: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const hourlyRate = parseFloat(formData.hourlyRate);
      const moversNeeded = parseInt(formData.moversNeeded);
      const estimatedHours = parseFloat(formData.estimatedHours);
      const truckServiceFee = formData.truckServiceFee ? parseFloat(formData.truckServiceFee) : undefined;

      // Check if client exists
      let existingClient = clients.find(
        client => client.phone === formData.clientPhone || 
        (formData.clientEmail && client.email === formData.clientEmail)
      );

      let clientId = existingClient?.id;

      // Create new client if doesn't exist
      if (!existingClient && formData.clientName && formData.clientPhone) {
        console.log('Creating new client...');
        try {
          const newClient = await addClient({
            name: formData.clientName,
            phone: formData.clientPhone,
            email: formData.clientEmail || null,
            primary_address: formData.originAddress,
            company_name: null,
            preferred_contact_method: 'phone'
          });
          clientId = newClient.id;
          console.log('Created new client with ID:', clientId);
        } catch (clientError) {
          console.error('Error creating client:', clientError);
          throw new Error('Failed to create client');
        }
      }

      const estimatedTotal = (hourlyRate * moversNeeded * estimatedHours) + (truckServiceFee || 0);

      const jobData = {
        client_id: clientId,
        client_name: formData.clientName,
        client_phone: formData.clientPhone,
        client_email: formData.clientEmail || null,
        origin_address: formData.originAddress,
        destination_address: formData.destinationAddress,
        job_date: formData.jobDate,
        start_time: formData.startTime,
        hourly_rate: hourlyRate,
        movers_needed: moversNeeded,
        estimated_duration_hours: estimatedHours,
        estimated_total: estimatedTotal,
        truck_size: formData.truckSize || null,
        truck_service_fee: truckServiceFee,
        special_requirements: formData.specialRequirements || null,
        is_paid: formData.isPaid,
        payment_method: formData.paymentMethod || null,
        paid_at: formData.isPaid ? new Date().toISOString() : null,
      };

      console.log('Submitting job data:', jobData);
      await addJob(jobData);
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to schedule job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-purple-800">Schedule New Job</DialogTitle>
          <DialogDescription>
            Enter the job details to schedule a new moving job.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clientPhone">Client Phone *</Label>
              <Input
                id="clientPhone"
                value={formData.clientPhone}
                onChange={(e) => setFormData({...formData, clientPhone: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({...formData, clientEmail: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originAddress">Origin Address *</Label>
            <Input
              id="originAddress"
              value={formData.originAddress}
              onChange={(e) => setFormData({...formData, originAddress: e.target.value})}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destinationAddress">Destination Address *</Label>
            <Input
              id="destinationAddress"
              value={formData.destinationAddress}
              onChange={(e) => setFormData({...formData, destinationAddress: e.target.value})}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobDate">Job Date *</Label>
              <Input
                id="jobDate"
                type="date"
                value={formData.jobDate}
                onChange={(e) => setFormData({...formData, jobDate: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($) *</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="moversNeeded">Movers Needed *</Label>
              <Input
                id="moversNeeded"
                type="number"
                min="1"
                value={formData.moversNeeded}
                onChange={(e) => setFormData({...formData, moversNeeded: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours *</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={(e) => setFormData({...formData, estimatedHours: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="truckSize">Truck Size</Label>
              <Select value={formData.truckSize} onValueChange={(value) => setFormData({...formData, truckSize: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select truck size (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="truckServiceFee">Truck Service Fee ($)</Label>
              <Input
                id="truckServiceFee"
                type="number"
                min="0"
                step="0.01"
                value={formData.truckServiceFee}
                onChange={(e) => setFormData({...formData, truckServiceFee: e.target.value})}
                placeholder="90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={formData.specialRequirements}
              onChange={(e) => setFormData({...formData, specialRequirements: e.target.value})}
              placeholder="Any special requirements or notes..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPaid"
              checked={formData.isPaid}
              onCheckedChange={(checked) => setFormData({...formData, isPaid: checked})}
            />
            <Label htmlFor="isPaid">Mark as Paid</Label>
          </div>

          {formData.isPaid && (
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
              {isSubmitting ? 'Scheduling...' : 'Schedule Job'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
