# SportNet Database Schema Documentation

## Overview
SportNet is a comprehensive sports networking platform that connects athletes, coaches, teams, and sports professionals. This document outlines the complete database schema, relationships, and implementation details.

## Database Technology Stack
- **Primary Database**: PostgreSQL 14+
- **Cache Layer**: Redis
- **Search Engine**: Elasticsearch (optional)
- **File Storage**: AWS S3 / Cloudinary
- **Real-time**: WebSocket connections

## Core Tables

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(254) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    role VARCHAR(50) NOT NULL CHECK (role IN ('player', 'coach', 'team', 'nutritionist', 'physiotherapist', 'psychologist', 'journalist', 'agent', 'trainer', 'referee', 'other')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned', 'deleted')),
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_created_at ON users(created_at);
```

### 2. Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    timezone VARCHAR(50),
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_sport ON profiles(sport);
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_skill_level ON profiles(skill_level);
CREATE INDEX idx_profiles_is_verified ON profiles(is_verified);
CREATE UNIQUE INDEX idx_profiles_user_id_unique ON profiles(user_id);
```

### 3. Teams Table
```sql
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    sport VARCHAR(100) NOT NULL,
    team_type VARCHAR(50) CHECK (team_type IN ('professional', 'amateur', 'youth', 'college', 'recreational')),
    founded_year INTEGER,
    location VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    logo_url TEXT,
    cover_image_url TEXT,
    website_url TEXT,
    social_links JSONB DEFAULT '{}',
    max_members INTEGER DEFAULT 50,
    is_recruiting BOOLEAN DEFAULT TRUE,
    privacy_level VARCHAR(20) DEFAULT 'public' CHECK (privacy_level IN ('public', 'private', 'invite_only')),
    verification_status VARCHAR(20) DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_sport ON teams(sport);
CREATE INDEX idx_teams_location ON teams(location);
CREATE INDEX idx_teams_team_type ON teams(team_type);
CREATE INDEX idx_teams_is_recruiting ON teams(is_recruiting);
```

### 4. Team Members Table
```sql
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'coach', 'player', 'staff', 'member')),
    position VARCHAR(100),
    jersey_number INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'left')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(team_id, user_id)
);

-- Indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status);
```

### 5. Posts Table
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
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

-- Indexes
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_team_id ON posts(team_id);
CREATE INDEX idx_posts_post_type ON posts(post_type);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);
CREATE INDEX idx_posts_is_featured ON posts(is_featured);
```

### 6. Post Media Table
```sql
CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_name VARCHAR(255),
    file_size BIGINT,
    mime_type VARCHAR(100),
    width INTEGER,
    height INTEGER,
    duration INTEGER, -- for video/audio in seconds
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_post_media_post_id ON post_media(post_id);
CREATE INDEX idx_post_media_type ON post_media(media_type);
CREATE INDEX idx_post_media_order ON post_media(post_id, display_order);
```

### 7. Connections Table
```sql
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Indexes
CREATE INDEX idx_connections_requester_id ON connections(requester_id);
CREATE INDEX idx_connections_addressee_id ON connections(addressee_id);
CREATE INDEX idx_connections_status ON connections(status);
CREATE INDEX idx_connections_type ON connections(connection_type);
```

### 8. Messages Table
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'team')),
    name VARCHAR(100),
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(conversation_id, user_id)
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Indexes
CREATE INDEX idx_conversations_type ON conversations(type);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_messages_reply_to_id ON messages(reply_to_id);
```

### 9. Notifications Table
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Indexes
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_priority ON notifications(priority);
```

### 10. Achievements Table
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Indexes
CREATE INDEX idx_achievements_user_id ON achievements(user_id);
CREATE INDEX idx_achievements_type ON achievements(achievement_type);
CREATE INDEX idx_achievements_verification_status ON achievements(verification_status);
CREATE INDEX idx_achievements_is_featured ON achievements(is_featured);
CREATE INDEX idx_achievements_date_achieved ON achievements(date_achieved);
```

### 11. Events Table
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) CHECK (event_type IN ('game', 'practice', 'tournament', 'training', 'meeting', 'social', 'other')),
    sport VARCHAR(100),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    timezone VARCHAR(50),
    location VARCHAR(255),
    venue_name VARCHAR(255),
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    max_participants INTEGER,
    registration_required BOOLEAN DEFAULT FALSE,
    registration_deadline TIMESTAMP,
    is_public BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_events_organizer_id ON events(organizer_id);
CREATE INDEX idx_events_team_id ON events(team_id);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_location ON events(location);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_is_public ON events(is_public);
```

### 12. Event Participants Table
```sql
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'confirmed', 'attended', 'no_show', 'cancelled')),
    role VARCHAR(50) DEFAULT 'participant' CHECK (role IN ('participant', 'organizer', 'coach', 'referee', 'volunteer')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    notes TEXT,
    
    UNIQUE(event_id, user_id)
);

-- Indexes
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX idx_event_participants_status ON event_participants(status);
```

### 13. Likes Table
```sql
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    likeable_type VARCHAR(50) NOT NULL CHECK (likeable_type IN ('post', 'comment', 'achievement', 'event')),
    likeable_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, likeable_type, likeable_id)
);

-- Indexes
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_likeable ON likes(likeable_type, likeable_id);
CREATE INDEX idx_likes_created_at ON likes(created_at);
```

### 14. Comments Table
```sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Indexes
CREATE INDEX idx_comments_author_id ON comments(author_id);
CREATE INDEX idx_comments_commentable ON comments(commentable_type, commentable_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);
CREATE INDEX idx_comments_created_at ON comments(created_at);
```

### 15. Analytics Tables
```sql
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(15, 4),
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_bucket DATE DEFAULT CURRENT_DATE
);

