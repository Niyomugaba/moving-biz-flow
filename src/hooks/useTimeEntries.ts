
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TimeEntry {
  id: string;
  employee_id: string;
  job_id: string;
  hours_worked: number;
  hourly_rate: number;
  entry_date: string;
  notes: string | null;
  created_at: string;
}

export const useTimeEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      return data as TimeEntry[];
    }
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: Omit<TimeEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([timeEntryData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Time Entry Added",
        description: "Hours have been recorded successfully.",
      });
    }
  });

  return {
    timeEntries,
    isLoading,
    error,
    addTimeEntry: addTimeEntryMutation.mutate,
    isAddingTimeEntry: addTimeEntryMutation.isPending
  };
};
