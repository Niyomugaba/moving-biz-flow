
-- Update all existing client statistics based on their completed jobs
UPDATE clients 
SET 
  total_jobs_completed = (
    SELECT COUNT(*) 
    FROM jobs 
    WHERE client_id = clients.id AND status = 'completed'
  ),
  total_revenue = (
    SELECT COALESCE(SUM(COALESCE(actual_total, estimated_total)), 0)
    FROM jobs 
    WHERE client_id = clients.id AND status = 'completed'
  ),
  updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM jobs WHERE client_id = clients.id
);
