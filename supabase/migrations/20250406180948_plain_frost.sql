/*
  # Create advertising inquiries table

  1. New Tables
    - `ad_inquiries`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, required)
      - `company` (text, required)
      - `message` (text, required)
      - `status` (text, default 'pending')
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `ad_inquiries` table
    - Add policy for authenticated users to manage inquiries
    - Add policy for public to create inquiries
*/

CREATE TABLE IF NOT EXISTS ad_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ad_inquiries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users full access"
  ON ad_inquiries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public to create inquiries"
  ON ad_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);