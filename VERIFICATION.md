# ✅ 部署验证清单

## 📋 部署前检查

### 1. 文件完整性检查

运行以下命令验证所有必需文件是否存在：

```bash
# Windows (PowerShell)
Get-ChildItem -Recurse | Select-Object FullName

# Mac/Linux
find . -type f -not -path './node_modules/*' -not -path './.git/*' | sort
```

**必需文件清单：**

- [ ] `package.json` - 项目配置
- [ ] `vite.config.js` - Vite 配置（base: './'）
- [ ] `index.html` - HTML 入口
- [ ] `src/App.tsx` - 主应用组件
- [ ] `src/main.tsx` - React 入口
- [ ] `src/index.css` - 全局样式
- [ ] `src/SandboxEnvironment.tsx` - 沙盒环境组件
- [ ] `src/types/index.ts` - TypeScript 类型
- [ ] `src/data/mockData.ts` - 示例数据
- [ ] `.github/workflows/deploy.yml` - GitHub Actions 工作流
- [ ] `README.md` - 项目说明
- [ ] `LICENSE` - 许可证

### 2. 构建测试

```bash
# 清理并重新构建
rm -rf dist node_modules  # Windows: rmdir /s /q dist node_modules
npm install
npm run build
```

**检查构建输出：**

```bash
# 查看 dist 目录
ls dist/

# 应该包含：
# - index.html
# - assets/
#   - index-*.js
#   - index-*.css
```

### 3. 本地预览测试

```bash
npm run preview
```

打开浏览器访问显示的 URL（通常是 http://localhost:4173）

**验证项目：**

- [ ] 页面正常加载
- [ ] 所有 13 个界面可以访问
- [ ] 深色/浅色主题切换正常
- [ ] 沙盒环境可以启动
- [ ] 没有控制台错误

---

## 🚀 部署步骤

### 步骤 1：初始化 Git（如果还没有）

```bash
git init
git add .
git commit -m "Initial commit: REA Agentic AI"
```

### 步骤 2：连接到 GitHub

```bash
git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
git branch -M main
git push -u origin main
```

### 步骤 3：启用 GitHub Pages

1. 访问：https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages
2. **Source**: 选择 **GitHub Actions**
3. 点击 **Save**

### 步骤 4：等待部署

1. 访问：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
2. 等待 "Deploy to GitHub Pages" 工作流完成
3. 确认显示绿色勾 ✅

### 步骤 5：验证网站

访问：**https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## 🔍 故障排除

### 问题 1：404 错误

**症状**：访问网站显示 404

**解决**：
```bash
# 1. 检查 GitHub Pages 设置
# 访问：https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages
# 确保 Source 选择的是 "GitHub Actions"

# 2. 检查 Actions 工作流
# 访问：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
# 确保工作流成功完成

# 3. 等待 2-3 分钟
# GitHub Pages 需要时间生效
```

### 问题 2：页面空白

**症状**：页面加载但内容为空

**解决**：
```bash
# 1. 硬刷新浏览器
# Windows/Linux: Ctrl + Shift + R
# Mac: Cmd + Shift + R

# 2. 清除浏览器缓存
# Chrome: F12 → Application → Clear storage

# 3. 检查浏览器控制台
# F12 → Console 标签，查看错误信息

# 4. 验证 vite.config.js
# 确保 base: './'（相对路径）
```

### 问题 3：样式丢失

**症状**：页面显示但样式不正确

**解决**：
```bash
# 1. 检查 dist 目录
ls dist/assets/
# 应该包含 CSS 和 JS 文件

# 2. 检查 index.html
cat dist/index.html
# 确保资源路径是相对路径：./assets/...

# 3. 重新构建
npm run build
```

### 问题 4：工作流失败

**症状**：GitHub Actions 显示红色 ❌

**解决**：
```bash
# 1. 查看错误日志
# 访问：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
# 点击失败的工作流，查看详细错误

# 2. 本地测试构建
npm run build
# 如果本地失败，修复错误后重新推送

# 3. 检查依赖
npm install
npm run build
```

---

## 📊 部署状态检查

### 检查清单

- [ ] 代码已推送到 `main` 分支
- [ ] GitHub Pages 已启用（Source: GitHub Actions）
- [ ] Actions 工作流成功完成
- [ ] 网站可以访问：https://srinivasa-ks.github.io/Rea-Agenti-AI/
- [ ] 所有页面正常加载
- [ ] 样式和脚本正确
- [ ] 深色/浅色主题切换正常
- [ ] 沙盒环境可以启动

### 快速验证命令

```bash
# 检查 Git 状态
git status
git log --oneline -5

# 检查远程仓库
git remote -v

# 检查构建
npm run build
ls -la dist/

# 检查配置文件
cat vite.config.js | grep "base:"
```

---

## 🎯 成功标志

部署成功的标志：

✅ GitHub Actions 工作流显示绿色勾  
✅ 访问 https://srinivasa-ks.github.io/Rea-Agenti-AI/ 能看到完整应用  
✅ 所有 13 个界面都可以访问  
✅ 深色/浅色主题可以切换  
✅ 沙盒环境可以启动和运行  
✅ 没有控制台错误  

---

## 🆘 获取帮助

如果遇到问题：

1. **查看 Actions 日志**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
2. **查看部署指南**：`DEPLOY_CN.md` 或 `GITHUB_GUIDE_CN.md`
3. **提交 Issue**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues

---

## 📞 快速链接

- **仓库**：https://github.com/Srinivasa-ks/Rea-Agenti-AI
- **Settings**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings
- **Pages 设置**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages
- **Actions**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
- **网站**：https://srinivasa-ks.github.io/Rea-Agenti-AI/

---

**祝你部署成功！** 🚀
