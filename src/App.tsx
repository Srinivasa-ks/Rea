import { useState } from 'react';
import { Icons } from './components/Icons';
import { Phase1Analysis } from './components/Phase1Analysis';
import { Phase2Decoding } from './components/Phase2Decoding';
import { Phase3Fixing } from './components/Phase3Fixing';
import { Phase4Assembly } from './components/Phase4Assembly';
import { Phase5Summary } from './components/Phase5Summary';

type WorkflowPhase = 'upload' | 'analysis' | 'decoding' | 'fixing' | 'assembly' | 'summary';

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

  const handleFileUpload = (file: File, question: string) => {
    setFileData({
      fileName: file.name,
      fileType: file.type || 'Unknown',
      fileSize: file.size,
      question,
    });
    setCurrentPhase('analysis');
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setCurrentPhase('decoding');
  };

  const handleDecodingComplete = (result: any) => {
    setDecodingResult(result);
    setCurrentPhase('fixing');
  };

  const handleFixingComplete = (result: any) => {
    setFixes(result);
    setCurrentPhase('assembly');
  };

  const handleAssemblyComplete = (result: any) => {
    setAssemblyResult(result);
    setCurrentPhase('summary');
  };

  const handleStartNew = () => {
    setCurrentPhase('upload');
    setFileData(null);
    setAnalysisResult(null);
    setDecodingResult(null);
    setFixes(null);
    setAssemblyResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
                <Icons.Cpu />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">REA Agentic AI</h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">Reverse Engineer Anything</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Ghidra MCP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Sandbox</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Phase Indicator */}
      {currentPhase !== 'upload' && (
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {[
                  { id: 'analysis', label: '1. Analysis', icon: '🔍' },
                  { id: 'decoding', label: '2. Decoding', icon: '🔬' },
                  { id: 'fixing', label: '3. Fixing', icon: '🔧' },
                  { id: 'assembly', label: '4. Assembly', icon: '🔨' },
                  { id: 'summary', label: '5. Summary', icon: '📊' },
                ].map((phase, index) => {
                  const phaseOrder = ['analysis', 'decoding', 'fixing', 'assembly', 'summary'];
                  const currentIndex = phaseOrder.indexOf(currentPhase);
                  const phaseIndex = phaseOrder.indexOf(phase.id);
                  const isActive = phase.id === currentPhase;
                  const isCompleted = phaseIndex < currentIndex;

                  return (
                    <div key={phase.id} className="flex items-center">
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
                        isActive ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' :
                        isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                      }`}>
                        <span>{phase.icon}</span>
                        <span className="text-sm font-medium">{phase.label}</span>
                        {isCompleted && <span>✓</span>}
                      </div>
                      {index < 4 && (
                        <div className={`w-8 h-0.5 mx-2 ${
                          phaseIndex < currentIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
              <button
                onClick={handleStartNew}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
              >
                Start New Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPhase === 'upload' && (
          <UploadScreen onUpload={handleFileUpload} />
        )}
        {currentPhase === 'analysis' && fileData && (
          <Phase1Analysis
            fileName={fileData.fileName}
            fileType={fileData.fileType}
            fileSize={fileData.fileSize}
            question={fileData.question}
            onComplete={handleAnalysisComplete}
          />
        )}
        {currentPhase === 'decoding' && analysisResult && (
          <Phase2Decoding
            analysisResult={analysisResult}
            onComplete={handleDecodingComplete}
          />
        )}
        {currentPhase === 'fixing' && decodingResult && (
          <Phase3Fixing
            decodingResult={decodingResult}
            onComplete={handleFixingComplete}
          />
        )}
        {currentPhase === 'assembly' && fixes && (
          <Phase4Assembly
            fixes={fixes}
            onComplete={handleAssemblyComplete}
          />
        )}
        {currentPhase === 'summary' && analysisResult && decodingResult && fixes && assemblyResult && fileData && (
          <Phase5Summary
            analysisResult={analysisResult}
            decodingResult={decodingResult}
            fixes={fixes}
            assemblyResult={assemblyResult}
            fileName={fileData.fileName}
          />
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
