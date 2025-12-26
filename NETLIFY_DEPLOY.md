# Deploying to Netlify

This guide will walk you through deploying your Captured Moments app to Netlify.

## Prerequisites

1. A Netlify account (sign up at [netlify.com](https://netlify.com))
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. Your Supabase project set up and running

## Step 1: Push Your Code to Git

If you haven't already, initialize a git repository and push to GitHub/GitLab/Bitbucket:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## Step 2: Install Netlify CLI (Optional)

You can deploy via the Netlify website or using the CLI:

```bash
npm install -g netlify-cli
```

## Step 3: Deploy via Netlify Dashboard

### Option A: Deploy via GitHub/GitLab/Bitbucket (Recommended)

1. Go to [app.netlify.com](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next` (Netlify will auto-detect this with the Next.js plugin)
6. Click **"Deploy site"**

### Option B: Deploy via Netlify CLI

```bash
# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

## Step 4: Configure Environment Variables

**IMPORTANT**: You must set your environment variables in Netlify:

1. Go to your site dashboard on Netlify
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

⚠️ **Security Note**: The `SUPABASE_SERVICE_ROLE_KEY` should be kept secret. Make sure it's only set in Netlify's environment variables and never committed to Git.

## Step 5: Redeploy

After setting environment variables:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
   - Or push a new commit to trigger automatic deployment

## Step 6: Verify Deployment

1. Visit your Netlify site URL (e.g., `https://your-site-name.netlify.app`)
2. Test the following:
   - Home page loads
   - Upload functionality works
   - Admin login works at `/admin/login`

## Troubleshooting

### Build Fails

- Check the build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify Node.js version (should be 20+)

### Environment Variables Not Working

- Make sure variables are set in Netlify dashboard (not just `.env.local`)
- Redeploy after adding/changing environment variables
- Check variable names match exactly (case-sensitive)

### Images Not Loading

- Verify Supabase storage bucket is public
- Check that `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- Ensure image remote patterns in `next.config.js` are correct

### Admin Login Not Working

- Verify `SUPABASE_SERVICE_ROLE_KEY` is set in Netlify
- Check that admin user exists in your Supabase database
- Review server logs in Netlify Functions dashboard

## Custom Domain (Optional)

1. Go to **Domain settings** in your Netlify dashboard
2. Click **"Add custom domain"**
3. Follow the instructions to configure DNS

## Continuous Deployment

Once connected to Git, Netlify will automatically deploy:
- Every push to your main branch
- Pull requests will get preview deployments

## Next.js on Netlify

This project uses the `@netlify/plugin-nextjs` plugin (configured in `netlify.toml`) which:
- Handles Next.js routing automatically
- Supports server-side rendering (SSR)
- Supports API routes
- Optimizes builds for Netlify's edge network

## Support

If you encounter issues:
1. Check Netlify build logs
2. Review Next.js documentation: https://nextjs.org/docs/deployment
3. Check Netlify Next.js plugin docs: https://github.com/netlify/netlify-plugin-nextjs

