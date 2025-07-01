
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
  lead_cost: number | null; // This represents the cost to generate the lead
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
      
      // Map estimated_value from database to lead_cost for the interface
      return data.map(lead => ({
        ...lead,
        lead_cost: lead.estimated_value
      })) as Lead[];
    }
  });

  const addLeadMutation = useMutation({
    mutationFn: async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
      // When adding a lead, also add them to clients table
      const { data: leadResult, error: leadError } = await supabase
        .from('leads')
        .insert({
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          source: leadData.source,
          status: leadData.status,
          estimated_value: leadData.lead_cost, // Map lead_cost back to estimated_value for DB
          notes: leadData.notes,
          follow_up_date: leadData.follow_up_date,
          assigned_to: leadData.assigned_to
        })
        .select()
        .single();
      
      if (leadError) throw leadError;

      // Add to clients table
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email,
          primary_address: 'Address not provided',
          notes: `Added from lead. Source: ${leadData.source}. Status: ${leadData.status}`
        });

      if (clientError) {
        console.warn('Could not add to clients (may already exist):', clientError);
      }
      
      return leadResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Lead Added Successfully",
        description: "New lead has been added to your pipeline and client list.",
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
      const dbUpdates: any = { ...updates };
      
      // Map lead_cost back to estimated_value for database
      if (updates.lead_cost !== undefined) {
        dbUpdates.estimated_value = updates.lead_cost;
        delete dbUpdates.lead_cost;
      }

      const { data, error } = await supabase
        .from('leads')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;

      // If status is converted, create a job
      if (updates.status === 'converted') {
        const leadData = leads.find(l => l.id === id);
        if (leadData) {
          const { error: jobError } = await supabase
            .from('jobs')
            .insert({
              client_name: leadData.name,
              client_phone: leadData.phone,
              client_email: leadData.email,
              origin_address: 'TBD - Contact client for details',
              destination_address: 'TBD - Contact client for details',
              job_date: new Date().toISOString().split('T')[0],
              start_time: '09:00:00',
              estimated_duration_hours: 4,
              hourly_rate: 150, // Default rate
              estimated_total: 600,
              movers_needed: 2,
              status: 'scheduled'
            });

          if (jobError) {
            console.warn('Could not create job from converted lead:', jobError);
          } else {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
          }
        }
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
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
