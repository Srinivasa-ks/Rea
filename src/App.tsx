import { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { SandboxEnvironment } from './SandboxEnvironment';
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
import { generateReport, downloadReport, downloadFile } from './utils/reportGenerator';

type Screen = 'welcome' | 'ask' | 'investigation' | 'results' | 'history' | 'sandbox' | 'settings';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [darkMode, setDarkMode] = useState(false);
  const [acknowledged, setAcknowledgedState] = useState(hasAcknowledged());
  const [investigations, setInvestigations] = useState<Investigation[]>(getAllInvestigations());
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleAcknowledge = () => {
    setAcknowledged();
    setAcknowledgedState(true);
    setScreen('ask');
  };

  const handleFileUpload = async (file: File, question: string) => {
    setAnalyzing(true);
    setAnalysisProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const isBinary = isBinaryFile(uint8Array);
      
      let result: any;
      let binaryAnalysis: BinaryAnalysisResult | undefined;

      if (isBinary) {
        binaryAnalysis = await analyzeBinary(arrayBuffer, file.name);
        result = {
          summary: `Binary analysis complete. Type: ${binaryAnalysis.fileType}, Architecture: ${binaryAnalysis.architecture}, Entropy: ${binaryAnalysis.entropy.toFixed(2)} bits/byte. Found ${binaryAnalysis.strings.length} strings and ${binaryAnalysis.sections.length} sections.`,
          confidence: 0.95,
          evidence: binaryAnalysis.evidence,
          steps: [
            'Detected binary file format',
            `Identified: ${binaryAnalysis.fileType}`,
            `Architecture: ${binaryAnalysis.architecture}`,
            `Entropy: ${binaryAnalysis.entropy.toFixed(2)} bits/byte`,
            `Extracted ${binaryAnalysis.strings.length} strings`,
            `Parsed ${binaryAnalysis.sections.length} sections`,
          ],
          codeSnippets: [],
          recommendations: [
            'Verify file legitimacy with antivirus',
            'Review extracted strings for sensitive data',
            'Check imports for suspicious dependencies',
          ],
          risks: binaryAnalysis.risks,
        };
      } else {
        const content = await file.text();
        const fileType = detectFileType(file.name);
        result = await analyzeCode(content, { question, fileType });
      }

      const investigation: Investigation = {
        id: generateId(),
        question,
        targetPath: file.name,
        targetType: isBinary ? 'binary' : detectFileType(file.name),
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        fileSize: file.size,
        fileHash: calculateHash(String.fromCharCode(...uint8Array.slice(0, 1000))),
        result,
        binaryAnalysis,
      };

      saveInvestigation(investigation);
      setCurrentInvestigation(investigation);
      setInvestigations(getAllInvestigations());
      setScreen('results');
      setAnalyzing(false);
      setAnalysisProgress(100);
    } catch (err) {
      setAnalyzing(false);
      alert('Analysis failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
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
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Icons.Cpu />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">REA Agentic AI</div>
              <div className="text-xs text-gray-500">v2.0.0</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2">
          {[
            { id: 'ask', label: 'New Analysis', icon: <Icons.Search /> },
            { id: 'history', label: 'History', icon: <Icons.History />, count: investigations.length },
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

      <main className="flex-1 overflow-y-auto">
        {screen === 'ask' && <AskScreen onUpload={handleFileUpload} analyzing={analyzing} />}
        {screen === 'investigation' && <InvestigationScreen progress={analysisProgress} />}
        {screen === 'results' && currentInvestigation && (
          <ResultsScreen 
            investigation={currentInvestigation}
            onExport={(inv, format) => {
              const content = generateReport(inv, format);
              downloadReport(content, `investigation-${inv.id}`, format);
            }}
          />
        )}
        {screen === 'history' && (
          <HistoryScreen 
            investigations={investigations}
            onDelete={(id) => {
              deleteInvestigation(id);
              setInvestigations(getAllInvestigations());
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
        {screen === 'sandbox' && <SandboxEnvironment targetPath="/sandbox" />}
        {screen === 'settings' && <SettingsScreen />}
      </main>
    </div>
  );
}

function AskScreen({ onUpload, analyzing }: { onUpload: (file: File, question: string) => void; analyzing: boolean }) {
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
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">New Analysis</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Upload a file and ask a question to analyze it.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How does authentication work? What API endpoints are used? Are there security vulnerabilities?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
          disabled={analyzing}
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Target File</label>
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

      <button
        onClick={handleSubmit}
        disabled={analyzing || !file || !question.trim()}
        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg shadow transition-colors"
      >
        {analyzing ? 'Analyzing...' : 'Start Analysis'}
      </button>

      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Supported File Types</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• <strong>Code files:</strong> JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, PHP, Ruby</li>
          <li>• <strong>Binary files:</strong> PE (Windows), ELF (Linux), Mach-O (macOS), and more</li>
          <li>• <strong>Documents:</strong> PDF, JSON, XML, YAML, Markdown</li>
          <li>• <strong>Archives:</strong> ZIP, GZIP</li>
          <li>• <strong>Images:</strong> JPEG, PNG, GIF</li>
        </ul>
      </div>
    </div>
  );
}

function InvestigationScreen({ progress }: { progress: number }) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Analyzing...</h2>
        <div className="max-w-md mx-auto mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div className="bg-indigo-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultsScreen({ investigation, onExport }: { 
  investigation: Investigation;
  onExport: (inv: Investigation, format: 'markdown' | 'json' | 'html') => void;
}) {
  if (!investigation.result) return null;
  const { result } = investigation;

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
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

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
        <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
      </div>

      {result.steps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Analysis Steps</h3>
          <ol className="space-y-2">
            {result.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
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
            {result.evidence.map((ev, i) => (
              <div key={ev.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">E{i + 1}</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">{ev.type}</span>
                  <span className="text-xs text-gray-500">{Math.round(ev.confidence * 100)}% confidence</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">{ev.description}</div>
                {ev.content && (
                  <pre className="bg-gray-50 dark:bg-gray-900 rounded p-2 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">{ev.content}</pre>
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
            {result.recommendations.map((rec, i) => (
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
            {result.risks.map((risk, i) => (
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

      {investigation.binaryAnalysis && (
        <div className="mt-6 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Binary File Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-600 dark:text-gray-400">File Type:</span><div className="font-mono text-gray-900 dark:text-white">{investigation.binaryAnalysis.fileType}</div></div>
              <div><span className="text-gray-600 dark:text-gray-400">Architecture:</span><div className="font-mono text-gray-900 dark:text-white">{investigation.binaryAnalysis.architecture}</div></div>
              <div><span className="text-gray-600 dark:text-gray-400">Entropy:</span><div className="font-mono text-gray-900 dark:text-white">{investigation.binaryAnalysis.entropy.toFixed(2)} bits/byte</div></div>
              <div><span className="text-gray-600 dark:text-gray-400">Sections:</span><div className="font-mono text-gray-900 dark:text-white">{investigation.binaryAnalysis.sections.length}</div></div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Hex Dump (First 512 bytes)</h3>
            <pre className="bg-gray-900 text-green-400 rounded-lg p-4 text-xs font-mono overflow-x-auto">{investigation.binaryAnalysis.hexDump}</pre>
          </div>

          {investigation.binaryAnalysis.strings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Extracted Strings ({investigation.binaryAnalysis.strings.length})</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {investigation.binaryAnalysis.strings.slice(0, 50).map((str, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-xs text-gray-500 font-mono w-20">0x{str.offset.toString(16).padStart(8, '0')}</span>
                    <span className="text-sm text-gray-900 dark:text-white font-mono flex-1 break-all">{str.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
