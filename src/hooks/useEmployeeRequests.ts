
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
      
      // First, check if the request exists
      const { data: existingRequest, error: checkError } = await supabase
        .from('employee_requests')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking request:', checkError);
        throw checkError;
      }
      
      if (!existingRequest) {
        console.error('Request not found with ID:', id);
        throw new Error('Employee request not found');
      }
      
      console.log('Found existing request:', existingRequest);
      
      // Update the request status
      const { data: requestData, error: requestError } = await supabase
        .from('employee_requests')
        .update({ status, notes })
        .eq('id', id)
        .select()
        .maybeSingle();
      
      if (requestError) {
        console.error('Request update error:', requestError);
        throw requestError;
      }

      if (!requestData) {
        console.error('No data returned from update');
        throw new Error('Failed to update employee request');
      }

      console.log('Request updated successfully:', requestData);

      // If approved, create employee record
      if (status === 'approved' && hourlyWage) {
        console.log('Creating employee record...');
        
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .insert([{
            name: requestData.name,
            phone: requestData.phone,
            hourly_wage: hourlyWage,
            status: 'Active',
            hire_date: new Date().toISOString().split('T')[0]
          }])
          .select()
          .maybeSingle();
        
        if (employeeError) {
          console.error('Employee creation error:', employeeError);
          throw employeeError;
        }

        console.log('Employee created successfully:', employeeData);
      }

      return requestData;
    },
    onSuccess: (data, variables) => {
      console.log('Mutation success, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['employeeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      if (variables.status === 'approved') {
        toast({
          title: "Request Approved",
          description: `${data.name} has been approved and can now access the employee portal with their phone number.`,
        });
      } else if (variables.status === 'rejected') {
        toast({
          title: "Request Rejected",
          description: `${data.name}'s request has been rejected.`,
        });
      } else {
        toast({
          title: "Request Updated",
          description: "The employee request has been updated.",
        });
      }
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "Error",
        description: `Failed to update the employee request: ${error.message}. Please try again.`,
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
