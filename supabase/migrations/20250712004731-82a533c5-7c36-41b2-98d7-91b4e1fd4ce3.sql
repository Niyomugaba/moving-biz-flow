
-- Add the missing pricing fields to the jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS pricing_model TEXT DEFAULT 'per_person',
ADD COLUMN IF NOT EXISTS flat_hourly_rate NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS worker_hourly_rate NUMERIC DEFAULT NULL;

-- Add check constraints to ensure valid pricing model values
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_pricing_model_check 
CHECK (pricing_model IN ('per_person', 'flat_rate'));
