-- Add worker pricing fields to jobs table
ALTER TABLE public.jobs 
ADD COLUMN worker_flat_rate boolean DEFAULT false,
ADD COLUMN worker_flat_amount numeric;