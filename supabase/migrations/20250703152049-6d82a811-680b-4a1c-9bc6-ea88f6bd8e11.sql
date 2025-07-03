-- Fix all potential database-level issues and ensure data integrity

-- Update jobs table to ensure client_id can be null (for manual entries)
ALTER TABLE public.jobs ALTER COLUMN client_id DROP NOT NULL;

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

-- Ensure job numbers are unique and auto-generated properly
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_job_number ON public.jobs(job_number);

-- Ensure employee numbers are unique and auto-generated properly  
CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_employee_number ON public.employees(employee_number);

-- Update any existing jobs with NULL client_id to have proper handling
UPDATE public.jobs 
SET client_id = NULL 
WHERE client_id = '' OR client_id = '00000000-0000-0000-0000-000000000000';

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

-- Ensure all user roles have proper default values
UPDATE public.user_roles 
SET role = 'employee' 
WHERE role IS NULL;

-- Add index for better performance on common queries
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_lead_id ON public.jobs(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_date ON public.time_entries(employee_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- Ensure all timestamps have proper timezone handling
ALTER TABLE public.jobs ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.jobs ALTER COLUMN updated_at SET DEFAULT now();

-- Add a constraint to ensure job dates are not in the past (with reasonable buffer)
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS check_job_date_not_too_old;
ALTER TABLE public.jobs ADD CONSTRAINT check_job_date_not_too_old 
  CHECK (job_date >= CURRENT_DATE - INTERVAL '30 days');

-- Ensure proper data validation for critical fields
ALTER TABLE public.jobs ADD CONSTRAINT IF NOT EXISTS check_hourly_rate_positive 
  CHECK (hourly_rate > 0);
  
ALTER TABLE public.jobs ADD CONSTRAINT IF NOT EXISTS check_movers_positive 
  CHECK (movers_needed > 0);

ALTER TABLE public.employees ADD CONSTRAINT IF NOT EXISTS check_hourly_wage_positive 
  CHECK (hourly_wage > 0);