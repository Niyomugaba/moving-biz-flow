
-- Create table to store SMS verification codes
CREATE TABLE public.sms_verification_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '10 minutes'),
  used BOOLEAN NOT NULL DEFAULT false
);

-- Add index for faster lookups
CREATE INDEX idx_sms_verification_phone_code ON public.sms_verification_codes(phone, code) WHERE NOT used;

-- Add index for cleanup of expired codes
CREATE INDEX idx_sms_verification_expires_at ON public.sms_verification_codes(expires_at);
