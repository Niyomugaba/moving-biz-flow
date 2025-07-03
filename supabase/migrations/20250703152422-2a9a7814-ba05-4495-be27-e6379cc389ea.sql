-- Fix database-level issues and ensure data integrity

-- Ensure time_entries table has proper total_pay calculation trigger
CREATE OR REPLACE FUNCTION public.calculate_total_pay()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate total pay based on hours and rates
  IF NEW.regular_hours IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
    NEW.total_pay := (NEW.regular_hours * NEW.hourly_rate) + 
                     COALESCE((NEW.overtime_hours * NEW.overtime_rate), 0);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-calculate total_pay on insert/update
DROP TRIGGER IF EXISTS calculate_total_pay_trigger ON public.time_entries;
CREATE TRIGGER calculate_total_pay_trigger
  BEFORE INSERT OR UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_total_pay();

-- Create a trigger to auto-update job totals when they're completed
CREATE OR REPLACE FUNCTION public.update_job_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- When job is marked as completed, ensure actual_total is set if not already
  IF NEW.status = 'completed' AND (NEW.actual_total IS NULL OR NEW.actual_total = 0) THEN
    -- Use estimated_total as fallback if actual_total not set
    NEW.actual_total := COALESCE(NEW.actual_total, NEW.estimated_total);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for job total updates
DROP TRIGGER IF EXISTS update_job_totals_trigger ON public.jobs;
CREATE TRIGGER update_job_totals_trigger
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_job_totals();

-- Add indexes for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_lead_id ON public.jobs(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON public.time_entries(employee_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);