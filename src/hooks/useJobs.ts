import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SystemValidator, sanitizeDataForDatabase } from '@/utils/systemValidator';

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
  lead_cost?: number;
  created_at: string;
  updated_at: string;
  // Pricing fields
  pricing_model?: 'per_person' | 'flat_rate';
  flat_hourly_rate?: number;
  worker_hourly_rate?: number;
  // Add hours_worked as a calculated field for the form
  hours_worked?: number;
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
  lead_cost?: number;
  is_lead?: boolean;
  // New pricing fields
  pricing_model?: 'per_person' | 'flat_rate';
  flat_hourly_rate?: number;
  worker_hourly_rate?: number;
}

export const useJobs = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: jobs = [], isLoading, error, refetch } = useQuery({
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
      
      // Debug: Check for Natalie's job and fix client_id if missing
      if (data) {
        const natalieJob = data.find(job => 
          job.client_name === 'Natalie' || job.client_phone === '+1 (412) 273-5545'
        );
        
        if (natalieJob && !natalieJob.client_id && natalieJob.status === 'completed') {
          console.log('🔧 FIXING: Natalie\'s completed job has no client_id! Linking now...');
          
          // Find Natalie's client record
          const { data: natalieClient, error: clientError } = await supabase
            .from('clients')
            .select('id, name, phone')
            .eq('phone', '+1 (412) 273-5545')
            .single();
            
          if (!clientError && natalieClient) {
            console.log('📝 Found Natalie\'s client record, updating job...');
            
            // Update the job with the correct client_id
            const { error: updateError } = await supabase
              .from('jobs')
              .update({ client_id: natalieClient.id })
              .eq('id', natalieJob.id);
              
            if (updateError) {
              console.error('❌ Failed to update job client_id:', updateError);
            } else {
              console.log('✅ Successfully linked job to client! This should trigger stats update.');
              
              // Force refresh of client data after linking
              queryClient.invalidateQueries({ queryKey: ['clients'] });
              queryClient.invalidateQueries({ queryKey: ['client-stats'] });
              
              // Re-fetch the updated jobs data
              const { data: updatedData } = await supabase
                .from('jobs')
                .select('*')
                .order('created_at', { ascending: false });
              return updatedData as Job[];
            }
          } else {
            console.log('❌ Could not find Natalie\'s client record:', clientError);
          }
        } else if (natalieJob) {
          console.log('✅ Natalie\'s job already has client_id:', natalieJob.client_id);
        }
      }
      
      return data as Job[];
    },
    staleTime: 0,
    gcTime: 0,
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ id, updates, shouldCreateDummyEmployees = false }: { 
      id: string; 
      updates: Partial<Job>; 
      shouldCreateDummyEmployees?: boolean 
    }) => {
      console.log('Updating job:', id, updates);
      
      // Log if this is a status change to completed
      if (updates.status === 'completed') {
        console.log('Job being marked as completed - database trigger will update client stats automatically');
      }
      
      // First update the job
      const { data, error } = await supabase
        .from('jobs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // If this is a flat_rate job and we need to create dummy employees
      if (shouldCreateDummyEmployees && 
          updates.pricing_model === 'flat_rate' && 
          updates.worker_hourly_rate && 
          updates.movers_needed) {
        
        console.log('Creating dummy employees for negotiated job');
        
        const dummyEmployees = [];
        const firstNames = ['Alex', 'Jordan', 'Casey', 'Morgan', 'Taylor', 'Riley', 'Avery', 'Quinn', 'Sage', 'River'];
        
        for (let i = 0; i < updates.movers_needed; i++) {
          const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)];
          const dummyName = `Dummy ${randomFirstName} ${i + 1}`;
          const dummyPhone = `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
          
          const employeeData = {
            name: dummyName,
            phone: dummyPhone,
            email: `dummy${i + 1}@temp.com`,
            hourly_wage: updates.worker_hourly_rate,
            status: 'active' as const,
            hire_date: new Date().toISOString().split('T')[0],
            position: 'dummy_worker',
            department: 'temporary',
            notes: `Dummy employee created for job ${id}`
          };

          const { data: employeeData2, error: employeeError } = await supabase
            .from('employees')
            .insert({
              employee_number: '', // Will be auto-generated by trigger
              name: employeeData.name,
              phone: employeeData.phone,
              email: employeeData.email,
              hourly_wage: employeeData.hourly_wage,
              status: employeeData.status,
              hire_date: employeeData.hire_date,
              position: employeeData.position,
              department: employeeData.department,
              notes: employeeData.notes
            })
            .select()
            .single();

          if (employeeError) {
            console.error('Error creating dummy employee:', employeeError);
          } else {
            dummyEmployees.push(employeeData2);
            
            // Create time entry for this dummy employee
            const jobDate = new Date(data.job_date);
            const [hours, minutes] = data.start_time.split(':');
            const clockInTime = new Date(jobDate);
            clockInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            const hoursWorked = updates.hours_worked || 8; // Default to 8 hours if not specified
            const clockOutTime = new Date(clockInTime);
            clockOutTime.setHours(clockOutTime.getHours() + hoursWorked);

            console.log('Creating time entry for dummy employee:', employeeData2.name);
            
            const { error: timeEntryError } = await supabase
              .from('time_entries')
              .insert({
                employee_id: employeeData2.id,
                job_id: id,
                entry_date: data.job_date,
                clock_in_time: clockInTime.toISOString(),
                clock_out_time: clockOutTime.toISOString(),
                regular_hours: Math.min(hoursWorked, 8),
                overtime_hours: Math.max(0, hoursWorked - 8),
                hourly_rate: updates.worker_hourly_rate,
                overtime_rate: updates.worker_hourly_rate * 1.5,
                status: 'approved',
                notes: `Auto-generated for dummy employee on negotiated job ${data.job_number}`,
                approved_at: new Date().toISOString(),
                break_duration_minutes: 30
              });

            if (timeEntryError) {
              console.error('Error creating time entry for dummy employee:', timeEntryError);
            } else {
              console.log('Time entry created successfully for dummy employee:', employeeData2.name);
            }
          }
        }

        console.log('Created dummy employees:', dummyEmployees);
      }

      return data as Job;
    },
    onSuccess: (data) => {
      console.log('Job updated successfully, invalidating related queries');
      
      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      
      // If job was completed, the database trigger automatically updated client stats
      if (data.status === 'completed') {
        console.log('Job completed - database trigger has automatically updated client statistics');
        // Force immediate refetch of clients to show updated stats
        setTimeout(() => {
          queryClient.refetchQueries({ queryKey: ['clients'] });
        }, 100);
      }
      
      toast({
        title: "Job Updated",
        description: "Job has been successfully updated.",
        duration: 2000
      });
    },
    onError: (error: any) => {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job.",
        variant: "destructive",
        duration: 2000
      });
    }
  });

  const addJobMutation = useMutation({
    mutationFn: async (jobData: CreateJobData & { shouldCreateDummyEmployees?: boolean }) => {
      console.log('Creating job with data:', jobData);
      
      // Extract flags and process job data
      const { is_lead, shouldCreateDummyEmployees, ...jobDataWithoutFlags } = jobData;
      const isLead = is_lead === true;
      
      // Validate job data
      const validation = SystemValidator.validateJobData(jobDataWithoutFlags);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const sanitizedData = sanitizeDataForDatabase(jobDataWithoutFlags);
      
      let leadId = sanitizedData.lead_id;
      
      if ((isLead || (sanitizedData.lead_cost && sanitizedData.lead_cost > 0)) && !leadId) {
        console.log('Creating lead entry for client marked as lead:', sanitizedData.client_name);
        
        const { data: leadData, error: leadError } = await supabase
          .from('leads')
          .insert({
            name: sanitizedData.client_name,
            phone: sanitizedData.client_phone,
            email: sanitizedData.client_email || null,
            estimated_value: sanitizedData.estimated_total,
            lead_cost: sanitizedData.lead_cost || 0,
            status: 'converted',
            source: 'other',
            notes: isLead ? 'Added as lead during manual job scheduling' : 'Direct scheduling with lead cost tracking'
          })
          .select()
          .single();
        
        if (leadError) {
          console.error('Error creating lead:', leadError);
        } else {
          leadId = leadData.id;
          console.log('Lead created successfully:', leadData);
        }
      }
      
      let clientId = sanitizedData.client_id;
      
      if (!clientId) {
        const { data: existingClient, error: clientCheckError } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', sanitizedData.client_phone)
          .maybeSingle();

        if (clientCheckError) {
          console.error('Error checking existing client:', clientCheckError);
        } else if (existingClient) {
          clientId = existingClient.id;
          console.log('Found existing client:', existingClient.id);
        } else {
          const { data: newClient, error: clientError } = await supabase
            .from('clients')
            .insert({
              name: sanitizedData.client_name,
              phone: sanitizedData.client_phone,
              email: sanitizedData.client_email || null,
              primary_address: sanitizedData.origin_address || 'Address from job booking',
              total_jobs_completed: 0,
              total_revenue: 0
            })
            .select()
            .single();

          if (clientError) {
            console.error('Error creating client:', clientError);
          } else if (newClient) {
            clientId = newClient.id;
            console.log('Client created successfully:', newClient);
          }
        }
      }
      
      const insertData = {
        client_id: clientId,
        client_name: sanitizedData.client_name,
        client_phone: sanitizedData.client_phone,
        client_email: sanitizedData.client_email,
        origin_address: sanitizedData.origin_address,
        destination_address: sanitizedData.destination_address,
        job_date: sanitizedData.job_date,
        start_time: sanitizedData.start_time,
        hourly_rate: sanitizedData.hourly_rate,
        estimated_total: sanitizedData.estimated_total,
        movers_needed: sanitizedData.movers_needed,
        truck_size: sanitizedData.truck_size,
        special_requirements: sanitizedData.special_requirements,
        is_paid: sanitizedData.is_paid || false,
        payment_method: sanitizedData.payment_method,
        paid_at: sanitizedData.paid_at,
        lead_id: leadId,
        status: 'scheduled' as const,
        estimated_duration_hours: 2,
        pricing_model: sanitizedData.pricing_model || 'per_person',
        flat_hourly_rate: sanitizedData.flat_hourly_rate,
        worker_hourly_rate: sanitizedData.worker_hourly_rate
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
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      
      toast({
        title: "Job Created",
        description: "Job has been successfully scheduled.",
        duration: 2000
      });
    },
    onError: (error: any) => {
      console.error('Error in addJobMutation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create job.",
        variant: "destructive",
        duration: 2000
      });
    }
  });

  const convertLeadToJobMutation = useMutation({
    mutationFn: async ({ leadId, leadData }: { leadId: string; leadData: any }) => {
      console.log('Starting lead conversion process:', leadId, leadData);
      
      try {
        // Find or create client from the lead
        let clientId: string | null = null;
        
        // First check if client already exists with same phone
        const { data: existingClient, error: clientCheckError } = await supabase
          .from('clients')
          .select('id')
          .eq('phone', leadData.phone)
          .maybeSingle();

        if (clientCheckError) {
          console.error('Error checking existing client:', clientCheckError);
        } else if (existingClient) {
          clientId = existingClient.id;
          console.log('Found existing client:', existingClient.id);
        } else {
          // Create new client
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

          clientId = createdClient.id;
          console.log('Client created successfully:', createdClient);
        }

        // Get current date and set default scheduling
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const jobDate = tomorrow.toISOString().split('T')[0];

        // Create job with scheduled status and realistic default values
        const jobInsertData = {
          client_id: clientId,
          client_name: leadData.name,
          client_phone: leadData.phone,
          client_email: leadData.email || null,
          origin_address: 'Origin address - Please update before job date',
          destination_address: 'Destination address - Please update before job date',
          job_date: jobDate,
          start_time: '09:00',
          hourly_rate: leadData.estimated_value ? Math.max(50, Math.floor(leadData.estimated_value / 4)) : 75,
          movers_needed: 2,
          estimated_total: leadData.estimated_value || 300,
          estimated_duration_hours: 4,
          lead_id: leadId,
          status: 'scheduled' as const,
          truck_size: 'medium',
          special_requirements: leadData.notes ? `Lead notes: ${leadData.notes}` : 'Converted from lead - please verify all details',
          is_paid: false
        };

        console.log('Creating scheduled job with data:', jobInsertData);

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

        return { job: createdJob as Job, client: existingClient || clientId };

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
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      
      toast({
        title: "Lead Converted Successfully",
        description: `Lead converted and scheduled as job for tomorrow. Please update addresses and details in the Jobs section.`,
        duration: 4000
      });
    },
    onError: (error: any) => {
      console.error('Error converting lead to job:', error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert lead to job. Please try again.",
        variant: "destructive",
        duration: 2000
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
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-stats'] });
      
      toast({
        title: "Job Deleted",
        description: "Job has been successfully deleted.",
        duration: 2000
      });
    },
    onError: (error: any) => {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete job.",
        variant: "destructive",
        duration: 2000
      });
    }
  });

  return {
    jobs,
    isLoading,
    error,
    refetchJobs: refetch,
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
