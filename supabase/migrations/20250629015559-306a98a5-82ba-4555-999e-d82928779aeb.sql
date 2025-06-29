
-- Update the employees table to make employee_number have a default value
-- This will allow the TypeScript types to treat it as optional during inserts
ALTER TABLE public.employees ALTER COLUMN employee_number SET DEFAULT generate_employee_number();

-- Update the jobs table to make job_number have a default value  
-- This will allow the TypeScript types to treat it as optional during inserts
ALTER TABLE public.jobs ALTER COLUMN job_number SET DEFAULT generate_job_number();
