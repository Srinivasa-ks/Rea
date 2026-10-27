# REA Agentic AI - 5-Phase Reverse Engineering Platform

## 🎯 Overview

REA Agentic AI is a production-grade reverse engineering platform that uses 12 specialized AI agents to analyze, decode, fix, assemble, and document any software file through a comprehensive 5-phase workflow.

## 🚀 Key Features

### ✅ All File Types Supported
- **Executables**: PE (Windows), ELF (Linux), Mach-O (macOS)
- **Code Files**: JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, PHP, Ruby
- **Documents**: PDF, DOC, XLS, PPT
- **Archives**: ZIP, RAR, 7Z, TAR, GZIP, BZIP2
- **Images**: JPEG, PNG, GIF, BMP
- **Data Files**: JSON, XML, YAML, CSV
- **Scripts**: Shell, Batch, PowerShell
- **And 100+ more file types**

### 🔄 5-Phase Workflow

#### Phase 1: Analysis
- **12 Specialized AI Agents** work collaboratively
- Real-time agent task visualization
- File type detection and classification
- Entropy calculation and hash generation
- Risk assessment and authorization checks

**Agents Include:**
- 🔍 Triage Agent - File classification
- 🛡️ Policy Agent - Authorization & safety
- ⚙️ Native Agent - Binary analysis
- 🌐 Web/JS Agent - Code analysis
- 👁️ Runtime Observer - Behavior monitoring
- 🌍 Network Agent - Network analysis
- 📋 Evidence Curator - Evidence collection
- 💬 Explainer - Findings synthesis
- 🔨 Reconstruction - Implementation guide
- 🎯 Orchestrator - Coordination
- 🔧 Setup Doctor - System health
- 📊 Metrics Agent - Performance analysis

#### Phase 2: Decoding
- **Disassembly** - Interactive x86/x64 disassembly viewer
- **Feature Analysis** - Capabilities and behaviors
- **Flaw Detection** - Vulnerabilities and security issues
- **Strength Identification** - Positive patterns and best practices
- **Attribute Analysis** - Binary metadata and characteristics

#### Phase 3: Fixing
- **Recommended Fixes** - Auto-detected vulnerability patches
- **Custom Modifications** - Add/remove/modify features
- **Code Optimization** - Performance improvements
- **Security Hardening** - Vulnerability remediation

#### Phase 4: Assembly
- **License Selection** - MIT, Apache, GPL, or Proprietary
- **Code Assembly** - Compile modified code
- **Stability Checks** - Compilation, tests, security, performance
- **App Generation** - Create new or modified applications

#### Phase 5: Summary
- **Comprehensive Report** - All phases documented
- **Export Options** - Markdown, JSON, HTML formats
- **Audit Trail** - Complete operation history
- **Recommendations** - Next steps and best practices

### 🌐 Always Connected
- Real-time internet connectivity status
- Ghidra MCP integration for advanced analysis
- Persistent sandbox environment
- Live status indicators

### 🔒 Privacy & Security
- Local-only processing
- No telemetry or data collection
- Sandboxed code execution
- Secure file handling

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Quick Start

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

### Deploy to GitHub Pages

```bash
# Build the application
npm run build

# Deploy to GitHub
git add .
git commit -m "Deploy production build"
git push origin main
```

Your app will be live at: `https://srinivasa-ks.github.io/Rea-Agenti-AI/`

## 🎮 Usage

### Starting a New Analysis

1. **Upload File**
   - Drag and drop any file or click to browse
   - Supports all file types (executables, code, documents, etc.)

2. **Ask Your Question**
   - Describe what you want to know about the file
   - Examples:
     - "How does authentication work?"
     - "What are the security vulnerabilities?"
     - "How can I modify this feature?"
     - "What APIs does this application use?"

3. **Watch the 5-Phase Workflow**
   - **Phase 1**: 12 AI agents analyze your file in real-time
   - **Phase 2**: Deep decoding with disassembly and feature analysis
   - **Phase 3**: Fix vulnerabilities and add custom modifications
   - **Phase 4**: Assemble, license, and stabilize
   - **Phase 5**: Generate comprehensive summary report

### Phase 1: Analysis

During this phase, you'll see:
- **Real-time agent progress** - Watch each of the 12 agents work
- **Live activity log** - See what each agent is doing
- **Overall progress bar** - Track completion percentage
- **Agent status cards** - Individual agent progress and tasks

### Phase 2: Decoding

Explore your file through multiple views:
- **Disassembly Tab** - Interactive x86/x64 disassembly with syntax highlighting
- **Features Tab** - Detected capabilities and behaviors
- **Flaws Tab** - Security vulnerabilities and code issues
- **Strengths Tab** - Positive patterns and best practices
- **Attributes Tab** - Binary metadata, sections, imports/exports

### Phase 3: Fixing

