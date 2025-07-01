
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
  payment_due_date: string | null;
  invoice_number: string | null;
  tax_amount: number | null;
  created_at: string;
  updated_at: string;
}

export const useJobs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      console.log('Fetching jobs...');
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('job_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      console.log('Jobs fetched successfully:', data?.length);
      return data as Job[];
    }
  });

  const addJobMutation = useMutation({
    mutationFn: async (jobData: {
      client_name: string;
      client_phone: string;
      client_email?: string | null;
      origin_address: string;
      destination_address: string;
      job_date: string;
      start_time: string;
      estimated_duration_hours: number;
      hourly_rate: number;
      estimated_total: number;
      movers_needed: number;
      truck_size?: string | null;
      special_requirements?: string | null;
      client_id?: string | null;
      is_paid?: boolean;
      payment_method?: string | null;
      paid_at?: string | null;
    }) => {
      console.log('Creating job with data:', jobData);
      
      const insertData = {
        client_name: jobData.client_name,
        client_phone: jobData.client_phone,
        client_email: jobData.client_email,
        origin_address: jobData.origin_address,
        destination_address: jobData.destination_address,
        job_date: jobData.job_date,
        start_time: jobData.start_time,
        estimated_duration_hours: jobData.estimated_duration_hours,
        hourly_rate: jobData.hourly_rate,
        estimated_total: jobData.estimated_total,
        movers_needed: jobData.movers_needed,
        truck_size: jobData.truck_size,
        special_requirements: jobData.special_requirements,
        client_id: jobData.client_id,
        is_paid: jobData.is_paid || false,
        payment_method: jobData.payment_method,
        paid_at: jobData.paid_at,
        status: 'scheduled' as const
      };

      console.log('Inserting job data:', insertData);

      const { data, error } = await supabase
        .from('jobs')
        .insert(insertData)
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating job:', error);
        throw error;
      }
      
      console.log('Job created successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Scheduled Successfully",
        description: `Job ${data.job_number} has been added to your schedule.`,
      });
    },
    onError: (error) => {
      console.error('Error in addJobMutation:', error);
      toast({
        title: "Error Scheduling Job",
        description: "There was an error creating the job. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Job> }) => {
      console.log('Updating job:', id, updates);
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating job:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Updated",
        description: "Job information has been updated.",
      });
    },
    onError: (error) => {
      console.error('Error updating job:', error);
      toast({
        title: "Error Updating Job",
        description: "There was an error updating the job. Please try again.",
        variant: "destructive",
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
