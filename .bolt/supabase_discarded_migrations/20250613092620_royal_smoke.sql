/*
  # Add missing RLS policies for profiles table

  1. Security Policies
    - Add policy for authenticated users to insert their own profile
    - Add policy for authenticated users to update their own profile
    - These policies are required for signup and profile creation to work

  2. Changes
    - Allow INSERT for authenticated users creating their own profile
    - Allow UPDATE for authenticated users modifying their own profile
*/

-- Add INSERT policy for profiles table
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Add UPDATE policy for profiles table  
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);