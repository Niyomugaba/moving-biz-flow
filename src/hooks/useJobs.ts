
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
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled' | 'pending_schedule';
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
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching jobs:', error);
        throw error;
      }
      
      console.log('Jobs fetched successfully:', data?.length);
      console.log('Jobs data:', data);
      
      // Check for jobs with lead_id to see converted leads
      const convertedLeadJobs = data?.filter(job => job.lead_id) || [];
      console.log('Jobs converted from leads:', convertedLeadJobs.length, convertedLeadJobs);
      
      const pendingJobs = data?.filter(job => job.status === 'pending_schedule') || [];
      console.log('Jobs with pending_schedule status:', pendingJobs.length, pendingJobs);
      
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
      console.log('Starting lead conversion process:', leadId, leadData);
      
      try {
        // First, create a client from the lead data
        const clientInsertData = {
          name: leadData.name,
          phone: leadData.phone,
          email: leadData.email || null,
          primary_address: 'Address to be confirmed during scheduling',
          secondary_address: null,
          company_name: null,
          notes: leadData.notes || null,
          preferred_contact_method: 'phone',
          rating: null,
          total_revenue: 0,
          total_jobs_completed: 0
        };

        console.log('Creating client with data:', clientInsertData);

        const { data: createdClient, error: clientError } = await supabase
          .from('clients')
          .insert(clientInsertData)
          .select()
          .single();

        if (clientError) {
          console.error('Error creating client from lead:', clientError);
          throw new Error(`Failed to create client: ${clientError.message}`);
        }

        console.log('Client created successfully:', createdClient);

        // Create job with pending_schedule status - needs to be scheduled
        const jobInsertData = {
          client_id: createdClient.id,
          client_name: leadData.name,
          client_phone: leadData.phone,
          client_email: leadData.email || null,
          origin_address: 'Origin address to be confirmed during scheduling',
          destination_address: 'Destination address to be confirmed during scheduling',
          job_date: '2025-01-01', // Placeholder date - will be updated when scheduled
          start_time: '09:00', // Placeholder time - will be updated when scheduled
          hourly_rate: leadData.estimated_value ? Math.max(50, Math.floor(leadData.estimated_value / 4)) : 50,
          movers_needed: 2,
          estimated_total: leadData.estimated_value || 200,
          estimated_duration_hours: 4,
          lead_id: leadId,
          status: 'pending_schedule' as const,
          truck_size: null,
          special_requirements: leadData.notes || null,
          is_paid: false
        };

        console.log('Creating job with data:', jobInsertData);

        const { data: createdJob, error: jobError } = await supabase
          .from('jobs')
          .insert(jobInsertData)
          .select()
          .single();

        if (jobError) {
          console.error('Error creating job from lead:', jobError);
          throw new Error(`Failed to create job: ${jobError.message}`);
        }

        console.log('Job created successfully:', createdJob);

        // Update lead status to converted
        const { error: leadError } = await supabase
          .from('leads')
          .update({ status: 'converted' })
          .eq('id', leadId);

        if (leadError) {
          console.error('Error updating lead status:', leadError);
          throw new Error(`Failed to update lead status: ${leadError.message}`);
        }

        console.log('Lead status updated to converted successfully');

        return { job: createdJob as Job, client: createdClient };

      } catch (error) {
        console.error('Full error in lead conversion:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Lead conversion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      toast({
        title: "Lead Converted Successfully",
        description: `Lead converted to client "${data.client.name}". The job is ready for scheduling in the Jobs section.`,
      });
    },
    onError: (error: any) => {
      console.error('Error converting lead to job:', error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert lead to job. Please try again.",
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
