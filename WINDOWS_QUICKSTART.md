# 🪟 Windows 桌面应用 - 快速开始

## 📦 构建你的 Windows 应用

### 第 1 步：创建图标文件

运行以下命令创建占位图标：

```bash
node scripts/create-placeholder-icon.js
```

**或者** 手动创建一个 256x256 的 PNG 图标文件，保存为 `public/icon.png`

### 第 2 步：构建 Windows 应用

```bash
npm run electron:build:win
```

### 第 3 步：获取安装程序

构建完成后，在 `release/` 目录中找到：

- **`REA Agentic AI-Setup-1.0.0.exe`** - NSIS 安装程序（推荐）
- **`REA Agentic AI-1.0.0.exe`** - 便携版本

---

## 🎯 常用命令

```bash
# 开发模式（实时预览）
npm run electron:dev

# 构建 Windows 应用
npm run electron:build:win

# 仅构建安装程序
npm run electron:build:win -- --win nsis

# 仅构建便携版本
npm run electron:build:win -- --win portable

# 预览构建结果
npm run electron:preview
```

---

## 📋 系统要求

- **Node.js**: 18+ 
- **Windows**: 10/11 (64位)
- **磁盘空间**: 2GB+

---

## 📚 详细文档

查看 `WINDOWS_BUILD.md` 获取完整的构建指南，包括：

- 自定义应用信息
- 修改窗口设置
- 代码签名
- 分发方法
- 故障排除

---

## 🔗 相关资源

- **Electron 文档**: https://www.electronjs.org/docs
- **electron-builder**: https://www.electron.build/
- **NSIS 文档**: https://nsis.sourceforge.io/Docs/

---

**开始构建！** 🚀

运行 `npm run electron:build:win` 创建你的 Windows 应用！