Modify your code:
- **Select recommended fixes** - Check boxes for auto-detected patches
- **Add custom modifications** - Describe features to add/remove/change
- **Review changes** - See summary of all modifications
- **Apply fixes** - Watch fixes being applied in real-time

### Phase 4: Assembly

Prepare for deployment:
- **Choose license** - MIT, Apache, GPL, or Proprietary
- **Start assembly** - Compile and assemble modified code
- **Stability checks** - Automatic compilation, tests, security, performance
- **Generate artifacts** - Create deployable application

### Phase 5: Summary

Get your comprehensive report:
- **Executive summary** - High-level overview
- **Phase details** - Expandable sections for each phase
- **Export options** - Download as Markdown, JSON, or HTML
- **Start new analysis** - Begin another reverse engineering session

## 🛠️ Technical Details

### Architecture

```
src/
├── App.tsx                    # Main application with 5-phase workflow
├── components/
│   ├── Phase1Analysis.tsx     # 12-agent analysis system
│   ├── Phase2Decoding.tsx     # Disassembly & feature analysis
│   ├── Phase3Fixing.tsx       # Fix & modification interface
│   ├── Phase4Assembly.tsx     # Assembly & licensing
│   ├── Phase5Summary.tsx      # Comprehensive reporting
│   ├── DisassemblyViewer.tsx  # Interactive disassembly
│   ├── AssemblyEditor.tsx     # Code editor
│   ├── FileFeatureAnalysis.tsx # Feature detection
│   ├── Icons.tsx              # SVG icon components
│   └── LicensingInfo.tsx      # License information
├── utils/
│   ├── agentSystem.ts         # 12-agent orchestration
│   ├── analyzer.ts            # Code analysis engine
│   ├── binaryAnalyzer.ts      # Binary file analysis
│   ├── ghidraAnalyzer.ts      # Ghidra-style analysis
│   ├── crypto.ts              # Cryptographic utilities
│   ├── auditTrail.ts          # Operation logging
│   ├── mcpIntegration.ts      # MCP protocol support
│   ├── storage.ts             # Data persistence
│   └── reportGenerator.ts     # Report generation
└── main.tsx                   # Application entry point
```

### Build Output

```
dist/
├── index.html          (3.45 KB)
└── assets/
    ├── index-*.css     (46.14 KB / gzip: 8.27 KB)
    └── index-*.js      (221.80 KB / gzip: 61.57 KB)
```

**Total Size**: ~271 KB (gzip: ~71 KB)

### Performance

- **Build Time**: ~2.5 seconds
- **Load Time**: < 1 second
- **Analysis Speed**: 15-30 seconds per file
- **Memory Usage**: < 100 MB

## 🔌 Integrations

### Ghidra MCP
- Advanced binary analysis
- Professional-grade disassembly
- Cross-reference tracking
- Function identification

### Sandbox Environment
- Safe code execution
- Isolated testing
- Real-time monitoring
- Resource limits

### Export Formats
- **Markdown** - Human-readable reports
- **JSON** - Machine-readable data
- **HTML** - Web-viewable reports

## 📊 Example Workflow

### Analyzing a Windows Executable

1. **Upload**: `malware.exe` (PE32 executable)
2. **Question**: "What does this program do and are there security vulnerabilities?"

**Phase 1 Results:**
- 12 agents analyze the file
- Detected: PE32 executable, x86 architecture
- Found: 47 functions, 234 strings, 12 imports
- Risks: 3 high-severity vulnerabilities

**Phase 2 Results:**
- Disassembly: 1,247 instructions decoded
- Features: Network communication, file I/O, registry access
- Flaws: Buffer overflow, hardcoded credentials, insecure API usage
- Strengths: Error handling, resource cleanup

**Phase 3 Actions:**
- Fix buffer overflow vulnerability
- Remove hardcoded credentials
- Add input validation
- Implement secure API calls

**Phase 4 Assembly:**
- License: MIT
- All stability checks passed
- Generated: `malware_fixed.exe`

**Phase 5 Summary:**
- Comprehensive HTML report
- Complete audit trail
- Export in 3 formats

## 🔒 Security & Ethics

### Ethical Guidelines
- Only analyze files you own or have permission to analyze
- Use for legitimate security research and education
- Respect software licenses and intellectual property
- Report vulnerabilities responsibly

### Privacy
- All processing happens locally in your browser
- No data is sent to external servers
- No telemetry or analytics
- Files never leave your device

### Security
- Sandboxed code execution
- No file system access
- Network requests blocked in sandbox
- Resource limits enforced

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ghidra** - NSA's reverse engineering framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Srinivasa-ks/Rea-Agenti-AI/discussions)
- **Documentation**: [Wiki](https://github.com/Srinivasa-ks/Rea-Agenti-AI/wiki)

## 🌟 Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ by the REA Agentic AI Team**

*Reverse Engineer Anything - Ethically, Efficiently, Effectively*
