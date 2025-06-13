/*
  # Fix profile insertion policy

  1. Security
    - Safely add INSERT policy for profiles table
    - Check if policy exists before creating to avoid conflicts
    - Ensure authenticated users can create their own profiles
*/

-- Check if the policy exists and create it only if it doesn't
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