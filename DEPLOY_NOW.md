# 🚀 Deploy REA Agentic AI to GitHub Pages

## Quick Deployment (3 Steps)

### Step 1: Push Your Code to GitHub

```bash
# Add all changes
git add .

# Commit
git commit -m "Deploy to GitHub Pages"

# Push to main branch
git push origin main
```

### Step 2: Enable GitHub Pages

1. Go to your repository: **https://github.com/Srinivasa-ks/Rea-Agenti-AI**
2. Click on **Settings** (gear icon ⚙️)
3. In the left sidebar, click **Pages**
4. Under "Build and deployment":
   - **Source**: Select **GitHub Actions**
5. That's it! The workflow will automatically deploy

### Step 3: Wait for Deployment

- The GitHub Actions workflow will run automatically
- Takes about 1-2 minutes
- Your site will be live at: **https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## Verify Deployment

Check the deployment status:
- Go to: **https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions**
- You should see "Deploy to GitHub Pages" workflow running
- Wait for it to show ✅ success

---

## Troubleshooting

### If you see 404 error:
- Make sure you selected **GitHub Actions** as the source (not "Deploy from a branch")
- Wait 2-3 minutes after the workflow completes
- Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)

### If assets don't load:
- The `vite.config.js` has been updated with `base: '/Rea-Agenti-AI/'`
- Push the latest changes to GitHub
- The workflow will rebuild with the correct paths

---

## What's Been Fixed

✅ Updated `vite.config.js` with correct base path for GitHub Pages  
✅ GitHub Actions workflow is configured and ready  
✅ Build is successful and tested  

---

## Your Live Site

Once deployed, your app will be available at:

**🌐 https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## Next Steps

After deployment:
1. Test all features (Welcome, Ask, Investigation, Sandbox, etc.)
2. Try the dark/light theme toggle
3. Test the sandbox environment
4. Share your site with others!

---

**Need help?** Check the Actions tab for deployment logs:  
https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
