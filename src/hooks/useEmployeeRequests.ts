
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
      // First update the request status
      const { data: requestData, error: requestError } = await supabase
        .from('employee_requests')
        .update({ status, notes })
        .eq('id', id)
        .select()
        .single();
      
      if (requestError) throw requestError;

      // If approved, create employee record
      if (status === 'approved' && hourlyWage) {
        const { error: employeeError } = await supabase
          .from('employees')
          .insert([{
            name: requestData.name,
            phone: requestData.phone,
            hourly_wage: hourlyWage,
            status: 'Active',
            hire_date: new Date().toISOString().split('T')[0]
          }]);
        
        if (employeeError) throw employeeError;
      }

      return requestData;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employeeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      if (variables.status === 'approved') {
        toast({
          title: "Request Approved",
          description: `${data.name} has been approved and added as an employee.`,
        });
      } else {
        toast({
          title: "Request Updated",
          description: "The employee request has been updated.",
        });
      }
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
