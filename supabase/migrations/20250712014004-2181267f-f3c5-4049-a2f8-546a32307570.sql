
-- Add tip column to time_entries table
ALTER TABLE public.time_entries 
ADD COLUMN tip_amount numeric DEFAULT 0;

-- Update the calculate_time_entry_pay function to include tips
CREATE OR REPLACE FUNCTION public.calculate_time_entry_pay()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Calculate total pay based on hours, rates, and tips
  IF NEW.regular_hours IS NOT NULL AND NEW.hourly_rate IS NOT NULL THEN
    NEW.total_pay := (NEW.regular_hours * NEW.hourly_rate) + 
                     COALESCE((NEW.overtime_hours * NEW.overtime_rate), 0) +
                     COALESCE(NEW.tip_amount, 0);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically calculate pay including tips
DROP TRIGGER IF EXISTS calculate_pay_on_insert ON public.time_entries;
DROP TRIGGER IF EXISTS calculate_pay_on_update ON public.time_entries;

CREATE TRIGGER calculate_pay_on_insert
  BEFORE INSERT ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_pay();

CREATE TRIGGER calculate_pay_on_update
  BEFORE UPDATE ON public.time_entries
  FOR EACH ROW
  EXECUTE FUNCTION calculate_time_entry_pay();
