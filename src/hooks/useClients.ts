
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

  const { data: clients = [], isLoading, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      console.log('Fetching clients from database...');
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      console.log('Clients fetched successfully:', data);
      
      // Special focus on Natalie's client data
      const natalieClient = data.find(client => 
        client.name === 'Natalie' || client.phone === '+1 (412) 273-5545'
      );
      
      if (natalieClient) {
        console.log('🔍 NATALIE CLIENT RECORD:', {
          id: natalieClient.id,
          name: natalieClient.name,
          phone: natalieClient.phone,
          total_jobs_completed: natalieClient.total_jobs_completed,
          total_revenue: natalieClient.total_revenue
        });
        
        // Check her jobs manually
        const { data: natalieJobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, job_number, status, client_id, actual_total, estimated_total, client_name, client_phone')
          .or(`client_id.eq.${natalieClient.id},client_phone.eq.+1 (412) 273-5545,client_name.ilike.%Natalie%`);
        
        if (!jobsError) {
          console.log('🔍 ALL JOBS FOR NATALIE (by any criteria):', natalieJobs);
          
          const completedJobs = natalieJobs?.filter(job => job.status === 'completed') || [];
          console.log('✅ COMPLETED JOBS FOR NATALIE:', completedJobs);
          
          if (completedJobs.length > 0) {
            const expectedRevenue = completedJobs.reduce((sum, job) => 
              sum + (job.actual_total || job.estimated_total || 0), 0
            );
            console.log('💰 EXPECTED REVENUE:', expectedRevenue);
            console.log('📊 DATABASE SHOWS:', {
              total_jobs_completed: natalieClient.total_jobs_completed,
              total_revenue: natalieClient.total_revenue
            });
            
            if (natalieClient.total_jobs_completed !== completedJobs.length || 
                natalieClient.total_revenue !== expectedRevenue) {
              console.log('🚨 MISMATCH DETECTED! Triggers may not be working properly.');
              
              // Manually trigger the update
              console.log('🔧 Attempting manual client stats update...');
              const { error: updateError } = await supabase
                .from('clients')
                .update({
                  total_jobs_completed: completedJobs.length,
                  total_revenue: expectedRevenue,
                  updated_at: new Date().toISOString()
                })
                .eq('id', natalieClient.id);
                
              if (updateError) {
                console.error('❌ Manual update failed:', updateError);
              } else {
                console.log('✅ Manual update successful!');
                // Re-fetch updated data
                const { data: updatedData } = await supabase
                  .from('clients')
                  .select('*')
                  .order('name');
                return updatedData as Client[];
              }
            }
          }
        }
      }
      
      return data as Client[];
    },
    staleTime: 0,
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
    isDeletingClient: deleteClientMutation.isPending,
    refetchClients: refetch
  };
};
