
-- Add missing truck-related columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN truck_service_fee numeric DEFAULT 0,
ADD COLUMN truck_rental_cost numeric DEFAULT 0,
ADD COLUMN truck_gas_cost numeric DEFAULT 0;

-- Add break_duration_minutes to time_entries if it doesn't exist
-- (checking the schema, it already exists, so this is just to be safe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_entries' 
                   AND column_name = 'break_duration_minutes') THEN
        ALTER TABLE public.time_entries 
        ADD COLUMN break_duration_minutes integer DEFAULT 0;
    END IF;
END $$;
