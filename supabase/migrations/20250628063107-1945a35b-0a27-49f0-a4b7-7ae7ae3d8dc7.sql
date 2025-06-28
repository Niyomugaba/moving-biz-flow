
-- Rename estimated_hours to actual_hours and add payment tracking
ALTER TABLE public.jobs 
RENAME COLUMN estimated_hours TO actual_hours;

-- Add a paid status column to track if the job has been paid
ALTER TABLE public.jobs 
ADD COLUMN paid boolean NOT NULL DEFAULT false;

-- Add a column to track when payment was received
ALTER TABLE public.jobs 
ADD COLUMN paid_at timestamp with time zone;
