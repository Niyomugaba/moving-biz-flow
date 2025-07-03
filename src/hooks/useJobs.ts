
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Job {
  id: string;
  job_number: string;
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  origin_address: string;
  destination_address: string;
  job_date: string;
  start_time: string;
  hourly_rate: number;
  movers_needed: number;
  estimated_total: number;
  actual_duration_hours?: number;
  actual_total?: number;
  truck_size?: string;
  special_requirements?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';
  customer_satisfaction?: number;
  is_paid: boolean;
  payment_method?: string;
  paid_at?: string;
  payment_due_date?: string;
  tax_amount?: number;
  invoice_number?: string;
  completion_notes?: string;
  truck_service_fee?: number;
  truck_rental_cost?: number;
  truck_gas_cost?: number;
  lead_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobData {
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  origin_address: string;
  destination_address: string;
  job_date: string;
  start_time: string;
  hourly_rate: number;
  movers_needed: number;
  estimated_total: number;
  truck_size?: string;
  special_requirements?: string;
  is_paid?: boolean;
  payment_method?: string;
  paid_at?: string;
  lead_id?: string;
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
    mutationFn: async (jobData: CreateJobData) => {
      console.log('Creating job with data:', jobData);
      
      const insertData = {
        client_id: jobData.client_id,
        client_name: jobData.client_name,
        client_phone: jobData.client_phone,
        client_email: jobData.client_email,
        origin_address: jobData.origin_address,
        destination_address: jobData.destination_address,
        job_date: jobData.job_date,
        start_time: jobData.start_time,
        hourly_rate: jobData.hourly_rate,
        estimated_total: jobData.estimated_total,
        movers_needed: jobData.movers_needed,
        truck_size: jobData.truck_size,
        special_requirements: jobData.special_requirements,
        is_paid: jobData.is_paid || false,
        payment_method: jobData.payment_method,
        paid_at: jobData.paid_at,
        lead_id: jobData.lead_id,
        status: 'scheduled' as const,
        estimated_duration_hours: 2 // Default 2 hours minimum
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

      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Created",
        description: "Job has been successfully scheduled.",
      });
    },
    onError: (error: any) => {
      console.error('Error in addJobMutation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create job.",
        variant: "destructive",
      });
    }
  });

  const convertLeadToJobMutation = useMutation({
    mutationFn: async ({ leadId, leadData }: { leadId: string; leadData: any }) => {
      console.log('Converting lead to job:', leadId, leadData);
      
      // Create job with minimal required data
      const jobInsertData = {
        client_name: leadData.name,
        client_phone: leadData.phone,
        client_email: leadData.email,
        origin_address: 'TBD', // To be determined during scheduling
        destination_address: 'TBD', // To be determined during scheduling
        job_date: new Date().toISOString().split('T')[0], // Today's date as placeholder
        start_time: '09:00', // Default start time
        hourly_rate: 50, // Default rate
        movers_needed: 2, // Default movers
        estimated_total: 100, // Default estimate
        lead_id: leadId,
        status: 'scheduled' as const,
        estimated_duration_hours: 2
      };

      const { data: createdJob, error: jobError } = await supabase
        .from('jobs')
        .insert(jobInsertData)
        .select()
        .single();

      if (jobError) {
        console.error('Error creating job from lead:', jobError);
        throw jobError;
      }

      // Update lead status to converted
      const { error: leadError } = await supabase
        .from('leads')
        .update({ status: 'converted' })
        .eq('id', leadId);

      if (leadError) {
        console.error('Error updating lead status:', leadError);
        throw leadError;
      }

      return createdJob as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead Converted",
        description: "Lead has been converted to a job. You can now schedule it from the Jobs page.",
      });
    },
    onError: (error: any) => {
      console.error('Error converting lead to job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to convert lead to job.",
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

      if (error) throw error;
      return data as Job;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Updated",
        description: "Job has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job.",
        variant: "destructive",
      });
    }
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting job:', id);
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Job Deleted",
        description: "Job has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job.",
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
    deleteJob: deleteJobMutation.mutate,
    convertLeadToJob: convertLeadToJobMutation.mutate,
    isAddingJob: addJobMutation.isPending,
    isUpdatingJob: updateJobMutation.isPending,
    isDeletingJob: deleteJobMutation.isPending,
    isConvertingLead: convertLeadToJobMutation.isPending
  };
};
