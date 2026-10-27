# 🪟 Windows 桌面应用构建指南

## 📦 构建可下载的 Windows 应用程序

本指南将帮助你构建 REA Agentic AI 的 Windows 桌面应用程序（.exe 安装程序）。

---

## 🎯 构建产物

构建完成后，你将获得：

1. **NSIS 安装程序** (`REA Agentic AI-Setup-1.0.0.exe`)
   - 完整的安装向导
   - 可自定义安装目录
   - 创建桌面快捷方式和开始菜单
   - 支持卸载

2. **便携版本** (`REA Agentic AI-1.0.0.exe`)
   - 无需安装
   - 可直接运行
   - 可放在 U 盘中携带

---

## 🚀 快速构建（3 步）

### 第 1 步：准备图标

你需要一个 256x256 或更大的 PNG 图标文件：

1. 使用设计工具（如 Figma、Photoshop、Canva）创建图标
2. 或使用在线工具将 `public/icon.svg` 转换为 PNG
3. 保存为 `public/icon.png`

**推荐图标规格：**
- 尺寸：256x256 像素或更大（512x512 更佳）
- 格式：PNG（支持透明背景）
- 内容：应用标志，简洁清晰

### 第 2 步：构建 Windows 应用

打开命令提示符或 PowerShell，运行：

```bash
npm run electron:build:win
```

这个命令会：
1. 构建 React 应用（`npm run build`）
2. 使用 electron-builder 打包 Windows 应用
3. 生成安装程序和便携版本

### 第 3 步：获取构建产物

构建完成后，在 `release/` 目录中找到：

```
release/
├── REA Agentic AI-Setup-1.0.0.exe    # NSIS 安装程序
├── REA Agentic AI-1.0.0.exe          # 便携版本
├── latest.yml                         # 更新信息
└── ...
```

---

## 📋 详细构建步骤

### 环境要求

- **Node.js**: 18 或更高版本
- **npm**: 9 或更高版本
- **Windows**: 10 或 11（64 位）
- **磁盘空间**: 至少 2GB 可用空间

### 安装依赖

```bash
npm install
```

### 开发模式测试

在构建之前，建议先在开发模式下测试：

```bash
npm run electron:dev
```

这会启动 Vite 开发服务器和 Electron 窗口，你可以实时查看更改。

### 构建生产版本

```bash
# 构建所有平台（当前只配置了 Windows）
npm run electron:build

# 仅构建 Windows
npm run electron:build:win

# 构建 Windows 安装程序（NSIS）
npm run electron:build:win -- --win nsis

# 构建 Windows 便携版本
npm run electron:build:win -- --win portable
```

### 预览构建结果

```bash
npm run electron:preview
```

这会构建应用并立即启动 Electron 窗口进行测试。

---

## 🎨 自定义应用

### 修改应用信息

编辑 `package.json`：

```json
{
  "name": "rea-agentic-ai",
  "version": "1.0.0",
  "description": "你的应用描述",
  "author": "你的名字",
  "build": {
    "appId": "com.yourcompany.appname",
    "productName": "你的应用名称"
  }
}
```

### 修改窗口设置

编辑 `electron/main.js`：

```javascript
mainWindow = new BrowserWindow({
  width: 1400,        // 窗口宽度
  height: 900,        // 窗口高度
  minWidth: 1024,     // 最小宽度
  minHeight: 768,     // 最小高度
  // ... 其他设置
});
```

### 修改安装程序设置

编辑 `package.json` 中的 `build.nsis` 部分：

```json
"nsis": {
  "oneClick": false,                    // 是否一键安装
  "allowToChangeInstallationDirectory": true,  // 允许选择安装目录
  "createDesktopShortcut": true,        // 创建桌面快捷方式
  "createStartMenuShortcut": true,      // 创建开始菜单快捷方式
  "shortcutName": "REA Agentic AI"      // 快捷方式名称
}
```

---

## 🔧 故障排除

### 问题 1：找不到图标

**错误**: `Cannot find icon file: public/icon.png`

**解决**:
1. 确保 `public/icon.png` 文件存在
2. 图标尺寸至少 256x256 像素
3. 使用 PNG 格式

### 问题 2：构建失败

**错误**: `electron-builder 构建错误`