CREATE TABLE platform_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(15, 4),
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_bucket DATE DEFAULT CURRENT_DATE
);

-- Indexes
CREATE INDEX idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX idx_user_analytics_type ON user_analytics(metric_type);
CREATE INDEX idx_user_analytics_date ON user_analytics(date_bucket);
CREATE INDEX idx_platform_analytics_type ON platform_analytics(metric_type);
CREATE INDEX idx_platform_analytics_date ON platform_analytics(date_bucket);
```

## Views and Functions

### 1. User Stats View
```sql
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
```

### 2. Popular Posts View
```sql
CREATE VIEW popular_posts AS
SELECT 
    p.*,
    u.email as author_email,
    pr.full_name as author_name,
    pr.avatar_url as author_avatar,
    (SELECT COUNT(*) FROM likes l WHERE l.likeable_id = p.id AND l.likeable_type = 'post') as like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.commentable_id = p.id AND c.commentable_type = 'post') as comment_count
FROM posts p
JOIN users u ON p.author_id = u.id
LEFT JOIN profiles pr ON u.id = pr.user_id
WHERE p.status = 'published'
ORDER BY like_count DESC, comment_count DESC, p.created_at DESC;
```

## Triggers and Functions

### 1. Update Timestamp Trigger
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ... (apply to all relevant tables)
```

### 2. Notification Trigger
```sql
CREATE OR REPLACE FUNCTION create_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification for new likes
    IF TG_TABLE_NAME = 'likes' THEN
        INSERT INTO notifications (recipient_id, sender_id, type, title, content, data)
        SELECT 
            CASE 
                WHEN NEW.likeable_type = 'post' THEN (SELECT author_id FROM posts WHERE id = NEW.likeable_id)
                WHEN NEW.likeable_type = 'comment' THEN (SELECT author_id FROM comments WHERE id = NEW.likeable_id)
            END,
            NEW.user_id,
            'like',
            'Someone liked your ' || NEW.likeable_type,
            'Your ' || NEW.likeable_type || ' received a like',
            json_build_object('likeable_type', NEW.likeable_type, 'likeable_id', NEW.likeable_id)
        WHERE NEW.user_id != (
            CASE 
                WHEN NEW.likeable_type = 'post' THEN (SELECT author_id FROM posts WHERE id = NEW.likeable_id)
                WHEN NEW.likeable_type = 'comment' THEN (SELECT author_id FROM comments WHERE id = NEW.likeable_id)
            END
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notification_on_like AFTER INSERT ON likes FOR EACH ROW EXECUTE FUNCTION create_notification();
```

## Security Considerations

### 1. Row Level Security (RLS)
```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Example policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

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
```

### 2. Data Validation
```sql
-- Add constraints for data validation
ALTER TABLE users ADD CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE profiles ADD CONSTRAINT valid_height CHECK (height_cm > 0 AND height_cm < 300);
ALTER TABLE profiles ADD CONSTRAINT valid_weight CHECK (weight_kg > 0 AND weight_kg < 500);
ALTER TABLE events ADD CONSTRAINT valid_event_times CHECK (end_time > start_time);
```

## Performance Optimization

### 1. Partitioning
```sql
-- Partition large tables by date
CREATE TABLE posts_2024 PARTITION OF posts FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE posts_2025 PARTITION OF posts FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE notifications_2024 PARTITION OF notifications FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
CREATE TABLE notifications_2025 PARTITION OF notifications FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### 2. Materialized Views
```sql
-- Create materialized view for user statistics
CREATE MATERIALIZED VIEW user_stats_mv AS
SELECT 
    u.id,
    COUNT(DISTINCT c.id) as connection_count,
    COUNT(DISTINCT p.id) as post_count,
    COUNT(DISTINCT l.id) as total_likes_received,
    COUNT(DISTINCT a.id) as achievement_count
FROM users u
LEFT JOIN connections c ON (c.requester_id = u.id OR c.addressee_id = u.id) AND c.status = 'accepted'
LEFT JOIN posts p ON p.author_id = u.id AND p.status = 'published'
LEFT JOIN likes l ON l.likeable_id = p.id AND l.likeable_type = 'post'
LEFT JOIN achievements a ON a.user_id = u.id
WHERE u.status = 'active'
GROUP BY u.id;

-- Refresh periodically
CREATE UNIQUE INDEX ON user_stats_mv (id);
```

## Backup and Recovery

### 1. Backup Strategy
```sql
-- Daily full backup
pg_dump -h localhost -U postgres -d sportnet > sportnet_backup_$(date +%Y%m%d).sql

-- Continuous archiving
archive_mode = on
archive_command = 'cp %p /backup/archive/%f'
```

### 2. Point-in-Time Recovery
```sql
-- Enable WAL archiving
wal_level = replica
max_wal_senders = 3
```

## Migration Scripts

### 1. Initial Setup
```sql
-- Create database
CREATE DATABASE sportnet;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
```

### 2. Sample Data
```sql
-- Insert sample users
INSERT INTO users (email, password_hash, role) VALUES
('john@example.com', '$2b$10$...', 'player'),
('sarah@example.com', '$2b$10$...', 'coach'),
('team@example.com', '$2b$10$...', 'team');

-- Insert sample profiles
INSERT INTO profiles (user_id, full_name, sport, location) VALUES
((SELECT id FROM users WHERE email = 'john@example.com'), 'John Smith', 'Basketball', 'New York, USA'),
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'Sarah Johnson', 'Tennis', 'London, UK');
```

This schema provides a robust foundation for the SportNet platform with proper relationships, security, and performance considerations.