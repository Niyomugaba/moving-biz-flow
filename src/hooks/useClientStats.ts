
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs } from './useJobs';

export const useClientStats = () => {
  const { jobs } = useJobs();

  const { data: clientStats = [], isLoading, refetch } = useQuery({
    queryKey: ['client-stats', jobs],
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
      console.log('Calculated client stats:', statsArray);
      
      // Update client records in database with calculated stats
      for (const stats of statsArray) {
        if (stats.client_id) {
          try {
            console.log(`Updating client ${stats.client_name} with stats:`, {
              jobs: stats.total_jobs_completed,
              revenue: stats.total_revenue
            });
            
            const { error } = await supabase
              .from('clients')
              .update({
                total_jobs_completed: stats.total_jobs_completed,
                total_revenue: stats.total_revenue,
                updated_at: new Date().toISOString()
              })
              .eq('id', stats.client_id);
              
            if (error) {
              console.error(`Error updating client ${stats.client_name} stats:`, error);
            } else {
              console.log(`Successfully updated stats for client ${stats.client_name}: ${stats.total_jobs_completed} jobs, $${stats.total_revenue} revenue`);
            }
          } catch (error) {
            console.error(`Exception updating client ${stats.client_name} stats:`, error);
          }
        }
      }
      
      return statsArray;
    },
    enabled: jobs.length > 0,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchInterval: 5000, // Refetch every 5 seconds to ensure data stays fresh
  });

  return {
    clientStats,
    isLoading,
    refetchClientStats: refetch
  };
};
