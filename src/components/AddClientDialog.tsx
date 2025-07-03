
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useClients } from '@/hooks/useClients';

interface AddClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddClientDialog: React.FC<AddClientDialogProps> = ({ open, onOpenChange }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [primaryAddress, setPrimaryAddress] = useState('');
  const [secondaryAddress, setSecondaryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('phone');
  
  const { addClient, isAddingClient } = useClients();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !primaryAddress.trim()) {
      console.error('Missing required fields');
      return;
    }

    const clientData = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      company_name: companyName.trim() || null,
      primary_address: primaryAddress.trim(),
      secondary_address: secondaryAddress.trim() || null,
      notes: notes.trim() || null,
      preferred_contact_method: preferredContactMethod,
      rating: null,
      total_revenue: 0,
      total_jobs_completed: 0
    };
    
    console.log('Adding client to database:', clientData);
    addClient(clientData);

    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setCompanyName('');
    setPrimaryAddress('');
    setSecondaryAddress('');
    setNotes('');
    setPreferredContactMethod('phone');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="primaryAddress">Primary Address *</Label>
            <Input
              id="primaryAddress"
              value={primaryAddress}
              onChange={(e) => setPrimaryAddress(e.target.value)}
              placeholder="Enter primary address"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="secondaryAddress">Secondary Address</Label>
            <Input
              id="secondaryAddress"
              value={secondaryAddress}
              onChange={(e) => setSecondaryAddress(e.target.value)}
              placeholder="Enter secondary address"
            />
          </div>
          
          <div>
            <Label htmlFor="preferredContactMethod">Preferred Contact Method</Label>
            <select
              id="preferredContactMethod"
              value={preferredContactMethod}
              onChange={(e) => setPreferredContactMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="text">Text Message</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isAddingClient}>
              {isAddingClient ? 'Adding Client...' : 'Add Client'}
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
