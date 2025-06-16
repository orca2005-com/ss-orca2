/*
  # Create Notifications System

  1. New Tables
    - `notifications` - User notifications
    
  2. Security
    - Enable RLS on notifications table
    - Add policies for notification privacy
    
  3. Features
    - Real-time notifications
    - Multiple notification types
    - Read/unread status
    - Expiration support
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'message', 'mention', 'post_share', 'system')),
  title VARCHAR(255),
  content TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender ON notifications(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications table
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    recipient_id = auth.uid() AND
    (expires_at IS NULL OR expires_at > NOW())
  );

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE expires_at IS NOT NULL 
  AND expires_at < NOW();
END;
$$ language 'plpgsql';

-- Create function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_recipient_id UUID,
  p_sender_id UUID,
  p_type VARCHAR(50),
  p_title VARCHAR(255),
  p_content TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_expires_hours INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  expires_timestamp TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate expiration if provided
  IF p_expires_hours IS NOT NULL THEN
    expires_timestamp := NOW() + (p_expires_hours || ' hours')::INTERVAL;
  END IF;
  
  -- Insert notification
  INSERT INTO notifications (
    recipient_id,
    sender_id,
    type,
    title,
    content,
    data,
    expires_at
  ) VALUES (
    p_recipient_id,
    p_sender_id,
    p_type,
    p_title,
    p_content,
    p_data,
    expires_timestamp
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ language 'plpgsql' SECURITY DEFINER;