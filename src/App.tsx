import { useState } from 'react';
import { Icons } from './components/Icons';
import { Phase1Page } from './pages/Phase1Page';
import { Phase2Page } from './pages/Phase2Page';
import { Phase3Page } from './pages/Phase3Page';
import { Phase4Page } from './pages/Phase4Page';
import { Phase5Page } from './pages/Phase5Page';

export type Screen = 'upload' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'history' | 'sandbox' | 'settings';

// Dedicated page components for each phase
type WorkflowPhase = 'upload' | 'analysis' | 'decoding' | 'fixing' | 'assembly' | 'summary';

// Customization interfaces for each phase
interface Phase1Config {
  selectedAgents: string[];
  analysisDepth: 'quick' | 'standard' | 'deep';
  focusAreas: string[];
  fileTypeOverride: string;
}

interface Phase2Config {
  showDisassembly: boolean;
  showFeatures: boolean;
  showFlaws: boolean;
  showStrengths: boolean;
  showAttributes: boolean;
  disassemblyArch: 'x86' | 'x64' | 'arm' | 'auto';
  analysisDepth: 'basic' | 'detailed' | 'comprehensive';
}

interface Phase3Config {
  autoFixSeverity: 'all' | 'high' | 'medium' | 'low';
  customTemplates: string[];
  validationRules: string[];
  enableRollback: boolean;
}

interface Phase4Config {
  licenseType: 'mit' | 'apache' | 'gpl' | 'proprietary';
  stabilityChecks: string[];
  buildConfig: string;
  outputFormat: 'exe' | 'dll' | 'lib' | 'source';
}

interface Phase5Config {
  reportSections: string[];
  exportFormats: string[];
  detailLevel: 'summary' | 'detailed' | 'comprehensive';
  includeAuditTrail: boolean;
}

interface AnalysisResult {
  fileName: string;
  fileType: string;
  fileSize: number;
  question: string;
  confidence: number;
  evidenceCount: number;
  functionCount: number;
  stringCount: number;
  importCount: number;
  exportCount: number;
  sectionCount: number;
  risks: any[];
  recommendations: string[];
  summary: string;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [currentPhase, setCurrentPhase] = useState<WorkflowPhase>('upload');
  const [fileData, setFileData] = useState<{
    fileName: string;
    fileType: string;
    fileSize: number;
    question: string;
  } | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [decodingResult, setDecodingResult] = useState<any>(null);
  const [fixes, setFixes] = useState<any>(null);
  const [assemblyResult, setAssemblyResult] = useState<any>(null);
  
  // Customization states for each phase
  const [phase1Config, setPhase1Config] = useState<Phase1Config>({
    selectedAgents: ['all'],
    analysisDepth: 'standard',
    focusAreas: ['security', 'functionality'],
    fileTypeOverride: '',
  });
  
  const [phase2Config, setPhase2Config] = useState<Phase2Config>({
    showDisassembly: true,
    showFeatures: true,
    showFlaws: true,
    showStrengths: true,
    showAttributes: true,
    disassemblyArch: 'auto',
    analysisDepth: 'detailed',
  });
  
  const [phase3Config, setPhase3Config] = useState<Phase3Config>({
    autoFixSeverity: 'high',
    customTemplates: [],
    validationRules: ['syntax', 'security'],
    enableRollback: true,
  });
  
  const [phase4Config, setPhase4Config] = useState<Phase4Config>({
    licenseType: 'mit',
    stabilityChecks: ['compilation', 'tests', 'security', 'performance'],
    buildConfig: 'release',
    outputFormat: 'exe',
  });
  
  const [phase5Config, setPhase5Config] = useState<Phase5Config>({
    reportSections: ['overview', 'analysis', 'decoding', 'fixing', 'assembly'],
    exportFormats: ['html', 'json'],
    detailLevel: 'detailed',
    includeAuditTrail: true,
  });

  const handleFileUpload = (file: File, question: string) => {
    setFileData({
      fileName: file.name,
      fileType: file.type || 'Unknown',
      fileSize: file.size,
      question,
    });
    setCurrentPhase('analysis');
    setScreen('phase1');
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setCurrentPhase('decoding');
    setScreen('phase2');
  };

  const handleDecodingComplete = (result: any) => {
    setDecodingResult(result);
    setCurrentPhase('fixing');
    setScreen('phase3');
  };

  const handleFixingComplete = (result: any) => {
    setFixes(result);
    setCurrentPhase('assembly');
    setScreen('phase4');
  };

  const handleAssemblyComplete = (result: any) => {
    setAssemblyResult(result);
    setCurrentPhase('summary');
    setScreen('phase5');
  };

