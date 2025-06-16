/*
  # Database Functions and Triggers

  1. Functions
    - Update user stats automatically
    - Handle user registration
    - Create notifications
    - Manage conversations

  2. Triggers
    - Auto-update timestamps
    - Maintain user stats
    - Create notifications on actions
*/

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
        ((stats->>'following')::int + 1)::text::jsonb
      )
      WHERE user_id = NEW.follower_id;
      
      -- Increment followers count for following
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        ((stats->>'followers')::int + 1)::text::jsonb
      )
      WHERE user_id = NEW.following_id;
      
    ELSIF TG_OP = 'DELETE' THEN
      -- Decrement following count for follower
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{following}', 
        GREATEST(((stats->>'following')::int - 1), 0)::text::jsonb
      )
      WHERE user_id = OLD.follower_id;
      
      -- Decrement followers count for following
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{followers}', 
        GREATEST(((stats->>'followers')::int - 1), 0)::text::jsonb
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
        ((stats->>'posts')::int + 1)::text::jsonb
      )
      WHERE user_id = NEW.author_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE user_profiles 
      SET stats = jsonb_set(
        stats, 
        '{posts}', 
        GREATEST(((stats->>'posts')::int - 1), 0)::text::jsonb
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
  INSERT INTO users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  INSERT INTO user_profiles (user_id)
  VALUES (NEW.id);
  
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

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updating timestamps
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

-- Trigger to create notifications on follows
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

-- Trigger to create notifications on likes
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

-- Trigger to create notifications on comments
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

-- Trigger to create notifications on messages
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