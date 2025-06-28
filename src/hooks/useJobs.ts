
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Job {
  id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  address: string;
  job_date: string;
  job_time: string;
  hourly_rate: number;
  movers_needed: number;
  actual_hours: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  notes: string | null;
  paid: boolean;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export const useJobs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('job_date', { ascending: false });
      
      if (error) throw error;
      return data as Job[];
    }
  });

  const addJobMutation = useMutation({
    mutationFn: async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Scheduled Successfully",
        description: "New job has been added to your schedule.",
      });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Job> }) => {
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Updated",
        description: "Job information has been updated.",
      });
    }
  });

  return {
    jobs,
    isLoading,
    error,
    addJob: addJobMutation.mutate,
    updateJob: updateJobMutation.mutate,
    isAddingJob: addJobMutation.isPending,
    isUpdatingJob: updateJobMutation.isPending
  };
};
