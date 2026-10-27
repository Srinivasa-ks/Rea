import { useState } from 'react';

import { Screen } from '../App';

interface Phase3PageProps {
  onNavigate: (phase: Screen) => void;
}

export function Phase3Page({ onNavigate }: Phase3PageProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [fixSeverity, setFixSeverity] = useState('high');
  const [validationRules, setValidationRules] = useState(['syntax', 'security']);
  const [enableRollback, setEnableRollback] = useState(true);
  const [customTemplates, setCustomTemplates] = useState<string[]>([]);
  const [newTemplate, setNewTemplate] = useState('');

  const addTemplate = () => {
    if (newTemplate.trim()) {
      setCustomTemplates([...customTemplates, newTemplate.trim()]);
      setNewTemplate('');
    }
  };

  const removeTemplate = (index: number) => {
    setCustomTemplates(customTemplates.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔧 Phase 3: Fixing
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Add, remove, modify, or update features based on analysis
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Phase 3 Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fix Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Fix Settings</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Auto-fix Severity
                </label>
                <select
                  value={fixSeverity}
                  onChange={(e) => setFixSeverity(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="all">Fix all vulnerabilities</option>
                  <option value="high">High severity only</option>
                  <option value="medium">Medium and high</option>
                  <option value="low">Low, medium, and high</option>
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Validation Rules
                </label>
                <div className="space-y-2">
                  {['syntax', 'security', 'performance', 'compatibility'].map(rule => (
                    <label key={rule} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                      <input
                        type="checkbox"
                        checked={validationRules.includes(rule)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setValidationRules([...validationRules, rule]);
                          } else {
                            setValidationRules(validationRules.filter(r => r !== rule));
                          }
                        }}
                        className="w-5 h-5 text-indigo-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{rule}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={enableRollback}
                    onChange={(e) => setEnableRollback(e.target.checked)}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Enable Rollback</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Allow undoing changes</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Custom Templates */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Custom Fix Templates</h3>
              
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    placeholder="Enter template name..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={addTemplate}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {customTemplates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No custom templates added
                  </div>
                ) : (
                  customTemplates.map((template, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <span className="text-sm text-gray-900 dark:text-white">{template}</span>
                      <button
                        onClick={() => removeTemplate(index)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
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

      {/* Fixes List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Available Fixes</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-red-900 dark:text-red-300">Buffer Overflow Fix</div>
                <div className="text-sm text-red-800 dark:text-red-400">Add bounds checking at 0x00401050</div>
              </div>
              <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full text-xs font-medium">High</span>
            </div>
            <button className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors">
              Apply Fix
            </button>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-yellow-900 dark:text-yellow-300">Memory Leak Fix</div>
                <div className="text-sm text-yellow-800 dark:text-yellow-400">Add proper cleanup at function exit</div>
              </div>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-medium">Medium</span>
            </div>
            <button className="mt-3 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded-lg transition-colors">
              Apply Fix
            </button>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-semibold text-blue-900 dark:text-blue-300">Performance Optimization</div>
                <div className="text-sm text-blue-800 dark:text-blue-400">Cache frequently accessed data</div>
              </div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">Low</span>
            </div>
            <button className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
              Apply Fix
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onNavigate('phase2')}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          ← Back to Phase 2
        </button>
        <button
          onClick={() => onNavigate('phase4')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue to Phase 4: Assembly →
        </button>
      </div>
    </div>
  );
}
