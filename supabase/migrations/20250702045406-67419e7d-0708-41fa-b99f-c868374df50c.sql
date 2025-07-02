
-- Create user profiles table to store additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create app_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'manager', 'employee');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update user_roles table to include owner role
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.app_role 
USING role::text::public.app_role;

-- Update the has_role function to work with new roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Owners and admins can view all profiles" 
  ON public.profiles 
  FOR ALL 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Update existing RLS policies to include owner role
DROP POLICY IF EXISTS "Super admins and admins can manage all clients" ON public.clients;
CREATE POLICY "Owners and admins can manage all clients" 
  ON public.clients 
  FOR ALL 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

DROP POLICY IF EXISTS "Super admins and admins can manage employees" ON public.employees;
CREATE POLICY "Owners and admins can manage employees" 
  ON public.employees 
  FOR ALL 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

DROP POLICY IF EXISTS "Super admins and admins can manage all data" ON public.leads;
CREATE POLICY "Owners and admins can manage leads" 
  ON public.leads 
  FOR ALL 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

DROP POLICY IF EXISTS "Super admins and admins can manage time entries" ON public.time_entries;
CREATE POLICY "Owners and admins can manage time entries" 
  ON public.time_entries 
  FOR ALL 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

-- Admin role can view financials but only owners can modify critical financial data
CREATE POLICY "Admins can view jobs" 
  ON public.jobs 
  FOR SELECT 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Admins can insert and update jobs" 
  ON public.jobs 
  FOR INSERT 
  WITH CHECK (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

CREATE POLICY "Admins can update jobs" 
  ON public.jobs 
  FOR UPDATE 
  USING (
    has_role(auth.uid(), 'owner'::app_role) OR 
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'manager'::app_role)
  );

-- Only owners can delete jobs (to protect data)
CREATE POLICY "Only owners can delete jobs" 
  ON public.jobs 
  FOR DELETE 
  USING (has_role(auth.uid(), 'owner'::app_role));
