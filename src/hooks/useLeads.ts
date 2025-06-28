
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  source: 'website' | 'referral' | 'google_ads' | 'facebook' | 'phone' | 'walk_in' | 'other';
  status: 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';
  estimated_value: number | null;
  notes: string | null;
  follow_up_date: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
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
      
      if (error) throw error;
      return data as Lead[];
    }
  });

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead Added Successfully",
        description: "New lead has been added to your pipeline.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add lead. Please try again.",
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead Updated",
        description: "Lead information has been updated.",
      });
    }
  });

  return {
    leads,
    isLoading,
    error,
    addLead: addLeadMutation.mutate,
    updateLead: updateLeadMutation.mutate,
    isAddingLead: addLeadMutation.isPending,
    isUpdatingLead: updateLeadMutation.isPending
  };
};
