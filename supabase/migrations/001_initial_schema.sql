-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Media Items Table
CREATE TABLE media_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    storage_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video')),
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploader_ip INET,
    uploader_name TEXT,
    caption TEXT,
    is_approved BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments Table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    commenter_name TEXT,
    commenter_ip INET,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin Users Table
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_media_items_created_at ON media_items(created_at DESC);
CREATE INDEX idx_media_items_is_deleted ON media_items(is_deleted);
CREATE INDEX idx_media_items_is_approved ON media_items(is_approved);
CREATE INDEX idx_media_items_approved_not_deleted ON media_items(is_approved, is_deleted) WHERE is_approved = true AND is_deleted = false;

CREATE INDEX idx_comments_media_id ON comments(media_id);
CREATE INDEX idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX idx_comments_is_deleted ON comments(is_deleted);
CREATE INDEX idx_comments_is_approved ON comments(is_approved);
CREATE INDEX idx_comments_media_approved_not_deleted ON comments(media_id, is_approved, is_deleted) WHERE is_approved = true AND is_deleted = false;

CREATE INDEX idx_admin_users_username ON admin_users(username);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to update updated_at
CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON media_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for media_items
-- Public read: Anyone can read approved, non-deleted items
CREATE POLICY "Public can read approved media"
    ON media_items FOR SELECT
    USING (is_approved = true AND is_deleted = false);

-- Public insert: Anyone can upload (insert)
CREATE POLICY "Public can insert media"
    ON media_items FOR INSERT
    WITH CHECK (true);

-- Admin-only update: Only service role can update
-- (This will be handled server-side, but we disable public updates)
CREATE POLICY "No public updates on media"
    ON media_items FOR UPDATE
    USING (false)
    WITH CHECK (false);

-- Admin-only delete: Only service role can delete (soft delete via is_deleted)
CREATE POLICY "No public deletes on media"
    ON media_items FOR DELETE
    USING (false);

-- RLS Policies for comments
-- Public read: Anyone can read approved comments on approved media
CREATE POLICY "Public can read approved comments"
    ON comments FOR SELECT
    USING (
        is_approved = true 
        AND is_deleted = false
        AND EXISTS (
            SELECT 1 FROM media_items 
            WHERE media_items.id = comments.media_id 
            AND media_items.is_approved = true 
            AND media_items.is_deleted = false
        )
    );

-- Public insert: Anyone can comment
CREATE POLICY "Public can insert comments"
    ON comments FOR INSERT
    WITH CHECK (true);

-- Admin-only update
CREATE POLICY "No public updates on comments"
    ON comments FOR UPDATE
    USING (false)
    WITH CHECK (false);

-- Admin-only delete
CREATE POLICY "No public deletes on comments"
    ON comments FOR DELETE
    USING (false);

-- RLS Policies for admin_users
-- No public access to admin users table
CREATE POLICY "No public access to admin users"
    ON admin_users FOR ALL
    USING (false)
    WITH CHECK (false);

