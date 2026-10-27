#!/bin/bash

# REA Agentic AI - GitHub Pages Deployment Script
# This script helps you deploy the app to GitHub Pages

echo "🚀 REA Agentic AI - GitHub Pages Deployment"
echo "============================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: REA Agentic AI platform"
    echo "✅ Git initialized"
else
    echo "✅ Git already initialized"
fi

# Check if remote is set
if ! git remote get-url origin &> /dev/null; then
    echo ""
    echo "🔗 Connecting to GitHub repository..."
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/Srinivasa-ks/Rea-Agenti-AI.git"
    read -p "Repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ No repository URL provided. Exiting."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✅ Remote added: $repo_url"
else
    echo "✅ Remote already configured: $(git remote get-url origin)"
fi

# Build the project
echo ""
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors and try again."
    exit 1
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: Update application" || echo "No changes to commit"
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo "✅ Code pushed successfully"
else
    echo "❌ Push failed. Check your git configuration."
    exit 1
fi

echo ""
echo "============================================"
echo "✅ Deployment initiated!"
echo ""
echo "📋 Next Steps:"
echo "1. Go to: https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages"
echo "2. Under 'Build and deployment', select 'GitHub Actions' as Source"
echo "3. Wait 1-2 minutes for deployment"
echo ""
echo "🌐 Your site will be live at:"
echo "   https://srinivasa-ks.github.io/Rea-Agenti-AI/"
echo ""
echo "📊 Monitor deployment at:"
echo "   https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions"
echo "============================================"
