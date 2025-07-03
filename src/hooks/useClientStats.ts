
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useJobs } from './useJobs';

export const useClientStats = () => {
  const { jobs } = useJobs();

  const { data: clientStats = [], isLoading } = useQuery({
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
        
        // Count completed jobs
        if (job.status === 'completed') {
          stats.total_jobs_completed += 1;
        }
        
        // Add revenue from paid jobs
        if (job.status === 'completed' && job.is_paid && job.actual_total) {
          stats.total_revenue += job.actual_total;
        }
      });
      
      const statsArray = Array.from(clientStatsMap.values());
      console.log('Calculated client stats:', statsArray);
      
      // Update client records in database
      for (const stats of statsArray) {
        if (stats.client_id) {
          try {
            const { error } = await supabase
              .from('clients')
              .update({
                total_jobs_completed: stats.total_jobs_completed,
                total_revenue: stats.total_revenue,
                updated_at: new Date().toISOString()
              })
              .eq('id', stats.client_id);
              
            if (error) {
              console.error('Error updating client stats:', error);
            } else {
              console.log(`Updated stats for client ${stats.client_name}:`, {
                jobs: stats.total_jobs_completed,
                revenue: stats.total_revenue
              });
            }
          } catch (error) {
            console.error('Error updating client stats:', error);
          }
        }
      }
      
      return statsArray;
    },
    enabled: jobs.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  });

  return {
    clientStats,
    isLoading
  };
};
