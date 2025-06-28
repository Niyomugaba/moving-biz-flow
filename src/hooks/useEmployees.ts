
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  employee_number: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  hourly_wage: number;
  overtime_rate: number | null;
  hire_date: string;
  status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  department: string | null;
  position: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useEmployees = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [], isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data as Employee[];
    }
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at' | 'employee_number'>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Employee Added Successfully",
        description: "New employee has been added to your team.",
      });
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Employee> }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({
        title: "Employee Removed",
        description: "Employee has been removed from your team.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove employee. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    employees,
    isLoading,
    error,
    addEmployee: addEmployeeMutation.mutate,
    isAddingEmployee: addEmployeeMutation.isPending,
    updateEmployee: updateEmployeeMutation.mutate,
    isUpdatingEmployee: updateEmployeeMutation.isPending,
    deleteEmployee: deleteEmployeeMutation.mutate,
    isDeletingEmployee: deleteEmployeeMutation.isPending
  };
};
