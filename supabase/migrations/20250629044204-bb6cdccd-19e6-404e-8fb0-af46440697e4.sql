
-- Create RLS policies for the clients table to allow basic operations
-- Since there's no authentication system set up yet, we'll allow all operations for now

-- Policy to allow anyone to view clients
CREATE POLICY "Allow viewing all clients" 
  ON public.clients 
  FOR SELECT 
  USING (true);

-- Policy to allow anyone to insert clients
CREATE POLICY "Allow inserting clients" 
  ON public.clients 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow anyone to update clients
CREATE POLICY "Allow updating clients" 
  ON public.clients 
  FOR UPDATE 
  USING (true);

-- Policy to allow anyone to delete clients
CREATE POLICY "Allow deleting clients" 
  ON public.clients 
  FOR DELETE 
  USING (true);
