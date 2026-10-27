import { useState } from 'react';

import { Screen } from '../App';

interface Phase2PageProps {
  onNavigate: (phase: Screen) => void;
}

export function Phase2Page({ onNavigate }: Phase2PageProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState('disassembly');
  const [showDisassembly, setShowDisassembly] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);
  const [showFlaws, setShowFlaws] = useState(true);
  const [showStrengths, setShowStrengths] = useState(true);
  const [showAttributes, setShowAttributes] = useState(true);
  const [architecture, setArchitecture] = useState('auto');

  const tabs = [
    { id: 'disassembly', label: 'Disassembly', icon: '💻', enabled: showDisassembly },
    { id: 'features', label: 'Features', icon: '⚙️', enabled: showFeatures },
    { id: 'flaws', label: 'Flaws', icon: '⚠️', enabled: showFlaws },
    { id: 'strengths', label: 'Strengths', icon: '✅', enabled: showStrengths },
    { id: 'attributes', label: 'Attributes', icon: '📊', enabled: showAttributes },
  ];

  const enabledTabs = tabs.filter(tab => tab.enabled);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔬 Phase 2: Decoding
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Deep analysis with disassembly, feature detection, and vulnerability scanning
            </p>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            {showConfig ? 'Hide Configuration' : '⚙️ Show Configuration'}
          </button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Phase 2 Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tab Visibility */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Tabs</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={showDisassembly}
                    onChange={(e) => setShowDisassembly(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-2xl">💻</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Disassembly</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Interactive binary disassembly</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={showFeatures}
                    onChange={(e) => setShowFeatures(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-2xl">⚙️</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Features</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Detected capabilities</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={showFlaws}
                    onChange={(e) => setShowFlaws(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Flaws</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Vulnerabilities and issues</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={showStrengths}
                    onChange={(e) => setShowStrengths(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-2xl">✅</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Strengths</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Positive patterns</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={showAttributes}
                    onChange={(e) => setShowAttributes(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-2xl">📊</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Attributes</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Binary metadata</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Architecture Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Architecture</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="arch"
                    checked={architecture === 'auto'}
                    onChange={() => setArchitecture('auto')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Auto-detect</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Automatically detect architecture</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="arch"
                    checked={architecture === 'x86'}
                    onChange={() => setArchitecture('x86')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">x86 (32-bit)</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">32-bit x86 instructions</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="arch"
                    checked={architecture === 'x64'}
                    onChange={() => setArchitecture('x64')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">x64 (64-bit)</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">64-bit x86-64 instructions</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="arch"
                    checked={architecture === 'arm'}
                    onChange={() => setArchitecture('arm')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">ARM</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">ARM architecture</div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
              Apply Configuration
            </button>
            <button
              onClick={() => setShowConfig(false)}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Analysis Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {enabledTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 border-b-2 border-indigo-500'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === 'disassembly' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Disassembly View</h3>
              <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-100 overflow-x-auto">
                <div className="text-green-400">0x00401000: push ebp</div>
                <div className="text-blue-400">0x00401001: mov ebp, esp</div>
                <div className="text-yellow-400">0x00401003: sub esp, 0x20</div>
                <div className="text-purple-400">0x00401006: mov [ebp-0x4], 0x0</div>
                <div className="text-red-400">0x0040100D: call 0x00401100</div>
              </div>
            </div>
          )}
          {activeTab === 'features' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Detected Features</h3>
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">Network Communication</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">HTTP/HTTPS requests detected</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="font-semibold text-gray-900 dark:text-white">File I/O</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">File read/write operations</div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'flaws' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Identified Flaws</h3>
              <div className="space-y-3">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="font-semibold text-red-900 dark:text-red-300">Buffer Overflow</div>
                  <div className="text-sm text-red-800 dark:text-red-400">Potential buffer overflow at 0x00401050</div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'strengths' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Code Strengths</h3>
              <div className="space-y-3">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="font-semibold text-green-900 dark:text-green-300">Error Handling</div>
                  <div className="text-sm text-green-800 dark:text-green-400">Comprehensive error handling detected</div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'attributes' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Binary Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Architecture</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">x64</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Entropy</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">6.82</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onNavigate('phase1')}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          ← Back to Phase 1
        </button>
        <button
          onClick={() => onNavigate('phase3')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue to Phase 3: Fixing →
        </button>
      </div>
    </div>
  );
}
