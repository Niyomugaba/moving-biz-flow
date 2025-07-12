
-- Add hours_worked column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS hours_worked NUMERIC DEFAULT NULL;

-- Add comment to clarify this field's purpose
COMMENT ON COLUMN public.jobs.hours_worked IS 'Actual hours worked on the job, used for flat rate pricing calculations';
