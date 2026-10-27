# 🚀 部署到 GitHub Pages - 快速指南

## 🌐 你的网站链接

**https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## ⚡ 快速部署（3 步完成）

### 方法 1：使用部署脚本（推荐）

**Windows 用户：**
```bash
deploy.bat
```

**Mac/Linux 用户：**
```bash
chmod +x deploy.sh
./deploy.sh
```

### 方法 2：手动部署

```bash
# 1. 构建项目
npm run build

# 2. 提交代码
git add .
git commit -m "Deploy to GitHub Pages"

# 3. 推送到 GitHub
git push origin main
```

### 方法 3：如果你还没有 Git 仓库

```bash
# 初始化 Git
git init
git add .
git commit -m "Initial commit"

# 连接到你的 GitHub 仓库
git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
git branch -M main
git push -u origin main
```

---

## ⚙️ 启用 GitHub Pages（重要！）

推送代码后，你需要在 GitHub 上启用 Pages：

1. 打开：**https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages**

2. 在 **Build and deployment** 部分：
   - **Source**: 选择 **GitHub Actions**

3. 等待 1-2 分钟

4. 访问你的网站：**https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## 🔍 检查部署状态

- **查看构建进度**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
- **查看部署设置**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages
- **访问网站**：https://srinivasa-ks.github.io/Rea-Agenti-AI/

---

## ❓ 常见问题

### Q: 网站显示 404？
**A:** 
- 确保已在 GitHub Settings → Pages 中启用 GitHub Actions
- 检查 Actions 标签页，确认部署工作流已完成
- 等待 2-3 分钟让 GitHub Pages 生效

### Q: 页面空白或样式丢失？
**A:**
- 硬刷新浏览器：`Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
- 清除浏览器缓存
- 检查浏览器控制台是否有错误

### Q: 如何更新网站？
**A:**
```bash
# 修改代码后
npm run build
git add .
git commit -m "Update: 描述你的更改"
git push origin main
# GitHub Actions 会自动重新部署
```

### Q: 工作流失败？
**A:**
- 查看 Actions 标签页的错误日志
- 确保所有依赖都在 `package.json` 中
- 检查 Node.js 版本兼容性

---

## 📋 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 已启用（Source: GitHub Actions）
- [ ] Actions 工作流显示成功（绿色勾）
- [ ] 网站可以正常访问
- [ ] 所有页面和样式正常加载

---

## 🎯 部署后的功能

你的网站将包含所有 13 个界面：

✅ **Welcome** - 平台介绍  
✅ **Ask** - 提交调查问题  
✅ **Investigation** - 实时代理监控  
✅ **Results** - 证据支持的结果  
✅ **Sandbox** - 安全执行环境（6 个监控标签）  
✅ **History** - 调查历史记录  
✅ **Native** - Ghidra 风格二进制分析  
✅ **MCP** - AI 工具集成指南  
✅ **Architecture** - 系统设计文档  
✅ **Setup** - 系统健康检查  
✅ **Logs** - 事件日志查看器  
✅ **Settings** - 隐私和配置  
✅ **Approvals** - 审批收件箱  

加上：
- 🌓 深色/浅色主题切换
- 📱 响应式设计（支持所有设备）
- 🔒 完全离线运行

---

## 🆘 需要帮助？

- **GitHub Pages 文档**：https://docs.github.com/en/pages
- **GitHub Actions 文档**：https://docs.github.com/en/actions
- **提交问题**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues

---

## ✨ 完成！

部署成功后，你的 REA Agentic AI 平台将在以下地址可用：

**🌐 https://srinivasa-ks.github.io/Rea-Agenti-AI/**

每次推送到 `main` 分支都会自动重新部署！

---

**祝你部署顺利！** 🚀
