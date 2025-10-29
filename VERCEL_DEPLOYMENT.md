# Vercel Deployment Guide

This guide will help you deploy your Food Delivery App to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **Supabase Project**: Ensure your Supabase project is set up and running

## Step 1: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

## Step 2: Prepare Your Environment Variables

1. Copy `.env.example` to `.env.local` (for local testing)
2. Fill in your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 3: Deploy via Vercel Dashboard

### Option A: GitHub Integration (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the framework settings
5. Configure environment variables:
   - Add `EXPO_PUBLIC_SUPABASE_URL`
   - Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Add `NODE_ENV` = `production`
6. Click "Deploy"

### Option B: Vercel CLI

1. Navigate to your project directory
2. Run: `vercel`
3. Follow the prompts
4. Set environment variables: `vercel env add`

## Step 4: Configure Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Navigate to "Settings" → "Environment Variables"
3. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `NODE_ENV` | `production` | Production |

## Step 5: Build Configuration

The project includes these files for Vercel deployment:

- **`vercel.json`**: Deployment configuration
- **`package.json`**: Updated with build scripts
- **`.vercelignore`**: Files to exclude from deployment

## Step 6: Custom Domain (Optional)

1. In your Vercel project dashboard
2. Go to "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Step 7: Verify Deployment

1. Visit your deployed URL
2. Test the authentication flow
3. Verify Supabase connection
4. Check all app functionality

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Ensure all required env vars are set in Vercel
3. **Supabase Connection**: Verify your Supabase URL and keys are correct
4. **Routing Issues**: The `vercel.json` handles SPA routing

### Build Commands:

- **Build**: `npm run build`
- **Local Preview**: `npm run web`
- **Deploy**: `npm run deploy` (if using CLI)

## Automatic Deployments

Once connected to GitHub:
- **Production**: Deploys automatically on pushes to `main` branch
- **Preview**: Deploys automatically on pull requests
- **Branch Deployments**: Each branch gets its own preview URL

## Performance Optimization

The deployment is optimized with:
- Static file caching
- Gzip compression
- CDN distribution
- Automatic HTTPS

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Expo Web Documentation](https://docs.expo.dev/workflow/web/)
- [Supabase Documentation](https://supabase.com/docs)

---

**Note**: Make sure your Supabase RLS policies are properly configured for production use.