
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'website' | 'referral' | 'google_ads' | 'facebook' | 'phone' | 'walk_in' | 'other';
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';
  assigned_to?: string;
  follow_up_date?: string;
  estimated_value?: number;
  lead_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadData {
  name: string;
  phone: string;
  email?: string;
  source?: Lead['source'];
  status?: Lead['status'];
  assigned_to?: string;
  follow_up_date?: string;
  estimated_value?: number;
  lead_cost?: number;
  notes?: string;
}

export const useLeads = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, error } = useQuery({
    queryKey: ['leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching leads:', error);
        throw error;
      }
      
      return data as Lead[];
    }
  });

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: CreateLeadData) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead Added",
        description: "Lead has been successfully added.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add lead.",
        variant: "destructive",
      });
    }
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Lead> }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead Updated",
        description: "Lead has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead.",
        variant: "destructive",
      });
    }
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting lead:', id);
      
      // First, check if this lead has been converted to jobs
      const { data: relatedJobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id, job_number')
        .eq('lead_id', id);

      if (jobsError) {
        console.error('Error checking related jobs:', jobsError);
        throw jobsError;
      }

      // If there are related jobs, update them to remove the lead reference
      if (relatedJobs && relatedJobs.length > 0) {
        console.log('Found related jobs, removing lead reference:', relatedJobs);
        
        const { error: updateError } = await supabase
          .from('jobs')
          .update({ lead_id: null })
          .eq('lead_id', id);

        if (updateError) {
          console.error('Error updating related jobs:', updateError);
          throw updateError;
        }
      }

      // Now delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] }); // Also invalidate jobs since we may have updated them
      toast({
        title: "Lead Deleted",
        description: "Lead has been successfully deleted. Any related jobs will remain but no longer reference this lead.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting lead:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead.",
        variant: "destructive",
      });
    }
  });

  return {
    leads,
    isLoading,
    error,
    addLead: addLeadMutation.mutate,
    updateLead: updateLeadMutation.mutate,
    deleteLead: deleteLeadMutation.mutate,
    isAddingLead: addLeadMutation.isPending,
    isUpdatingLead: updateLeadMutation.isPending,
    isDeletingLead: deleteLeadMutation.isPending
  };
};
