# 🔧 Vercel Deployment Troubleshooting Guide

## 🔴 Current Issue
Build succeeds but deployment fails with: "An unexpected error happened when running this build"

### Build Log Analysis:
```
✅ Build Success: 53 seconds
✅ Compiled successfully
✅ Generated static pages (5/5)
✅ Created serverless functions
❌ Failed at: Deploying outputs... (34s timeout)
```

## 🚀 Solution 1: Deploy via Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy directly
cd add-ons/cidadao-dashboard
vercel --prod

# If it asks for scope/project, answer:
# - Scope: Your account
# - Link to existing? No (create new)
# - Project name: cidadao-dashboard
# - Directory: ./
```

## 🌐 Solution 2: Alternative Hosting Platforms

### Option A: Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=.next

# Or drag-and-drop the .next folder to netlify.com
```

### Option B: Deploy to Render
1. Create account at render.com
2. New > Static Site
3. Connect GitHub: anderson-ufrj/cidadao.ai-dashboard
4. Build Command: `npm run build && npm run export`
5. Publish Directory: `out`

### Option C: Deploy to Railway (Like your backend)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## 📦 Solution 3: Static Export for Any Host

First, configure Next.js for static export:

```javascript
// next.config.js
module.exports = {
  output: 'export',
  images: {
    unoptimized: true
  }
}
```

Then build and deploy anywhere:
```bash
npm run build
# Creates 'out' folder with static files

# Deploy to any static host:
# - GitHub Pages
# - Surge.sh
# - AWS S3
# - Any web server
```

## 🔍 Solution 4: Debug Vercel Deployment

### Check Vercel Status
```bash
# Check if Vercel has issues
curl https://www.vercel-status.com/api/v2/status.json
```

### Try Different Regions
```json
// vercel.json
{
  "regions": ["sfo1"],  // Try different regions
  "framework": "nextjs"
}
```

### Reduce Bundle Size
```bash
# Check what's making it large
npm run build
npm run analyze  # If you have bundle analyzer

# The current 335KB is reasonable, but can be optimized
```

## 🎯 Solution 5: Quick Deploy to Surge.sh

Fastest option for testing:
```bash
# Install and deploy in 30 seconds
npm i -g surge

# Build for static hosting
npm run build
npx next export  # Creates 'out' directory

# Deploy
surge out/ cidadao-dashboard.surge.sh
```

## 📝 Solution 6: Contact Vercel Support

Since the build succeeds, this is likely a Vercel infrastructure issue:

1. Go to: https://vercel.com/help
2. Click "Contact Support"
3. Provide:
   - Project: cidadao-dashboard
   - Error: "Deploying outputs" timeout after successful build
   - Build ID from your deployment logs

## ⚡ Solution 7: GitHub Pages (Free & Reliable)

```bash
# Add GitHub Pages action
mkdir -p .github/workflows
```

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm install
      - run: npm run build
      - run: npx next export

      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

Then enable GitHub Pages in repository settings.

## 🆘 Current Recommendation

Since Vercel is having deployment issues (not code issues):

1. **Immediate**: Use Vercel CLI (`vercel --prod`)
2. **If CLI fails**: Deploy to Netlify (drag & drop)
3. **For production**: Consider Railway (same as your backend)

The code is working perfectly - this is a Vercel infrastructure problem!