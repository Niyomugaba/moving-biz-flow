import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TimeEntry } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useTimeEntries = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries = [], isLoading } = useQuery({
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

      return data;
    },
  });

  const totalHours = timeEntries.reduce((acc, entry) => {
    const clockIn = new Date(entry.clock_in_time);
    const clockOut = new Date(entry.clock_out_time);
    const duration = (clockOut.getTime() - clockIn.getTime()) / (1000 * 60 * 60);
    return acc + duration;
  }, 0);

  const addTimeEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<TimeEntry, 'id'>) => {
      console.log('Adding time entry:', newEntry);
      const { data, error } = await supabase
        .from('time_entries')
        .insert([newEntry]);

      if (error) {
        console.error('Error adding time entry:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Added",
        description: "New time entry has been added successfully.",
      });
    },
    onError: (error) => {
      console.error('Error adding time entry:', error);
      toast({
        title: "Error",
        description: "Failed to add time entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const approveTimeEntry = useMutation({
    mutationFn: async (id: string) => {
      console.log('Approving time entry:', id);
      const { error } = await supabase
        .from('time_entries')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) {
        console.error('Error approving time entry:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Approved",
        description: "The time entry has been approved successfully.",
      });
    },
    onError: (error) => {
      console.error('Error approving time entry:', error);
      toast({
        title: "Error",
        description: "Failed to approve time entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const rejectTimeEntry = useMutation({
    mutationFn: async (id: string) => {
      console.log('Rejecting time entry:', id);
      const { error } = await supabase
        .from('time_entries')
        .update({ 
          status: 'rejected',
          approved_at: null,
          approved_by: null
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error rejecting time entry:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      toast({
        title: "Time Entry Rejected",
        description: "The time entry has been rejected successfully.",
      });
    },
    onError: (error) => {
      console.error('Error rejecting time entry:', error);
      toast({
        title: "Error",
        description: "Failed to reject time entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    timeEntries,
    totalHours,
    isLoading,
    addTimeEntry: addTimeEntryMutation.mutate,
    isAddingTimeEntry: addTimeEntryMutation.isPending,
    approveTimeEntry: approveTimeEntry.mutate,
    isApprovingTimeEntry: approveTimeEntry.isPending,
    rejectTimeEntry: rejectTimeEntry.mutate,
    isRejectingTimeEntry: rejectTimeEntry.isPending,
  };
};
