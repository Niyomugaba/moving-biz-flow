
-- Insert manager with correct credentials
INSERT INTO public.managers (username, pin, name) 
VALUES ('jlniyomugaba', '5605', 'Jean Louis Niyomugaba')
ON CONFLICT (username) DO UPDATE SET
  pin = EXCLUDED.pin,
  name = EXCLUDED.name,
  is_active = true;
