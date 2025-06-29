
-- Update the existing manager with your new credentials
UPDATE public.managers 
SET username = 'jlniyomugaba', pin = '5605', name = 'Manager'
WHERE username = 'admin';

-- If for some reason the admin user doesn't exist, insert the new one
INSERT INTO public.managers (username, pin, name) 
SELECT 'jlniyomugaba', '5605', 'Manager'
WHERE NOT EXISTS (SELECT 1 FROM public.managers WHERE username = 'jlniyomugaba');
