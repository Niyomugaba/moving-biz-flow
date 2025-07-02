
-- Disable email confirmation for faster account creation
-- This allows users to sign up without needing to confirm their email
UPDATE auth.config 
SET email_confirm_required = false 
WHERE id = 1;

-- Also ensure email change confirmation is disabled
UPDATE auth.config 
SET email_change_confirm_required = false 
WHERE id = 1;
