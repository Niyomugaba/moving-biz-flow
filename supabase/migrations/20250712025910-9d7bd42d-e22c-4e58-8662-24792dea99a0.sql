
-- Create a function to update client statistics when jobs are completed
CREATE OR REPLACE FUNCTION update_client_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if job status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Update the client's statistics
    UPDATE clients 
    SET 
      total_jobs_completed = (
        SELECT COUNT(*) 
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      total_revenue = (
        SELECT COALESCE(SUM(COALESCE(actual_total, estimated_total)), 0)
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  
  -- If job status changed from completed to something else, recalculate
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE clients 
    SET 
      total_jobs_completed = (
        SELECT COUNT(*) 
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      total_revenue = (
        SELECT COALESCE(SUM(COALESCE(actual_total, estimated_total)), 0)
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_client_stats ON jobs;
CREATE TRIGGER trigger_update_client_stats
  AFTER UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_client_stats();

-- Also handle new completed jobs (INSERT)
CREATE OR REPLACE FUNCTION update_client_stats_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if new job is completed
  IF NEW.status = 'completed' THEN
    UPDATE clients 
    SET 
      total_jobs_completed = (
        SELECT COUNT(*) 
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      total_revenue = (
        SELECT COALESCE(SUM(COALESCE(actual_total, estimated_total)), 0)
        FROM jobs 
        WHERE client_id = NEW.client_id AND status = 'completed'
      ),
      updated_at = now()
    WHERE id = NEW.client_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the insert trigger
DROP TRIGGER IF EXISTS trigger_update_client_stats_insert ON jobs;
CREATE TRIGGER trigger_update_client_stats_insert
  AFTER INSERT ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_client_stats_insert();
