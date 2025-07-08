
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useJobs } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddLeadCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobData: {
    id: string;
    client_name: string;
    client_phone: string;
    client_email?: string;
    estimated_total: number;
    lead_id?: string;
  };
}

export const AddLeadCostDialog = ({ open, onOpenChange, jobData }: AddLeadCostDialogProps) => {
  const [leadCost, setLeadCost] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!leadCost || Number(leadCost) <= 0) {
      toast({
        title: "Invalid Lead Cost",
        description: "Please enter a valid lead cost greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a lead entry for this job if it doesn't have one
      let leadId = jobData.lead_id;
      
      if (!leadId) {
        console.log('Creating lead entry for job:', jobData.id);
        
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert({
            name: jobData.client_name,
            phone: jobData.client_phone,
            email: jobData.client_email || null,
            estimated_value: jobData.estimated_total,
            lead_cost: Number(leadCost),
            status: 'converted',
            source: 'other',
            notes: `Lead cost added post-job creation - ${new Date().toLocaleDateString()}`
          })
          .select()
          .single();

        if (leadError) {
          console.error('Error creating lead:', leadError);
          throw new Error(`Failed to create lead: ${leadError.message}`);
        }

        leadId = leadData.id;
        console.log('Lead created successfully:', leadData);
      } else {
        // Update existing lead with the cost
        const { error: updateError } = await supabase
          .from('leads')
          .update({ lead_cost: Number(leadCost) })
          .eq('id', leadId);

        if (updateError) {
          console.error('Error updating lead cost:', updateError);
          throw new Error(`Failed to update lead cost: ${updateError.message}`);
        }
      }

      // Update the job with the lead_id
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ lead_id: leadId })
        .eq('id', jobData.id);

      if (jobError) {
        console.error('Error updating job:', jobError);
        throw new Error(`Failed to update job: ${jobError.message}`);
      }

      // Ensure client exists in clients table
      const { data: existingClient, error: clientCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', jobData.client_phone)
        .eq('name', jobData.client_name)
        .maybeSingle();

      if (clientCheckError) {
        console.error('Error checking for existing client:', clientCheckError);
      }

      if (!existingClient) {
        console.log('Creating client entry for job:', jobData.id);
        
        const { error: clientError } = await supabase
          .from('clients')
          .insert({
            name: jobData.client_name,
            phone: jobData.client_phone,
            email: jobData.client_email || null,
            primary_address: 'Address from job booking',
            total_jobs_completed: 0,
            total_revenue: 0
          });

        if (clientError) {
          console.error('Error creating client:', clientError);
          // Don't throw error here as the main functionality still works
        } else {
          console.log('Client created successfully');
        }
      }

      toast({
        title: "Lead Cost Added",
        description: `Lead cost of $${leadCost} has been successfully added to this job.`,
      });

      onOpenChange(false);
      setLeadCost('');
      
      // Refresh the page to show updated data
      window.location.reload();

    } catch (error: any) {
      console.error('Error adding lead cost:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add lead cost. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Lead Cost</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_info">Client</Label>
            <div className="text-sm text-gray-600">
              <div className="font-medium">{jobData.client_name}</div>
              <div>{jobData.client_phone}</div>
              {jobData.client_email && <div>{jobData.client_email}</div>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lead_cost">Lead Cost ($) *</Label>
            <Input
              id="lead_cost"
              type="number"
              value={leadCost}
              onChange={(e) => setLeadCost(e.target.value)}
              min="0"
              step="0.01"
              placeholder="Enter the cost of acquiring this lead"
              required
            />
            <p className="text-sm text-gray-500">
              Enter the cost of generating this lead (advertising, referral fees, etc.)
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Lead Cost'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
