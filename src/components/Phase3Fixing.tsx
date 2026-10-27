import { useState } from 'react';

interface Phase3Config {
  autoFixSeverity: 'all' | 'high' | 'medium' | 'low';
  customTemplates: string[];
  validationRules: string[];
  enableRollback: boolean;
}

interface Phase3FixingProps {
  decodingResult: any;
  onComplete: (fixes: any) => void;
  config: Phase3Config;
  onConfigChange: (config: Phase3Config) => void;
}

export function Phase3Fixing({ decodingResult, onComplete, config, onConfigChange }: Phase3FixingProps) {
  const [selectedFixes, setSelectedFixes] = useState<number[]>([]);
  const [customFixes, setCustomFixes] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [fixingProgress, setFixingProgress] = useState(0);
  const [showConfig, setShowConfig] = useState(false);

  const toggleFix = (id: number) => {
    setSelectedFixes(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const addCustomFix = () => {
    if (newFeature.trim()) {
      setCustomFixes(prev => [...prev, newFeature]);
      setNewFeature('');
    }
  };

  const removeCustomFix = (index: number) => {
    setCustomFixes(prev => prev.filter((_, i) => i !== index));
  };

  const handleApplyFixes = async () => {
    // Simulate applying fixes
    for (let i = 0; i <= 100; i += 10) {
      setFixingProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    onComplete({
      selectedFixes,
      customFixes,
      totalFixes: selectedFixes.length + customFixes.length,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Phase 3: Fixing & Modification
          </h2>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showConfig ? 'Hide' : 'Show'} Configuration
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Add, remove, modify, or update features based on analysis
        </p>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⚙️ Phase 3 Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto-fix Settings */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Auto-fix Severity Threshold
              </label>
              <select
                value={config.autoFixSeverity}
                onChange={(e) => onConfigChange({ ...config, autoFixSeverity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="all">Fix all vulnerabilities</option>
                <option value="high">High severity only</option>
                <option value="medium">Medium and high</option>
                <option value="low">Low, medium, and high</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
                Validation Rules
              </label>
              <div className="space-y-2">
                {['syntax', 'security', 'performance', 'compatibility'].map(rule => (
                  <label key={rule} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.validationRules.includes(rule)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onConfigChange({ ...config, validationRules: [...config.validationRules, rule] });
                        } else {
                          onConfigChange({ ...config, validationRules: config.validationRules.filter(r => r !== rule) });
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{rule}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  checked={config.enableRollback}
                  onChange={(e) => onConfigChange({ ...config, enableRollback: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable rollback capability</span>
              </label>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom Fix Templates
              </label>
              <div className="space-y-2 mb-2">
                {config.customTemplates.map((template, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{template}</span>
                    <button
                      onClick={() => onConfigChange({ ...config, customTemplates: config.customTemplates.filter((_, idx) => idx !== i) })}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const template = prompt('Enter custom fix template:');
                  if (template) {
                    onConfigChange({ ...config, customTemplates: [...config.customTemplates, template] });
                  }
                }}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded transition-colors"
              >
                + Add Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixing Progress */}
      {fixingProgress > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Applying Fixes</h3>
            <span className="text-2xl font-bold text-indigo-600">{fixingProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${fixingProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Fixes */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            🔧 Recommended Fixes ({decodingResult.flaws.length})
          </h3>
          <div className="space-y-3">
            {decodingResult.flaws.map((flaw: any) => (
              <div
                key={flaw.id}
                onClick={() => toggleFix(flaw.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedFixes.includes(flaw.id)
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFixes.includes(flaw.id)}
                      onChange={() => toggleFix(flaw.id)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <h4 className="font-medium text-gray-900 dark:text-white">{flaw.title}</h4>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    flaw.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    flaw.severity === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  }`}>
                    {flaw.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{flaw.description}</p>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <strong>Fix:</strong> {flaw.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Modifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            ✏️ Custom Modifications
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add New Feature or Modification
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomFix()}
                placeholder="e.g., Add logging, Remove deprecated API, Update encryption..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <button
                onClick={addCustomFix}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {customFixes.map((fix, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <span className="text-sm text-gray-900 dark:text-white">{fix}</span>
                <button
                  onClick={() => removeCustomFix(i)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
            {customFixes.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No custom modifications added yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-6">
        <h3 className="font-semibold text-indigo-900 dark:text-indigo-300 mb-3">
          📋 Fix Summary
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Recommended Fixes:</span>
            <div className="font-bold text-indigo-600 dark:text-indigo-400">{selectedFixes.length}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Custom Modifications:</span>
            <div className="font-bold text-indigo-600 dark:text-indigo-400">{customFixes.length}</div>
          </div>
          <div>
            <span className="text-gray-600 dark:text-gray-400">Total Changes:</span>
            <div className="font-bold text-indigo-600 dark:text-indigo-400">{selectedFixes.length + customFixes.length}</div>
          </div>
        </div>
      </div>

      {/* Apply Button */}
      {(selectedFixes.length > 0 || customFixes.length > 0) && fixingProgress === 0 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleApplyFixes}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow transition-colors"
          >
            Apply All Fixes →
          </button>
        </div>
      )}

      {fixingProgress === 100 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => onComplete({ selectedFixes, customFixes })}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
          >
            Continue to Phase 4: Assembly →
          </button>
        </div>
      )}
    </div>
  );
}
