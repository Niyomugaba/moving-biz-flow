
-- Clear all data from all tables (keeping the structure)
-- Order matters due to foreign key constraints

-- Clear time entries first (references employees and jobs)
DELETE FROM public.time_entries;

-- Clear job assignments (references jobs and employees)
DELETE FROM public.job_assignments;

-- Clear user roles (references auth.users and employees)
DELETE FROM public.user_roles;

-- Clear jobs (references clients)
DELETE FROM public.jobs;

-- Clear employee requests
DELETE FROM public.employee_requests;

-- Clear employees
DELETE FROM public.employees;

-- Clear leads (references employees for assigned_to)
DELETE FROM public.leads;

-- Clear clients
DELETE FROM public.clients;

-- Clear managers
DELETE FROM public.managers;

-- Reset any sequences/counters if they exist
-- This ensures auto-generated numbers start from 1 again
SELECT setval(pg_get_serial_sequence('public.employees', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.jobs', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.leads', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.clients', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.time_entries', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.job_assignments', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.employee_requests', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.user_roles', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('public.managers', 'id'), 1, false);
