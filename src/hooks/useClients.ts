import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useClientStats } from './useClientStats';

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
  const { clientStats } = useClientStats();

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      console.log('Fetching clients...');
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      console.log('Clients fetched:', data?.length);
      
      // Merge with calculated stats
      const updatedClients = data?.map(client => {
        const stats = clientStats.find(s => s.client_id === client.id);
        if (stats) {
          return {
            ...client,
            total_jobs_completed: stats.total_jobs_completed,
            total_revenue: stats.total_revenue
          };
        }
        return client;
      }) || [];
      
      console.log('Clients with updated stats:', updatedClients);
      return updatedClients as Client[];
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
        .insert([{
          ...clientData,
          total_jobs_completed: 0,
          total_revenue: 0
        }])
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
        duration: 2000
      });
    },
    onError: (error) => {
      console.error('Error in addClientMutation:', error);
      toast({
        title: "Error Adding Client",
        description: "There was an error adding the client. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      console.log('Updating client:', id, updates);
      
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }
      
      console.log('Client updated successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Updated",
        description: `${data.name} has been updated successfully.`,
        duration: 2000
      });
    },
    onError: (error) => {
      console.error('Error in updateClientMutation:', error);
      toast({
        title: "Error Updating Client",
        description: "There was an error updating the client. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: string) => {
      console.log('Deleting client with id:', clientId);
      
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', clientId);
      
      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }
      
      console.log('Client deleted successfully');
      return clientId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Deleted",
        description: "The client has been successfully deleted.",
        duration: 2000
      });
    },
    onError: (error) => {
      console.error('Error in deleteClientMutation:', error);
      toast({
        title: "Error Deleting Client",
        description: "There was an error deleting the client. Please try again.",
        variant: "destructive",
        duration: 2000
      });
    }
  });

  return {
    clients,
    isLoading,
    addClient: addClientMutation.mutateAsync,
    isAddingClient: addClientMutation.isPending,
    updateClient: updateClientMutation.mutateAsync,
    isUpdatingClient: updateClientMutation.isPending,
    deleteClient: deleteClientMutation.mutateAsync,
    isDeletingClient: deleteClientMutation.isPending
  };
};
