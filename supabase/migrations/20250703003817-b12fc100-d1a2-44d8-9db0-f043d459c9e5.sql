
-- Add a lead_id column to the jobs table to track which lead was converted
ALTER TABLE public.jobs ADD COLUMN lead_id uuid REFERENCES public.leads(id);

-- Add an index for better performance when querying jobs by lead
CREATE INDEX idx_jobs_lead_id ON public.jobs(lead_id);
