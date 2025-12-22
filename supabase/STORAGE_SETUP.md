# Storage Setup Instructions

## Bucket Configuration

1. Go to your Supabase Dashboard
2. Navigate to **Storage** section
3. Click **Create bucket**
4. Configure the bucket with these settings:
   - **Name**: `media-uploads`
   - **Public bucket**: ✅ Yes (checked)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**: `image/*,video/*`

## Storage Policies

After creating the bucket, run the SQL in `storage_policies.sql` in the Supabase SQL Editor to set up the access policies.

The policies allow:
- **Public read**: Anyone can view/download files
- **Public write**: Anyone can upload files
- **Public update**: Anyone can update files (optional, for replacing uploads)
- **Admin delete**: Only service role can delete files (handled via service role key)

## Notes

- Files are stored with public URLs that can be directly accessed
- File paths should follow a pattern like: `{uuid}/{filename}`
- Consider implementing file cleanup for deleted media items (server-side cleanup job)

