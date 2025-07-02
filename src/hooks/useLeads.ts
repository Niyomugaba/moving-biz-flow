
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
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead Deleted",
        description: "Lead has been successfully deleted.",
      });
    },
    onError: (error: any) => {
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
