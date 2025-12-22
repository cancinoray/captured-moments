# Captured Moments

A public Next.js app using Supabase where guests can upload photos and videos, view a shared feed, and comment without authentication.

## Features

- **Public Uploads**: Anyone can upload photos and videos without authentication
- **Shared Feed**: View all approved media in a beautiful grid layout
- **Comments**: Public commenting system with real-time updates
- **Admin Moderation**: Separate admin panel for managing media and comments
- **Mobile-First Design**: Fully responsive, optimized for mobile devices

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **TypeScript**: Full type safety

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)

2. Run the database migration:
   - Go to your Supabase Dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase/migrations/001_initial_schema.sql`

3. Set up Storage:
   - Go to Storage section in Supabase Dashboard
   - Create a bucket named `media-uploads`
   - Configure it as:
     - **Public bucket**: Yes
     - **File size limit**: 52428800 (50MB)
     - **Allowed MIME types**: `image/*,video/*`
   - Run the SQL from `supabase/storage_policies.sql` in the SQL Editor

4. Create an admin user:
   - You'll need to create an admin user in the `admin_users` table
   - Use the password hashing utility (see below) or create a script

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project settings under API.

### 4. Create Admin User

You can create an admin user using the Supabase SQL Editor:

```sql
-- Replace 'admin' and 'your_password_hash' with your desired username and bcrypt hash
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$...'); -- Use bcrypt to hash your password
```

Or create a simple script to hash and insert:

```typescript
import { hashPassword } from './lib/auth';
// Use this to hash passwords server-side
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
captured-moments/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (feed)
│   ├── upload/
│   │   └── page.tsx        # Upload page
│   └── admin/
│       ├── layout.tsx      # Admin layout (protected)
│       ├── login/
│       │   └── page.tsx    # Admin login
│       └── page.tsx        # Admin dashboard
├── components/
│   ├── Feed.tsx            # Main feed component
│   ├── MediaCard.tsx       # Individual media item
│   ├── CommentSection.tsx  # Comments display and form
│   ├── UploadForm.tsx      # File upload component
│   ├── AdminModeration.tsx # Admin moderation dashboard
│   ├── LoginForm.tsx       # Admin login form
│   └── LogoutButton.tsx    # Logout button
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser Supabase client
│   │   └── server.ts       # Server Supabase client
│   ├── actions/
│   │   ├── auth.ts         # Authentication actions
│   │   └── admin.ts        # Admin actions
│   ├── auth.ts             # Auth utilities
│   ├── utils.ts            # Helper functions
│   └── types/
│       └── database.ts     # TypeScript types
└── supabase/
    ├── migrations/
    │   └── 001_initial_schema.sql  # Database schema
    ├── storage_policies.sql        # Storage policies
    └── STORAGE_SETUP.md            # Storage setup guide
```

## Database Schema

### Tables

- **media_items**: Stores metadata for uploaded photos/videos
- **comments**: Stores comments on media items
- **admin_users**: Stores admin user credentials

See `supabase/migrations/001_initial_schema.sql` for complete schema.

## RLS Policies

- **Public Read**: Anyone can read approved, non-deleted items
- **Public Write**: Anyone can insert media and comments
- **Admin Only**: Only admins (via service role) can update/delete

## Storage

- Bucket: `media-uploads`
- Public read access
- Public write access (anyone can upload)
- Admin delete access (via service role)

## Admin Panel

Access the admin panel at `/admin/login`

- View all media items and comments
- Filter by status (all, approved, pending, deleted)
- Approve, delete, or restore items
- Bulk actions for multiple items

## License

MIT

