import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SystemValidator, sanitizeDataForDatabase } from '@/utils/systemValidator';

export interface TimeEntry {
  id: string;
  employee_id: string;
  job_id?: string;
  entry_date: string;
  clock_in_time: string;
  clock_out_time?: string;
  regular_hours?: number;
  overtime_hours?: number;
  hourly_rate: number;
  overtime_rate?: number;
  total_pay?: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  manager_notes?: string;
  approved_by?: string;
  approved_at?: string;
  is_paid: boolean;
  paid_at?: string;
  tip_amount?: number; // This is employee tip (expense) - deducted from revenue
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryData {
  employee_id: string;
  job_id?: string;
  entry_date: string;
  clock_in_time: string;
  clock_out_time: string;
  regular_hours: number;
  overtime_hours?: number;
  hourly_rate: number;
  overtime_rate?: number;
  notes?: string;
  tip_amount?: number; // Employee tip (expense)
}

// Helper function to calculate total pay (for client-side display only)
const calculateTotalPay = (entry: Partial<TimeEntry>): number => {
  const regularPay = (entry.regular_hours || 0) * (entry.hourly_rate || 0);
  const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || entry.hourly_rate || 0);
  const tipAmount = entry.tip_amount || 0;
  return regularPay + overtimePay + tipAmount;
};

