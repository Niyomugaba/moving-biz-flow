
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  hourly_wage: number;
  status: 'Active' | 'Inactive';
  hire_date: string;
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
    mutationFn: async (employeeData: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('employees')
        .insert([employeeData])
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

  return {
    employees,
    isLoading,
    error,
    addEmployee: addEmployeeMutation.mutate,
    isAddingEmployee: addEmployeeMutation.isPending
  };
};
