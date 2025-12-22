-- Storage bucket creation and policies
-- Run this in Supabase SQL Editor after creating the bucket in the dashboard

-- Note: First create the bucket 'media-uploads' in Supabase Dashboard:
-- 1. Go to Storage > Create bucket
-- 2. Name: media-uploads
-- 3. Public bucket: Yes
-- 4. File size limit: 52428800 (50MB)
-- 5. Allowed MIME types: image/*,video/*

-- Storage Policies for media-uploads bucket

-- Public read access: Anyone can read files
CREATE POLICY "Public can read media files"
ON storage.objects FOR SELECT
USING (bucket_id = 'media-uploads');

-- Public write access: Anyone can upload files
CREATE POLICY "Public can upload media files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media-uploads');

-- Public can update their own uploads (optional, for replacing files)
CREATE POLICY "Public can update own uploads"
ON storage.objects FOR UPDATE
USING (bucket_id = 'media-uploads')
WITH CHECK (bucket_id = 'media-uploads');

-- Admin delete access: Only service role can delete
-- Public cannot delete (this is handled by disabling DELETE for anon role)
-- Service role key has full access by default, so no policy needed for deletion

