/*
  # Create advertisements table and storage (Fixed)

  1. New Tables
    - `advertisements`
      - `id` (uuid, primary key)
      - `image_url` (text, required)
      - `link_url` (text, required)
      - `active` (boolean, default false)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `advertisements` table
    - Add policies for public read access and authenticated user management
    - Set up storage bucket and policies for advertisement images

  3. Storage
    - Create advertisements bucket for image storage
    - Configure public access for images
*/

-- Create advertisements table
CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  link_url text NOT NULL,
  active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access" ON advertisements;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON advertisements;

-- Create policies
CREATE POLICY "Allow public read access"
  ON advertisements
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users full access"
  ON advertisements
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for advertisement images (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'advertisements'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('advertisements', 'advertisements', true);
  END IF;
END $$;

-- Drop existing storage policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Give public access to advertisement images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to manage advertisement images" ON storage.objects;

-- Set up storage policies
CREATE POLICY "Give public access to advertisement images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'advertisements');

CREATE POLICY "Allow authenticated users to manage advertisement images"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (bucket_id = 'advertisements')
  WITH CHECK (bucket_id = 'advertisements');