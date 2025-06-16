/*
  # Create Following/Followers System

  1. New Tables
    - `follows` - User following relationships
    
  2. Security
    - Enable RLS on follows table
    - Add policies for follow management
    
  3. Features
    - Follow/unfollow functionality
    - Mutual connections tracking
    - Block/mute capabilities
*/

-- Create follows table for user relationships
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'blocked', 'muted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_follows_status ON follows(status);
CREATE INDEX IF NOT EXISTS idx_follows_created_at ON follows(created_at DESC);

-- Enable Row Level Security
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Create policies for follows table
CREATE POLICY "Users can view public follows"
  ON follows
  FOR SELECT
  TO authenticated
  USING (
    status = 'active' AND (
      follower_id = auth.uid() OR 
      following_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id IN (follower_id, following_id)
        AND users.privacy_settings->>'profile_visibility' = 'public'
      )
    )
  );

CREATE POLICY "Users can manage own follows"
  ON follows
  FOR ALL
  TO authenticated
  USING (follower_id = auth.uid())
  WITH CHECK (follower_id = auth.uid());

-- Create function to update user stats when following
CREATE OR REPLACE FUNCTION update_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Update follower's following count
    UPDATE user_profiles 
    SET stats = jsonb_set(
      stats, 
      '{following}', 
      ((COALESCE(stats->>'following', '0')::int) + 1)::text::jsonb
    )
    WHERE user_id = NEW.follower_id;
    
    -- Update following's followers count
    UPDATE user_profiles 
    SET stats = jsonb_set(
      stats, 
      '{followers}', 
      ((COALESCE(stats->>'followers', '0')::int) + 1)::text::jsonb
    )
    WHERE user_id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'active' THEN
    -- Update follower's following count
    UPDATE user_profiles 
    SET stats = jsonb_set(
      stats, 
      '{following}', 
      GREATEST(((COALESCE(stats->>'following', '0')::int) - 1), 0)::text::jsonb
    )
    WHERE user_id = OLD.follower_id;
    
    -- Update following's followers count
    UPDATE user_profiles 
    SET stats = jsonb_set(
      stats, 
      '{followers}', 
      GREATEST(((COALESCE(stats->>'followers', '0')::int) - 1), 0)::text::jsonb
    )
    WHERE user_id = OLD.following_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status = 'active' AND NEW.status != 'active' THEN
      -- Unfollow: decrease counts
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{following}', 
        GREATEST(((COALESCE(stats->>'following', '0')::int) - 1), 0)::text::jsonb
      )
      WHERE user_id = NEW.follower_id;
      
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        GREATEST(((COALESCE(stats->>'followers', '0')::int) - 1), 0)::text::jsonb
      )
      WHERE user_id = NEW.following_id;
      
    ELSIF OLD.status != 'active' AND NEW.status = 'active' THEN
      -- Follow: increase counts
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{following}', 
        ((COALESCE(stats->>'following', '0')::int) + 1)::text::jsonb
      )
      WHERE user_id = NEW.follower_id;
      
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        ((COALESCE(stats->>'followers', '0')::int) + 1)::text::jsonb
      )
      WHERE user_id = NEW.following_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for follow stats
CREATE TRIGGER update_follow_stats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_stats();