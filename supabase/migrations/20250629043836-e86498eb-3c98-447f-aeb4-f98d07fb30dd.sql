
-- Create RLS policies for the leads table to allow basic operations
-- Since there's no authentication system set up yet, we'll allow all operations for now

-- Policy to allow anyone to view leads
CREATE POLICY "Allow viewing all leads" 
  ON public.leads 
  FOR SELECT 
  USING (true);

-- Policy to allow anyone to insert leads
CREATE POLICY "Allow inserting leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow anyone to update leads
CREATE POLICY "Allow updating leads" 
  ON public.leads 
  FOR UPDATE 
  USING (true);

-- Policy to allow anyone to delete leads
CREATE POLICY "Allow deleting leads" 
  ON public.leads 
  FOR DELETE 
  USING (true);
