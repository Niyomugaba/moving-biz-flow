
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  break_duration_minutes?: number;
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
  break_duration_minutes?: number;
}

export const useTimeEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading, error } = useQuery({
    queryKey: ['time-entries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }
      
      return data as TimeEntry[];
    }
  });

  const addTimeEntryMutation = useMutation({
    mutationFn: async (entryData: CreateTimeEntryData) => {
      console.log('Creating time entry with data:', entryData);
      
      // Calculate total pay
      const regularPay = entryData.regular_hours * entryData.hourly_rate;
      const overtimePay = entryData.overtime_hours && entryData.overtime_rate 
        ? entryData.overtime_hours * entryData.overtime_rate 
        : 0;
      const totalPay = regularPay + overtimePay;
      
      const insertData = {
        employee_id: entryData.employee_id,
        job_id: entryData.job_id || null,
        entry_date: entryData.entry_date,
        clock_in_time: entryData.clock_in_time,
        clock_out_time: entryData.clock_out_time,
        regular_hours: entryData.regular_hours,
        overtime_hours: entryData.overtime_hours || null,
        hourly_rate: entryData.hourly_rate,
        overtime_rate: entryData.overtime_rate || null,
        total_pay: totalPay,
        notes: entryData.notes || null,
        break_duration_minutes: entryData.break_duration_minutes || 0,
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

      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
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
      
      // Recalculate total pay if hours or rates are being updated
      if (updates.regular_hours !== undefined || updates.overtime_hours !== undefined || 
          updates.hourly_rate !== undefined || updates.overtime_rate !== undefined) {
        
        // Get current entry to fill in missing values
        const { data: currentEntry } = await supabase
          .from('time_entries')
          .select('*')
          .eq('id', id)
          .single();
        
        if (currentEntry) {
          const regularHours = updates.regular_hours ?? currentEntry.regular_hours ?? 0;
          const overtimeHours = updates.overtime_hours ?? currentEntry.overtime_hours ?? 0;
          const hourlyRate = updates.hourly_rate ?? currentEntry.hourly_rate ?? 0;
          const overtimeRate = updates.overtime_rate ?? currentEntry.overtime_rate ?? (hourlyRate * 1.5);
          
          const regularPay = regularHours * hourlyRate;
          const overtimePay = overtimeHours * overtimeRate;
          updates.total_pay = regularPay + overtimePay;
        }
      }
      
      const { data, error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TimeEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
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
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Deleted",
        description: "Time entry has been successfully deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete time entry.",
        variant: "destructive",
      });
    }
  });

  const approveTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: 'system' // You might want to get actual user ID
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: "Error",
        description: error.message || "Failed to approve time entry.",
        variant: "destructive",
      });
    }
  });

  const rejectTimeEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: "Error",
        description: error.message || "Failed to reject time entry.",
        variant: "destructive",
      });
    }
  });

  const markAsPaidMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('time_entries')
        .update({ 
          is_paid: true,
          paid_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
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
      toast({
        title: "Error",
        description: error.message || "Failed to mark time entry as paid.",
        variant: "destructive",
      });
    }
  });

  return {
    timeEntries,
    isLoading,
    error,
    addTimeEntry: addTimeEntryMutation.mutate,
    updateTimeEntry: updateTimeEntryMutation.mutate,
    deleteTimeEntry: deleteTimeEntryMutation.mutate,
    approveTimeEntry: approveTimeEntryMutation.mutate,
    rejectTimeEntry: rejectTimeEntryMutation.mutate,
    markAsPaid: markAsPaidMutation.mutate,
    isAddingTimeEntry: addTimeEntryMutation.isPending,
    isUpdatingTimeEntry: updateTimeEntryMutation.isPending,
    isDeletingTimeEntry: deleteTimeEntryMutation.isPending,
    isApprovingTimeEntry: approveTimeEntryMutation.isPending,
    isRejectingTimeEntry: rejectTimeEntryMutation.isPending,
    isMarkingAsPaid: markAsPaidMutation.isPending
  };
};
