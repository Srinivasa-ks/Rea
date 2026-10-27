# REA Agentic AI - Reverse Engineer Anything

<div align="center">

![Version](https://img.shields.io/badge/version-0.1.0--m0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build](https://img.shields.io/badge/build-passing-success)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)

**Local-first AI-powered reverse engineering platform**

[🚀 Live Demo](https://srinivasa-ks.github.io/Rea-Agenti-AI/) • [📖 Documentation](#documentation) • [🛠️ Setup](#quick-start) • [🤝 Contributing](#contributing)

</div>

---

## 🎯 Overview

REA Agentic AI is a local-first platform where a team of AI agents reverse engineer applications and binaries, explain how features work in plain English, show the evidence, and provide guides to recreate similar features.

### ✨ Key Features

- **🤖 Multi-Agent System**: 12 specialized AI agents working collaboratively
- **🔍 Evidence-Based Analysis**: Every claim backed by verifiable evidence
- **🛡️ Sandbox Environment**: Safe, isolated execution for target analysis
- **📊 Native Binary Analysis**: Ghidra-powered decompilation and analysis
- **🔌 MCP Integration**: Connect with Claude, Codex, Cursor, and VS Code
- **🌐 Multiple Interfaces**: CLI, MCP Server, and Desktop App
- **🔒 Privacy-First**: No telemetry, no cloud, fully local operation
- **📝 Complete Audit Trail**: Full event logging and history tracking

## 🌐 Live Preview

**👉 [View Live Demo](https://srinivasa-ks.github.io/Rea-Agenti-AI/)**

The application is automatically deployed to GitHub Pages from the `main` branch.

## 🪟 Windows Desktop App

Download the native Windows desktop application:

**👉 [Download for Windows](https://github.com/Srinivasa-ks/Rea-Agenti-AI/releases)**

### Build Your Own Windows App

```bash
# Install dependencies
npm install

# Build Windows installer
npm run electron:build:win

# Or use the one-click build script
build-windows.bat
```

See [README_WINDOWS.md](README_WINDOWS.md) for detailed instructions.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Srinivasa-ks/Rea-Agenti-AI.git
cd Rea-Agenti-AI

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. Open your browser to `http://localhost:3000`
2. Navigate through the sidebar to explore different features
3. Start with the **Welcome** screen to understand the platform
4. Use **Ask** to submit investigation questions
5. Monitor progress in **Investigation** screen
6. View results in **Results** screen
7. Use **Sandbox** for safe target execution

## 🏗️ Architecture

### Three Front Doors, One Shared Core

```
┌─────────────────────────────────────────────────────────┐
│                    REA App (Electron)                    │
│  Welcome │ Ask │ Investigation │ Results │ History      │
└────────────────────┬────────────────────────────────────┘
                     │ (no logic)
┌────────────────────┴────────────────────────────────────┐
│                      REA Core                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Orchestrator Agent                   │  │
│  │  Triage │ Web/JS │ Native │ Explain │ Reconstruct │  │
│  └──────────────────────────────────────────────────┘  │
│  Evidence Ledger │ History (SQLite) │ Setup/Doctor     │
└─────────────────────────────────────────────────────────┘
┌──────────────────┐  ┌──────────────────────────────────┐
│  CLI (rea-agent) │  │  MCP Server (stdio + HTTP)       │
└──────────────────┘  └──────────────────────────────────┘
```

### Agent System

| Agent | Role | Tools |
|-------|------|-------|
| **Orchestrator** | Coordinates investigation | delegate, plan, reconcile |
| **Triage** | Classifies targets | file-stat, mime-detect, source-map-check |
| **Web/JS** | Analyzes JavaScript | ast-parse, string-search, call-graph |
| **Native** | Binary analysis (Ghidra) | decompile, disassemble, xrefs |
| **Evidence Curator** | Manages evidence | record-evidence, link-evidence, hash-verify |
| **Explainer** | Synthesizes findings | synthesize, diagram-gen, confidence-calc |
| **Reconstruction** | Guides recreation | code-gen, template-select |
| **Policy/Safety** | Enforces rules | risk-assess, authorize-check |
| **Setup Doctor** | System health | detect, verify, install |

### Sandbox Environment

The sandbox provides isolated execution with:

- **Process Monitoring**: Real-time CPU, memory, and process tracking
- **Network Control**: Configurable network access policies
- **File System Isolation**: Read-only target access, controlled writes
- **Security Events**: Automatic blocking of suspicious operations
- **Snapshot Capability**: Save and restore execution state

## 📖 Documentation

### Investigation Workflow

1. **Intake**: User submits question and target
2. **Triage**: System classifies target type and capabilities
3. **Planning**: Orchestrator creates investigation plan
4. **Investigation**: Agents execute analysis tasks
5. **Reconciliation**: Evidence is cross-referenced and validated
6. **Explanation**: Findings synthesized into plain English
7. **Reconstruction**: Guide provided to recreate feature
8. **Archive**: Results stored with full audit trail

### Evidence System

Every claim in an investigation is backed by evidence records:

```typescript
interface EvidenceRecord {
  id: string;              // Unique identifier (E1, E2, ...)
  type: EvidenceType;      // source-excerpt, decompiled, network-capture, etc.
  source: string;          // File path and location
  tool: string;            // Tool that generated evidence
  timestamp: string;       // When evidence was captured
  hash: string;            // SHA-256 hash for verification
  caption: string;         // Human-readable description
  excerpt?: string;        // Code or data excerpt
  confidence: ConfidenceLevel; // confirmed, high, medium, low, hypothesis
}
```

### Final Answer Format

Every investigation produces:

1. **Summary**: 3-5 sentence overview
2. **Flow Diagram**: Mermaid diagram of feature behavior
3. **Step-by-Step**: Detailed explanation with evidence references
4. **Confidence**: Derived confidence level with open questions
5. **Behavior Spec**: Complete specification of observed behavior
6. **Reconstruction Guide**: Clean-room implementation guide
7. **Reproduce Commands**: CLI commands to reproduce findings

## 🛠️ Development

### Project Structure

```
Rea-Agenti-AI/
├── src/
│   ├── App.tsx                 # Main application
│   ├── SandboxEnvironment.tsx  # Sandbox UI
│   ├── types/
│   │   └── index.ts           # TypeScript types
│   ├── data/
│   │   └── mockData.ts        # Sample investigation data
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles
├── .github/
│   └── workflows/
│       └── deploy.yml         # GitHub Pages deployment
├── index.html                 # HTML template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.js             # Vite config
└── README.md                  # This file
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **GitHub Actions** - CI/CD

## 🔒 Security & Privacy

### Local-First Design

- ✅ No telemetry or analytics
- ✅ No cloud dependencies
- ✅ No API keys required
- ✅ All processing happens locally
- ✅ Network access only for approved downloads

### Safety Features

- **Authorization Gate**: User must confirm ownership/permission
- **Risk Classification**: Actions classified by risk level
- **Approval Workflow**: High-risk actions require explicit approval
- **Sandbox Isolation**: Unknown targets run in isolated environment
- **Secret Masking**: API keys and tokens automatically masked
- **Audit Logging**: Every action logged with full context

### What REA Will NOT Do

- ❌ Create malware or exploits
- ❌ Bypass licenses or DRM
- ❌ Attack third-party systems
- ❌ Assist with piracy
- ❌ Operate without user authorization

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines (coming soon).

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Rea-Agenti-AI.git
cd Rea-Agenti-AI

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and commit
git commit -m 'Add amazing feature'

# Push and create PR
git push origin feature/amazing-feature
```

## 📊 Milestones

- [x] **M0**: Recon & Architecture Design
- [x] **M1**: Foundations & Core Types
- [ ] **M2**: Setup & Doctor System
- [ ] **M3**: Single-Agent JS Analysis
- [ ] **M4**: Orchestrator & Multi-Agent
- [ ] **M5**: MCP Server & App Shell
- [ ] **M6**: Electron Analysis
- [ ] **M7**: Ghidra Integration
- [ ] **M8**: Reconstruction Guide
- [ ] **M9**: Hardening & Security
- [ ] **M10**: Evals & Documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Upstream REA** (github.com/morluto/rea) - Core reverse engineering library
- **Ghidra** (NSA) - Native binary analysis framework
- **GhidraMCP** - MCP interface for Ghidra

## 📞 Support

- 📧 Email: [Your email]
- 🐛 Issues: [GitHub Issues](https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/Srinivasa-ks/Rea-Agenti-AI/discussions)

---

<div align="center">

**Built with ❤️ by [Srinivasa KS](https://github.com/Srinivasa-ks)**

[⭐ Star this repo](https://github.com/Srinivasa-ks/Rea-Agenti-AI) • [🐛 Report Bug](https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues) • [💡 Request Feature](https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues)

</div>
