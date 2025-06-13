-- Fix profile RLS policies to allow proper user operations

-- First, drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own data" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create comprehensive policies for profiles table
-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own profile and public profiles
CREATE POLICY "Users can view profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    NOT is_private OR 
    EXISTS (
      SELECT 1 FROM connections 
      WHERE (requester_id = auth.uid() AND addressee_id = user_id) 
         OR (addressee_id = auth.uid() AND requester_id = user_id)
      AND status = 'accepted'
    )
  );

-- Allow public access to non-private profiles for unauthenticated users
CREATE POLICY "Public can view public profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (NOT is_private);

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;