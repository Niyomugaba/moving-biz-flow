
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TimeEntry {
  id: string;
  employee_id: string;
  job_id: string | null;
  entry_date: string;
  clock_in_time: string;
  clock_out_time: string | null;
  regular_hours: number | null;
  overtime_hours: number | null;
  hourly_rate: number;
  overtime_rate: number | null;
  total_pay: number | null;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  manager_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  is_paid: boolean;
  paid_at: string | null;
  break_duration_minutes: number | null;
  created_at: string;
  updated_at: string;
}

export const useTimeEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      console.log('Fetching time entries...');
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }
      console.log('Time entries fetched successfully:', data?.length);
      return data as TimeEntry[];
    }
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: {
      employee_id: string;
      job_id?: string;
      entry_date: string;
      clock_in_time: string;
      clock_out_time: string;
      regular_hours: number;
      overtime_hours?: number;
      hourly_rate: number;
      overtime_rate?: number;
      break_duration_minutes?: number;
      notes?: string;
    }) => {
      console.log('Creating time entry with data:', timeEntryData);
      
      const regularPay = timeEntryData.regular_hours * timeEntryData.hourly_rate;
      const overtimePay = timeEntryData.overtime_hours && timeEntryData.overtime_rate 
        ? timeEntryData.overtime_hours * timeEntryData.overtime_rate 
        : 0;
      const totalPay = regularPay + overtimePay;

      const insertData = {
        ...timeEntryData,
        total_pay: totalPay,
        status: 'pending' as const
      };

      const { data, error } = await supabase
        .from('time_entries')
        .insert([insertData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating time entry:', error);
        throw error;
      }
      
      console.log('Time entry created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Hours Submitted",
        description: "Your work hours have been submitted for approval.",
      });
    },
    onError: (error) => {
      console.error('Error in addTimeEntryMutation:', error);
      toast({
        title: "Error Submitting Hours",
        description: "There was an error submitting your hours. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
      console.log('Updating time entry:', id, updates);
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating time entry:', error);
        throw error;
      }
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      
      const statusText = variables.updates.status === 'approved' ? 'approved' : 
                        variables.updates.status === 'rejected' ? 'rejected' : 'updated';
      
      if (variables.updates.status === 'pending') {
        toast({
          title: "Status Reset",
          description: "Time entry status has been reset to pending.",
        });
      } else {
        toast({
          title: "Time Entry Updated",
          description: `Time entry has been ${statusText}.`,
        });
      }
    },
    onError: (error) => {
      console.error('Error updating time entry:', error);
      toast({
        title: "Error Updating Time Entry",
        description: "There was an error updating the time entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const approveTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Approving time entry:', id);
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'manager' // In a real app, this would be the current user ID
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error approving time entry:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Time Entry Approved",
        description: "The time entry has been approved.",
      });
    },
    onError: (error) => {
      console.error('Error approving time entry:', error);
      toast({
        title: "Error Approving Time Entry",
        description: "There was an error approving the time entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  const rejectTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Rejecting time entry:', id);
      const { data, error } = await supabase
        .from('time_entries')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error rejecting time entry:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Time Entry Rejected",
        description: "The time entry has been rejected.",
      });
    },
    onError: (error) => {
      console.error('Error rejecting time entry:', error);
      toast({
        title: "Error Rejecting Time Entry",
        description: "There was an error rejecting the time entry. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    timeEntries,
    isLoading,
    error,
    addTimeEntry: addTimeEntryMutation.mutateAsync,
    updateTimeEntry: updateTimeEntryMutation.mutate,
    approveTimeEntry: approveTimeEntryMutation.mutate,
    rejectTimeEntry: rejectTimeEntryMutation.mutate,
    isAddingTimeEntry: addTimeEntryMutation.isPending,
    isUpdatingTimeEntry: updateTimeEntryMutation.isPending,
    isApprovingTimeEntry: approveTimeEntryMutation.isPending,
    isRejectingTimeEntry: rejectTimeEntryMutation.isPending
  };
};
