# Deployment Guide - GitHub Pages

This guide walks you through deploying REA Agentic AI to GitHub Pages.

## 🌐 Live Preview URL

Once deployed, your app will be available at:

**https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## 📋 Prerequisites

1. A GitHub account
2. Git installed on your machine
3. Node.js 20+ installed
4. The repository created at: https://github.com/Srinivasa-ks/Rea-Agenti-AI

---

## 🚀 Step-by-Step Deployment

### Step 1: Initialize Git Repository

```bash
# Navigate to your project folder
cd path/to/Rea-Agenti-AI

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: REA Agentic AI platform"
```

### Step 2: Connect to GitHub

```bash
# Add the remote repository
git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository: https://github.com/Srinivasa-ks/Rea-Agenti-AI
2. Click **Settings** (gear icon)
3. In the left sidebar, click **Pages**
4. Under **Build and deployment**:
   - **Source**: Select **GitHub Actions**
5. The workflow will automatically build and deploy on every push to `main`

### Step 4: Verify Deployment

1. Go to the **Actions** tab in your repository
2. You should see the "Deploy to GitHub Pages" workflow running
3. Wait for it to complete (usually 1-2 minutes)
4. Visit: **https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## 🔄 Automatic Updates

Every time you push to the `main` branch, GitHub Actions will:

1. Check out your code
2. Install dependencies
3. Build the production version
4. Deploy to GitHub Pages

No manual steps needed!

---

## 🛠️ Manual Deployment (Alternative)

If you prefer to deploy manually without GitHub Actions:

```bash
# Build the project
npm run build

# The dist/ folder contains your production-ready app
# You can upload it to any static hosting service
```

### Alternative Hosting Options

| Service | URL | Notes |
|---------|-----|-------|
| **GitHub Pages** | `https://srinivasa-ks.github.io/Rea-Agenti-AI/` | Free, automatic |
| **Vercel** | `https://rea-agenti-ai.vercel.app` | Free tier available |
| **Netlify** | `https://rea-agenti-ai.netlify.app` | Free tier available |
| **Cloudflare Pages** | `https://rea-agenti-ai.pages.dev` | Free tier available |

---

## 🔧 Troubleshooting

### Page shows 404

- Make sure GitHub Pages is enabled in Settings → Pages
- Check that the workflow completed successfully in the Actions tab
- Verify the base path in `vite.config.js` matches your repo name

### Assets not loading

- Clear your browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- Check browser console for 404 errors
- Verify the build output in the Actions tab

### Workflow fails

- Check the Actions tab for error details
- Ensure `package.json` has all required dependencies
- Verify Node.js version compatibility

---

## 📊 Deployment Status

Check deployment status anytime:

- **Build Status**: https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
- **Live Site**: https://srinivasa-ks.github.io/Rea-Agenti-AI/
- **Deployments**: Repository Settings → Pages → Deployments

---

## 🎯 Custom Domain (Optional)

To use a custom domain:

1. In repository Settings → Pages, enter your custom domain
2. Add a `CNAME` file in the `public/` folder with your domain
3. Configure DNS records with your domain provider
4. Enable HTTPS in the Pages settings

---

## 📝 Notes

- The app is configured with `base: '/Rea-Agenti-AI/'` for GitHub Pages
- All assets are bundled and optimized for production
- The app works fully offline after initial load
- No server-side processing required - pure static site

---

**Need help?** Open an issue at: https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues
