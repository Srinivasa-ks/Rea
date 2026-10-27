# 🪟 REA Agentic AI - Windows 桌面应用

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**本地优先的 AI 驱动逆向工程平台**

[📥 下载应用](#-下载与安装) • [🔨 构建指南](#-构建指南) • [📖 文档](#-文档)

</div>

---

## 🎯 概述

REA Agentic AI 是一个本地优先的平台，通过 AI 代理团队逆向工程应用程序和二进制文件，用简单的英语解释功能工作原理，展示证据，并提供重建类似功能的指南。

### ✨ 主要特性

- 🤖 **多代理系统** - 12 个专业化 AI 代理协同工作
- 🔍 **证据驱动分析** - 每个结论都有可验证的证据支持
- 🛡️ **沙盒环境** - 安全隔离的目标执行环境
- 📊 **原生二进制分析** - Ghidra 驱动的反编译和分析
- 🔌 **MCP 集成** - 与 Claude、Codex、Cursor 和 VS Code 连接
- 🌐 **多界面** - CLI、MCP 服务器和桌面应用
- 🔒 **隐私优先** - 无遥测、无云、完全本地运行
- 📝 **完整审计跟踪** - 全事件日志和历史跟踪

---

## 📥 下载与安装

### 方法 1：使用预构建的安装程序（推荐）

1. 前往 [Releases 页面](https://github.com/Srinivasa-ks/Rea-Agenti-AI/releases)
2. 下载最新版本：
   - **`REA Agentic AI-Setup-1.0.0.exe`** - 安装程序（推荐）
   - **`REA Agentic AI-1.0.0.exe`** - 便携版本
3. 运行安装程序并按照向导操作
4. 启动应用并开始使用！

### 方法 2：自己构建

如果你想要最新版本或自定义构建：

```bash
# 克隆仓库
git clone https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
cd Rea-Agenti-AI

# 安装依赖
npm install

# 构建 Windows 应用
npm run electron:build:win

# 或运行一键构建脚本
build-windows.bat
```

构建完成后，在 `release/` 目录中找到安装程序。

---

## 🔨 构建指南

### 系统要求

- **Node.js**: 18 或更高版本
- **npm**: 9 或更高版本
- **Windows**: 10 或 11（64 位）
- **磁盘空间**: 至少 2GB 可用空间
- **内存**: 至少 4GB RAM

### 快速构建（3 步）

#### 第 1 步：准备环境

```bash
# 克隆仓库
git clone https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
cd Rea-Agenti-AI

# 安装依赖
npm install
```

#### 第 2 步：准备图标

你需要一个 256x256 或更大的 PNG 图标文件：

**选项 A：使用占位图标**
```bash
node scripts/create-placeholder-icon.js
```

**选项 B：使用提供的 SVG**
1. 打开 `public/icon.svg`
2. 使用在线工具转换为 PNG（如 https://cloudconvert.com/svg-to-png）
3. 设置尺寸为 256x256 或 512x512
4. 保存为 `public/icon.png`

**选项 C：创建自定义图标**
- 使用 Figma、Photoshop、Canva 等工具
- 设计 256x256 或 512x512 的图标
- 保存为 PNG 格式（支持透明背景）
- 放置到 `public/icon.png`

#### 第 3 步：构建应用

**使用一键构建脚本（推荐）：**
```bash
build-windows.bat
```

**或手动构建：**
```bash
npm run electron:build:win
```

### 构建产物

构建完成后，在 `release/` 目录中找到：

```
release/
├── REA Agentic AI-Setup-1.0.0.exe    # NSIS 安装程序（~150MB）
├── REA Agentic AI-1.0.0.exe          # 便携版本（~150MB）
├── latest.yml                         # 更新信息
└── builder-debug.yml                  # 构建调试信息
```

---

## 🎮 使用方法

### 安装版本

1. 双击 `REA Agentic AI-Setup-1.0.0.exe`
2. 按照安装向导操作
3. 选择安装目录（可选）
4. 创建桌面快捷方式（推荐）
5. 完成安装
6. 从桌面或开始菜单启动应用

### 便携版本

1. 双击 `REA Agentic AI-1.0.0.exe`
2. 应用立即启动，无需安装
3. 可以放在 U 盘中随身携带

### 开发模式

如果你想修改代码并实时预览：

```bash
npm run electron:dev
```

这会启动 Vite 开发服务器和 Electron 窗口，支持热重载。

---

## 📋 应用界面

应用包含 13 个主要界面：

1. **Welcome** - 平台介绍和免责声明
2. **Ask** - 提交调查问题
3. **Investigation** - 实时代理监控
4. **Results** - 证据支持的结果展示
5. **Sandbox** - 安全执行环境（6 个监控标签）
6. **History** - 调查历史记录
7. **Native** - Ghidra 风格二进制分析
8. **MCP** - AI 工具集成指南
9. **Architecture** - 系统设计文档
10. **Setup** - 系统健康检查
11. **Logs** - 事件日志查看器
12. **Settings** - 隐私和配置
13. **Approvals** - 审批收件箱

---

## 🔧 自定义

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

### 修改安装程序

编辑 `package.json` 中的 `build.nsis`：

```json
"nsis": {
  "oneClick": false,
  "allowToChangeInstallationDirectory": true,
  "createDesktopShortcut": true,
  "createStartMenuShortcut": true,
  "shortcutName": "REA Agentic AI"
}
```

---

## 🔒 安全特性

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

### 本地优先设计

- ✅ 无遥测或分析
- ✅ 无云依赖
- ✅ 无需 API 密钥
- ✅ 所有处理在本地进行
- ✅ 网络访问仅用于批准的下载

---

## 🐛 故障排除

### 问题 1：构建失败 - 找不到图标

**错误**: `Cannot find icon file: public/icon.png`

**解决**:
```bash
# 创建占位图标
node scripts/create-placeholder-icon.js

# 或手动创建 256x256 PNG 图标
# 保存为 public/icon.png
```

### 问题 2：应用启动白屏

**解决**:
1. 检查 `dist/index.html` 是否存在
2. 运行 `npm run build` 确保构建成功
3. 在开发模式下检查控制台错误（`npm run electron:dev`）

### 问题 3：安装包太大

**原因**: Electron 包含完整的 Chromium 和 Node.js

**说明**:
- 这是正常的，Electron 应用通常 100-200MB
- 可以使用 UPX 压缩减小体积（高级）
- 考虑使用 Tauri 替代 Electron（更小的体积）

### 问题 4：Windows SmartScreen 警告

**原因**: 应用未签名

**解决**:
- 点击 "更多信息" → "仍要运行"
- 或购买代码签名证书对应用进行签名

---

## 📚 文档

- **快速开始**: `WINDOWS_QUICKSTART.md`
- **完整构建指南**: `WINDOWS_BUILD.md`
- **项目说明**: `README.md`
- **部署指南**: `DEPLOY_CN.md`
- **文件验证**: `FILE_VERIFICATION.md`

---

## 🤝 贡献

欢迎贡献！请查看 [CONTRIBUTING.md](CONTRIBUTING.md)（即将推出）。

---

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 🙏 致谢

- **Upstream REA** (github.com/morluto/rea) - 核心逆向工程库
- **Ghidra** (NSA) - 原生二进制分析框架
- **GhidraMCP** - Ghidra 的 MCP 接口
- **Electron** - 桌面应用框架

---

## 📞 支持

- 📧 **问题**: [GitHub Issues](https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues)
- 💬 **讨论**: [GitHub Discussions](https://github.com/Srinivasa-ks/Rea-Agenti-AI/discussions)
- 📖 **文档**: [Wiki](https://github.com/Srinivasa-ks/Rea-Agenti-AI/wiki)

---

<div align="center">

**用 ❤️ 构建 by [Srinivasa KS](https://github.com/Srinivasa-ks)**

[⭐ Star this repo](https://github.com/Srinivasa-ks/Rea-Agenti-AI) • [📥 Download](https://github.com/Srinivasa-ks/Rea-Agenti-AI/releases) • [🐛 Report Bug](https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues)

</div>
