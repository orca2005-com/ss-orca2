/*
  # Fix Row Level Security Policies for Profiles Table
  
  1. Security Changes
    - Add INSERT policy for profiles (if not exists)
    - Add UPDATE policy for profiles (if not exists)
    - Ensure users can manage their own profile data
  
  This migration handles existing policies gracefully by using IF NOT EXISTS checks.
*/

-- Add INSERT policy for profiles table (only if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Add UPDATE policy for profiles table (only if it doesn't exist)
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
      USING (auth.uid() = user_id);
  END IF;
END $$;