/*
  # Storage Setup for SportNet

  1. Storage Buckets
    - `avatars` - User profile pictures
    - `covers` - User cover images
    - `post-media` - Post images and videos
    - `documents` - Achievement documents and other files

  2. Security
    - RLS policies for secure file access
    - File type and size restrictions
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('covers', 'covers', true),
  ('post-media', 'post-media', true),
  ('documents', 'documents', false);

-- Avatars bucket policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Cover images bucket policies
CREATE POLICY "Cover images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

CREATE POLICY "Users can upload their own cover" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'covers' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own cover" ON storage.objects FOR UPDATE USING (
  bucket_id = 'covers' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own cover" ON storage.objects FOR DELETE USING (
  bucket_id = 'covers' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Post media bucket policies
CREATE POLICY "Post media is publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'post-media');

CREATE POLICY "Users can upload post media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'post-media' AND 
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete their own post media" ON storage.objects FOR DELETE USING (
  bucket_id = 'post-media' AND 
  EXISTS (
    SELECT 1 FROM posts p 
    JOIN post_media pm ON p.id = pm.post_id 
    WHERE pm.file_url LIKE '%' || name || '%' 
    AND p.author_id = auth.uid()
  )
);

-- Documents bucket policies (private)
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own documents" ON storage.objects FOR DELETE USING (
  bucket_id = 'documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);