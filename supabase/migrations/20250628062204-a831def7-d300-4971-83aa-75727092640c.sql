
-- Add status column to time_entries table to track approval status
ALTER TABLE public.time_entries 
ADD COLUMN status text NOT NULL DEFAULT 'pending';

-- Add a comment to track any manager notes
ALTER TABLE public.time_entries 
ADD COLUMN manager_notes text;

-- Add approved_by column to track who approved the entry
ALTER TABLE public.time_entries 
ADD COLUMN approved_by uuid REFERENCES auth.users(id);

-- Add approved_at column to track when it was approved
ALTER TABLE public.time_entries 
ADD COLUMN approved_at timestamp with time zone;

-- Update existing entries to be approved (so they don't break existing functionality)
UPDATE public.time_entries SET status = 'approved' WHERE status = 'pending';
