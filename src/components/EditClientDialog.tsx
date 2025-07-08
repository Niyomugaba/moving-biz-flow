import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { useClients } from '@/hooks/useClients';
import { useLeads } from '@/hooks/useLeads';
import { AlertCircle } from 'lucide-react';

interface EditClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any;
}

export const EditClientDialog = ({ open, onOpenChange, client }: EditClientDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    primary_address: '',
    secondary_address: '',
    company_name: '',
    preferred_contact_method: 'phone',
    notes: '',
    is_lead: false,
    lead_cost: 0,
    estimated_value: 0
  });

  const { updateClient, isUpdatingClient } = useClients();
  const { addLead, leads } = useLeads();

  useEffect(() => {
    if (client && open) {
      // Check if this client has an associated lead
      const associatedLead = leads.find(lead => 
        lead.name.toLowerCase() === client.name.toLowerCase() && 
        lead.phone === client.phone
      );

      setFormData({
        name: client.name || '',
        phone: client.phone || '',
        email: client.email || '',
        primary_address: client.primary_address || '',
        secondary_address: client.secondary_address || '',
        company_name: client.company_name || '',
        preferred_contact_method: client.preferred_contact_method || 'phone',
        notes: client.notes || '',
        is_lead: !!associatedLead,
        lead_cost: associatedLead?.lead_cost || 0,
        estimated_value: associatedLead?.estimated_value || client.total_revenue || 0
      });
    }
  }, [client, open, leads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update client information
      await updateClient({
        id: client.id,
        updates: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          primary_address: formData.primary_address,
          secondary_address: formData.secondary_address || null,
          company_name: formData.company_name || null,
          preferred_contact_method: formData.preferred_contact_method,
          notes: formData.notes || null
        }
      });

      // Handle lead creation/update if marked as lead
      if (formData.is_lead) {
        const existingLead = leads.find(lead => 
          lead.name.toLowerCase() === formData.name.toLowerCase() && 
          lead.phone === formData.phone
        );

        if (!existingLead) {
          // Create new lead
          await addLead({
            name: formData.name,
            phone: formData.phone,
            email: formData.email || null,
            estimated_value: formData.estimated_value,
            lead_cost: formData.lead_cost,
            status: 'converted',
            source: 'other',
            notes: `Client updated to include lead tracking: ${formData.notes || ''}`
          });
        }
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Reset lead cost if is_lead is set to false
    if (field === 'is_lead' && value === false) {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        lead_cost: 0
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_address">Primary Address *</Label>
            <Input
              id="primary_address"
              value={formData.primary_address}
              onChange={(e) => handleInputChange('primary_address', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_address">Secondary Address</Label>
            <Input
              id="secondary_address"
              value={formData.secondary_address}
              onChange={(e) => handleInputChange('secondary_address', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
            />
          </div>

          {/* Lead Information Section */}
          <div className="border p-4 rounded-md bg-gray-50">
            <div className="flex items-center space-x-2 mb-3">
              <Checkbox
                id="is_lead"
                checked={formData.is_lead}
                onCheckedChange={(checked) => handleInputChange('is_lead', checked)}
              />
              <Label htmlFor="is_lead" className="font-medium text-gray-800">
                This client is a lead
              </Label>
              <AlertCircle className="h-4 w-4 text-blue-600" />
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              Mark this client as a lead to track acquisition costs and performance metrics.
            </p>

            {formData.is_lead && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lead_cost">Lead Cost ($)</Label>
                  <Input
                    id="lead_cost"
                    type="number"
                    value={formData.lead_cost}
                    onChange={(e) => handleInputChange('lead_cost', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Enter acquisition cost"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimated_value">Estimated Value ($)</Label>
                  <Input
                    id="estimated_value"
                    type="number"
                    value={formData.estimated_value}
                    onChange={(e) => handleInputChange('estimated_value', e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Expected client value"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              placeholder="Additional notes about this client..."
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdatingClient}>
              {isUpdatingClient ? 'Updating...' : 'Update Client'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
