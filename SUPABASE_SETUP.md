# Step-by-Step Supabase Setup Guide

This guide will walk you through setting up your Supabase project from scratch.

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign in"** if you already have an account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: Choose a name (e.g., "captured-moments")
   - **Database Password**: Create a strong password (save this - you'll need it for database access)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Select Free tier (or paid if you prefer)
5. Click **"Create new project"**
6. Wait 2-3 minutes for your project to be provisioned

## Step 2: Find Your API Keys

Once your project is ready:

1. In your Supabase Dashboard, click on the **Settings** icon (gear icon) in the left sidebar
2. Click on **"API"** in the settings menu
3. You'll see a page with your project credentials. Look for:

   **Project URL**
   - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy this value

   **anon public** key
   - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - It's a long string starting with `eyJ...`
   - Click the **"Reveal"** button if it's hidden
   - Copy this value

   **service_role** key
   - This is your `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **IMPORTANT**: This key has admin privileges - keep it secret!
   - Click the **"Reveal"** button if it's hidden
   - Copy this value

4. Create a `.env.local` file in your project root and add:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Replace the values with your actual keys from Supabase.

## Step 3: Set Up the Database

1. In your Supabase Dashboard, click on **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/migrations/001_initial_schema.sql` from your project
4. Copy the entire contents of that file
5. Paste it into the SQL Editor in Supabase
6. Click **"Run"** (or press `Ctrl+Enter` / `Cmd+Enter`)
7. You should see a success message: "Success. No rows returned"

This creates:
- `media_items` table (for photos/videos)
- `comments` table (for comments on media)
- `admin_users` table (for admin authentication)
- All necessary indexes and security policies

## Step 4: Set Up Storage Bucket

1. In your Supabase Dashboard, click on **"Storage"** in the left sidebar
2. Click **"Create bucket"** button
3. Configure the bucket:
   - **Name**: `media-uploads` (must be exactly this)
   - **Public bucket**: ✅ **Check this box** (very important!)
   - **File size limit**: `52428800` (this is 50MB in bytes)
   - **Allowed MIME types**: `image/*,video/*`
4. Click **"Create bucket"**

## Step 5: Set Up Storage Policies

1. Go back to **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Open the file `supabase/storage_policies.sql` from your project
4. Copy the entire contents of that file
5. Paste it into the SQL Editor in Supabase
6. Click **"Run"**
7. You should see a success message

This sets up permissions so:
- Anyone can read files (public access)
- Anyone can upload files
- Only admins (via service role) can delete files

## Step 6: Create an Admin User

You need to create an admin user with a hashed password. Here are two methods:

### Method 1: Using Node.js Script (Recommended)

1. Make sure you have your `.env.local` file set up with the keys from Step 2
2. Create a temporary script file `create-admin.js` in your project root:

```javascript
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  
  console.log(`Creating admin user: ${username}`);
  
  const passwordHash = await bcrypt.hash(password, 10);
  
  const { data, error } = await supabase
    .from('admin_users')
    .insert([
      {
        username: username,
        password_hash: passwordHash
      }
    ])
    .select();
  
  if (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
  
  console.log('✅ Admin user created successfully!');
  console.log('Username:', username);
  console.log('Password:', password);
  console.log('ID:', data[0].id);
}

createAdmin();
```

3. Install dotenv if needed: `npm install dotenv`
4. Run the script:
   ```bash
   node create-admin.js admin mypassword123
   ```
   (Replace `admin` and `mypassword123` with your desired username and password)

5. Delete the script file after use for security:
   ```bash
   rm create-admin.js
   ```

### Method 2: Using Supabase SQL Editor

1. First, you need to hash your password. You can use an online bcrypt generator or run this in Node.js:

```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('your_password_here', 10).then(hash => console.log(hash));
```

2. Go to **"SQL Editor"** in Supabase Dashboard
3. Run this SQL (replace the values):

```sql
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2a$10$YOUR_HASHED_PASSWORD_HERE');
```

Replace `'admin'` with your desired username and `'$2a$10$YOUR_HASHED_PASSWORD_HERE'` with the hash from step 1.

## Step 7: Verify Your Setup

1. Make sure your `.env.local` file is in the project root with all three keys
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000)
5. Try uploading a photo/video
6. Go to [http://localhost:3000/admin/login](http://localhost:3000/admin/login) and log in with your admin credentials

## Troubleshooting

### Can't find the API keys?
- Make sure you're in the **Settings** → **API** section
- The keys might be hidden - look for a **"Reveal"** or **"Show"** button
- Make sure you're logged into the correct Supabase project

### Getting "Missing Supabase environment variables" error?
- Make sure `.env.local` is in the project root (same level as `package.json`)
- Make sure the file is named exactly `.env.local` (not `.env` or `.env.local.txt`)
- Restart your dev server after creating/updating `.env.local`
- Check that all three variables are set (no empty values)

### Storage uploads not working?
- Make sure the bucket is named exactly `media-uploads`
- Make sure the bucket is set to **Public**
- Make sure you ran the storage policies SQL

### Can't log in as admin?
- Make sure you created the admin user correctly
- Check that the password hash was generated correctly
- Try creating a new admin user with a different username

## Next Steps

Once everything is set up:
- Your app should be running at `http://localhost:3000`
- Public users can upload at `/upload`
- Admins can log in at `/admin/login`
- The feed is at the home page `/`

