
-- Add PIN column to employees table for authentication
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS pin TEXT DEFAULT NULL;

-- Add comment to clarify this field's purpose
COMMENT ON COLUMN public.employees.pin IS 'PIN code for employee authentication in the employee portal';

-- Create indexes for better performance on time entries queries
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_status ON public.time_entries(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON public.time_entries(job_id) WHERE job_id IS NOT NULL;

-- Ensure we have all necessary triggers for time entry calculations
CREATE OR REPLACE FUNCTION public.calculate_time_entry_pay()
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

-- Create trigger for automatic pay calculation on time entries
DROP TRIGGER IF EXISTS trigger_calculate_time_entry_pay ON public.time_entries;
CREATE TRIGGER trigger_calculate_time_entry_pay
    BEFORE INSERT OR UPDATE ON public.time_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.calculate_time_entry_pay();
