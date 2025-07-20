import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Job, useJobs } from '@/hooks/useJobs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, DollarSign, Users, MapPin, Truck, FileText, CreditCard } from 'lucide-react';

interface EditJobDialogProps {
  job: Job | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditJobDialog = ({ job, open, onOpenChange }: EditJobDialogProps) => {
  const { updateJob, isUpdatingJob } = useJobs();
  
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [originAddress, setOriginAddress] = useState('');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [jobDate, setJobDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [moversNeeded, setMoversNeeded] = useState('');
  const [estimatedTotal, setEstimatedTotal] = useState('');
  const [actualTotal, setActualTotal] = useState('');
  const [actualDurationHours, setActualDurationHours] = useState('');
  const [truckSize, setTruckSize] = useState<string | undefined>('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [status, setStatus] = useState<Job['status']>('scheduled');
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | undefined>('');
  const [completionNotes, setCompletionNotes] = useState('');
  const [pricingModel, setPricingModel] = useState<'per_person' | 'flat_rate'>('per_person');
  const [totalClientPayment, setTotalClientPayment] = useState('');
  const [totalEmployeePayment, setTotalEmployeePayment] = useState('');

  useEffect(() => {
    if (job) {
      setClientName(job.client_name);
      setClientPhone(job.client_phone);
      setClientEmail(job.client_email || '');
      setOriginAddress(job.origin_address);
      setDestinationAddress(job.destination_address);
      setJobDate(job.job_date);
      setStartTime(job.start_time);
      setHourlyRate(job.hourly_rate.toString());
      setMoversNeeded(job.movers_needed.toString());
      setEstimatedTotal(job.estimated_total.toString());
      setActualTotal(job.actual_total?.toString() || '');
      setActualDurationHours(job.actual_duration_hours?.toString() || '');
      setTruckSize(job.truck_size || undefined);
      setSpecialRequirements(job.special_requirements || '');
      setStatus(job.status);
      setIsPaid(job.is_paid);
      setPaymentMethod(job.payment_method || undefined);
      setCompletionNotes(job.completion_notes || '');
      setPricingModel(job.pricing_model || 'per_person');
      setTotalClientPayment(job.total_amount_received?.toString() || job.actual_total?.toString() || '');
      setTotalEmployeePayment(''); // Will be calculated from time entries
    }
  }, [job]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    const updates: Partial<Job> = {
      client_name: clientName,
      client_phone: clientPhone,
      client_email: clientEmail || null,
      origin_address: originAddress,
      destination_address: destinationAddress,
      job_date: jobDate,
      start_time: startTime,
      hourly_rate: parseFloat(hourlyRate),
      movers_needed: parseInt(moversNeeded),
      estimated_total: parseFloat(estimatedTotal),
      actual_total: parseFloat(actualTotal) || null,
      actual_duration_hours: parseFloat(actualDurationHours) || null,
      truck_size: truckSize || null,
      special_requirements: specialRequirements || null,
      status: status as Job['status'],
      is_paid: isPaid,
      payment_method: paymentMethod || null,
      completion_notes: completionNotes || null,
      pricing_model: pricingModel,
      total_amount_received: parseFloat(totalClientPayment) || null
    };

    updateJob({ 
      id: job.id, 
      updates,
      shouldCreateDummyEmployees: false
    });
    
    onOpenChange(false);
  };

  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Edit Job - {job.job_number}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Status Badge */}
          <div className="flex items-center gap-2">
            <Badge variant={
              job.status === 'completed' ? 'default' : 
              job.status === 'in_progress' ? 'secondary' : 
              job.status === 'cancelled' ? 'destructive' : 'outline'
            }>
              {job.status.replace('_', ' ').toUpperCase()}
            </Badge>
            {job.is_paid && <Badge variant="outline" className="bg-green-50 text-green-700">PAID</Badge>}
          </div>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone</Label>
                <Input
                  id="clientPhone"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="originAddress">Origin Address</Label>
                <Input
                  id="originAddress"
                  value={originAddress}
                  onChange={(e) => setOriginAddress(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="destinationAddress">Destination Address</Label>
                <Input
                  id="destinationAddress"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="jobDate">Job Date</Label>
                <Input
                  id="jobDate"
                  type="date"
                  value={jobDate}
                  onChange={(e) => setJobDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="moversNeeded">Movers Needed</Label>
                <Input
                  id="moversNeeded"
                  type="number"
                  min="1"
                  value={moversNeeded}
                  onChange={(e) => setMoversNeeded(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="truckSize">Truck Size</Label>
                <Select value={truckSize} onValueChange={setTruckSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select truck size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                    <SelectItem value="extra_large">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Model */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Pricing Model</Label>
                <Select value={pricingModel} onValueChange={(value: 'per_person' | 'flat_rate') => setPricingModel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_person">Per Person Rate</SelectItem>
                    <SelectItem value="flat_rate">Flat Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {pricingModel === 'flat_rate' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <Label htmlFor="totalClientPayment">Total Client Payment</Label>
                    <Input
                      id="totalClientPayment"
                      type="number"
                      step="0.01"
                      value={totalClientPayment}
                      onChange={(e) => setTotalClientPayment(e.target.value)}
                      placeholder="What client paid you"
                    />
                  </div>
                  <div>
                    <Label htmlFor="totalEmployeePayment">Total Employee Payment</Label>
                    <Input
                      id="totalEmployeePayment"
                      type="number"
                      step="0.01"
                      value={totalEmployeePayment}
                      onChange={(e) => setTotalEmployeePayment(e.target.value)}
                      placeholder="What you paid employees"
                    />
                  </div>
                  <div className="col-span-2 text-sm text-gray-600">
                    <p><strong>Simplified Flat Rate:</strong> Just enter what the client paid and what you paid employees. The system will handle the rest.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      step="0.01"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedTotal">Estimated Total</Label>
                    <Input
                      id="estimatedTotal"
                      type="number"
                      step="0.01"
                      value={estimatedTotal}
                      onChange={(e) => setEstimatedTotal(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualTotal">Actual Total</Label>
                    <Input
                      id="actualTotal"
                      type="number"
                      step="0.01"
                      value={actualTotal}
                      onChange={(e) => setActualTotal(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="actualDurationHours">Actual Duration (Hours)</Label>
                    <Input
                      id="actualDurationHours"
                      type="number"
                      step="0.5"
                      value={actualDurationHours}
                      onChange={(e) => setActualDurationHours(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Status and Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Status & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Job Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="isPaid"
                  checked={isPaid}
                  onCheckedChange={setIsPaid}
                />
                <Label htmlFor="isPaid">Job is Paid</Label>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="venmo">Venmo</SelectItem>
                    <SelectItem value="zelle">Zelle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Special Requirements and Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="specialRequirements">Special Requirements</Label>
                <Textarea
                  id="specialRequirements"
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  placeholder="Any special requirements or notes for this job..."
                />
              </div>
              <div>
                <Label htmlFor="completionNotes">Completion Notes</Label>
                <Textarea
                  id="completionNotes"
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Notes about job completion, issues, etc..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
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
