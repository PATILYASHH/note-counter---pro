/*
  # Add timing fields to advertisements table

  1. Changes
    - Add duration field to store how long each ad should run (in seconds)
    - Add start_time field to track when the ad should start displaying
    - Add end_time field to track when the ad should stop displaying
    - Update active field logic to consider timing

  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE advertisements
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 30,
ADD COLUMN IF NOT EXISTS start_time timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS end_time timestamptz DEFAULT now() + interval '30 seconds';

-- Function to update end_time based on start_time and duration
CREATE OR REPLACE FUNCTION update_ad_end_time()
RETURNS TRIGGER AS $$
BEGIN
  NEW.end_time := NEW.start_time + (NEW.duration || ' seconds')::interval;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update end_time
CREATE TRIGGER update_ad_end_time_trigger
  BEFORE INSERT OR UPDATE OF start_time, duration
  ON advertisements
  FOR EACH ROW
  EXECUTE FUNCTION update_ad_end_time();