# 🎯 GitHub Pages 部署图文指南

## 第一步：推送代码到 GitHub

### 如果你已经有 Git 仓库：

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### 如果你还没有 Git 仓库：

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
git branch -M main
git push -u origin main
```

---

## 第二步：启用 GitHub Pages（关键步骤！）

### 1. 打开仓库设置

访问：**https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings**

或者点击仓库页面的 **Settings** 标签（齿轮图标 ⚙️）

### 2. 进入 Pages 设置

在左侧菜单中找到并点击 **Pages**

或者直接访问：**https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages**

### 3. 配置 Build and deployment

在 **Build and deployment** 部分：

```
Source: [GitHub Actions ▼]
```

**重要**：选择 **GitHub Actions**，不是 "Deploy from a branch"

### 4. 保存设置

点击 **Save** 按钮

---

## 第三步：等待部署完成

### 查看部署进度

1. 访问：**https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions**
2. 你会看到 "Deploy to GitHub Pages" 工作流正在运行
3. 等待它完成（通常需要 1-2 分钟）
4. 看到绿色勾 ✅ 表示成功

### 部署成功的标志

- ✅ 工作流显示 "Deploy to GitHub Pages" - success
- ✅ 所有步骤都显示绿色勾
- ✅ 页面显示 "Your site is live at..."

---

## 第四步：访问你的网站

部署完成后，访问：

**🌐 https://srinivasa-ks.github.io/Rea-Agenti-AI/**

---

## 📸 设置截图说明

### GitHub Settings → Pages 页面应该这样配置：

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Pages                                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Build and deployment                                    │
│                                                          │
│  Source                                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  GitHub Actions                          ▼       │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ⚠️ 不要选择 "Deploy from a branch"                      │
│  ✅ 必须选择 "GitHub Actions"                            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ❌ 常见错误及解决方法

### 错误 1：网站显示 404

**原因**：GitHub Pages 未启用或配置错误

**解决**：
1. 确认已选择 "GitHub Actions" 作为 Source
2. 检查 Actions 工作流是否成功完成
3. 等待 2-3 分钟让 GitHub Pages 生效

### 错误 2：页面空白

**原因**：资源文件路径错误

**解决**：
1. 硬刷新浏览器（Ctrl+Shift+R 或 Cmd+Shift+R）
2. 清除浏览器缓存
3. 检查浏览器控制台错误信息

### 错误 3：工作流失败

**原因**：构建错误或配置问题

**解决**：
1. 查看 Actions 标签页的详细错误日志
2. 确保 `package.json` 包含所有依赖
3. 本地运行 `npm run build` 测试构建

---

## 🔄 更新网站

每次修改代码后：

```bash
# 1. 构建项目
npm run build

# 2. 提交更改
git add .
git commit -m "Update: 描述你的更改"

# 3. 推送
git push origin main
```

GitHub Actions 会自动重新部署！

---

## 📊 监控部署

### 查看部署状态

- **工作流运行**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
- **部署设置**：https://github.com/Srinivasa-ks/Rea-Agenti-AI/settings/pages
- **网站链接**：https://srinivasa-ks.github.io/Rea-Agenti-AI/

### 部署时间线

```
推送代码 → 触发工作流 → 安装依赖 → 构建项目 → 部署到 Pages → 网站上线
   ↓           ↓            ↓           ↓            ↓            ↓
  立即      ~10秒        ~30秒       ~20秒        ~10秒       完成！
```

总时间：约 1-2 分钟

---

## ✅ 部署成功检查清单

- [ ] 代码已推送到 GitHub 的 `main` 分支
- [ ] 在 Settings → Pages 中选择了 "GitHub Actions"
- [ ] Actions 工作流显示成功（绿色勾 ✅）
- [ ] 访问 https://srinivasa-ks.github.io/Rea-Agenti-AI/ 能看到网站
- [ ] 所有页面正常加载
- [ ] 样式和脚本正确显示
- [ ] 深色/浅色主题切换正常

---

## 🎉 完成！

恭喜！你的 REA Agentic AI 平台现在已经上线了！

**网站地址**：https://srinivasa-ks.github.io/Rea-Agenti-AI/

每次推送到 `main` 分支都会自动更新网站。

---

**遇到问题？** 
- 查看 Actions 日志：https://github.com/Srinivasa-ks/Rea-Agenti-AI/actions
- 提交 Issue：https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues
