/*
  # Database Functions and Triggers

  1. Functions
    - update_user_stats: Updates user statistics (followers, following, posts)
    - handle_new_user: Creates user profile when auth user is created
    - create_notification: Helper function to create notifications
    - find_or_create_conversation: Finds or creates direct conversations
    - update_updated_at: Updates timestamp fields

  2. Triggers
    - Auto-update timestamps on record changes
    - Handle new user registration
    - Update user statistics on follows/posts
    - Create notifications for interactions

  3. Notification System
    - Automatic notifications for follows, likes, comments, messages
    - Proper data structure for different notification types
*/

-- Drop existing triggers if they exist to avoid conflicts
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_posts_updated_at ON posts;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_stats_on_follow ON follows;
DROP TRIGGER IF EXISTS update_stats_on_post ON posts;
DROP TRIGGER IF EXISTS notify_on_follow_trigger ON follows;
DROP TRIGGER IF EXISTS notify_on_like_trigger ON post_interactions;
DROP TRIGGER IF EXISTS notify_on_comment_trigger ON comments;
DROP TRIGGER IF EXISTS notify_on_message_trigger ON messages;

-- Function to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update follower/following counts
  IF TG_TABLE_NAME = 'follows' THEN
    IF TG_OP = 'INSERT' THEN
      -- Increment following count for follower
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{following}', 
        ((COALESCE(stats->>'following', '0'))::int + 1)::text::jsonb
      )
      WHERE user_id = NEW.follower_id;
      
      -- Increment followers count for following
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        ((COALESCE(stats->>'followers', '0'))::int + 1)::text::jsonb
      )
      WHERE user_id = NEW.following_id;
      
    ELSIF TG_OP = 'DELETE' THEN
      -- Decrement following count for follower
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{following}', 
        GREATEST(((COALESCE(stats->>'following', '0'))::int - 1), 0)::text::jsonb
      )
      WHERE user_id = OLD.follower_id;
      
      -- Decrement followers count for following
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        GREATEST(((COALESCE(stats->>'followers', '0'))::int - 1), 0)::text::jsonb
      )
      WHERE user_id = OLD.following_id;
    END IF;
  END IF;
  
  -- Update posts count
  IF TG_TABLE_NAME = 'posts' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{posts}', 
        ((COALESCE(stats->>'posts', '0'))::int + 1)::text::jsonb
      )
      WHERE user_id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{posts}', 
        GREATEST(((COALESCE(stats->>'posts', '0'))::int - 1), 0)::text::jsonb
      )
      WHERE user_id = OLD.author_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into users table
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Insert into user_profiles table
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notifications
CREATE OR REPLACE FUNCTION create_notification(
  recipient_id UUID,
  sender_id UUID,
  notification_type TEXT,
  title TEXT,
  content TEXT,
  data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    type,
    title,
    content,
    data,
    expires_at
  )
  VALUES (
    recipient_id,
    sender_id,
    notification_type,
    title,
    content,
    data,
    NOW() + INTERVAL '30 days'
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to find or create direct conversation
CREATE OR REPLACE FUNCTION find_or_create_conversation(
  user1_id UUID,
  user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  conversation_id UUID;
BEGIN
  -- Try to find existing direct conversation
  SELECT c.id INTO conversation_id
  FROM conversations c
  WHERE c.type = 'direct'
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp1
    WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id
  )
  AND EXISTS (
    SELECT 1 FROM conversation_participants cp2
    WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id
  )
  AND (
    SELECT COUNT(*) FROM conversation_participants cp
    WHERE cp.conversation_id = c.id AND cp.left_at IS NULL
  ) = 2;
  
  -- If no conversation exists, create one
  IF conversation_id IS NULL THEN
    INSERT INTO conversations (type, created_by)
    VALUES ('direct', user1_id)
    RETURNING id INTO conversation_id;
    
    -- Add both users as participants
    INSERT INTO conversation_participants (conversation_id, user_id)
    VALUES 
      (conversation_id, user1_id),
      (conversation_id, user2_id);
  END IF;
  
  RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps (only create if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Triggers for updating user stats
CREATE TRIGGER update_stats_on_follow
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER update_stats_on_post
  AFTER INSERT OR DELETE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Function and trigger to create notifications on follows
CREATE OR REPLACE FUNCTION notify_on_follow()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    PERFORM create_notification(
      NEW.following_id,
      NEW.follower_id,
      'follow',
      'New Follower',
      'started following you',
      jsonb_build_object('follower_id', NEW.follower_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_follow_trigger
  AFTER INSERT ON follows
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_follow();

-- Function and trigger to create notifications on likes
CREATE OR REPLACE FUNCTION notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.interaction_type = 'like' THEN
    SELECT author_id INTO post_author_id
    FROM posts
    WHERE id = NEW.post_id;
    
    -- Don't notify if user likes their own post
    IF post_author_id != NEW.user_id THEN
      PERFORM create_notification(
        post_author_id,
        NEW.user_id,
        'like',
        'Post Liked',
        'liked your post',
        jsonb_build_object('post_id', NEW.post_id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_like_trigger
  AFTER INSERT ON post_interactions
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_like();

-- Function and trigger to create notifications on comments
CREATE OR REPLACE FUNCTION notify_on_comment()
RETURNS TRIGGER AS $$
DECLARE
  post_author_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT author_id INTO post_author_id
    FROM posts
    WHERE id = NEW.post_id;
    
    -- Don't notify if user comments on their own post
    IF post_author_id != NEW.author_id THEN
      PERFORM create_notification(
        post_author_id,
        NEW.author_id,
        'comment',
        'New Comment',
        'commented on your post',
        jsonb_build_object('post_id', NEW.post_id, 'comment_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_comment_trigger
  AFTER INSERT ON comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_comment();

-- Function and trigger to create notifications on messages
CREATE OR REPLACE FUNCTION notify_on_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.message_type = 'text' THEN
    -- Get the other participant in direct conversations
    SELECT cp.user_id INTO recipient_id
    FROM conversation_participants cp
    JOIN conversations c ON c.id = cp.conversation_id
    WHERE cp.conversation_id = NEW.conversation_id
    AND cp.user_id != NEW.sender_id
    AND cp.left_at IS NULL
    AND c.type = 'direct'
    LIMIT 1;
    
    IF recipient_id IS NOT NULL THEN
      PERFORM create_notification(
        recipient_id,
        NEW.sender_id,
        'message',
        'New Message',
        'sent you a message',
        jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id)
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_message();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created ON notifications(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(recipient_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_posts_author_created ON posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_post_user ON post_interactions(post_id, user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_created ON comments(post_id, created_at DESC);