**解决**:
```bash
# 清理缓存
rm -rf node_modules release dist
npm install

# 重新构建
npm run electron:build:win
```

### 问题 3：应用启动白屏

**解决**:
1. 检查 `dist/index.html` 是否存在
2. 运行 `npm run build` 确保构建成功
3. 检查浏览器控制台错误（开发模式下按 F12）

### 问题 4：安装包太大

**原因**: Electron 包含完整的 Chromium 和 Node.js

**解决**:
- 这是正常的，Electron 应用通常 100-200MB
- 可以使用 UPX 压缩减小体积（高级）
- 考虑使用 Tauri 替代 Electron（更小的体积）

---

## 📦 分发应用

### 方法 1：直接分发安装程序

将 `release/REA Agentic AI-Setup-1.0.0.exe` 发送给用户：

1. 通过电子邮件发送
2. 上传到云存储（Google Drive、OneDrive）
3. 放在网站下载页面

### 方法 2：使用 GitHub Releases

1. 推送到 GitHub
2. 创建 Release
3. 上传 `.exe` 文件到 Release
4. 用户可以从 GitHub 下载

### 方法 3：代码签名（推荐）

为了避免 Windows SmartScreen 警告，建议对应用进行代码签名：

1. 购买代码签名证书（如 DigiCert、Sectigo）
2. 使用 `signtool` 签名：

```bash
signtool sign /f certificate.pfx /p password /tr http://timestamp.digicert.com /td sha256 /fd sha256 "release/REA Agentic AI-Setup-1.0.0.exe"
```

---

## 🎯 构建配置说明

### Windows 构建目标

当前配置了两个 Windows 构建目标：

1. **NSIS 安装程序**
   - 完整的安装向导
   - 支持自定义安装目录
   - 创建快捷方式
   - 支持卸载
   - 文件大小：~150MB

2. **便携版本**
   - 单文件可执行
   - 无需安装
   - 可放在 U 盘
   - 文件大小：~150MB

### 架构支持

当前配置仅支持 **x64**（64 位）Windows。

如需支持 32 位，修改 `package.json`：

```json
"win": {
  "target": [
    {
      "target": "nsis",
      "arch": ["x64", "ia32"]  // 添加 ia32 支持 32 位
    }
  ]
}
```

---

## 📊 构建时间

- **首次构建**: 5-10 分钟（需要下载 Electron）
- **后续构建**: 2-3 分钟
- **开发模式启动**: 5-10 秒

---

## 🔒 安全说明

### Electron 安全最佳实践

本应用已实施以下安全措施：

1. **上下文隔离** (`contextIsolation: true`)
   - 渲染进程无法直接访问 Node.js API
   - 通过 preload 脚本安全通信

2. **禁用 Node 集成** (`nodeIntegration: false`)
   - 渲染进程无法使用 `require()`
   - 防止恶意代码执行

3. **沙箱模式** (`sandbox: true`)
   - 渲染进程在沙箱中运行
   - 限制系统访问

4. **外部链接处理**
   - 所有外部链接在默认浏览器中打开
   - 防止应用内导航到外部网站

---

## 📚 相关文档

- **快速开始**: `QUICK_START.md`
- **部署指南**: `DEPLOY_CN.md`
- **项目说明**: `README.md`
- **Electron 文档**: https://www.electronjs.org/docs
- **electron-builder 文档**: https://www.electron.build/

---

## 🆘 获取帮助

遇到问题？

1. 查看 `FINAL_SUMMARY.md` 获取完整文件清单
2. 查看 `FIX_SUMMARY.md` 获取故障排除指南
3. 提交 Issue: https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues

---

## ✅ 构建检查清单

构建前确认：

- [ ] Node.js 18+ 已安装
- [ ] 所有依赖已安装 (`npm install`)
- [ ] 图标文件已准备 (`public/icon.png`)
- [ ] 开发模式测试通过 (`npm run electron:dev`)
- [ ] 生产构建成功 (`npm run build`)

构建后确认：

- [ ] 安装程序已生成 (`release/*.exe`)
- [ ] 安装程序可以正常运行
- [ ] 应用功能正常
- [ ] 快捷方式已创建
- [ ] 卸载功能正常

---

**准备构建你的 Windows 应用！** 🚀

运行 `npm run electron:build:win` 开始构建！
