/*
  # Fix Profiles RLS Policy for User Registration

  1. Security Updates
    - Add missing RLS policy for authenticated users to insert their own profiles
    - Ensure users can only create profiles for themselves during signup

  2. Changes
    - Add INSERT policy for profiles table allowing authenticated users to create their own profile
    - Policy ensures user_id matches auth.uid() for security
*/

-- Add policy to allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);