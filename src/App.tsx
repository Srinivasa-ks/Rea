import { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { SandboxEnvironment } from './SandboxEnvironment';
import { 
  Investigation as RealInvestigation, 
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
import { analyzeCode, detectFileType, batchAnalyze } from './utils/analyzer';
import { generateReport, downloadReport, downloadFile } from './utils/reportGenerator';

type Screen = 'welcome' | 'ask' | 'investigation' | 'results' | 'history' | 'sandbox' | 'settings' | 'compare' | 'native' | 'mcp' | 'architecture' | 'logs' | 'approvals';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  timestamp: number;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [darkMode, setDarkMode] = useState(false);
  const [acknowledged, setAcknowledgedState] = useState(hasAcknowledged());
  const [investigations, setInvestigations] = useState<RealInvestigation[]>(getAllInvestigations());
  const [currentInvestigation, setCurrentInvestigation] = useState<RealInvestigation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setScreen('ask');
            break;
          case 'h':
            e.preventDefault();
            setScreen('history');
            break;
          case 's':
            e.preventDefault();
            setScreen('settings');
            break;
          case 'k':
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addNotification = (type: Notification['type'], message: string) => {
    const notification: Notification = {
      id: generateId(),
      type,
      message,
      timestamp: Date.now(),
    };
    setNotifications(prev => [...prev, notification]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  const handleAcknowledge = () => {
    setAcknowledged();
    setAcknowledgedState(true);
    addNotification('success', 'Welcome to REA Agentic AI!');
  };

  const handleFileUpload = async (file: File, question: string, depth: 'quick' | 'standard' | 'deep' = 'standard') => {
    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const content = await file.text();
      const fileType = detectFileType(file.name);
      const fileHash = calculateHash(content);

      const investigation: RealInvestigation = {
        id: generateId(),
        question,
        targetPath: file.name,
        targetType: fileType,
        status: 'analyzing',
        createdAt: new Date().toISOString(),
        fileSize: file.size,
        fileHash,
      };

      setCurrentInvestigation(investigation);
      setScreen('investigation');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Perform analysis
      const result = await analyzeCode(content, { question, fileType, depth });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const completedInvestigation: RealInvestigation = {
        ...investigation,
        status: 'completed',
        completedAt: new Date().toISOString(),
        result,
      };

      saveInvestigation(completedInvestigation);
      setCurrentInvestigation(completedInvestigation);
      setInvestigations(getAllInvestigations());
      
      setTimeout(() => {
        setScreen('results');
        setAnalyzing(false);
        setAnalysisProgress(0);
        addNotification('success', `Analysis complete! Found ${result.evidence.length} evidence items.`);
      }, 500);
    } catch (err) {
      setAnalyzing(false);
      setAnalysisProgress(0);
      addNotification('error', err instanceof Error ? err.message : 'Analysis failed');
      setScreen('ask');
    }
  };

  const handleBatchUpload = async (files: FileList, question: string) => {
    setAnalyzing(true);
    addNotification('info', `Starting batch analysis of ${files.length} files...`);

    try {
      const fileArray = Array.from(files);
      const filesWithContent = await Promise.all(
        fileArray.map(async f => ({
          name: f.name,
          content: await f.text(),
          size: f.size,
        }))
      );
      
      const results = await batchAnalyze(
        filesWithContent.map(f => ({ name: f.name, content: f.content })),
        question
      );

      // Save each result as a separate investigation
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const content = filesWithContent[i].content;
        const investigation: RealInvestigation = {
          id: generateId(),
          question: `${question} (${file.name})`,
          targetPath: file.name,
          targetType: detectFileType(file.name),
          status: 'completed',
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          fileSize: file.size,
          fileHash: calculateHash(content),
          result: results[i],
        };
        saveInvestigation(investigation);
      }

      setInvestigations(getAllInvestigations());
      setAnalyzing(false);
      addNotification('success', `Batch analysis complete! ${files.length} files analyzed.`);
      setScreen('history');
    } catch (err) {
      setAnalyzing(false);
      addNotification('error', 'Batch analysis failed');
    }
  };

  const handleDeleteInvestigation = (id: string) => {
    if (confirm('Are you sure you want to delete this investigation?')) {
      deleteInvestigation(id);
      setInvestigations(getAllInvestigations());
      addNotification('info', 'Investigation deleted');
    }
  };

  const handleExportInvestigation = (investigation: RealInvestigation, format: 'markdown' | 'json' | 'html') => {
    const content = generateReport(investigation, format);
    const filename = `investigation-${investigation.id}`;
    downloadReport(content, filename, format);
    addNotification('success', `Report exported as ${format.toUpperCase()}`);
  };

  const handleExportAll = () => {
    const data = exportInvestigations();
    downloadFile(data, 'all-investigations.json', 'application/json');
    addNotification('success', 'All investigations exported');
  };

  const handleImport = (json: string) => {
    try {
      const imported = JSON.parse(json);
      const existing = getAllInvestigations();
      const merged = [...imported, ...existing];
      const unique = merged.reduce((acc: RealInvestigation[], curr) => {
        if (!acc.find(i => i.id === curr.id)) {
          acc.push(curr);
        }
        return acc;
      }, []);
      localStorage.setItem('rea_investigations', JSON.stringify(unique));
      setInvestigations(getAllInvestigations());
      addNotification('success', `Imported ${imported.length} investigations`);
    } catch (err) {
      addNotification('error', 'Failed to import: Invalid JSON format');
    }
  };

  // Welcome Screen
  if (!acknowledged) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4">
              <Icons.Shield />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to REA Agentic AI</h1>
            <p className="text-gray-600 dark:text-gray-400">Reverse Engineer Anything - Locally, Safely, With Evidence</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-2">⚠️ Important Notice</h3>
            <p className="text-sm text-amber-800 dark:text-amber-400">
              This tool is for authorized analysis only. You must own or have permission to analyze any target. 
              REA Agentic AI will not assist with malware creation, exploit development, or attacks on third-party systems.
            </p>
          </div>

          <button
            onClick={handleAcknowledge}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            I Understand - Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
              notif.type === 'success' ? 'bg-emerald-500 text-white' :
              notif.type === 'error' ? 'bg-red-500 text-white' :
              notif.type === 'warning' ? 'bg-amber-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {notif.message}
          </div>
        ))}
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowKeyboardShortcuts(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>New Investigation</span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+N</kbd></div>
              <div className="flex justify-between"><span>History</span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+H</kbd></div>
              <div className="flex justify-between"><span>Settings</span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+S</kbd></div>
              <div className="flex justify-between"><span>Show Shortcuts</span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+K</kbd></div>
              <div className="flex justify-between"><span>Close Modal</span><kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd></div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Icons.Cpu />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">REA Agentic AI</div>
              <div className="text-xs text-gray-500">v1.0.0</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {[
            { id: 'ask', label: 'New Investigation', icon: <Icons.Search /> },
            { id: 'history', label: 'History', icon: <Icons.History />, badge: investigations.length },
            { id: 'sandbox', label: 'Sandbox', icon: <Icons.Shield /> },
            { id: 'native', label: 'Native Analysis', icon: <Icons.Cpu /> },
            { id: 'mcp', label: 'MCP Server', icon: <Icons.Link /> },
            { id: 'architecture', label: 'Architecture', icon: <Icons.Terminal /> },
            { id: 'logs', label: 'Logs', icon: <Icons.FileText /> },
            { id: 'approvals', label: 'Approvals', icon: <Icons.Bell />, badge: 2 },
            { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id as Screen)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                screen === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'} relative`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Press <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+K</kbd> for shortcuts
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {screen === 'ask' && (
          <AskScreen onUpload={handleFileUpload} onBatchUpload={handleBatchUpload} analyzing={analyzing} progress={analysisProgress} />
        )}
        {screen === 'investigation' && currentInvestigation && (
          <InvestigationScreen investigation={currentInvestigation} progress={analysisProgress} />
        )}
        {screen === 'results' && currentInvestigation && (
          <ResultsScreen 
            investigation={currentInvestigation} 
            onExport={handleExportInvestigation}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen 
            investigations={investigations}
            onDelete={handleDeleteInvestigation}
            onExport={handleExportInvestigation}
            onExportAll={handleExportAll}
            onImport={handleImport}
            onView={(inv) => {
              setCurrentInvestigation(inv);
              setScreen('results');
            }}
          />
        )}
        {screen === 'sandbox' && (
          <SandboxEnvironment targetPath="/targets/sample-app.js" />
        )}
        {screen === 'native' && <NativeScreen />}
        {screen === 'mcp' && <MCPScreen />}
        {screen === 'architecture' && <ArchitectureScreen />}
        {screen === 'logs' && <LogsScreen />}
        {screen === 'approvals' && <ApprovalsScreen />}
        {screen === 'settings' && <SettingsScreen />}
      </main>
    </div>
  );
}

// Ask Screen with batch upload and depth selection
function AskScreen({ onUpload, onBatchUpload, analyzing, progress }: { 
  onUpload: (file: File, question: string, depth: 'quick' | 'standard' | 'deep') => void;
  onBatchUpload: (files: FileList, question: string) => void;
  analyzing: boolean;
  progress: number;
}) {
  const [question, setQuestion] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [depth, setDepth] = useState<'quick' | 'standard' | 'deep'>('standard');
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (files.length === 0 || !question.trim()) {
      alert('Please provide both a question and at least one file');
      return;
    }
    
    if (mode === 'batch' && files.length > 1) {
      const fileList = {
        length: files.length,
        item: (index: number) => files[index],
      } as FileList;
      onBatchUpload(fileList, question);
    } else {
      onUpload(files[0], question, depth);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Investigation</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Upload files and ask questions to analyze them.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'single' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Single File
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'batch' ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            Batch Analysis
          </button>
        </div>

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How does authentication work? What API endpoints are used? Are there security vulnerabilities?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
          disabled={analyzing}
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
          {mode === 'batch' ? 'Target Files' : 'Target File'}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple={mode === 'batch'}
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
          disabled={analyzing}
        />
        
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((file, i) => (
              <p key={i} className="text-sm text-gray-600 dark:text-gray-400">
                {file.name} ({formatFileSize(file.size)})
              </p>
            ))}
          </div>
        )}

        {mode === 'single' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Analysis Depth
            </label>
            <div className="flex gap-2">
              {(['quick', 'standard', 'deep'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDepth(d)}
                  disabled={analyzing}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    depth === d ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {depth === 'quick' && 'Fast analysis with basic pattern matching'}
              {depth === 'standard' && 'Balanced analysis with comprehensive checks'}
              {depth === 'deep' && 'Thorough analysis with security audit and performance metrics'}
            </p>
          </div>
        )}
      </div>

      {analyzing && (
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Analyzing...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={analyzing || files.length === 0 || !question.trim()}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow transition-colors"
      >
        {analyzing ? 'Analyzing...' : mode === 'batch' ? `Start Batch Analysis (${files.length} files)` : 'Start Investigation'}
      </button>
    </div>
  );
}

// Investigation Screen with progress
function InvestigationScreen({ investigation, progress }: { investigation: RealInvestigation; progress: number }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyzing...</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{investigation.question}</p>
        <p className="text-sm text-gray-500 mb-6">Target: {investigation.targetPath}</p>
        
        <div className="max-w-md mx-auto">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Results Screen (same as before but with enhanced features)
function ResultsScreen({ investigation, onExport }: { 
  investigation: RealInvestigation;
  onExport: (inv: RealInvestigation, format: 'markdown' | 'json' | 'html') => void;
}) {
  if (!investigation.result) return null;

  const { result } = investigation;

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investigation Results</h2>
          <p className="text-gray-600 dark:text-gray-400">{investigation.question}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onExport(investigation, 'markdown')}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Export MD
          </button>
          <button
            onClick={() => onExport(investigation, 'json')}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Export JSON
          </button>
          <button
            onClick={() => onExport(investigation, 'html')}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Export HTML
          </button>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-emerald-600">{Math.round(result.confidence * 100)}%</div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">Confidence Score</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{result.evidence.length} evidence items found</div>
          </div>
        </div>
      </div>

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
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {result.evidence.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Evidence ({result.evidence.length})</h3>
          <div className="space-y-3">
            {result.evidence.map((ev: any, i: number) => (
              <div key={ev.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">E{i + 1}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                    {ev.type}
                  </span>
                  <span className="text-xs text-gray-500">{Math.round(ev.confidence * 100)}% confidence</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{ev.description}</div>
                {ev.content && (
                  <pre className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                    {ev.content}
                  </pre>
                )}
              </div>
            ))}
          </div>
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
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Mitigation:</strong> {risk.mitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// History Screen with advanced features
function HistoryScreen({ investigations, onDelete, onExport, onExportAll, onImport, onView }: {
  investigations: RealInvestigation[];
  onDelete: (id: string) => void;
  onExport: (inv: RealInvestigation, format: 'markdown' | 'json' | 'html') => void;
  onExportAll: () => void;
  onImport: (json: string) => void;
  onView: (inv: RealInvestigation) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'confidence'>('date');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'analyzing' | 'failed'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = investigations
    .filter(inv => {
      const matchesSearch = inv.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           inv.targetPath.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'name') return a.targetPath.localeCompare(b.targetPath);
      if (sortBy === 'confidence') return (b.result?.confidence || 0) - (a.result?.confidence || 0);
      return 0;
    });

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investigation History</h2>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Import
          </button>
          <button
            onClick={onExportAll}
            disabled={investigations.length === 0}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Export All
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search investigations..."
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="confidence">Sort by Confidence</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="analyzing">Analyzing</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          {investigations.length === 0 ? 'No investigations yet. Start your first investigation!' : 'No matching investigations found.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{inv.question}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>{inv.targetPath}</span>
                    <span>•</span>
                    <span>{formatDate(inv.createdAt)}</span>
                    {inv.fileSize && (
                      <>
                        <span>•</span>
                        <span>{formatFileSize(inv.fileSize)}</span>
                      </>
                    )}
                    {inv.result && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-600 font-medium">{Math.round(inv.result.confidence * 100)}% confidence</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  inv.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  inv.status === 'analyzing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  inv.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {inv.status}
                </span>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => onView(inv)}
                  className="px-3 py-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors"
                >
                  View
                </button>
                <button
                  onClick={() => onExport(inv, 'markdown')}
                  className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Export MD
                </button>
                <button
                  onClick={() => onDelete(inv.id)}
                  className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Native Analysis Screen
function NativeScreen() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Native Binary Analysis</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Ghidra-powered binary analysis and reverse engineering</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-12">
          <Icons.Cpu />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-4 mb-2">Ghidra Integration</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Native binary analysis requires Ghidra installation</p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Setup Ghidra
          </button>
        </div>
      </div>
    </div>
  );
}

// MCP Server Screen
function MCPScreen() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">MCP Server</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Model Context Protocol integration for AI assistants</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Connection Details</h3>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm">
          <div>Endpoint: <span className="text-indigo-600">http://localhost:3000/mcp</span></div>
          <div>Status: <span className="text-emerald-600">Active</span></div>
          <div>Protocol: <span className="text-gray-700 dark:text-gray-300">MCP v1.0</span></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Tools</h3>
        <div className="space-y-2">
          {['analyze_code', 'search_patterns', 'security_audit', 'performance_analysis', 'dependency_graph'].map(tool => (
            <div key={tool} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <span className="font-mono text-sm text-gray-900 dark:text-white">{tool}</span>
              <span className="text-xs text-emerald-600">Available</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Architecture Screen
function ArchitectureScreen() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Architecture</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">REA Agentic AI platform architecture and design</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <pre className="text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
{`┌─────────────────────────────────────────────────────────────┐
│                    REA Agentic AI                            │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React + TypeScript + Tailwind)                   │
│  ├─ Investigation UI                                        │
│  ├─ Results Viewer                                          │
│  ├─ History Manager                                         │
│  ├─ Sandbox Environment                                     │
│  └─ Settings Panel                                          │
├─────────────────────────────────────────────────────────────┤
│  Core Engine                                                │
│  ├─ Code Analyzer (Pattern Matching)                        │
│  ├─ Security Auditor                                        │
│  ├─ Performance Analyzer                                    │
│  ├─ Report Generator (MD/JSON/HTML)                         │
│  └─ Data Storage (localStorage)                             │
├─────────────────────────────────────────────────────────────┤
│  Integrations                                               │
│  ├─ MCP Server (AI Assistants)                              │
│  ├─ Ghidra (Native Binary Analysis)                         │
│  └─ File System API                                         │
└─────────────────────────────────────────────────────────────┘`}
        </pre>
      </div>
    </div>
  );
}

// Logs Screen
function LogsScreen() {
  const [logs] = useState([
    { timestamp: new Date().toISOString(), level: 'info', message: 'Application started' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'Storage initialized' },
    { timestamp: new Date().toISOString(), level: 'info', message: 'Analysis engine ready' },
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">System Logs</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Application logs and debugging information</p>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
              <span className={log.level === 'error' ? 'text-red-400' : log.level === 'warning' ? 'text-amber-400' : 'text-emerald-400'}>
                [{log.level.toUpperCase()}]
              </span>
              <span className="text-gray-300">{log.message}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Approvals Screen
function ApprovalsScreen() {
  const [approvals] = useState([
    { id: '1', action: 'Network Access', description: 'Allow API calls to external endpoints', status: 'pending' },
    { id: '2', action: 'File System Write', description: 'Write analysis results to disk', status: 'pending' },
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Approvals</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Pending actions requiring authorization</p>
      
      <div className="space-y-3">
        {approvals.map(approval => (
          <div key={approval.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{approval.action}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{approval.description}</p>
              </div>
              <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                Pending
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
                Approve
              </button>
              <button className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                Deny
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Settings Screen
function SettingsScreen() {
  const [settings, setSettings] = useState(getSettings());

  const handleSave = () => {
    saveSettings(settings);
    alert('Settings saved!');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">General</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              History Retention
            </label>
            <select
              value={settings.historyRetention}
              onChange={(e) => setSettings({ ...settings, historyRetention: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="never">Never delete</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Max File Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Auto-approve static reads</div>
              <div className="text-xs text-gray-500">Skip approval for read-only analysis</div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoApproveReads}
              onChange={(e) => setSettings({ ...settings, autoApproveReads: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Secret Masking</div>
              <div className="text-xs text-gray-500">Auto-mask API keys and tokens</div>
            </div>
            <input
              type="checkbox"
              checked={settings.secretMasking}
              onChange={(e) => setSettings({ ...settings, secretMasking: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
      >
        Save Settings
      </button>
    </div>
  );
}
