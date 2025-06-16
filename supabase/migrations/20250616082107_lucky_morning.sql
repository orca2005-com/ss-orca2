/*
  # Insert Sample Data

  1. Sample Users
    - Create diverse user profiles
    - Different roles and sports
    
  2. Sample Relationships
    - Follow relationships
    - Conversations
    
  3. Sample Content
    - Posts with various content types
    - Comments and interactions
    
  4. Sample Notifications
    - Different notification types
*/

-- Insert sample users
INSERT INTO users (id, email, full_name, username, role, sport, location, bio, avatar_url, cover_image_url, is_verified) VALUES
('11111111-1111-1111-1111-111111111111', 'john.smith@example.com', 'John Smith', 'johnsmith', 'player', 'Basketball', 'New York, USA', 'Professional basketball player with 5+ years of experience. Love the game and always pushing to improve.', 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg', 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg', true),
('22222222-2222-2222-2222-222222222222', 'elite@academy.com', 'Elite Sports Academy', 'elitesports', 'team', 'Multiple', 'Los Angeles, USA', 'Premier sports academy focused on developing young talent across multiple sports.', 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg', 'https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg', true),
('33333333-3333-3333-3333-333333333333', 'sarah.johnson@example.com', 'Sarah Johnson', 'sarahj', 'coach', 'Tennis', 'London, UK', 'Professional tennis coach with 10+ years of experience. Specialized in youth development.', 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg', 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg', true),
('44444444-4444-4444-4444-444444444444', 'mike.rodriguez@example.com', 'Mike Rodriguez', 'mikerod', 'player', 'Soccer', 'Madrid, Spain', 'Professional soccer player passionate about the beautiful game.', 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg', 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg', false),
('55555555-5555-5555-5555-555555555555', 'thunder@basketball.com', 'Thunder Basketball Club', 'thunderbc', 'team', 'Basketball', 'Chicago, USA', 'Professional basketball team competing in the national league.', 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg', 'https://images.pexels.com/photos/1544775/pexels-photo-1544775.jpeg', true),
('66666666-6666-6666-6666-666666666666', 'coach.martinez@example.com', 'Coach Martinez', 'coachmartinez', 'coach', 'Basketball', 'Miami, USA', 'Elite basketball coach specializing in player development and team strategy.', 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg', 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg', true),
('77777777-7777-7777-7777-777777777777', 'dr.wilson@nutrition.com', 'Dr. Emma Wilson', 'drwilson', 'Sports Nutritionist', 'Nutrition & Wellness', 'Mumbai, India', 'Sports nutrition expert helping athletes optimize their performance through proper nutrition.', 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg', 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg', true),
('88888888-8888-8888-8888-888888888888', 'mark.thompson@physio.com', 'Mark Thompson', 'marktherapy', 'Physiotherapist', 'Sports Medicine', 'Delhi, India', 'Licensed physiotherapist specializing in sports injury prevention and rehabilitation.', 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg', 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg', true)
ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO user_profiles (user_id, achievements, certifications, experience_years, skill_level, position, stats) VALUES
('11111111-1111-1111-1111-111111111111', ARRAY['Regional Championship MVP 2023', 'All-Star Team Selection 2022', '1000+ Career Points'], ARRAY[]::TEXT[], 5, 'professional', 'Point Guard', '{"followers": 1234, "following": 89, "posts": 156}'::jsonb),
('22222222-2222-2222-2222-222222222222', ARRAY['Best Youth Academy 2023', '100+ Professional Athletes Trained', 'National Training Center of the Year'], ARRAY[]::TEXT[], 15, 'expert', NULL, '{"followers": 5678, "following": 234, "posts": 89}'::jsonb),
('33333333-3333-3333-3333-333333333333', ARRAY['Coach of the Year 2022', 'Former National Team Coach', 'Level 4 Certified Trainer'], ARRAY['ITF Level 4 Coaching Certification', 'Sports Psychology Diploma', 'Youth Development Specialist'], 10, 'expert', NULL, '{"followers": 3456, "following": 156, "posts": 203}'::jsonb),
('44444444-4444-4444-4444-444444444444', ARRAY['La Liga Young Player Award 2023', 'UEFA Youth Championship Winner', 'Top Scorer Regional League'], ARRAY[]::TEXT[], 3, 'professional', 'Striker', '{"followers": 2890, "following": 145, "posts": 78}'::jsonb),
('55555555-5555-5555-5555-555555555555', ARRAY['National Championship 2022', 'Conference Champions 2023', 'Best Team Spirit Award'], ARRAY[]::TEXT[], 8, 'professional', NULL, '{"followers": 8920, "following": 67, "posts": 234}'::jsonb),
('66666666-6666-6666-6666-666666666666', ARRAY['State Championship Coach 2023', 'Coach of the Year Award 2022', 'Developed 20+ College Scholarship Athletes'], ARRAY['USA Basketball Gold License', 'NFHS Coaching Certification', 'Sports Psychology Certificate'], 15, 'expert', NULL, '{"followers": 4200, "following": 189, "posts": 167}'::jsonb),
('77777777-7777-7777-7777-777777777777', ARRAY['Certified Sports Nutritionist', 'Published Research Author', 'Olympic Team Consultant'], ARRAY['Certified Sports Nutritionist', 'Masters in Sports Science', 'ACSM Certification'], 8, 'expert', NULL, '{"followers": 2100, "following": 95, "posts": 145}'::jsonb),
('88888888-8888-8888-8888-888888888888', ARRAY['Licensed Physiotherapist', 'Sports Injury Specialist', '500+ Athletes Treated'], ARRAY['Licensed Physiotherapist', 'Sports Medicine Certification', 'Manual Therapy Specialist'], 12, 'expert', NULL, '{"followers": 1800, "following": 120, "posts": 98}'::jsonb)
ON CONFLICT (user_id) DO NOTHING;

-- Insert follow relationships
INSERT INTO follows (follower_id, following_id, status) VALUES
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'active'),
('11111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'active'),
('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'active'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'active'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'active'),
('44444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'active'),
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'active'),
('22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'active'),
('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 'active'),
('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', 'active'),
('88888888-8888-8888-8888-888888888888', '11111111-1111-1111-1111-111111111111', 'active')
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- Insert sample posts
INSERT INTO posts (id, author_id, content, media_urls, media_types, visibility) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Just finished an amazing training session! Working on improving my game every day. 💪', ARRAY['https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg', 'https://images.pexels.com/photos/3076514/pexels-photo-3076514.jpeg'], ARRAY['image', 'image'], 'public'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Big win today! Thanks to all our supporters who came out to cheer us on! 🏆', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'public'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Another successful training camp completed! Proud of everyone''s progress. 🎾', ARRAY['https://images.pexels.com/photos/8224691/pexels-photo-8224691.jpeg'], ARRAY['image'], 'public'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 'Training hard for the upcoming season! ⚽ The dedication is paying off.', ARRAY['https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg'], ARRAY['image'], 'public'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '77777777-7777-7777-7777-777777777777', 'Proper nutrition is key to peak performance! Here are my top 5 pre-workout meal tips for athletes. 🥗', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'public'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '88888888-8888-8888-8888-888888888888', 'Recovery is just as important as training! Remember to listen to your body and take rest days when needed. 💪', ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'public')
ON CONFLICT (id) DO NOTHING;

-- Insert sample post interactions
INSERT INTO post_interactions (post_id, user_id, interaction_type) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'like'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'like'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'like'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'like'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 'like'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'like'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'like'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'like'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'like'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '33333333-3333-3333-3333-333333333333', 'like'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 'like')
ON CONFLICT (post_id, user_id, interaction_type) DO NOTHING;

-- Insert sample comments
INSERT INTO comments (id, post_id, author_id, content) VALUES
('11111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333', 'Great work! Keep pushing yourself!'),
('22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '44444444-4444-4444-4444-444444444444', 'Inspiring dedication! 🔥'),
('33333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Congratulations on the victory!'),
('44444444-cccc-cccc-cccc-cccccccccccc', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Your coaching methods are amazing!'),
('55555555-eeee-eeee-eeee-eeeeeeeeeeee', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Thanks for the nutrition tips!')
ON CONFLICT (id) DO NOTHING;

-- Insert sample conversations
INSERT INTO conversations (id, type, created_by) VALUES
('aaaaaaaa-1111-1111-1111-111111111111', 'direct', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-2222-2222-2222-222222222222', 'direct', '11111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Insert conversation participants
INSERT INTO conversation_participants (conversation_id, user_id, role) VALUES
('aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'member'),
('aaaaaaaa-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'member'),
('bbbbbbbb-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'member'),
('bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'member')
ON CONFLICT (conversation_id, user_id) DO NOTHING;

-- Insert sample messages
INSERT INTO messages (id, conversation_id, sender_id, content) VALUES
('msg11111-1111-1111-1111-111111111111', 'aaaaaaaa-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Hey, how was the game?'),
('msg22222-2222-2222-2222-222222222222', 'aaaaaaaa-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'It was amazing! We won 3-1. The team played really well together.'),
('msg33333-3333-3333-3333-333333333333', 'aaaaaaaa-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'That''s awesome! I saw the highlights. Your goal in the second half was incredible!'),
('msg44444-4444-4444-4444-444444444444', 'bbbbbbbb-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Training session tomorrow at 6 AM. Don''t be late!')
ON CONFLICT (id) DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (recipient_id, sender_id, type, title, content, data) VALUES
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'like', 'New Like', 'liked your recent post', '{"post_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}'::jsonb),
('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'comment', 'New Comment', 'commented on your post', '{"post_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "comment_id": "22222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa"}'::jsonb),
('11111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'follow', 'New Follower', 'started following you', '{}'::jsonb),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'message', 'New Message', 'sent you a message', '{"conversation_id": "aaaaaaaa-1111-1111-1111-111111111111"}'::jsonb)
ON CONFLICT DO NOTHING;