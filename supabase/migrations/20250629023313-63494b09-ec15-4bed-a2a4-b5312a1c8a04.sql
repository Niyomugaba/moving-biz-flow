
-- Add RLS policies for employee_requests table to allow basic operations
-- Since there's no authentication system set up yet, we'll allow all operations for now

-- Policy to allow anyone to view employee requests (for managers to review)
CREATE POLICY "Allow viewing all employee requests" 
  ON public.employee_requests 
  FOR SELECT 
  USING (true);

-- Policy to allow anyone to insert employee requests (for new employees to submit)
CREATE POLICY "Allow inserting employee requests" 
  ON public.employee_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Policy to allow anyone to update employee requests (for status changes)
CREATE POLICY "Allow updating employee requests" 
  ON public.employee_requests 
  FOR UPDATE 
  USING (true);

-- Policy to allow anyone to delete employee requests (for cleanup)
CREATE POLICY "Allow deleting employee requests" 
  ON public.employee_requests 
  FOR DELETE 
  USING (true);
