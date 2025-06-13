/*
  # Fix RLS Policy for Profile Creation

  1. Security Changes
    - Add INSERT policy for profiles table to allow authenticated users to create their own profile
    - Ensure users can insert profile data where user_id matches their auth.uid()

  This resolves the "new row violates row-level security policy" error during signup.
*/

-- Add policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);