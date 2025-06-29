
-- Insert a test employee for email verification testing
INSERT INTO public.employees (
  name,
  email,
  phone,
  hourly_wage,
  status,
  hire_date,
  position,
  department
) VALUES (
  'Test Employee',
  'test@bantumovers.com',
  '555-123-4567',
  25.00,
  'active',
  CURRENT_DATE,
  'mover',
  'operations'
);
