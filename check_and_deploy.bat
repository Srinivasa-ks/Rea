@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ╔════════════════════════════════════════════════════════════╗
echo ║   REA Agentic AI - 部署检查和部署工具                     ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

set PASS=0
set FAIL=0

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第 1 步：检查核心文件
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if exist "package.json" (
    echo [OK] package.json
    set /a PASS+=1
) else (
    echo [FAIL] package.json
    set /a FAIL+=1
)

if exist "vite.config.js" (
    echo [OK] vite.config.js
    set /a PASS+=1
) else (
    echo [FAIL] vite.config.js
    set /a FAIL+=1
)

if exist "tsconfig.json" (
    echo [OK] tsconfig.json
    set /a PASS+=1
) else (
    echo [FAIL] tsconfig.json
    set /a FAIL+=1
)

if exist "index.html" (
    echo [OK] index.html
    set /a PASS+=1
) else (
    echo [FAIL] index.html
    set /a FAIL+=1
)

if exist ".gitignore" (
    echo [OK] .gitignore
    set /a PASS+=1
) else (
    echo [FAIL] .gitignore
    set /a FAIL+=1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第 2 步：检查源代码文件
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if exist "src\main.tsx" (
    echo [OK] src\main.tsx
    set /a PASS+=1
) else (
    echo [FAIL] src\main.tsx
    set /a FAIL+=1
)

if exist "src\App.tsx" (
    echo [OK] src\App.tsx
    set /a PASS+=1
) else (
    echo [FAIL] src\App.tsx
    set /a FAIL+=1
)

if exist "src\SandboxEnvironment.tsx" (
    echo [OK] src\SandboxEnvironment.tsx
    set /a PASS+=1
) else (
    echo [FAIL] src\SandboxEnvironment.tsx
    set /a FAIL+=1
)

if exist "src\index.css" (
    echo [OK] src\index.css
    set /a PASS+=1
) else (
    echo [FAIL] src\index.css
    set /a FAIL+=1
)

if exist "src\types\index.ts" (
    echo [OK] src\types\index.ts
    set /a PASS+=1
) else (
    echo [FAIL] src\types\index.ts
    set /a FAIL+=1
)

if exist "src\data\mockData.ts" (
    echo [OK] src\data\mockData.ts
    set /a PASS+=1
) else (
    echo [FAIL] src\data\mockData.ts
    set /a FAIL+=1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第 3 步：检查 GitHub 部署文件
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if exist ".github\workflows\deploy.yml" (
    echo [OK] .github\workflows\deploy.yml
    set /a PASS+=1
) else (
    echo [FAIL] .github\workflows\deploy.yml
    set /a FAIL+=1
)

if exist "README.md" (
    echo [OK] README.md
    set /a PASS+=1
) else (
    echo [FAIL] README.md
    set /a FAIL+=1
)

if exist "LICENSE" (
    echo [OK] LICENSE
    set /a PASS+=1
) else (
    echo [FAIL] LICENSE
    set /a FAIL+=1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  第 4 步：构建测试
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo 正在构建项目...
call npm run build >nul 2>&1

if %errorlevel% equ 0 (
    echo [OK] 构建成功
    set /a PASS+=1
    
    if exist "dist\index.html" (
        echo [OK] dist\index.html 已生成
        set /a PASS+=1
    ) else (
        echo [FAIL] dist\index.html 未生成
        set /a FAIL+=1
    )
) else (
    echo [FAIL] 构建失败
    set /a FAIL+=1
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  验证结果
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

echo 通过: %PASS%
echo 失败: %FAIL%
echo.

if %FAIL% equ 0 (
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  [OK] 所有检查通过！项目已准备好部署                       ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    echo  Git 状态检查
    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    if exist .git (
        echo [OK] Git 仓库已初始化
        
        git remote get-url origin >nul 2>&1
        if !errorlevel! equ 0 (
            for /f "delims=" %%i in ('git remote get-url origin') do set REMOTE_URL=%%i
            echo [OK] 远程仓库: !REMOTE_URL!
            
            echo.
            echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            echo  推送到 GitHub
            echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            
            set /p PUSH_CONFIRM="是否推送到 GitHub？(y/n) "
            if /i "!PUSH_CONFIRM!"=="y" (
                git branch -M main 2>nul
                git add .
                git commit -m "Deploy: REA Agentic AI application" 2>nul
                git push -u origin main
                
                if !errorlevel! equ 0 (
                    echo.
                    echo [OK] 代码已推送
                    echo.
                    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    echo  启用 GitHub Pages
                    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    echo.
                    echo 请完成以下步骤：
                    echo.
                    echo 1. 打开: https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages
                    echo.
                    echo 2. 在 'Build and deployment' 部分：
                    echo    Source: 选择 'GitHub Actions'
                    echo.
                    echo 3. 等待 1-2 分钟
                    echo.
                    echo 4. 访问: https://srinivasa-ks.github.io/Rea-Agenti-AI/
                    echo.
                    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    echo  监控部署
                    echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    echo.
                    echo 查看部署进度: https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
                ) else (
                    echo [FAIL] 推送失败
                )
            )
        ) else (
            echo [WARN] 未配置远程仓库
            echo.
            echo 请运行以下命令添加远程仓库：
            echo git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
            echo git branch -M main
            echo git push -u origin main
        )
    ) else (
        echo [WARN] Git 仓库未初始化
        echo.
        echo 请运行以下命令初始化：
        echo git init
        echo git add .
        echo git commit -m "Initial commit: REA Agentic AI"
        echo git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
        echo git branch -M main
        echo git push -u origin main
    )
) else (
    echo ╔════════════════════════════════════════════════════════════╗
    echo ║  [FAIL] 检查失败！请修复上述问题后再部署                   ║
    echo ╚════════════════════════════════════════════════════════════╝
    echo.
    echo 请查看 FILE_VERIFICATION.md 获取详细信息
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo  相关文档
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo • QUICK_START.md      - 3 分钟快速部署
echo • DEPLOY_CN.md        - 完整部署指南
echo • GITHUB_GUIDE_CN.md  - 图文部署指南
echo • FILE_VERIFICATION.md - 文件验证报告
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

pause
