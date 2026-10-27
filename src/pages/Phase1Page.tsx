import { useState } from 'react';

import { Screen } from '../App';

interface Phase1PageProps {
  onNavigate: (phase: Screen) => void;
}

export function Phase1Page({ onNavigate }: Phase1PageProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['all']);
  const [analysisDepth, setAnalysisDepth] = useState('standard');
  const [focusAreas, setFocusAreas] = useState(['security', 'functionality']);

  const agents = [
    { id: 'orchestrator', name: 'Orchestrator', icon: '🎯', description: 'Coordinates investigation' },
    { id: 'triage', name: 'Triage', icon: '🔍', description: 'Classifies target type' },
    { id: 'web-js', name: 'Web/JS', icon: '🌐', description: 'Analyzes JavaScript' },
    { id: 'electron', name: 'Electron', icon: '⚡', description: 'Analyzes Electron apps' },
    { id: 'runtime', name: 'Runtime', icon: '👁️', description: 'Monitors behavior' },
    { id: 'native', name: 'Native', icon: '⚙️', description: 'Binary analysis' },
    { id: 'network', name: 'Network', icon: '🌍', description: 'Network traffic' },
    { id: 'evidence', name: 'Evidence', icon: '📋', description: 'Collects evidence' },
    { id: 'explainer', name: 'Explainer', icon: '💬', description: 'Synthesizes findings' },
    { id: 'reconstruction', name: 'Reconstruction', icon: '🔨', description: 'Creates guide' },
    { id: 'policy', name: 'Policy', icon: '🛡️', description: 'Safety checks' },
    { id: 'setup', name: 'Setup', icon: '🔧', description: 'System health' },
  ];

  const toggleAgent = (agentId: string) => {
    if (agentId === 'all') {
      setSelectedAgents(['all']);
    } else {
      const newAgents = selectedAgents.filter(a => a !== 'all');
      if (newAgents.includes(agentId)) {
        const updated = newAgents.filter(a => a !== agentId);
        setSelectedAgents(updated.length === 0 ? ['all'] : updated);
      } else {
        setSelectedAgents([...newAgents, agentId]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔍 Phase 1: Analysis
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              12 specialized AI agents analyze your file collaboratively
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Phase 1 Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Agents</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={selectedAgents.includes('all')}
                    onChange={() => toggleAgent('all')}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">All Agents (12)</span>
                </label>
                {agents.map(agent => (
                  <label key={agent.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedAgents.includes(agent.id)}
                      onChange={() => toggleAgent(agent.id)}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <span className="text-2xl">{agent.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{agent.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{agent.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Analysis Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Analysis Settings</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Analysis Depth
                </label>
                <select
                  value={analysisDepth}
                  onChange={(e) => setAnalysisDepth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="quick">Quick - Fast basic analysis</option>
                  <option value="standard">Standard - Balanced analysis</option>
                  <option value="deep">Deep - Comprehensive analysis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Focus Areas
                </label>
                <div className="space-y-2">
                  {['security', 'functionality', 'performance', 'network', 'ui', 'database'].map(area => (
                    <label key={area} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={focusAreas.includes(area)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFocusAreas([...focusAreas, area]);
                          } else {
                            setFocusAreas(focusAreas.filter(a => a !== area));
                          }
                        }}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
              Start Analysis
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

      {/* Agent Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Active Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => (
            <div key={agent.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{agent.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{agent.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{agent.description}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">Status: Ready</span>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onNavigate('upload')}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          ← Back to Upload
        </button>
        <button
          onClick={() => onNavigate('phase2')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue to Phase 2: Decoding →
        </button>
      </div>
    </div>
  );
}
