
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
  break_duration_minutes: number | null;
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
  created_at: string;
  updated_at: string;
}

export const useTimeEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['timeEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select(`
          *,
          employees!inner(name),
          jobs(client_name, job_date)
        `)
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      return data as (TimeEntry & { 
        employees: { name: string };
        jobs: { client_name: string; job_date: string } | null;
      })[];
    }
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: {
      employee_id: string;
      job_id?: string;
      entry_date: string;
      clock_in_time: string;
      clock_out_time?: string;
      regular_hours?: number;
      overtime_hours?: number;
      break_duration_minutes?: number;
      hourly_rate: number;
      overtime_rate?: number;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          employee_id: timeEntryData.employee_id,
          job_id: timeEntryData.job_id || null,
          entry_date: timeEntryData.entry_date,
          clock_in_time: timeEntryData.clock_in_time,
          clock_out_time: timeEntryData.clock_out_time || null,
          regular_hours: timeEntryData.regular_hours || null,
          overtime_hours: timeEntryData.overtime_hours || null,
          break_duration_minutes: timeEntryData.break_duration_minutes || 0,
          hourly_rate: timeEntryData.hourly_rate,
          overtime_rate: timeEntryData.overtime_rate || null,
          notes: timeEntryData.notes || null,
          status: 'pending',
          is_paid: false
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Hours Submitted",
        description: "Your hours have been submitted for approval.",
      });
    }
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Time Entry Updated",
        description: "The time entry has been updated successfully.",
      });
    }
  });

  const approveTimeEntryMutation = useMutation({
    mutationFn: async ({ id, managerNotes }: { id: string; managerNotes?: string }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          status: 'approved',
          manager_notes: managerNotes,
          approved_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Hours Approved",
        description: "The time entry has been approved.",
      });
    }
  });

  const rejectTimeEntryMutation = useMutation({
    mutationFn: async ({ id, managerNotes }: { id: string; managerNotes: string }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          status: 'rejected',
          manager_notes: managerNotes
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Hours Rejected",
        description: "The time entry has been rejected.",
      });
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async ({ id, paid }: { id: string; paid: boolean }) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({
          is_paid: paid,
          paid_at: paid ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries'] });
      toast({
        title: "Payment Status Updated",
        description: "The payment status has been updated.",
      });
    }
  });

  return {
    timeEntries,
    isLoading,
    error,
    addTimeEntry: addTimeEntryMutation.mutate,
    isAddingTimeEntry: addTimeEntryMutation.isPending,
    updateTimeEntry: updateTimeEntryMutation.mutate,
    isUpdatingTimeEntry: updateTimeEntryMutation.isPending,
    approveTimeEntry: approveTimeEntryMutation.mutate,
    isApprovingTimeEntry: approveTimeEntryMutation.isPending,
    rejectTimeEntry: rejectTimeEntryMutation.mutate,
    isRejectingTimeEntry: rejectTimeEntryMutation.isPending,
    markAsPaid: markAsPaidMutation.mutate,
    isMarkingAsPaid: markAsPaidMutation.isPending
  };
};
