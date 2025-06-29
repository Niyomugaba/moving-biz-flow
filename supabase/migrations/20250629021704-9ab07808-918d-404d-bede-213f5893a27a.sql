
-- Create RLS policies for employees table to allow basic operations
-- Note: Since there's no authentication system set up yet, we'll allow all operations for now

-- Policy to allow anyone to view employees (for now, until auth is implemented)
CREATE POLICY "Allow viewing all employees" 
  ON public.employees 
  FOR SELECT 
  USING (true);

-- Policy to allow anyone to insert employees (for now, until auth is implemented)
CREATE POLICY "Allow inserting employees" 
  ON public.employees 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow anyone to update employees (for now, until auth is implemented)
CREATE POLICY "Allow updating employees" 
  ON public.employees 
  FOR UPDATE 
  USING (true);

-- Policy to allow anyone to delete employees (for now, until auth is implemented)
CREATE POLICY "Allow deleting employees" 
  ON public.employees 
  FOR DELETE 
  USING (true);
