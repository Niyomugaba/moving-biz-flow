
-- Drop all existing tables and their dependencies
DROP TABLE IF EXISTS public.time_entries CASCADE;
DROP TABLE IF EXISTS public.job_assignments CASCADE;
DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.employee_requests CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.sms_verification_codes CASCADE;

-- Drop any existing custom types
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.lead_status CASCADE;
DROP TYPE IF EXISTS public.lead_source CASCADE;
DROP TYPE IF EXISTS public.job_status CASCADE;
DROP TYPE IF EXISTS public.employee_status CASCADE;
DROP TYPE IF EXISTS public.time_entry_status CASCADE;

-- Create enhanced schema for Bantu Movers

-- Create custom types for better data integrity
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'quoted', 'converted', 'lost');
CREATE TYPE public.lead_source AS ENUM ('website', 'referral', 'google_ads', 'facebook', 'phone', 'walk_in', 'other');
CREATE TYPE public.job_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled');
CREATE TYPE public.employee_status AS ENUM ('active', 'inactive', 'terminated', 'on_leave');
CREATE TYPE public.time_entry_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'manager', 'employee');

-- Enhanced leads table with better tracking
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  source lead_source NOT NULL DEFAULT 'other',
  status lead_status NOT NULL DEFAULT 'new',
  estimated_value DECIMAL(10,2),
  notes TEXT,
  follow_up_date DATE,
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  primary_address TEXT NOT NULL,
  secondary_address TEXT,
  company_name TEXT,
  preferred_contact_method TEXT DEFAULT 'phone',
  notes TEXT,
  total_jobs_completed INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced employees table with role management
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT NOT NULL,
  address TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  hourly_wage DECIMAL(8,2) NOT NULL,
  overtime_rate DECIMAL(8,2),
  hire_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status employee_status NOT NULL DEFAULT 'active',
  department TEXT DEFAULT 'operations',
  position TEXT DEFAULT 'mover',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User roles table for proper role management
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'employee',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enhanced jobs table with better pricing and tracking
CREATE TABLE public.jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_number TEXT UNIQUE NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  origin_address TEXT NOT NULL,
  destination_address TEXT NOT NULL,
  job_date DATE NOT NULL,
  start_time TIME NOT NULL,
  estimated_duration_hours DECIMAL(4,2) NOT NULL,
  actual_duration_hours DECIMAL(4,2),
  hourly_rate DECIMAL(8,2) NOT NULL,
  estimated_total DECIMAL(10,2) NOT NULL,
  actual_total DECIMAL(10,2),
  movers_needed INTEGER NOT NULL DEFAULT 2,
  truck_size TEXT,
  special_requirements TEXT,
  status job_status NOT NULL DEFAULT 'scheduled',
  completion_notes TEXT,
  customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job assignments with roles
CREATE TABLE public.job_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'mover',
  hourly_rate DECIMAL(8,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(job_id, employee_id)
);

-- Enhanced time entries with better tracking (FIXED: hourly_rate typo)
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  clock_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE,
  break_duration_minutes INTEGER DEFAULT 0,
  regular_hours DECIMAL(4,2),
  overtime_hours DECIMAL(4,2),
  hourly_rate DECIMAL(8,2) NOT NULL,
  overtime_rate DECIMAL(8,2),
  total_pay DECIMAL(8,2) GENERATED ALWAYS AS (
    COALESCE(regular_hours * hourly_rate, 0) + 
    COALESCE(overtime_hours * COALESCE(overtime_rate, hourly_rate * 1.5), 0)
  ) STORED,
  status time_entry_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  manager_notes TEXT,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Employee requests with better workflow
CREATE TABLE public.employee_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  position_applied TEXT DEFAULT 'mover',
  expected_hourly_wage DECIMAL(8,2),
  availability TEXT,
  experience_years INTEGER DEFAULT 0,
  reference_contacts TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  interview_date DATE,
  interview_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for leads assigned_to
ALTER TABLE public.leads ADD CONSTRAINT leads_assigned_to_fkey 
  FOREIGN KEY (assigned_to) REFERENCES public.employees(id) ON DELETE SET NULL;

-- Generate unique employee numbers automatically
CREATE OR REPLACE FUNCTION generate_employee_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_number := 'BM' || LPAD(counter::TEXT, 4, '0');
    IF NOT EXISTS (SELECT 1 FROM public.employees WHERE employee_number = new_number) THEN
      RETURN new_number;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Generate unique job numbers automatically
CREATE OR REPLACE FUNCTION generate_job_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  counter INTEGER := 1;
BEGIN
  LOOP
    new_number := 'JOB' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || LPAD(counter::TEXT, 3, '0');
    IF NOT EXISTS (SELECT 1 FROM public.jobs WHERE job_number = new_number) THEN
      RETURN new_number;
    END IF;
    counter := counter + 1;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-generating numbers
CREATE OR REPLACE FUNCTION set_employee_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.employee_number IS NULL OR NEW.employee_number = '' THEN
    NEW.employee_number := generate_employee_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_job_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN
    NEW.job_number := generate_job_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_employee_number
  BEFORE INSERT ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION set_employee_number();

CREATE TRIGGER trigger_set_job_number
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION set_job_number();

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;

-- Security function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- RLS Policies for admins and managers
CREATE POLICY "Super admins and admins can manage all data" ON public.leads
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Super admins and admins can manage all clients" ON public.clients
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Super admins and admins can manage employees" ON public.employees
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can manage roles except super_admin" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin') AND role != 'super_admin'
  );

CREATE POLICY "Super admins and admins can manage jobs" ON public.jobs
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Super admins and admins can manage job assignments" ON public.job_assignments
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Employees can view their job assignments" ON public.job_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.employees e ON ur.employee_id = e.id 
      WHERE ur.user_id = auth.uid() AND e.id = employee_id
    )
  );

CREATE POLICY "Super admins and admins can manage time entries" ON public.time_entries
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );

CREATE POLICY "Employees can manage their own time entries" ON public.time_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.employees e ON ur.employee_id = e.id 
      WHERE ur.user_id = auth.uid() AND e.id = employee_id
    )
  );

CREATE POLICY "Anyone can create employee requests" ON public.employee_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Super admins and admins can manage employee requests" ON public.employee_requests
  FOR ALL USING (
    public.has_role(auth.uid(), 'super_admin') OR 
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'manager')
  );
