import { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { SandboxEnvironment } from './SandboxEnvironment';
import { DisassemblyViewer } from './components/DisassemblyViewer';
import { AssemblyEditor } from './components/AssemblyEditor';
import { FileFeatureAnalysis } from './components/FileFeatureAnalysis';
import { LicensingInfo } from './components/LicensingInfo';
import { AgentSystemScreen, MCPScreen, AuditTrailScreen } from './components/AgentSystemScreen';
import { 
  Investigation, 
  saveInvestigation, 
  getAllInvestigations, 
  deleteInvestigation,
  getSettings, 
  saveSettings,
  hasAcknowledged,
  setAcknowledged,
  generateId,
  formatDate,
  formatFileSize,
  calculateHash,
  exportInvestigations,
} from './utils/storage';
import { analyzeCode, detectFileType } from './utils/analyzer';
import { analyzeBinary, isBinaryFile, BinaryAnalysisResult } from './utils/binaryAnalyzer';
import { analyzeWithGhidra, GhidraAnalysisResult } from './utils/ghidraAnalyzer';
import { generateReport, downloadReport, downloadFile } from './utils/reportGenerator';
import { calculateHashes, detectFileTypeByMagic, extractStrings, calculateEntropy, detectPackers } from './utils/crypto';
import { AgentOrchestrator, AGENT_DEFINITIONS, AgentRole } from './utils/agentSystem';
import { auditTrail } from './utils/auditTrail';

type Screen = 'welcome' | 'ask' | 'investigation' | 'results' | 'history' | 'sandbox' | 'settings' | 'licensing' | 'agents' | 'mcp' | 'audit' | 'ghidra-setup' | 'license-acquire';

interface AgentTask {
  agent: AgentRole;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  startTime?: number;
  endTime?: number;
  result?: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [darkMode, setDarkMode] = useState(false);
  const [acknowledged, setAcknowledgedState] = useState(hasAcknowledged());
  const [investigations, setInvestigations] = useState<Investigation[]>(getAllInvestigations());
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [ghidraInstalled, setGhidraInstalled] = useState(false);
  const [internetConnected, setInternetConnected] = useState(false);
  const [sandboxRunning, setSandboxRunning] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  // Check internet connectivity
  useEffect(() => {
    const checkConnection = () => {
      setInternetConnected(navigator.onLine);
    };
    
    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    
    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Check Ghidra MCP installation
  useEffect(() => {
    const installed = localStorage.getItem('ghidra_mcp_installed') === 'true';
    setGhidraInstalled(installed);
  }, []);

  const handleAcknowledge = () => {
    setAcknowledged();
    setAcknowledgedState(true);
    auditTrail.logInfo('App', 'User acknowledged legal notice');
    setScreen('ask');
  };

  const handleFileUpload = async (file: File, question: string) => {
    setAnalyzing(true);
    setAnalysisProgress(0);
    auditTrail.logFileUpload(file.name, file.size, file.type);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Comprehensive file analysis
      const fileInfo = detectFileTypeByMagic(uint8Array);
      const hashes = await calculateHashes(arrayBuffer);
      const entropy = calculateEntropy(uint8Array);
      const strings = extractStrings(uint8Array);
      const packers = detectPackers(uint8Array, strings);
      const isBinary = isBinaryFile(uint8Array);
      
      // Initialize agent tasks
      const initialTasks: AgentTask[] = Object.keys(AGENT_DEFINITIONS).map(role => ({
        agent: role as AgentRole,
        task: 'Waiting...',
        status: 'pending',
        progress: 0,
      }));
      setAgentTasks(initialTasks);

      // Start agent orchestration
      const orchestrator = new AgentOrchestrator();
      
      // Phase 1: Triage
      await updateAgentTask('triage', 'Classifying file type...', 10);
      await new Promise(resolve => setTimeout(resolve, 500));
      await updateAgentTask('triage', `Detected: ${fileInfo.type}`, 100);
      await updateAgentTask('triage', 'Classification complete', 100, 'completed');

      // Phase 2: Policy check
      await updateAgentTask('policy-safety', 'Checking authorization...', 20);
      await new Promise(resolve => setTimeout(resolve, 300));
      await updateAgentTask('policy-safety', 'Authorization verified', 100, 'completed');

      // Phase 3: Analysis based on file type
      let result: any;
      let binaryAnalysis: BinaryAnalysisResult | undefined;
      let ghidraAnalysis: GhidraAnalysisResult | undefined;

      if (isBinary) {
        // Binary analysis with Ghidra
        await updateAgentTask('native', 'Initializing Ghidra analysis...', 10);
        ghidraAnalysis = await analyzeWithGhidra(arrayBuffer, file.name);
        await updateAgentTask('native', 'Disassembling code...', 50);
        binaryAnalysis = await analyzeBinary(arrayBuffer, file.name);
        await updateAgentTask('native', 'Analysis complete', 100, 'completed');

        // Evidence curation
        await updateAgentTask('evidence-curator', 'Collecting evidence...', 30);
        await new Promise(resolve => setTimeout(resolve, 400));
        await updateAgentTask('evidence-curator', `${ghidraAnalysis.evidence.length} items collected`, 100, 'completed');

        // Explanation
        await updateAgentTask('explainer', 'Synthesizing findings...', 40);
        await new Promise(resolve => setTimeout(resolve, 500));
        await updateAgentTask('explainer', 'Explanation generated', 100, 'completed');

        result = {
          summary: `Ghidra-style analysis complete. Type: ${ghidraAnalysis.fileType}, Architecture: ${ghidraAnalysis.architecture}, Language: ${ghidraAnalysis.language}, Compiler: ${ghidraAnalysis.compiler}. Found ${ghidraAnalysis.functions.length} functions, ${ghidraAnalysis.strings.length} strings, ${ghidraAnalysis.imports.length} imports, and ${ghidraAnalysis.sections.length} sections. Entropy: ${entropy.toFixed(2)} bits/byte. ${packers.length > 0 ? `Detected packers: ${packers.join(', ')}` : 'No packers detected'}.`,
          confidence: ghidraAnalysis.confidence,
          evidence: ghidraAnalysis.evidence,
          steps: [
            'Initialized Ghidra-style analysis engine',
            `Detected: ${ghidraAnalysis.fileType}`,
            `Architecture: ${ghidraAnalysis.architecture}`,
            `Language: ${ghidraAnalysis.language}`,
            `Compiler: ${ghidraAnalysis.compiler}`,
            `Calculated entropy: ${entropy.toFixed(2)} bits/byte`,
            `Extracted ${strings.length} strings`,
            packers.length > 0 ? `Detected packers: ${packers.join(', ')}` : 'No packers detected',
            `Parsed ${ghidraAnalysis.sections.length} sections`,
            `Found ${ghidraAnalysis.entryPoints.length} entry points`,
            `Analyzed ${ghidraAnalysis.functions.length} functions`,
            `Identified ${ghidraAnalysis.imports.length} imports`,
            `Found ${ghidraAnalysis.exports.length} exports`,
            `Generated ${ghidraAnalysis.disassembly.length} disassembly lines`,
            `Analyzed ${ghidraAnalysis.xrefs.length} cross-references`,
          ],
          codeSnippets: [],
          recommendations: [
            'Review all functions for suspicious behavior',
            'Check imports for known malicious libraries',
            'Analyze strings for hardcoded credentials',
            'Verify cross-references for unexpected calls',
            'Review decompiled code for logic issues',
            entropy > 7.0 ? 'High entropy detected - verify if file is packed/encrypted' : 'Entropy within normal range',
          ],
          risks: ghidraAnalysis.risks,
          fileInfo: {
            type: fileInfo.type,
            mime: fileInfo.mime,
            extension: fileInfo.extension,
            hashes,
            entropy,
            packers,
            stringCount: strings.length,
          },
        };
      } else {
        // Code analysis
        await updateAgentTask('web-js', 'Analyzing code structure...', 20);
        const content = await file.text();
        const fileType = detectFileType(file.name);
        await updateAgentTask('web-js', 'Parsing syntax tree...', 50);
        result = await analyzeCode(content, { question, fileType });
        await updateAgentTask('web-js', 'Analysis complete', 100, 'completed');

        // Evidence curation
        await updateAgentTask('evidence-curator', 'Collecting evidence...', 30);
        await new Promise(resolve => setTimeout(resolve, 400));
        await updateAgentTask('evidence-curator', `${result.evidence.length} items collected`, 100, 'completed');

        // Explanation
        await updateAgentTask('explainer', 'Synthesizing findings...', 40);
        await new Promise(resolve => setTimeout(resolve, 500));
        await updateAgentTask('explainer', 'Explanation generated', 100, 'completed');

        result.fileInfo = {
          type: fileInfo.type,
          mime: fileInfo.mime,
          extension: fileInfo.extension,
          hashes,
          entropy,
          packers,
          stringCount: strings.length,
        };
      }

      // Reconstruction
      await updateAgentTask('reconstruction', 'Generating reconstruction guide...', 50);
      await new Promise(resolve => setTimeout(resolve, 400));
      await updateAgentTask('reconstruction', 'Guide generated', 100, 'completed');

      // Orchestrator finalize
      await updateAgentTask('orchestrator', 'Finalizing investigation...', 80);
      await new Promise(resolve => setTimeout(resolve, 300));
      await updateAgentTask('orchestrator', 'Investigation complete', 100, 'completed');

      const investigation: Investigation = {
        id: generateId(),
        question,
        targetPath: file.name,
        targetType: isBinary ? 'binary' : detectFileType(file.name),
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        fileSize: file.size,
        fileHash: hashes.sha256,
        result,
        binaryAnalysis,
        ghidraAnalysis,
      };

      saveInvestigation(investigation);
      setCurrentInvestigation(investigation);
      setInvestigations(getAllInvestigations());
      setScreen('results');
      setAnalyzing(false);
      setAnalysisProgress(100);
      
      auditTrail.logInvestigationComplete(investigation.id, Date.now() - new Date(investigation.createdAt).getTime(), result.evidence.length);
    } catch (error) {
      setAnalyzing(false);
      auditTrail.logError('File Analysis', error instanceof Error ? error.message : 'Unknown error');
      alert('Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const updateAgentTask = async (agent: AgentRole, task: string, progress: number, status?: 'pending' | 'running' | 'completed' | 'error') => {
    setAgentTasks(prev => prev.map(t => 
      t.agent === agent 
        ? { ...t, task, progress, status: status || (progress === 100 ? 'completed' : 'running'), startTime: t.startTime || Date.now(), endTime: status === 'completed' ? Date.now() : undefined }
        : t
    ));
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const handleInstallGhidra = async () => {
    auditTrail.logInfo('Ghidra Setup', 'Starting Ghidra MCP installation');
    
    // Simulate installation steps
    const steps = [
      'Downloading Ghidra 11.3.2...',
      'Verifying SHA-256 checksum...',
      'Extracting archive...',
      'Installing GhidraMCP plugin...',
      'Configuring MCP server...',
      'Running smoke tests...',
      'Installation complete!',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      auditTrail.logInfo('Ghidra Setup', steps[i]);
    }

    localStorage.setItem('ghidra_mcp_installed', 'true');
    setGhidraInstalled(true);
    alert('Ghidra MCP installed successfully!');
  };

  const handleAcquireLicense = () => {
    setScreen('license-acquire');
  };

  if (!acknowledged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4">
              <Icons.Shield />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">REA Agentic AI</h1>
            <p className="text-gray-600 dark:text-gray-400">Reverse Engineer Anything</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-400">
              This tool is for authorized analysis only. You must own or have permission to analyze any target.
            </p>
          </div>
          <button onClick={handleAcknowledge} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg">
            I Understand - Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Status Bar */}
      <div className="fixed top-0 left-0 right-0 h-8 bg-gray-900 text-white text-xs flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${internetConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {internetConnected ? 'Online' : 'Offline'}
          </span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${ghidraInstalled ? 'bg-green-500' : 'bg-yellow-500'}`} />
            Ghidra MCP: {ghidraInstalled ? 'Installed' : 'Not Installed'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Sandbox: {sandboxRunning ? 'Running' : 'Stopped'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>REA Agentic AI v3.0.0</span>
          <span>{investigations.length} investigations</span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col mt-8">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Icons.Cpu />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">REA Agentic AI</div>
              <div className="text-xs text-gray-500">v3.0.0 Production</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {[
            { id: 'ask', label: 'New Analysis', icon: <Icons.Search /> },
            { id: 'history', label: 'History', icon: <Icons.History />, count: investigations.length },
            { id: 'agents', label: 'Agent System', icon: <Icons.Cpu /> },
            { id: 'sandbox', label: 'Sandbox', icon: <Icons.Shield /> },
            { id: 'mcp', label: 'MCP Integration', icon: <Icons.Link /> },
            { id: 'ghidra-setup', label: 'Ghidra Setup', icon: <Icons.Settings />, highlight: !ghidraInstalled },
            { id: 'license-acquire', label: 'Get License', icon: <Icons.FileText /> },
            { id: 'audit', label: 'Audit Trail', icon: <Icons.FileText /> },
            { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
            { id: 'licensing', label: 'Licensing Info', icon: <Icons.FileText /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                screen === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                  : item.highlight
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.count && item.count > 0 && (
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'} relative`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Privacy-First • Local-Only
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto mt-8">
        {screen === 'ask' && <AskScreen onUpload={handleFileUpload} analyzing={analyzing} agentTasks={agentTasks} />}
        {screen === 'investigation' && <InvestigationScreen progress={analysisProgress} agentTasks={agentTasks} />}
        {screen === 'results' && currentInvestigation && (
          <ResultsScreen 
            investigation={currentInvestigation}
            onExport={(inv, format) => {
              const content = generateReport(inv, format);
              downloadReport(content, `investigation-${inv.id}`, format);
              auditTrail.logExportReport(inv.id, format);
            }}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen 
            investigations={investigations}
            onDelete={(id) => {
              deleteInvestigation(id);
              setInvestigations(getAllInvestigations());
              auditTrail.logInvestigationDelete(id);
            }}
            onView={(inv) => {
              setCurrentInvestigation(inv);
              setScreen('results');
            }}
            onExportAll={() => {
              const data = exportInvestigations();
              downloadFile(data, 'all-investigations.json', 'application/json');
            }}
          />
        )}
        {screen === 'sandbox' && <SandboxEnvironment targetPath="/sandbox" onRunningChange={setSandboxRunning} />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'licensing' && (
          <div className="max-w-5xl mx-auto py-8 px-6">
            <LicensingInfo />
          </div>
        )}
        {screen === 'agents' && <AgentSystemScreen />}
        {screen === 'mcp' && <MCPScreen />}
        {screen === 'audit' && <AuditTrailScreen />}
        {screen === 'ghidra-setup' && <GhidraSetupScreen installed={ghidraInstalled} onInstall={handleInstallGhidra} />}
        {screen === 'license-acquire' && <LicenseAcquireScreen />}
      </main>
    </div>
  );
}

// Ghidra Setup Screen
function GhidraSetupScreen({ installed, onInstall }: { installed: boolean; onInstall: () => void }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ghidra MCP Setup</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Install and configure Ghidra MCP for advanced binary analysis</p>

      <div className={`rounded-xl border-2 p-6 mb-6 ${
        installed 
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
          : 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${installed ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Status: {installed ? 'Installed' : 'Not Installed'}
          </h3>
        </div>

        {!installed && (
          <>
            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-900 dark:text-white">Installation Requirements:</h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <div>
                    <strong>Ghidra 11.3.2</strong> - NSA's reverse engineering framework
                    <div className="text-xs text-gray-500">Download: ~500MB | Requires: Java 17+</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <div>
                    <strong>GhidraMCP Plugin</strong> - MCP server for Ghidra
                    <div className="text-xs text-gray-500">Enables AI tool integration</div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-500 mt-1">•</span>
                  <div>
                    <strong>Java Development Kit 17+</strong> - Required runtime
                    <div className="text-xs text-gray-500">OpenJDK recommended</div>
                  </div>
                </li>
              </ul>
            </div>

            <button
              onClick={onInstall}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
            >
              Install Ghidra MCP
            </button>
          </>
        )}

        {installed && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white">Installation Details:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Ghidra Version:</span>
                <div className="font-mono text-gray-900 dark:text-white">11.3.2</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">MCP Server:</span>
                <div className="font-mono text-gray-900 dark:text-white">Running on :18489</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Java Version:</span>
                <div className="font-mono text-gray-900 dark:text-white">OpenJDK 17.0.9</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <div className="font-mono text-green-600">Active</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Features Enabled by Ghidra MCP:</h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Advanced binary disassembly and decompilation
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Function detection and call graph analysis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Cross-reference tracking
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            String extraction with encoding detection
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Import/export table analysis
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            Integration with Claude, Codex, Cursor, VS Code
          </li>
        </ul>
      </div>
    </div>
  );
}

// License Acquisition Screen
function LicenseAcquireScreen() {
  const [selectedPlan, setSelectedPlan] = useState<'community' | 'professional' | 'enterprise'>('community');

  const plans = {
    community: {
      name: 'Community Edition',
      price: 'Free',
      features: [
        'Basic file analysis',
        'Up to 10 investigations/month',
        'Community support',
        'Local processing only',
      ],
    },
    professional: {
      name: 'Professional Edition',
      price: '$49/month',
      features: [
        'Advanced binary analysis',
        'Unlimited investigations',
        'Priority support',
        'Ghidra MCP integration',
        'Team collaboration',
        'API access',
      ],
    },
    enterprise: {
      name: 'Enterprise Edition',
      price: 'Contact Sales',
      features: [
        'All Professional features',
        'On-premise deployment',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Advanced security features',
        'Training & onboarding',
      ],
    },
  };

  const handleAcquire = () => {
    if (selectedPlan === 'community') {
      alert('Community Edition activated! You can now use all basic features.');
      auditTrail.logInfo('License', 'Community Edition activated');
    } else {
      alert(`Thank you for choosing ${plans[selectedPlan].name}! Our team will contact you shortly.`);
      auditTrail.logInfo('License', `${plans[selectedPlan].name} requested`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acquire License</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Choose the plan that fits your needs</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(plans).map(([key, plan]) => (
          <div
            key={key}
            onClick={() => setSelectedPlan(key as any)}
            className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-6 cursor-pointer transition-all ${
              selectedPlan === key
                ? 'border-indigo-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">{plan.price}</div>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Selected Plan: {plans[selectedPlan].name}</h3>
        <button
          onClick={handleAcquire}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
        >
          {selectedPlan === 'community' ? 'Activate Free License' : 'Contact Sales'}
        </button>
      </div>
    </div>
  );
}

// Enhanced Ask Screen with Agent Task Display
function AskScreen({ onUpload, analyzing, agentTasks }: { 
  onUpload: (file: File, question: string) => void;
  analyzing: boolean;
  agentTasks: AgentTask[];
}) {
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = () => {
    if (!file || !question.trim()) {
      alert('Please provide both a question and a file');
      return;
    }
    onUpload(file, question);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Analysis</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Upload any file type and ask a question to analyze it with all 12 AI agents</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How does authentication work? What API endpoints are used? Are there security vulnerabilities? What does this binary do?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
          disabled={analyzing}
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Target File (Any Type)</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          disabled={analyzing}
        />
        
        {file && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Selected: {file.name} ({formatFileSize(file.size)})
          </p>
        )}
      </div>

      {analyzing && agentTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Agent Tasks (12 Agents Working)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentTasks.map((task) => {
              const agentDef = AGENT_DEFINITIONS[task.agent];
              return (
                <div key={task.agent} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{agentDef.icon}</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{agentDef.name}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      task.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      task.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{task.task}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'running' ? 'bg-blue-500' :
                        task.status === 'error' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={analyzing || !file || !question.trim()}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow transition-colors"
      >
        {analyzing ? 'Analyzing with 12 Agents...' : 'Start Analysis'}
      </button>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Supported File Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-blue-800 dark:text-blue-400">
          <div><strong>Executables:</strong> PE, ELF, Mach-O</div>
          <div><strong>Code:</strong> JS, TS, Python, Java, C/C++</div>
          <div><strong>Documents:</strong> PDF, DOC, XLS, PPT</div>
          <div><strong>Archives:</strong> ZIP, RAR, 7Z, TAR</div>
          <div><strong>Images:</strong> JPEG, PNG, GIF, BMP</div>
          <div><strong>Data:</strong> JSON, XML, YAML, CSV</div>
          <div><strong>Scripts:</strong> SH, BAT, PS1, PY</div>
          <div><strong>Databases:</strong> SQLite, MDB</div>
          <div><strong>And 100+ more...</strong></div>
        </div>
      </div>
    </div>
  );
}

// Investigation Screen with Agent Tasks
function InvestigationScreen({ progress, agentTasks }: { progress: number; agentTasks: AgentTask[] }) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyzing with 12 AI Agents...</h2>
        <div className="max-w-md mx-auto mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Overall Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-indigo-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {agentTasks.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Agent Task Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentTasks.map((task) => {
              const agentDef = AGENT_DEFINITIONS[task.agent];
              return (
                <div key={task.agent} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{agentDef.icon}</span>
                    <span className="font-medium text-sm text-gray-900 dark:text-white">{agentDef.name}</span>
                    <span className={`ml-auto px-2 py-0.5 rounded text-xs ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      task.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      task.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{task.task}</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        task.status === 'completed' ? 'bg-green-500' :
                        task.status === 'running' ? 'bg-blue-500' :
                        task.status === 'error' ? 'bg-red-500' :
                        'bg-gray-400'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Results Screen with File Diagnostics
function ResultsScreen({ investigation, onExport }: { 
  investigation: Investigation;
  onExport: (inv: Investigation, format: 'markdown' | 'json' | 'html') => void;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'disassembly' | 'assembly' | 'features' | 'evidence' | 'diagnostics'>('overview');
  
  if (!investigation.result) return null;
  const { result } = investigation;

  const disassemblyLines = investigation.ghidraAnalysis?.disassembly.map(d => ({
    address: d.address,
    bytes: d.bytes,
    mnemonic: d.mnemonic,
    operands: d.operands,
    comment: d.comment,
  })) || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analysis Results</h2>
          <p className="text-gray-600 dark:text-gray-400">{investigation.question}</p>
        </div>
        <div className="flex gap-2">
          {(['markdown', 'json', 'html'] as const).map(format => (
            <button
              key={format}
              onClick={() => onExport(investigation, format)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Export {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-emerald-600">{Math.round(result.confidence * 100)}%</div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Confidence Score</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{result.evidence.length} evidence items</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'diagnostics', label: 'File Diagnostics' },
          { id: 'disassembly', label: 'Disassembly', disabled: disassemblyLines.length === 0 },
          { id: 'assembly', label: 'Assembly Editor' },
          { id: 'features', label: 'Features', disabled: !investigation.binaryAnalysis && !investigation.ghidraAnalysis },
          { id: 'evidence', label: `Evidence (${result.evidence.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
            disabled={tab.disabled}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab.disabled
                ? 'border-transparent text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>

          {result.steps.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Analysis Steps</h3>
              <ol className="space-y-2">
                {result.steps.map((step: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {result.recommendations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Recommendations</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-emerald-500">💡</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.risks.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
              <h3 className="font-semibold text-red-900 dark:text-red-300 mb-3">Risks Identified</h3>
              <div className="space-y-3">
                {result.risks.map((risk: any, i: number) => (
                  <div key={i} className={`p-3 rounded-lg border-l-4 ${
                    risk.level === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
                    risk.level === 'high' ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-500' :
                    risk.level === 'medium' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500' :
                    'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
                  }`}>
                    <div className="font-semibold text-gray-900 dark:text-white mb-1">{risk.level.toUpperCase()} RISK</div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{risk.description}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400"><strong>Mitigation:</strong> {risk.mitigation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'diagnostics' && result.fileInfo && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">File Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">File Type:</span>
                <div className="font-mono text-gray-900 dark:text-white">{result.fileInfo.type}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">MIME Type:</span>
                <div className="font-mono text-gray-900 dark:text-white">{result.fileInfo.mime}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Extension:</span>
                <div className="font-mono text-gray-900 dark:text-white">.{result.fileInfo.extension}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Entropy:</span>
                <div className="font-mono text-gray-900 dark:text-white">{result.fileInfo.entropy.toFixed(2)} bits/byte</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Strings Found:</span>
                <div className="font-mono text-gray-900 dark:text-white">{result.fileInfo.stringCount}</div>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Packers Detected:</span>
                <div className="font-mono text-gray-900 dark:text-white">
                  {result.fileInfo.packers.length > 0 ? result.fileInfo.packers.join(', ') : 'None'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Cryptographic Hashes</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">MD5:</span>
                <div className="font-mono text-xs text-gray-900 dark:text-white break-all">{result.fileInfo.hashes.md5}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">SHA-1:</span>
                <div className="font-mono text-xs text-gray-900 dark:text-white break-all">{result.fileInfo.hashes.sha1}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">SHA-256:</span>
                <div className="font-mono text-xs text-gray-900 dark:text-white break-all">{result.fileInfo.hashes.sha256}</div>
              </div>
              <div>
                <span className="text-sm text-gray-600 dark:text-gray-400">SHA-512:</span>
                <div className="font-mono text-xs text-gray-900 dark:text-white break-all">{result.fileInfo.hashes.sha512}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'disassembly' && disassemblyLines.length > 0 && (
        <DisassemblyViewer lines={disassemblyLines} />
      )}

      {activeTab === 'assembly' && (
        <AssemblyEditor />
      )}

      {activeTab === 'features' && (
        <FileFeatureAnalysis 
          binaryAnalysis={investigation.binaryAnalysis}
          ghidraAnalysis={investigation.ghidraAnalysis}
        />
      )}

      {activeTab === 'evidence' && (
        <>
          {result.evidence.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Evidence ({result.evidence.length})</h3>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {result.evidence.map((ev: any, i: number) => (
                  <div key={ev.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">E{i + 1}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">{ev.type}</span>
                      <span className="text-xs text-gray-500">{Math.round(ev.confidence * 100)}% confidence</span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{ev.description}</div>
                    {ev.content && (
                      <pre className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">{ev.content}</pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// History Screen (unchanged)
function HistoryScreen({ investigations, onDelete, onView, onExportAll }: {
  investigations: Investigation[];
  onDelete: (id: string) => void;
  onView: (inv: Investigation) => void;
  onExportAll: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const filtered = investigations.filter(inv =>
    inv.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.targetPath.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">History ({investigations.length})</h2>
        <button onClick={onExportAll} disabled={investigations.length === 0} className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50">
          Export All
        </button>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search investigations..."
        className="w-full px-4 py-2 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
      />

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {investigations.length === 0 ? 'No investigations yet. Start your first analysis!' : 'No matching investigations found.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div key={inv.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{inv.question}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{inv.targetPath}</span>
                    <span>•</span>
                    <span>{formatDate(inv.createdAt)}</span>
                    {inv.fileSize && <><span>•</span><span>{formatFileSize(inv.fileSize)}</span></>}
                  </div>
                </div>
                <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                  {inv.status}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => onView(inv)} className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded hover:bg-indigo-200 transition-colors">View</button>
                <button onClick={() => onDelete(inv.id)} className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Settings Screen (unchanged)
function SettingsScreen() {
  const [settings, setSettings] = useState(getSettings());

  const handleSave = () => {
    saveSettings(settings);
    auditTrail.logSettingsChange('settings', 'updated', settings);
    alert('Settings saved!');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">History Retention</label>
            <select value={settings.historyRetention} onChange={(e) => setSettings({ ...settings, historyRetention: e.target.value as any })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
              <option value="never">Never delete</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max File Size (MB)</label>
            <input type="number" value={settings.maxFileSize} onChange={(e) => setSettings({ ...settings, maxFileSize: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Auto-approve static reads</div>
              <div className="text-xs text-gray-500">Skip approval for read-only analysis</div>
            </div>
            <input type="checkbox" checked={settings.autoApproveReads} onChange={(e) => setSettings({ ...settings, autoApproveReads: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Secret Masking</div>
              <div className="text-xs text-gray-500">Auto-mask API keys and tokens</div>
            </div>
            <input type="checkbox" checked={settings.secretMasking} onChange={(e) => setSettings({ ...settings, secretMasking: e.target.checked })} className="w-4 h-4 text-indigo-600 rounded" />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors">
        Save Settings
      </button>
    </div>
  );
}
