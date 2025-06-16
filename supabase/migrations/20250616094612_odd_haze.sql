/*
  # Initial Database Schema Setup

  1. Tables
    - users: Core user information
    - user_profiles: Extended user profile data
    - follows: User follow relationships
    - posts: User posts/content
    - post_interactions: Likes, shares, etc.
    - comments: Post comments
    - conversations: Message threads
    - conversation_participants: Users in conversations
    - messages: Individual messages
    - notifications: User notifications
    - media_files: Uploaded media metadata

  2. Security
    - Row Level Security (RLS) policies
    - Secure defaults

  3. Indexes
    - Performance optimizations
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  username TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'player',
  sport TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  website_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  privacy_settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- User Profiles Table (Extended user data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievements TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  skill_level TEXT DEFAULT 'Beginner',
  position TEXT,
  team_size INTEGER,
  founded_year INTEGER,
  specializations TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  social_links JSONB DEFAULT '{}',
  stats JSONB DEFAULT '{"followers": 0, "following": 0, "posts": 0}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Follows Table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  media_types TEXT[] DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'public',
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  location TEXT,
  tags TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Post Interactions Table (likes, shares, etc.)
CREATE TABLE IF NOT EXISTS post_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id, interaction_type)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  mentions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'direct',
  name TEXT,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversation Participants Table
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_urls TEXT[] DEFAULT '{}',
  media_types TEXT[] DEFAULT '{}',
  message_type TEXT NOT NULL DEFAULT 'text',
  reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Media Files Table
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  thumbnail_url TEXT,
  is_processed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users policies
CREATE POLICY "Users can view all active users" 
  ON users FOR SELECT 
  USING (is_active = TRUE);

CREATE POLICY "Users can update their own profile" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "User profiles are viewable by everyone" 
  ON user_profiles FOR SELECT 
  USING (TRUE);

CREATE POLICY "Users can update their own profile data" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Anyone can see follows" 
  ON follows FOR SELECT 
  USING (TRUE);

CREATE POLICY "Users can follow others" 
  ON follows FOR INSERT 
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" 
  ON follows FOR DELETE 
  USING (auth.uid() = follower_id);

-- Posts policies
CREATE POLICY "Public posts are viewable by everyone" 
  ON posts FOR SELECT 
  USING (visibility = 'public' AND deleted_at IS NULL);

CREATE POLICY "Users can view their own posts" 
  ON posts FOR SELECT 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can create posts" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts" 
  ON posts FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts" 
  ON posts FOR UPDATE 
  USING (auth.uid() = author_id AND deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL);

-- Post interactions policies
CREATE POLICY "Anyone can see post interactions" 
  ON post_interactions FOR SELECT 
  USING (TRUE);

CREATE POLICY "Users can interact with posts" 
  ON post_interactions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their interactions" 
  ON post_interactions FOR DELETE 
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can see comments on public posts" 
  ON comments FOR SELECT 
  USING (
    deleted_at IS NULL AND 
    EXISTS (
      SELECT 1 FROM posts 
      WHERE posts.id = comments.post_id 
      AND posts.visibility = 'public'
      AND posts.deleted_at IS NULL
    )
  );

CREATE POLICY "Users can create comments" 
  ON comments FOR INSERT 
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own comments" 
  ON comments FOR UPDATE 
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments" 
  ON comments FOR UPDATE 
  USING (auth.uid() = author_id AND deleted_at IS NULL)
  WITH CHECK (deleted_at IS NOT NULL);

-- Conversations policies
CREATE POLICY "Users can see conversations they're part of" 
  ON conversations FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = id 
      AND conversation_participants.user_id = auth.uid()
      AND conversation_participants.left_at IS NULL
    )
  );

CREATE POLICY "Users can create conversations" 
  ON conversations FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Conversation participants policies
CREATE POLICY "Users can see participants in their conversations" 
  ON conversation_participants FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM conversation_participants cp 
      WHERE cp.conversation_id = conversation_id 
      AND cp.user_id = auth.uid()
      AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can add participants to conversations they created" 
  ON conversation_participants FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = conversation_id 
      AND conversations.created_by = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can see messages in their conversations" 
  ON messages FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = conversation_id 
      AND conversation_participants.user_id = auth.uid()
      AND conversation_participants.left_at IS NULL
    )
  );

CREATE POLICY "Users can send messages to conversations they're in" 
  ON messages FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversation_participants 
      WHERE conversation_participants.conversation_id = conversation_id 
      AND conversation_participants.user_id = auth.uid()
      AND conversation_participants.left_at IS NULL
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON messages FOR UPDATE 
  USING (sender_id = auth.uid() AND deleted_at IS NULL);

-- Notifications policies
CREATE POLICY "Users can see their own notifications" 
  ON notifications FOR SELECT 
  USING (recipient_id = auth.uid());

CREATE POLICY "Users can mark their notifications as read" 
  ON notifications FOR UPDATE 
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid() AND (
    (is_read = TRUE) OR
    (expires_at IS NOT NULL)
  ));

-- Media files policies
CREATE POLICY "Users can see public media files" 
  ON media_files FOR SELECT 
  USING (
    is_processed = TRUE OR uploader_id = auth.uid()
  );

CREATE POLICY "Users can upload media files" 
  ON media_files FOR INSERT 
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can update their own media files" 
  ON media_files FOR UPDATE 
  USING (uploader_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_sport ON users(sport);
CREATE INDEX IF NOT EXISTS idx_users_location ON users(location);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_visibility ON posts(visibility) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_tags ON posts USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_post_interactions_post_id ON post_interactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_user_id ON post_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_interactions_type ON post_interactions(interaction_type);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_comment_id) WHERE parent_comment_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_conversations_type ON conversations(type);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_media_files_uploader_id ON media_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_media_files_is_processed ON media_files(is_processed);