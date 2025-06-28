
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EmployeeRequest {
  id: string;
  name: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes: string | null;
}

export const useEmployeeRequests = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employeeRequests = [], isLoading, error } = useQuery({
    queryKey: ['employeeRequests'],
    queryFn: async () => {
      console.log('Fetching employee requests...');
      const { data, error } = await supabase
        .from('employee_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching employee requests:', error);
        throw error;
      }
      console.log('Fetched employee requests:', data);
      return data as EmployeeRequest[];
    }
  });

  const addEmployeeRequestMutation = useMutation({
    mutationFn: async (requestData: { name: string; phone: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('employee_requests')
        .insert([requestData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employeeRequests'] });
      toast({
        title: "Request Submitted",
        description: "Your employee request has been submitted for approval.",
      });
    }
  });

  const updateRequestStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes, hourlyWage }: { 
      id: string; 
      status: string; 
      notes?: string;
      hourlyWage?: number;
    }) => {
      console.log('Updating request status:', { id, status, notes, hourlyWage });
      
      try {
        // First, get the current request data
        const { data: currentRequest, error: fetchError } = await supabase
          .from('employee_requests')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) {
          console.error('Error fetching request:', fetchError);
          throw new Error(`Failed to fetch request: ${fetchError.message}`);
        }

        if (!currentRequest) {
          console.error('Request not found with ID:', id);
          throw new Error('Employee request not found');
        }

        console.log('Current request data:', currentRequest);

        // If approved, create employee record and delete request
        if (status === 'approved' && hourlyWage) {
          console.log('Creating employee record with data:', {
            name: currentRequest.name,
            phone: currentRequest.phone,
            hourly_wage: hourlyWage,
            status: 'Active'
          });
          
          const { data: employeeData, error: employeeError } = await supabase
            .from('employees')
            .insert({
              name: currentRequest.name,
              phone: currentRequest.phone,
              hourly_wage: hourlyWage,
              status: 'Active',
              hire_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();
          
          if (employeeError) {
            console.error('Employee creation error:', employeeError);
            throw new Error(`Failed to create employee: ${employeeError.message}`);
          }

          console.log('Employee created successfully:', employeeData);
          
          // Delete the request after successful employee creation
          const { error: deleteError } = await supabase
            .from('employee_requests')
            .delete()
            .eq('id', id);
          
          if (deleteError) {
            console.error('Error deleting approved request:', deleteError);
            throw new Error(`Failed to delete request after approval: ${deleteError.message}`);
          }

          console.log('Request deleted successfully after approval');

          return {
            ...currentRequest,
            status: 'approved',
            notes: notes || null,
            employee: employeeData,
            deleted: true
          };
        }

        // For rejected status, just update the status
        const { data: updatedRequest, error: updateError } = await supabase
          .from('employee_requests')
          .update({ 
            status, 
            notes: notes || null 
          })
          .eq('id', id)
          .select()
          .single();
        
        if (updateError) {
          console.error('Request update error:', updateError);
          throw new Error(`Failed to update request: ${updateError.message}`);
        }

        console.log('Request updated successfully');
        return updatedRequest;
        
      } catch (error) {
        console.error('Error in updateRequestStatus:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Mutation success, updating cache...');
      
      if (variables.status === 'approved') {
        // For approved requests, remove from cache immediately
        queryClient.setQueryData(['employeeRequests'], (oldData: EmployeeRequest[] | undefined) => {
          if (!oldData) return [];
          const filtered = oldData.filter(request => request.id !== variables.id);
          console.log('Removed approved request from cache. New count:', filtered.length);
          return filtered;
        });
        
        toast({
          title: "Request Approved",
          description: `${data.name} has been approved and added as an employee.`,
        });
      } else if (variables.status === 'rejected') {
        toast({
          title: "Request Rejected",
          description: `${data.name}'s request has been rejected.`,
        });
      }
      
      // Invalidate both queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['employeeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update the employee request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteRequestMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Attempting to delete request with ID:', id);
      
      // First verify the request exists
      const { data: existingRequest, error: fetchError } = await supabase
        .from('employee_requests')
        .select('id, name')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching request for deletion:', fetchError);
        throw new Error(`Request not found: ${fetchError.message}`);
      }
      
      console.log('Found request to delete:', existingRequest);
      
      // Now delete the request
      const { error: deleteError } = await supabase
        .from('employee_requests')
        .delete()
        .eq('id', id);
      
      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error(`Failed to delete request: ${deleteError.message}`);
      }
      
      console.log('Successfully deleted request with ID:', id);
      return { id, name: existingRequest.name };
    },
    onSuccess: (deletedData) => {
      console.log('Delete mutation successful, updating cache for ID:', deletedData.id);
      
      // Immediately remove from cache with optimistic update
      queryClient.setQueryData(['employeeRequests'], (oldData: EmployeeRequest[] | undefined) => {
        if (!oldData) return [];
        const filtered = oldData.filter(request => request.id !== deletedData.id);
        console.log('Updated cache after delete. Removed request, new count:', filtered.length);
        return filtered;
      });
      
      // Don't invalidate immediately to prevent race conditions
      // The cache update above should be sufficient
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['employeeRequests'] });
      }, 100);
      
      toast({
        title: "Request Deleted",
        description: `${deletedData.name}'s request has been permanently deleted.`,
      });
    },
    onError: (error: any) => {
      console.error('Delete mutation error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete the employee request. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    employeeRequests,
    isLoading,
    error,
    addEmployeeRequest: addEmployeeRequestMutation.mutate,
    isAddingRequest: addEmployeeRequestMutation.isPending,
    updateRequestStatus: updateRequestStatusMutation.mutate,
    isUpdatingRequest: updateRequestStatusMutation.isPending,
    deleteRequest: deleteRequestMutation.mutate,
    isDeletingRequest: deleteRequestMutation.isPending
  };
};
