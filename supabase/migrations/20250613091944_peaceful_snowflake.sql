/*
  # Fix duplicate policies

  1. Drop existing policies that might be duplicated
  2. Recreate them with proper IF NOT EXISTS checks
  3. Ensure clean policy state
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

-- Recreate policies with proper conditions
CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT TO public
  USING (
    NOT is_private OR 
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM connections 
      WHERE ((requester_id = auth.uid() AND addressee_id = user_id) 
             OR (addressee_id = auth.uid() AND requester_id = user_id))
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);