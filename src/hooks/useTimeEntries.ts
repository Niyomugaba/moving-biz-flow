
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
  status: 'pending' | 'approved' | 'rejected';
  manager_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  paid: boolean;
  paid_at: string | null;
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
        .select(`
          *,
          employees!inner(name),
          jobs!inner(client_name, job_date)
        `)
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      return data as (TimeEntry & { 
        employees: { name: string };
        jobs: { client_name: string; job_date: string };
      })[];
    }
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: Omit<TimeEntry, 'id' | 'created_at' | 'status' | 'manager_notes' | 'approved_by' | 'approved_at' | 'paid' | 'paid_at'>) => {
      const { data, error } = await supabase
        .from('time_entries')
        .insert([{ ...timeEntryData, status: 'pending', paid: false }])
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
          paid,
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
