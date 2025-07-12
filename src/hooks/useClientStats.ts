
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs } from './useJobs';

export const useClientStats = () => {
  const { jobs } = useJobs();

  const { data: clientStats = [], isLoading, refetch } = useQuery({
    queryKey: ['client-stats'],
    queryFn: async () => {
      console.log('Calculating client statistics from jobs:', jobs);
      
      const clientStatsMap = new Map();
      
      jobs.forEach(job => {
        const clientId = job.client_id;
        const clientName = job.client_name;
        
        if (!clientStatsMap.has(clientId)) {
          clientStatsMap.set(clientId, {
            client_id: clientId,
            client_name: clientName,
            total_jobs_completed: 0,
            total_revenue: 0
          });
        }
        
        const stats = clientStatsMap.get(clientId);
        
        // Count completed jobs and calculate revenue
        if (job.status === 'completed') {
          stats.total_jobs_completed += 1;
          console.log(`Job ${job.job_number} is completed for client ${clientName}`);
          
          // Add revenue from completed jobs (use actual_total if available, otherwise estimated_total)
          const revenueAmount = job.actual_total || job.estimated_total || 0;
          stats.total_revenue += revenueAmount;
          console.log(`Adding revenue ${revenueAmount} from completed job ${job.job_number} for client ${clientName}`);
        }
      });
      
      const statsArray = Array.from(clientStatsMap.values());
      console.log('Final calculated client stats:', statsArray);
      
      return statsArray;
    },
    enabled: jobs.length > 0,
    staleTime: 0,
  });

  return {
    clientStats,
    isLoading,
    refetchClientStats: refetch
  };
};
