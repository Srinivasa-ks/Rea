#!/bin/bash

# REA Agentic AI - 完整部署检查和部署脚本
# 此脚本会验证所有文件并帮助部署到 GitHub Pages

echo "╔════════════════════════════════════════════════════════════╗"
echo "║   REA Agentic AI - 部署检查和部署工具                     ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
PASS=0
FAIL=0

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 (缺失)"
        ((FAIL++))
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 包含 '$2'"
        ((PASS++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 缺少 '$2'"
        ((FAIL++))
        return 1
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 第 1 步：检查核心文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "package.json"
check_file "vite.config.js"
check_file "tsconfig.json"
check_file "index.html"
check_file ".gitignore"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 第 2 步：检查源代码文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file "src/main.tsx"
check_file "src/App.tsx"
check_file "src/SandboxEnvironment.tsx"
check_file "src/index.css"
check_file "src/types/index.ts"
check_file "src/data/mockData.ts"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 第 3 步：检查 GitHub 部署文件"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_file ".github/workflows/deploy.yml"
check_file "README.md"
check_file "LICENSE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 第 4 步：验证关键配置"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_content "vite.config.js" "base: './'"
check_content ".github/workflows/deploy.yml" "Deploy to GitHub Pages"
check_content ".github/workflows/deploy.yml" "actions/checkout@v4"
check_content ".github/workflows/deploy.yml" "npm run build"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔨 第 5 步：构建测试"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "正在构建项目..."
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} 构建成功"
    ((PASS++))
    
    # 检查构建输出
    if [ -f "dist/index.html" ]; then
        echo -e "${GREEN}✓${NC} dist/index.html 已生成"
        ((PASS++))
        
        # 检查资源路径
        if grep -q "./assets/" dist/index.html; then
            echo -e "${GREEN}✓${NC} 资源路径正确（相对路径）"
            ((PASS++))
        else
            echo -e "${RED}✗${NC} 资源路径错误"
            ((FAIL++))
        fi
    else
        echo -e "${RED}✗${NC} dist/index.html 未生成"
        ((FAIL++))
    fi
else
    echo -e "${RED}✗${NC} 构建失败"
    ((FAIL++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 验证结果"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -e "${GREEN}通过: $PASS${NC}"
echo -e "${RED}失败: $FAIL${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ 所有检查通过！项目已准备好部署                         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # 检查 Git 状态
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔗 第 6 步：Git 状态检查"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [ -d .git ]; then
        echo -e "${GREEN}✓${NC} Git 仓库已初始化"
        
        # 检查远程仓库
        if git remote get-url origin > /dev/null 2>&1; then
            REMOTE_URL=$(git remote get-url origin)
            echo -e "${GREEN}✓${NC} 远程仓库: $REMOTE_URL"
            
            # 检查是否有未提交的更改
            if [ -n "$(git status --porcelain)" ]; then
                echo -e "${YELLOW}⚠${NC} 有未提交的更改"
                echo ""
                read -p "是否提交所有更改？(y/n) " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    git add .
                    git commit -m "Deploy: REA Agentic AI application"
                    echo -e "${GREEN}✓${NC} 更改已提交"
                fi
            else
                echo -e "${GREEN}✓${NC} 工作目录干净"
            fi
            
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "🚀 第 7 步：推送到 GitHub"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            
            read -p "是否推送到 GitHub？(y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git branch -M main 2>/dev/null
                if git push -u origin main; then
                    echo -e "${GREEN}✓${NC} 代码已推送"
                    echo ""
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "⚙️  第 8 步：启用 GitHub Pages"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo ""
                    echo "请完成以下步骤："
                    echo ""
                    echo "1. 打开: https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages"
                    echo ""
                    echo "2. 在 'Build and deployment' 部分："
                    echo "   Source: 选择 'GitHub Actions'"
                    echo ""
                    echo "3. 等待 1-2 分钟"
                    echo ""
                    echo "4. 访问: https://srinivasa-ks.github.io/Rea-Agenti-AI/"
                    echo ""
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "📊 监控部署"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo ""
                    echo "查看部署进度: https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions"
                    echo ""
                else
                    echo -e "${RED}✗${NC} 推送失败"
                fi
            fi
        else
            echo -e "${YELLOW}⚠${NC} 未配置远程仓库"
            echo ""
            echo "请运行以下命令添加远程仓库："
            echo "git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git"
            echo "git branch -M main"
            echo "git push -u origin main"
        fi
    else
        echo -e "${YELLOW}⚠${NC} Git 仓库未初始化"
        echo ""
        echo "请运行以下命令初始化："
        echo "git init"
        echo "git add ."
        echo "git commit -m \"Initial commit: REA Agentic AI\""
        echo "git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git"
        echo "git branch -M main"
        echo "git push -u origin main"
    fi
else
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ❌ 检查失败！请修复上述问题后再部署                       ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "请查看 FILE_VERIFICATION.md 获取详细信息"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📚 相关文档"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "• QUICK_START.md      - 3 分钟快速部署"
echo "• DEPLOY_CN.md        - 完整部署指南"
echo "• GITHUB_GUIDE_CN.md  - 图文部署指南"
echo "• FILE_VERIFICATION.md - 文件验证报告"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
