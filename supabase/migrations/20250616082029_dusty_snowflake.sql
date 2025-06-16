/*
  # Create Media Files System

  1. New Tables
    - `media_files` - File metadata and storage info
    
  2. Security
    - Enable RLS on media_files table
    - Add policies for file access
    
  3. Features
    - File upload tracking
    - Media processing status
    - File metadata storage
    - Thumbnail generation
*/

-- Create media files table
CREATE TABLE IF NOT EXISTS media_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255),
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  duration INTEGER,
  thumbnail_url TEXT,
  is_processed BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_media_files_uploader ON media_files(uploader_id);
CREATE INDEX IF NOT EXISTS idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_files_processed ON media_files(is_processed);

-- Enable Row Level Security
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Create policies for media_files table
CREATE POLICY "Users can view public media files"
  ON media_files
  FOR SELECT
  TO authenticated
  USING (
    uploader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = media_files.uploader_id 
      AND users.privacy_settings->>'profile_visibility' = 'public'
    )
  );

CREATE POLICY "Users can upload own media files"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can update own media files"
  ON media_files
  FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid())
  WITH CHECK (uploader_id = auth.uid());

CREATE POLICY "Users can delete own media files"
  ON media_files
  FOR DELETE
  TO authenticated
  USING (uploader_id = auth.uid());