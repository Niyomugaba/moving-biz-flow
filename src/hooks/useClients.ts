
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  primary_address: string;
  secondary_address: string | null;
  company_name: string | null;
  preferred_contact_method: string | null;
  total_jobs_completed: number | null;
  total_revenue: number | null;
  rating: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useClients = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Client[];
    }
  });

  const addClientMutation = useMutation({
    mutationFn: async (clientData: {
      name: string;
      phone: string;
      email?: string | null;
      primary_address: string;
      company_name?: string | null;
      preferred_contact_method?: string | null;
    }) => {
      console.log('Creating client with data:', clientData);
      
      const { data, error } = await supabase
        .from('clients')
        .insert([clientData])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }
      
      console.log('Client created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Added",
        description: `${data.name} has been added as a new client.`,
      });
    },
    onError: (error) => {
      console.error('Error in addClientMutation:', error);
      toast({
        title: "Error Adding Client",
        description: "There was an error adding the client. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    clients,
    isLoading,
    addClient: addClientMutation.mutateAsync, // Return mutateAsync for promise handling
    isAddingClient: addClientMutation.isPending
  };
};
