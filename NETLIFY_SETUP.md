# Netlify Deployment Guide

## ✅ What Was Fixed

### Problem:
Your Next.js app was showing "Page not found" errors on Netlify because:
1. You had a `_redirects` file (for static sites) but you're using Next.js
2. Netlify wasn't configured to handle Next.js properly
3. Missing the Netlify Next.js plugin

### Solution:
Created `netlify.toml` in the root directory with proper Next.js configuration.

## 📋 Netlify Settings

### In Netlify Dashboard:

1. **Base directory**: `frontend`
2. **Build command**: `npm install && npm run build`
3. **Publish directory**: `.next`

### Environment Variables:
Add these in Netlify → Site settings → Environment variables:

```
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api/v1
```

Replace `your-backend-url.onrender.com` with your actual Render backend URL.

## 🔧 What the netlify.toml Does

```toml
[build]
  base = "frontend"           # Build from the frontend directory
  publish = ".next"           # Publish the Next.js build output
  command = "npm install && npm run build"

[[plugins]]
  package = "@netlify/plugin-nextjs"  # Essential for Next.js on Netlify

[build.environment]
  NODE_VERSION = "20"         # Use Node 20
```

## 🚀 Deployment Steps

1. **Push the `netlify.toml` file** to your repository
2. **Connect your repo** to Netlify (if not already)
3. **Set environment variables** in Netlify dashboard
4. **Trigger a new deployment**

## 🔍 Verify Deployment

After deployment, visit your Netlify URL. The homepage should load correctly with:
- Your district cards
- Navigation working
- District detail pages accessible via routes like `/district/1201`

## ⚠️ Important Notes

- **Removed**: `frontend/public/_redirects` (not needed for Next.js)
- **Added**: `netlify.toml` in root directory
- The `@netlify/plugin-nextjs` plugin is automatically installed during build
- Make sure your backend URL is correct in environment variables

## 🐛 Troubleshooting

If you still see 404s:
1. Check the environment variable `NEXT_PUBLIC_API_URL` is set
2. Verify the build logs in Netlify deploy logs
3. Ensure your repo is connected properly
4. Check that you're deploying from the correct branch

## 📝 Files Changed

- ✅ Created: `netlify.toml` (root)
- ❌ Deleted: `frontend/public/_redirects`

