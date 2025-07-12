
-- Add total_amount_received column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS total_amount_received NUMERIC DEFAULT NULL;

-- Add comment to clarify this field's purpose
COMMENT ON COLUMN public.jobs.total_amount_received IS 'Total amount actually received from client, including tips and bonuses for flat rate jobs';
