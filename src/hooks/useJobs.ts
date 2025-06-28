
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Job {
  id: string;
  job_number: string;
  client_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  origin_address: string;
  destination_address: string;
  job_date: string;
  start_time: string;
  estimated_duration_hours: number;
  actual_duration_hours: number | null;
  hourly_rate: number;
  estimated_total: number;
  actual_total: number | null;
  movers_needed: number;
  truck_size: string | null;
  special_requirements: string | null;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  completion_notes: string | null;
  customer_satisfaction: number | null;
  is_paid: boolean;
  paid_at: string | null;
  payment_method: string | null;
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
    mutationFn: async (jobData: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'job_number'>) => {
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
