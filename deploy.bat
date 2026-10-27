@echo off
REM REA Agentic AI - GitHub Pages Deployment Script for Windows

echo.
echo ============================================
echo   REA Agentic AI - GitHub Pages Deployment
echo ============================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing Git repository...
    git init
    git add .
    git commit -m "Initial commit: REA Agentic AI platform"
    echo Git initialized
) else (
    echo Git already initialized
)

REM Build the project
echo.
echo Building project...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed. Please fix errors and try again.
    pause
    exit /b 1
)

echo Build successful

REM Push to GitHub
echo.
echo Pushing to GitHub...
git add .
git commit -m "Deploy: Update application"
git branch -M main
git push -u origin main

if %errorlevel% neq 0 (
    echo Push failed. Check your git configuration.
    pause
    exit /b 1
)

echo.
echo ============================================
echo   Deployment initiated!
echo ============================================
echo.
echo Next Steps:
echo 1. Go to: https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages
echo 2. Under 'Build and deployment', select 'GitHub Actions' as Source
echo 3. Wait 1-2 minutes for deployment
echo.
echo Your site will be live at:
echo    https://srinivasa-ks.github.io/Rea-Agenti-AI/
echo.
echo Monitor deployment at:
echo    https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
echo ============================================
echo.
pause
