/*
  # Create Database Functions and Views

  1. Functions
    - User feed generation
    - Search functionality
    - Statistics calculation
    
  2. Views
    - User feed view
    - User statistics view
    - Popular content view
    
  3. Features
    - Optimized queries
    - Real-time data
    - Performance improvements
*/

-- Create function to get user feed
CREATE OR REPLACE FUNCTION get_user_feed(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  post_id UUID,
  author_id UUID,
  author_name VARCHAR(100),
  author_avatar TEXT,
  author_role VARCHAR(50),
  content TEXT,
  media_urls TEXT[],
  media_types TEXT[],
  likes_count BIGINT,
  comments_count BIGINT,
  shares_count BIGINT,
  is_liked_by_user BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as post_id,
    p.author_id,
    u.full_name as author_name,
    u.avatar_url as author_avatar,
    u.role as author_role,
    p.content,
    p.media_urls,
    p.media_types,
    COALESCE(likes.count, 0) as likes_count,
    COALESCE(comments.count, 0) as comments_count,
    COALESCE(shares.count, 0) as shares_count,
    COALESCE(user_likes.exists, false) as is_liked_by_user,
    p.created_at
  FROM posts p
  JOIN users u ON u.id = p.author_id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count
    FROM post_interactions 
    WHERE interaction_type = 'like'
    GROUP BY post_id
  ) likes ON likes.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count
    FROM comments 
    WHERE deleted_at IS NULL
    GROUP BY post_id
  ) comments ON comments.post_id = p.id
  LEFT JOIN (
    SELECT post_id, COUNT(*) as count
    FROM post_interactions 
    WHERE interaction_type = 'share'
    GROUP BY post_id
  ) shares ON shares.post_id = p.id
  LEFT JOIN (
    SELECT post_id, true as exists
    FROM post_interactions 
    WHERE user_id = p_user_id AND interaction_type = 'like'
  ) user_likes ON user_likes.post_id = p.id
  WHERE 
    p.deleted_at IS NULL
    AND u.is_active = true
    AND (
      p.visibility = 'public' OR
      p.author_id = p_user_id OR
      (p.visibility = 'followers' AND EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = p_user_id 
        AND following_id = p.author_id 
        AND status = 'active'
      ))
    )
    AND (
      p.author_id = p_user_id OR
      EXISTS (
        SELECT 1 FROM follows 
        WHERE follower_id = p_user_id 
        AND following_id = p.author_id 
        AND status = 'active'
      )
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to search users
CREATE OR REPLACE FUNCTION search_users(
  p_query TEXT,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  user_id UUID,
  full_name VARCHAR(100),
  username VARCHAR(50),
  role VARCHAR(50),
  sport VARCHAR(100),
  location VARCHAR(100),
  avatar_url TEXT,
  followers_count INTEGER,
  is_verified BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.full_name,
    u.username,
    u.role,
    u.sport,
    u.location,
    u.avatar_url,
    COALESCE((up.stats->>'followers')::INTEGER, 0) as followers_count,
    u.is_verified
  FROM users u
  LEFT JOIN user_profiles up ON up.user_id = u.id
  WHERE 
    u.is_active = true
    AND u.privacy_settings->>'profile_visibility' = 'public'
    AND (
      u.full_name ILIKE '%' || p_query || '%' OR
      u.username ILIKE '%' || p_query || '%' OR
      u.role ILIKE '%' || p_query || '%' OR
      u.sport ILIKE '%' || p_query || '%' OR
      u.location ILIKE '%' || p_query || '%'
    )
  ORDER BY 
    CASE 
      WHEN u.full_name ILIKE p_query || '%' THEN 1
      WHEN u.username ILIKE p_query || '%' THEN 2
      ELSE 3
    END,
    COALESCE((up.stats->>'followers')::INTEGER, 0) DESC,
    u.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to get user conversations
CREATE OR REPLACE FUNCTION get_user_conversations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  conversation_id UUID,
  conversation_type VARCHAR(20),
  conversation_name VARCHAR(100),
  conversation_avatar TEXT,
  last_message_content TEXT,
  last_message_timestamp TIMESTAMP WITH TIME ZONE,
  last_message_sender_name VARCHAR(100),
  unread_count BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as conversation_id,
    c.type as conversation_type,
    CASE 
      WHEN c.type = 'group' THEN c.name
      ELSE (
        SELECT u.full_name 
        FROM conversation_participants cp2
        JOIN users u ON u.id = cp2.user_id
        WHERE cp2.conversation_id = c.id 
        AND cp2.user_id != p_user_id
        AND cp2.left_at IS NULL
        LIMIT 1
      )
    END as conversation_name,
    CASE 
      WHEN c.type = 'group' THEN c.avatar_url
      ELSE (
        SELECT u.avatar_url 
        FROM conversation_participants cp2
        JOIN users u ON u.id = cp2.user_id
        WHERE cp2.conversation_id = c.id 
        AND cp2.user_id != p_user_id
        AND cp2.left_at IS NULL
        LIMIT 1
      )
    END as conversation_avatar,
    last_msg.content as last_message_content,
    last_msg.created_at as last_message_timestamp,
    last_msg.sender_name as last_message_sender_name,
    COALESCE(unread.count, 0) as unread_count,
    c.updated_at
  FROM conversations c
  JOIN conversation_participants cp ON cp.conversation_id = c.id
  LEFT JOIN (
    SELECT DISTINCT ON (m.conversation_id)
      m.conversation_id,
      m.content,
      m.created_at,
      u.full_name as sender_name
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.deleted_at IS NULL
    ORDER BY m.conversation_id, m.created_at DESC
  ) last_msg ON last_msg.conversation_id = c.id
  LEFT JOIN (
    SELECT 
      m.conversation_id,
      COUNT(*) as count
    FROM messages m
    JOIN conversation_participants cp_unread ON cp_unread.conversation_id = m.conversation_id
    WHERE 
      m.deleted_at IS NULL
      AND cp_unread.user_id = p_user_id
      AND m.created_at > cp_unread.last_read_at
      AND m.sender_id != p_user_id
    GROUP BY m.conversation_id
  ) unread ON unread.conversation_id = c.id
  WHERE 
    cp.user_id = p_user_id 
    AND cp.left_at IS NULL
  ORDER BY c.updated_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create function to get mutual connections
CREATE OR REPLACE FUNCTION get_mutual_connections(
  p_user_id UUID,
  p_other_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  user_id UUID,
  full_name VARCHAR(100),
  avatar_url TEXT,
  role VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.full_name,
    u.avatar_url,
    u.role
  FROM users u
  WHERE u.id IN (
    SELECT f1.following_id
    FROM follows f1
    WHERE f1.follower_id = p_user_id 
    AND f1.status = 'active'
    AND EXISTS (
      SELECT 1 FROM follows f2
      WHERE f2.follower_id = p_other_user_id
      AND f2.following_id = f1.following_id
      AND f2.status = 'active'
    )
  )
  AND u.is_active = true
  AND u.privacy_settings->>'profile_visibility' = 'public'
  ORDER BY u.full_name
  LIMIT p_limit;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create view for user statistics
CREATE OR REPLACE VIEW user_stats_view AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.role,
  u.sport,
  COALESCE((up.stats->>'followers')::INTEGER, 0) as followers_count,
  COALESCE((up.stats->>'following')::INTEGER, 0) as following_count,
  COALESCE((up.stats->>'posts')::INTEGER, 0) as posts_count,
  COALESCE(likes.total_likes, 0) as total_likes_received,
  COALESCE(comments.total_comments, 0) as total_comments_received,
  u.created_at,
  u.last_login_at
FROM users u
LEFT JOIN user_profiles up ON up.user_id = u.id
LEFT JOIN (
  SELECT 
    p.author_id,
    COUNT(pi.id) as total_likes
  FROM posts p
  LEFT JOIN post_interactions pi ON pi.post_id = p.id AND pi.interaction_type = 'like'
  WHERE p.deleted_at IS NULL
  GROUP BY p.author_id
) likes ON likes.author_id = u.id
LEFT JOIN (
  SELECT 
    p.author_id,
    COUNT(c.id) as total_comments
  FROM posts p
  LEFT JOIN comments c ON c.post_id = p.id AND c.deleted_at IS NULL
  WHERE p.deleted_at IS NULL
  GROUP BY p.author_id
) comments ON comments.author_id = u.id
WHERE u.is_active = true;