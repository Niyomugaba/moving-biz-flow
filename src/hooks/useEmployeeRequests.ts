
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
      const { data, error } = await supabase
        .from('employee_requests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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

        // Update the request status - use direct update without select
        const { error: updateError } = await supabase
          .from('employee_requests')
          .update({ 
            status, 
            notes: notes || null 
          })
          .eq('id', id);
        
        if (updateError) {
          console.error('Request update error:', updateError);
          throw new Error(`Failed to update request: ${updateError.message}`);
        }

        console.log('Request updated successfully');

        // If approved, create employee record
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
          
          return {
            ...currentRequest,
            status,
            notes: notes || null,
            employee: employeeData
          };
        }

        // Return the updated request data
        return {
          ...currentRequest,
          status,
          notes: notes || null
        };
        
      } catch (error) {
        console.error('Error in updateRequestStatus:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      console.log('Mutation success, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['employeeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      if (variables.status === 'approved') {
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

  return {
    employeeRequests,
    isLoading,
    error,
    addEmployeeRequest: addEmployeeRequestMutation.mutate,
    isAddingRequest: addEmployeeRequestMutation.isPending,
    updateRequestStatus: updateRequestStatusMutation.mutate,
    isUpdatingRequest: updateRequestStatusMutation.isPending
  };
};