  const handleStartNew = () => {
    setCurrentPhase('upload');
    setScreen('upload');
    setFileData(null);
    setAnalysisResult(null);
    setDecodingResult(null);
    setFixes(null);
    setAssemblyResult(null);
  };

  // Navigate to a specific phase
  const navigateToPhase = (phase: Screen) => {
    setScreen(phase);
  };

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
              <div className="text-xs text-gray-500">v3.0.0</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {/* Workflow Phases */}
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Workflow Phases
            </div>
            {[
              { id: 'upload', label: 'New Analysis', icon: '📁', screen: 'upload' as Screen },
              { id: 'phase1', label: '1. Analysis', icon: '🔍', screen: 'phase1' as Screen },
              { id: 'phase2', label: '2. Decoding', icon: '🔬', screen: 'phase2' as Screen },
              { id: 'phase3', label: '3. Fixing', icon: '🔧', screen: 'phase3' as Screen },
              { id: 'phase4', label: '4. Assembly', icon: '🔨', screen: 'phase4' as Screen },
              { id: 'phase5', label: '5. Summary', icon: '📊', screen: 'phase5' as Screen },
            ].map((item) => {
              const isDisabled = item.screen !== 'upload' && !fileData;
              const isCompleted = item.screen === 'phase1' && analysisResult ||
                                 item.screen === 'phase2' && decodingResult ||
                                 item.screen === 'phase3' && fixes ||
                                 item.screen === 'phase4' && assemblyResult;
              
              return (
                <button
                  key={item.id}
                  onClick={() => !isDisabled && navigateToPhase(item.screen)}
                  disabled={isDisabled}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                    screen === item.screen
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                      : isDisabled
                      ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {isCompleted && <span className="text-green-500">✓</span>}
                </button>
              );
            })}
          </div>

          {/* Other Pages */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              Other
            </div>
            {[
              { id: 'history', label: 'History', icon: <Icons.History />, screen: 'history' as Screen },
              { id: 'sandbox', label: 'Sandbox', icon: <Icons.Shield />, screen: 'sandbox' as Screen },
              { id: 'settings', label: 'Settings', icon: <Icons.Settings />, screen: 'settings' as Screen },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigateToPhase(item.screen)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-1 ${
                  screen === item.screen
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleStartNew}
            className="w-full px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
          >
            Start New Analysis
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {screen === 'upload' && (
          <UploadScreen onUpload={handleFileUpload} />
        )}
        {screen === 'phase1' && (
          <Phase1Page onNavigate={navigateToPhase} />
        )}
        {screen === 'phase2' && (
          <Phase2Page onNavigate={navigateToPhase} />
        )}
        {screen === 'phase3' && (
          <Phase3Page onNavigate={navigateToPhase} />
        )}
        {screen === 'phase4' && (
          <Phase4Page onNavigate={navigateToPhase} />
        )}
        {screen === 'phase5' && (
          <Phase5Page onNavigate={navigateToPhase} />
        )}
        {screen === 'history' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">History</h2>
            <p className="text-gray-600 dark:text-gray-400">History page content goes here...</p>
          </div>
        )}
        {screen === 'sandbox' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sandbox</h2>
            <p className="text-gray-600 dark:text-gray-400">Sandbox page content goes here...</p>
          </div>
        )}
        {screen === 'settings' && (
          <div className="max-w-7xl mx-auto px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Settings</h2>
            <p className="text-gray-600 dark:text-gray-400">Settings page content goes here...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function UploadScreen({ onUpload }: { onUpload: (file: File, question: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [question, setQuestion] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    if (file && question.trim()) {
      onUpload(file, question);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Start Reverse Engineering
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Upload any file and let 12 AI agents analyze it for you
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        {/* File Upload */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
              : 'border-gray-300 dark:border-gray-600'
          }`}
        >
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="text-4xl mb-3">📁</div>
            <div className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {file ? file.name : 'Drop your file here or click to browse'}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Supports all file types: PE, ELF, Mach-O, JS, Python, Java, C/C++, and more
            </div>
          </label>
        </div>

        {/* Question Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What would you like to know about this file?
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., How does authentication work? What are the security vulnerabilities? How can I modify this feature?"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            rows={4}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || !question.trim()}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow transition-colors"
        >
          Start 5-Phase Analysis →
        </button>

        {/* Info */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            🎯 What happens next?
          </h3>
          <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
            <div><strong>Phase 1:</strong> 12 AI agents analyze your file</div>
            <div><strong>Phase 2:</strong> Disassembly, feature analysis, flaw detection</div>
            <div><strong>Phase 3:</strong> Fix vulnerabilities and add features</div>
            <div><strong>Phase 4:</strong> Assemble, license, and stabilize</div>
            <div><strong>Phase 5:</strong> Comprehensive summary report</div>
          </div>
        </div>
      </div>
    </div>
  );
}
