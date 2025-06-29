
-- Create RLS policies for time_entries table

-- Allow users to insert their own time entries
CREATE POLICY "Users can insert their own time entries" 
ON public.time_entries 
FOR INSERT 
WITH CHECK (true);

-- Allow users to view all time entries (for managers)
CREATE POLICY "Users can view all time entries" 
ON public.time_entries 
FOR SELECT 
USING (true);

-- Allow users to update time entries (for managers to approve/reject)
CREATE POLICY "Users can update time entries" 
ON public.time_entries 
FOR UPDATE 
USING (true);

-- Allow users to delete time entries if needed
CREATE POLICY "Users can delete time entries" 
ON public.time_entries 
FOR DELETE 
USING (true);
