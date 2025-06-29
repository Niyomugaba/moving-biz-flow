
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useLeads } from '@/hooks/useLeads';

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddLeadDialog: React.FC<AddLeadDialogProps> = ({ open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const { addLead, isAddingLead } = useLeads();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !source) {
      return;
    }

    const leadData = {
      name,
      phone,
      email: email || null,
      source: source as 'website' | 'referral' | 'google_ads' | 'facebook' | 'phone' | 'walk_in' | 'other',
      status: 'new' as const,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      notes: null,
      follow_up_date: null,
      assigned_to: null
    };
    
    console.log('Adding lead to database:', leadData);
    addLead(leadData);

    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setSource('');
    setEstimatedValue('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="source">Lead Source *</Label>
            <Select value={source} onValueChange={setSource} required>
              <SelectTrigger>
                <SelectValue placeholder="Select lead source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google_ads">Google Ads</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="walk_in">Walk In</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
            <Input
              id="estimatedValue"
              type="number"
              step="0.01"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isAddingLead}>
              {isAddingLead ? 'Adding...' : 'Add Lead'}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
