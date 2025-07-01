
-- Update RLS policies for jobs table to allow authenticated users to create jobs
DROP POLICY IF EXISTS "Super admins and admins can manage jobs" ON public.jobs;

-- Create more permissive policies for jobs
CREATE POLICY "Authenticated users can view jobs" 
ON public.jobs FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can create jobs" 
ON public.jobs FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update jobs" 
ON public.jobs FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete jobs" 
ON public.jobs FOR DELETE 
TO authenticated 
USING (true);

-- Also update any missing columns that might be needed
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS payment_due_date DATE,
ADD COLUMN IF NOT EXISTS invoice_number TEXT,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC DEFAULT 0;
