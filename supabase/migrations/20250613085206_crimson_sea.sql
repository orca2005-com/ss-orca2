/*
  # Fix RLS Policy for Profile Creation

  1. Security
    - Safely checks if policies exist before creating them
    - Recreates the INSERT policy to ensure it's correct
    - Ensures all necessary policies exist for the profiles table
  
  2. Changes
    - Drops and recreates the INSERT policy for profiles
    - Adds conditional checks to prevent "already exists" errors
    - Ensures SELECT and UPDATE policies exist
*/

-- Drop the policy if it exists and recreate it to ensure it's correct
DO $$
BEGIN
  -- Drop existing policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    DROP POLICY "Users can insert their own profile" ON profiles;
  END IF;
END $$;

-- Create the INSERT policy for authenticated users
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure we have all necessary policies for profiles table
-- Check and create SELECT policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Public profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Public profiles are viewable by everyone"
      ON profiles
      FOR SELECT
      TO public
      USING (
        NOT is_private 
        OR user_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM connections 
          WHERE (
            (requester_id = auth.uid() AND addressee_id = profiles.user_id) 
            OR (addressee_id = auth.uid() AND requester_id = profiles.user_id)
          ) 
          AND status = 'accepted'
        )
      );
  END IF;
END $$;

-- Check and create UPDATE policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;