export const useTimeEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading, error, refetch } = useQuery({
    queryKey: ['time-entries'],
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
      
      console.log('Time entries fetched:', data?.length);
      return data as TimeEntry[];
    },
    staleTime: 0,
    gcTime: 0,
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (entryData: CreateTimeEntryData) => {
      console.log('Creating time entry with data:', entryData);
      
      const validation = SystemValidator.validateTimeEntryData(entryData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const sanitizedData = sanitizeDataForDatabase(entryData);
      
      // Calculate total pay on the client side for the initial insert
      const totalPay = calculateTotalPay({
        regular_hours: sanitizedData.regular_hours,
        overtime_hours: sanitizedData.overtime_hours,
        hourly_rate: sanitizedData.hourly_rate,
        overtime_rate: sanitizedData.overtime_rate,
        tip_amount: sanitizedData.tip_amount
      });
      
      const insertData = {
        employee_id: sanitizedData.employee_id,
        job_id: sanitizedData.job_id,
        entry_date: sanitizedData.entry_date,
        clock_in_time: sanitizedData.clock_in_time,
        clock_out_time: sanitizedData.clock_out_time,
        regular_hours: sanitizedData.regular_hours,
        overtime_hours: sanitizedData.overtime_hours,
        hourly_rate: sanitizedData.hourly_rate,
        overtime_rate: sanitizedData.overtime_rate,
        notes: sanitizedData.notes,
        tip_amount: sanitizedData.tip_amount || 0,
        total_pay: totalPay,
        status: 'pending' as const
      };

      console.log('Inserting time entry data:', insertData);

      const { data, error } = await supabase
        .from('time_entries')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating time entry:', error);
        throw error;
      }

      // NOTE: Employee tips do NOT get added to job totals as they are expenses, not revenue
      console.log('Time entry created successfully:', data);
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Time Entry Added",
        description: "Time entry has been successfully added.",
      });
    },
    onError: (error: any) => {
      console.error('Error in addTimeEntryMutation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add time entry.",
        variant: "destructive",
      });
    }
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TimeEntry> }) => {
      console.log('Updating time entry:', id, updates);
      
      // Get the original time entry first for tracking changes
      const { data: originalEntry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching original time entry:', fetchError);
        throw fetchError;
      }

      // Remove total_pay from updates as the database trigger will handle it
      const { total_pay, ...updatesWithoutTotalPay } = updates;
      
      console.log('Updates without total_pay:', updatesWithoutTotalPay);

      const { data, error } = await supabase
        .from('time_entries')
        .update(updatesWithoutTotalPay)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating time entry:', error);
        throw error;
      }

      // Employee tips are expenses, not revenue - they don't affect job totals
      console.log('Time entry updated successfully:', data);
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Time Entry Updated",
        description: "Time entry has been successfully updated.",
      });
    },
    onError: (error: any) => {
      console.error('Error updating time entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update time entry.",
        variant: "destructive",
      });
    }
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting time entry:', id);
      
      // Get the time entry before deleting to adjust job total if needed
      const { data: timeEntry, error: fetchError } = await supabase
        .from('time_entries')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching time entry for deletion:', fetchError);
      }

      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting time entry:', error);
        throw error;
      }

      // If there was a tip and job_id, subtract from job total
      if (timeEntry && timeEntry.job_id && timeEntry.tip_amount && timeEntry.tip_amount > 0) {
        console.log('Adjusting job total after time entry deletion:', -timeEntry.tip_amount);
        await updateJobTotalWithTip(timeEntry.job_id, -timeEntry.tip_amount);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast({
        title: "Time Entry Deleted",
        description: "Time entry has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting time entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete time entry.",
        variant: "destructive",
      });
    }
  });

  const approveTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      const approvedBy = user?.id || null;
      
      console.log('Approving time entry with user ID:', approvedBy);
      
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: approvedBy
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error approving time entry:', error);
        throw error;
      }
      
      console.log('Time entry approved successfully:', data);
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Approved",
        description: "Time entry has been approved.",
      });
    },
    onError: (error: any) => {
      console.error('Error in approveTimeEntryMutation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve time entry.",
        variant: "destructive",
      });
    }
  });

  const rejectTimeEntryMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      console.log('Rejecting time entry:', id, 'with reason:', reason);
      
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          status: 'rejected',
          manager_notes: reason || null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error rejecting time entry:', error);
        throw error;
      }
      
      console.log('Time entry rejected successfully:', data);
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Rejected",
        description: "Time entry has been rejected.",
      });
    },
    onError: (error: any) => {
      console.error('Error rejecting time entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to reject time entry.",
        variant: "destructive",
      });
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Marking time entry as paid:', id);
      
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          is_paid: true,
          paid_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error marking time entry as paid:', error);
        throw error;
      }
      
      console.log('Time entry marked as paid successfully:', data);
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Marked as Paid",
        description: "Time entry has been marked as paid.",
      });
    },
    onError: (error: any) => {
      console.error('Error marking time entry as paid:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark time entry as paid.",
        variant: "destructive",
      });
    }
  });

  const markAsUnpaidMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Marking time entry as unpaid:', id);
      
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          is_paid: false,
          paid_at: null
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error marking time entry as unpaid:', error);
        throw error;
      }
      
      console.log('Time entry marked as unpaid successfully:', data);
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Marked as Unpaid",
        description: "Time entry has been marked as unpaid.",
      });
    },
    onError: (error: any) => {
      console.error('Error in markAsUnpaidMutation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to mark time entry as unpaid.",
        variant: "destructive",
      });
    }
  });

  return {
    timeEntries,
    isLoading,
    error,
    refetchTimeEntries: refetch,
    addTimeEntry: addTimeEntryMutation.mutate,
    updateTimeEntry: updateTimeEntryMutation.mutate,
    deleteTimeEntry: deleteTimeEntryMutation.mutate,
    approveTimeEntry: approveTimeEntryMutation.mutate,
    rejectTimeEntry: ({ id, reason }: { id: string; reason?: string }) => rejectTimeEntryMutation.mutate({ id, reason }),
    markAsPaid: markAsPaidMutation.mutate,
    markAsUnpaid: markAsUnpaidMutation.mutate,
    isAddingTimeEntry: addTimeEntryMutation.isPending,
    isUpdatingTimeEntry: updateTimeEntryMutation.isPending,
    isDeletingTimeEntry: deleteTimeEntryMutation.isPending,
    isApprovingTimeEntry: approveTimeEntryMutation.isPending,
    isRejectingTimeEntry: rejectTimeEntryMutation.isPending,
    isMarkingAsPaid: markAsPaidMutation.isPending,
    isMarkingAsUnpaid: markAsUnpaidMutation.isPending
  };
};
