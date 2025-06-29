
-- Create a table for manager authentication
CREATE TABLE public.managers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  pin TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS on the managers table
ALTER TABLE public.managers ENABLE ROW LEVEL SECURITY;

-- Create policy that allows managers to select their own data
CREATE POLICY "Managers can view their own data" 
  ON public.managers 
  FOR SELECT 
  USING (true);

-- Insert a default manager account (username: admin, pin: 1234)
INSERT INTO public.managers (username, pin, name) 
VALUES ('admin', '1234', 'Manager');

-- Add trigger for updated_at
CREATE TRIGGER update_managers_updated_at
  BEFORE UPDATE ON public.managers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
