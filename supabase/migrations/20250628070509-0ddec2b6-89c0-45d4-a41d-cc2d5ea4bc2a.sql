
-- Add a paid status column to time_entries to track payment status
ALTER TABLE public.time_entries 
ADD COLUMN paid boolean NOT NULL DEFAULT false;

-- Add a column to track when payment was made
ALTER TABLE public.time_entries 
ADD COLUMN paid_at timestamp with time zone;

-- Create a table for new employee requests
CREATE TABLE public.employee_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  notes text
);

-- Enable RLS on employee_requests
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert requests (public access for new employees)
CREATE POLICY "Anyone can create employee requests" 
  ON public.employee_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow viewing all requests (for admin review)
CREATE POLICY "Allow viewing all employee requests" 
  ON public.employee_requests 
  FOR SELECT 
  USING (true);
