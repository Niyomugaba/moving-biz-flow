
-- Add lead_cost column to the leads table
ALTER TABLE public.leads 
ADD COLUMN lead_cost numeric DEFAULT 0;

-- Add comment to describe the column
COMMENT ON COLUMN public.leads.lead_cost IS 'Cost spent to generate this lead (advertising, marketing, etc.)';
