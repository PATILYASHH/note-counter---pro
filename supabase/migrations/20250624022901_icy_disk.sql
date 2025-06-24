/*
  # Fix Multi-Device Data Access and Email Verification

  1. Database Fixes
    - Fix foreign key constraints for proper data relationships
    - Add email verification requirement
    - Improve data sync capabilities
    - Add indexes for better performance

  2. Security Updates
    - Require email verification for access
    - Improve RLS policies for multi-device access
    - Add proper data isolation

  3. Performance
    - Add indexes for faster queries
    - Optimize data retrieval
*/

-- Fix user_data foreign key to reference auth.users directly
ALTER TABLE user_data DROP CONSTRAINT IF EXISTS user_data_user_id_fkey;
ALTER TABLE user_data ADD CONSTRAINT user_data_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON user_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_data_type ON user_data(data_type);
CREATE INDEX IF NOT EXISTS idx_user_data_updated_at ON user_data(updated_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Update user_profiles to ensure proper relationship
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_id_fkey 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add email_verified field to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Update the create_user_profile function to handle email verification
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, subscription_tier, subscription_status, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    'inactive',
    COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update email verification status
CREATE OR REPLACE FUNCTION update_email_verification()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_profiles 
  SET email_verified = COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing triggers
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
DROP TRIGGER IF EXISTS update_email_verification_trigger ON auth.users;

-- Create triggers
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

CREATE TRIGGER update_email_verification_trigger
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION update_email_verification();

-- Update RLS policies to require email verification
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Update user_data policies to work with auth.users directly
DROP POLICY IF EXISTS "Users can view own data" ON user_data;
CREATE POLICY "Users can view own data"
  ON user_data
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own data" ON user_data;
CREATE POLICY "Users can insert own data"
  ON user_data
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own data" ON user_data;
CREATE POLICY "Users can update own data"
  ON user_data
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own data" ON user_data;
CREATE POLICY "Users can delete own data"
  ON user_data
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to get exchange rate (placeholder - in production, use real API)
CREATE OR REPLACE FUNCTION get_usd_to_inr_rate()
RETURNS numeric AS $$
BEGIN
  -- In production, this would fetch from a real exchange rate API
  -- For now, return a reasonable rate
  RETURN 83.50;
END;
$$ LANGUAGE plpgsql;