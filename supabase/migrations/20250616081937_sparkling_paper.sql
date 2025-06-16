/*
  # Create Posts and Interactions System

  1. New Tables
    - `posts` - User posts and content
    - `post_interactions` - Likes, shares, saves
    - `comments` - Post comments with threading
    
  2. Security
    - Enable RLS on all tables
    - Add policies for content access
    
  3. Features
    - Post creation and management
    - Like/share/save functionality
    - Threaded comments
    - Media support
*/

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  media_types TEXT[] DEFAULT '{}',
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  is_pinned BOOLEAN DEFAULT FALSE,
  location VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create post interactions table
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('like', 'share', 'save')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(post_id, user_id, interaction_type)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  mentions UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility);
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_posts_deleted_at ON posts(deleted_at);

CREATE INDEX IF NOT EXISTS idx_post_interactions_post ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_deleted_at ON comments(deleted_at);

-- Enable Row Level Security
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Create policies for posts table
CREATE POLICY "Users can view posts based on visibility"
  ON posts
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND (
      visibility = 'public' OR
      author_id = auth.uid() OR
      (visibility = 'followers' AND EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = auth.uid() 
        AND following_id = author_id 
        AND status = 'active'
      ))
    )
  );

CREATE POLICY "Users can create own posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create policies for post_interactions table
CREATE POLICY "Users can view post interactions"
  ON post_interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = post_interactions.post_id 
      AND posts.deleted_at IS NULL
      AND (
        posts.visibility = 'public' OR
        posts.author_id = auth.uid() OR
        (posts.visibility = 'followers' AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = auth.uid() 
          AND following_id = posts.author_id 
          AND status = 'active'
        ))
      )
    )
  );

CREATE POLICY "Users can manage own interactions"
  ON post_interactions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policies for comments table
CREATE POLICY "Users can view comments on accessible posts"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.deleted_at IS NULL
      AND (
        posts.visibility = 'public' OR
        posts.author_id = auth.uid() OR
        (posts.visibility = 'followers' AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = auth.uid() 
          AND following_id = posts.author_id 
          AND status = 'active'
        ))
      )
    )
  );

CREATE POLICY "Users can create comments on accessible posts"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.deleted_at IS NULL
      AND (
        posts.visibility = 'public' OR
        posts.author_id = auth.uid() OR
        (posts.visibility = 'followers' AND EXISTS (
          SELECT 1 FROM follows 
          WHERE follower_id = auth.uid() 
          AND following_id = posts.author_id 
          AND status = 'active'
        ))
      )
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to update post stats
CREATE OR REPLACE FUNCTION update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update user's post count
    UPDATE user_profiles 
    SET stats = jsonb_set(
      stats, 
      '{posts}', 
      ((COALESCE(stats->>'posts', '0')::int) + 1)::text::jsonb
    )
    WHERE user_id = NEW.author_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Update user's post count
    UPDATE user_profiles 
    SET stats = jsonb_set(
      stats, 
      '{posts}', 
      GREATEST(((COALESCE(stats->>'posts', '0')::int) - 1), 0)::text::jsonb
    )
    WHERE user_id = OLD.author_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create trigger for post stats
CREATE TRIGGER update_post_stats_trigger
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_post_stats();