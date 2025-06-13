/*
  # Fix RLS Policies for Profiles Table
  
  This migration ensures all necessary RLS policies exist for the profiles table
  without creating duplicates. It uses conditional logic to only create policies
  that don't already exist.
  
  1. Security
    - Ensures authenticated users can insert their own profiles
    - Allows users to update their own profiles  
    - Provides proper read access based on privacy settings
    - Enables public access to non-private profiles
*/

-- Function to safely create policies only if they don't exist
DO $$
BEGIN
  -- Check and create INSERT policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check and create UPDATE policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'profiles' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check and create SELECT policy for authenticated users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'profiles' 
    AND policyname = 'Users can view profiles'
  ) THEN
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
  END IF;

  -- Check and create SELECT policy for anonymous users
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename = 'profiles' 
    AND policyname = 'Public can view public profiles'
  ) THEN
    CREATE POLICY "Public can view public profiles"
      ON profiles
      FOR SELECT
      TO anon
      USING (NOT is_private);
  END IF;
END $$;

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;