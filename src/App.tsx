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
  importInvestigations,
} from './utils/storage';
import { downloadFile } from './utils/reportGenerator';
import { analyzeCode, detectFileType } from './utils/analyzer';
import { generateReport, downloadReport } from './utils/reportGenerator';

type Screen = 'welcome' | 'ask' | 'investigation' | 'results' | 'history' | 'sandbox' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [darkMode, setDarkMode] = useState(false);
  const [acknowledged, setAcknowledgedState] = useState(hasAcknowledged());
  const [investigations, setInvestigations] = useState<RealInvestigation[]>(getAllInvestigations());
  const [currentInvestigation, setCurrentInvestigation] = useState<RealInvestigation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleAcknowledge = () => {
    setAcknowledged();
    setAcknowledgedState(true);
  };

  const handleFileUpload = async (file: File, question: string) => {
    setError(null);
    setAnalyzing(true);

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

      // Perform analysis
      const result = await analyzeCode(content, { question, fileType });

      const completedInvestigation: RealInvestigation = {
        ...investigation,
        status: 'completed',
        completedAt: new Date().toISOString(),
        result,
      };

      saveInvestigation(completedInvestigation);
      setCurrentInvestigation(completedInvestigation);
      setInvestigations(getAllInvestigations());
      setScreen('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
      setScreen('ask');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteInvestigation = (id: string) => {
    if (confirm('Are you sure you want to delete this investigation?')) {
      deleteInvestigation(id);
      setInvestigations(getAllInvestigations());
    }
  };

  const handleExportInvestigation = (investigation: RealInvestigation, format: 'markdown' | 'json' | 'html') => {
    const content = generateReport(investigation, format);
    const filename = `investigation-${investigation.id}`;
    downloadReport(content, filename, format);
  };

  const handleExportAll = () => {
    const data = exportInvestigations();
    downloadFile(data, 'all-investigations.json', 'application/json');
  };

  const handleImport = (json: string) => {
    try {
      importInvestigations(json);
      setInvestigations(getAllInvestigations());
      alert('Investigations imported successfully!');
    } catch (err) {
      alert('Failed to import: Invalid JSON format');
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

        <nav className="flex-1 p-2">
          {[
            { id: 'ask', label: 'New Investigation', icon: <Icons.Search /> },
            { id: 'history', label: 'History', icon: <Icons.History /> },
            { id: 'sandbox', label: 'Sandbox', icon: <Icons.Shield /> },
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
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'} relative`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {screen === 'ask' && (
          <AskScreen onUpload={handleFileUpload} analyzing={analyzing} error={error} />
        )}
        {screen === 'investigation' && currentInvestigation && (
          <InvestigationScreen investigation={currentInvestigation} />
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
        {screen === 'settings' && <SettingsScreen />}
      </main>
    </div>
  );
}

// Ask Screen with real file upload
function AskScreen({ onUpload, analyzing, error }: { 
  onUpload: (file: File, question: string) => void;
  analyzing: boolean;
  error: string | null;
}) {
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!file || !question.trim()) {
      alert('Please provide both a question and a file');
      return;
    }
    onUpload(file, question);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Investigation</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Upload a file and ask a question to analyze it.</p>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How does authentication work in this code? What API endpoints are used?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
          disabled={analyzing}
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
          Target File
        </label>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
            disabled={analyzing}
          />
        </div>
        {file && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Selected: {file.name} ({formatFileSize(file.size)})
          </p>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={analyzing || !file || !question.trim()}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow transition-colors"
      >
        {analyzing ? 'Analyzing...' : 'Start Investigation'}
      </button>
    </div>
  );
}

// Investigation Screen
function InvestigationScreen({ investigation }: { investigation: RealInvestigation }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyzing...</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{investigation.question}</p>
        <p className="text-sm text-gray-500">Target: {investigation.targetPath}</p>
      </div>
    </div>
  );
}

// Results Screen
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

// History Screen
function HistoryScreen({ investigations, onDelete, onExport, onExportAll, onImport, onView }: {
  investigations: RealInvestigation[];
  onDelete: (id: string) => void;
  onExport: (inv: RealInvestigation, format: 'markdown' | 'json' | 'html') => void;
  onExportAll: () => void;
  onImport: (json: string) => void;
  onView: (inv: RealInvestigation) => void;
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = investigations.filter(inv =>
    inv.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.targetPath.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search investigations..."
        className="w-full px-4 py-2 mb-6 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
      />

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
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  inv.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  inv.status === 'analyzing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
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
