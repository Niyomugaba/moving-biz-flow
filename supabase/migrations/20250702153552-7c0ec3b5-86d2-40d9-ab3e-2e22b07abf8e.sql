
-- First, let's see what's currently in the managers table
SELECT * FROM public.managers;

-- Clear any existing records and insert the correct manager credentials
DELETE FROM public.managers;

-- Insert the manager with the correct credentials
INSERT INTO public.managers (username, pin, name, is_active) 
VALUES ('jlniyomugaba', '5605', 'Jean Louis Niyomugaba', true);
