/*
  # Initial SportNet Database Schema

  1. New Tables
    - `users` - User authentication and basic info
    - `profiles` - Extended user profile information
    - `posts` - User posts and content
    - `post_media` - Media attachments for posts
    - `connections` - User connections/following system
    - `conversations` - Chat conversations
    - `messages` - Chat messages
    - `notifications` - User notifications
    - `achievements` - User achievements and certifications
    - `likes` - Likes for posts and other content
    - `comments` - Comments on posts

  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    - Create secure functions for common operations

  3. Performance
    - Add indexes for common queries
    - Create materialized views for analytics
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(254) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'coach', 'team', 'nutritionist', 'physiotherapist', 'psychologist', 'journalist', 'agent', 'trainer', 'referee', 'other')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'deleted')),
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles table
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(50),
    bio TEXT,
    sport VARCHAR(100),
    position VARCHAR(100),
    experience_years INTEGER,
    skill_level VARCHAR(50) CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'professional', 'expert')),
    location VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    height_cm INTEGER,
    weight_kg INTEGER,
    avatar_url TEXT,
    cover_image_url TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "contact_visibility": "connections", "activity_visibility": "public"}',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_type VARCHAR(50),
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- Posts table
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID,
    content TEXT NOT NULL,
    post_type VARCHAR(20) DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'video', 'link', 'poll', 'event')),
    visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'connections', 'private', 'team')),
    status VARCHAR(20) DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'deleted')),
    metadata JSONB DEFAULT '{}',
    location VARCHAR(100),
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Post media table
CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    duration INTEGER,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connections table
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'blocked')),
    connection_type VARCHAR(50) DEFAULT 'general' CHECK (connection_type IN ('general', 'teammate', 'coach_player', 'professional', 'friend')),
    message TEXT,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(requester_id, addressee_id),
    CHECK(requester_id != addressee_id)
);

-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'team')),
    name VARCHAR(100),
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'audio', 'file', 'system')),
    reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'connection_request', 'connection_accepted', 'message', 'team_invite', 'team_join', 'post_mention', 'achievement', 'system')),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    achievement_type VARCHAR(50) CHECK (achievement_type IN ('award', 'certification', 'milestone', 'competition', 'personal')),
    date_achieved DATE,
    issuing_organization VARCHAR(255),
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    verification_document_url TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes table
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likeable_type VARCHAR(50) NOT NULL CHECK (likeable_type IN ('post', 'comment', 'achievement', 'event')),
    likeable_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, likeable_type, likeable_id)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    commentable_type VARCHAR(50) NOT NULL CHECK (commentable_type IN ('post', 'event', 'achievement')),
    commentable_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_sport ON profiles(sport);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);

CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_visibility ON posts(visibility);

CREATE INDEX idx_post_media_post_id ON post_media(post_id);

CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_addressee_id ON connections(addressee_id);
CREATE INDEX idx_connections_status ON connections(status);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_verification_status ON achievements(verification_status);

CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_likeable ON likes(likeable_type, likeable_id);

CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_commentable ON comments(commentable_type, commentable_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (
    NOT is_private OR 
    user_id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM connections 
        WHERE (requester_id = auth.uid() AND addressee_id = user_id) 
           OR (addressee_id = auth.uid() AND requester_id = user_id)
        AND status = 'accepted'
    )
);

CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (user_id = auth.uid());

-- Posts policies
CREATE POLICY "Public posts are viewable by everyone" ON posts FOR SELECT USING (
    status = 'published' AND (
        visibility = 'public' OR
        (visibility = 'connections' AND EXISTS (
            SELECT 1 FROM connections 
            WHERE (requester_id = auth.uid() AND addressee_id = author_id) 
               OR (addressee_id = auth.uid() AND requester_id = author_id)
            AND status = 'accepted'
        )) OR
        author_id = auth.uid()
    )
);

CREATE POLICY "Users can create their own posts" ON posts FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (author_id = auth.uid());
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (author_id = auth.uid());

-- Post media policies
CREATE POLICY "Post media is viewable with post" ON post_media FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM posts 
        WHERE posts.id = post_media.post_id 
        AND (
            posts.status = 'published' AND (
                posts.visibility = 'public' OR
                (posts.visibility = 'connections' AND EXISTS (
                    SELECT 1 FROM connections 
                    WHERE (requester_id = auth.uid() AND addressee_id = posts.author_id) 
                       OR (addressee_id = auth.uid() AND requester_id = posts.author_id)
                    AND status = 'accepted'
                )) OR
                posts.author_id = auth.uid()
            )
        )
    )
);

CREATE POLICY "Users can add media to their posts" ON post_media FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM posts WHERE posts.id = post_media.post_id AND posts.author_id = auth.uid())
);

-- Connections policies
CREATE POLICY "Users can view their connections" ON connections FOR SELECT USING (
    requester_id = auth.uid() OR addressee_id = auth.uid()
);

CREATE POLICY "Users can create connection requests" ON connections FOR INSERT WITH CHECK (
    requester_id = auth.uid()
);

CREATE POLICY "Users can update connection requests" ON connections FOR UPDATE USING (
    addressee_id = auth.uid() OR requester_id = auth.uid()
);

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications FOR SELECT USING (
    recipient_id = auth.uid()
);

CREATE POLICY "Users can update their notifications" ON notifications FOR UPDATE USING (
    recipient_id = auth.uid()
);

-- Achievements policies
CREATE POLICY "Public achievements are viewable" ON achievements FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.user_id = achievements.user_id 
        AND (NOT profiles.is_private OR profiles.user_id = auth.uid())
    )
);

CREATE POLICY "Users can manage their achievements" ON achievements FOR ALL USING (
    user_id = auth.uid()
);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can manage their likes" ON likes FOR ALL USING (user_id = auth.uid());

-- Comments policies
CREATE POLICY "Comments are viewable with their parent content" ON comments FOR SELECT USING (
    NOT is_deleted AND (
        (commentable_type = 'post' AND EXISTS (
            SELECT 1 FROM posts 
            WHERE posts.id = comments.commentable_id 
            AND posts.status = 'published'
            AND (
                posts.visibility = 'public' OR
                posts.author_id = auth.uid() OR
                (posts.visibility = 'connections' AND EXISTS (
                    SELECT 1 FROM connections 
                    WHERE (requester_id = auth.uid() AND addressee_id = posts.author_id) 
                       OR (addressee_id = auth.uid() AND requester_id = posts.author_id)
                    AND status = 'accepted'
                ))
            )
        ))
    )
);

CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (
    author_id = auth.uid()
);

CREATE POLICY "Users can update their comments" ON comments FOR UPDATE USING (
    author_id = auth.uid()
);

-- Create functions for common operations

-- Function to get user feed
CREATE OR REPLACE FUNCTION get_user_feed(
    user_id UUID,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    author_id UUID,
    author_name TEXT,
    author_avatar TEXT,
    author_role TEXT,
    post_type TEXT,
    created_at TIMESTAMP,
    like_count BIGINT,
    comment_count BIGINT,
    is_liked BOOLEAN
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.content,
        p.author_id,
        pr.full_name as author_name,
        pr.avatar_url as author_avatar,
        u.role as author_role,
        p.post_type,
        p.created_at,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        COALESCE(ul.user_liked, false) as is_liked
    FROM posts p
    JOIN profiles pr ON p.author_id = pr.user_id
    JOIN users u ON p.author_id = u.id
    LEFT JOIN (
        SELECT likeable_id, COUNT(*) as like_count
        FROM likes 
        WHERE likeable_type = 'post'
        GROUP BY likeable_id
    ) l ON p.id = l.likeable_id
    LEFT JOIN (
        SELECT commentable_id, COUNT(*) as comment_count
        FROM comments 
        WHERE commentable_type = 'post' AND NOT is_deleted
        GROUP BY commentable_id
    ) c ON p.id = c.commentable_id
    LEFT JOIN (
        SELECT likeable_id, true as user_liked
        FROM likes 
        WHERE likeable_type = 'post' AND user_id = get_user_feed.user_id
    ) ul ON p.id = ul.likeable_id
    WHERE p.status = 'published'
    AND (
        p.visibility = 'public' OR
        p.author_id = get_user_feed.user_id OR
        (p.visibility = 'connections' AND EXISTS (
            SELECT 1 FROM connections 
            WHERE (requester_id = get_user_feed.user_id AND addressee_id = p.author_id) 
               OR (addressee_id = get_user_feed.user_id AND requester_id = p.author_id)
            AND status = 'accepted'
        ))
    )
    ORDER BY p.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Function to search users
CREATE OR REPLACE FUNCTION search_users(
    search_query TEXT,
    sport_filter TEXT DEFAULT NULL,
    role_filter TEXT DEFAULT NULL,
    location_filter TEXT DEFAULT NULL,
    limit_count INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT,
    sport TEXT,
    location TEXT,
    mutual_connections BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        p.full_name,
        p.avatar_url,
        u.role,
        p.sport,
        p.location,
        0::BIGINT as mutual_connections -- Simplified for now
    FROM users u
    JOIN profiles p ON u.id = p.user_id
    WHERE u.status = 'active'
    AND (NOT p.is_private OR p.user_id = auth.uid())
    AND (
        search_query IS NULL OR
        search_query = '' OR
        p.full_name ILIKE '%' || search_query || '%' OR
        p.sport ILIKE '%' || search_query || '%' OR
        p.location ILIKE '%' || search_query || '%' OR
        u.role ILIKE '%' || search_query || '%'
    )
    AND (sport_filter IS NULL OR p.sport ILIKE '%' || sport_filter || '%')
    AND (role_filter IS NULL OR u.role = role_filter)
    AND (location_filter IS NULL OR p.location ILIKE '%' || location_filter || '%')
    ORDER BY p.full_name
    LIMIT limit_count;
END;
$$;

-- Create user stats view
CREATE VIEW user_stats AS
SELECT 
    u.id,
    u.email,
    p.full_name,
    p.sport,
    p.location,
    (SELECT COUNT(*) FROM connections c WHERE (c.requester_id = u.id OR c.addressee_id = u.id) AND c.status = 'accepted') as connection_count,
    (SELECT COUNT(*) FROM posts po WHERE po.author_id = u.id AND po.status = 'published') as post_count,
    (SELECT COUNT(*) FROM likes l JOIN posts po ON l.likeable_id = po.id WHERE po.author_id = u.id AND l.likeable_type = 'post') as total_likes,
    (SELECT COUNT(*) FROM achievements a WHERE a.user_id = u.id) as achievement_count,
    u.created_at,
    u.last_login
FROM users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE u.status = 'active';

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply timestamp triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_achievements_updated_at BEFORE UPDATE ON achievements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();