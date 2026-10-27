@echo off
chcp 65001 >nul
setlocal

echo ╔════════════════════════════════════════════════════════════╗
echo ║   REA Agentic AI - Windows 应用构建工具                   ║
echo ╚════════════════════════════════════════════════════════════╝
echo.

REM 检查 Node.js
echo [1/5] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js
    echo 请安装 Node.js 18 或更高版本: https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js 已安装

REM 检查依赖
echo.
echo [2/5] 检查依赖...
if not exist "node_modules" (
    echo 正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
)
echo [OK] 依赖已安装

REM 检查图标
echo.
echo [3/5] 检查图标文件...
if not exist "public\icon.png" (
    echo 正在创建占位图标...
    node scripts/create-placeholder-icon.js
    if %errorlevel% neq 0 (
        echo [警告] 图标创建失败，继续构建...
    ) else (
        echo [OK] 占位图标已创建
    )
) else (
    echo [OK] 图标文件已存在
)

REM 构建应用
echo.
echo [4/5] 构建 Windows 应用...
echo 这可能需要 5-10 分钟...
echo.
call npm run electron:build:win

if %errorlevel% neq 0 (
    echo.
    echo [错误] 构建失败
    echo 请检查错误信息并重试
    pause
    exit /b 1
)

echo.
echo [5/5] 构建完成！
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║  ✅ 构建成功！                                             ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo 构建产物位于 release\ 目录：
echo.
if exist "release\REA Agentic AI-Setup-1.0.0.exe" (
    echo   • REA Agentic AI-Setup-1.0.0.exe  (安装程序)
)
if exist "release\REA Agentic AI-1.0.0.exe" (
    echo   • REA Agentic AI-1.0.0.exe        (便携版本)
)
echo.
echo 你可以：
echo   1. 双击安装程序进行安装
echo   2. 直接运行便携版本（无需安装）
echo   3. 将文件分发给其他用户
echo.
echo ════════════════════════════════════════════════════════════
echo.

REM 打开 release 目录
explorer release

pause
