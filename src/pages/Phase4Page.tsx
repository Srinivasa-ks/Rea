import { useState } from 'react';

import { Screen } from '../App';

interface Phase4PageProps {
  onNavigate: (phase: Screen) => void;
}

export function Phase4Page({ onNavigate }: Phase4PageProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [licenseType, setLicenseType] = useState('mit');
  const [buildConfig, setBuildConfig] = useState('release');
  const [outputFormat, setOutputFormat] = useState('exe');
  const [stabilityChecks, setStabilityChecks] = useState(['compilation', 'tests', 'security', 'performance']);

  const licenses = [
    { id: 'mit', name: 'MIT License', description: 'Permissive, minimal restrictions' },
    { id: 'apache', name: 'Apache 2.0', description: 'Permissive with patent grant' },
    { id: 'gpl', name: 'GNU GPL v3', description: 'Copyleft, requires source disclosure' },
    { id: 'proprietary', name: 'Proprietary', description: 'Custom license terms' },
  ];

  const buildConfigs = [
    { id: 'debug', name: 'Debug', description: 'With debug symbols, no optimization' },
    { id: 'release', name: 'Release', description: 'Optimized for performance' },
    { id: 'production', name: 'Production', description: 'Minified and fully optimized' },
  ];

  const outputFormats = [
    { id: 'exe', name: 'Executable (.exe)', description: 'Standalone application' },
    { id: 'dll', name: 'Dynamic Library (.dll)', description: 'Shared library' },
    { id: 'lib', name: 'Static Library (.lib)', description: 'Static library' },
    { id: 'source', name: 'Source Code Only', description: 'No compilation' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🔨 Phase 4: Assembly
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              License, build, and prepare for deployment
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Phase 4 Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">License Type</h3>
              <div className="space-y-2">
                {licenses.map(license => (
                  <label key={license.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="license"
                      checked={licenseType === license.id}
                      onChange={() => setLicenseType(license.id)}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{license.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{license.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Build Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Build Configuration</h3>
              <div className="space-y-2 mb-6">
                {buildConfigs.map(config => (
                  <label key={config.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="build"
                      checked={buildConfig === config.id}
                      onChange={() => setBuildConfig(config.id)}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{config.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{config.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Output Format</h3>
              <div className="space-y-2">
                {outputFormats.map(format => (
                  <label key={format.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="radio"
                      name="output"
                      checked={outputFormat === format.id}
                      onChange={() => setOutputFormat(format.id)}
                      className="w-5 h-5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{format.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Stability Checks</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['compilation', 'tests', 'security', 'performance', 'compatibility', 'memory'].map(check => (
                <label key={check} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="checkbox"
                    checked={stabilityChecks.includes(check)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setStabilityChecks([...stabilityChecks, check]);
                      } else {
                        setStabilityChecks(stabilityChecks.filter(c => c !== check));
                      }
                    }}
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{check}</span>
                </label>
              ))}
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

      {/* Assembly Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Assembly Status</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900 dark:text-white">License Applied</div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">Complete</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {licenses.find(l => l.id === licenseType)?.name}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900 dark:text-white">Build Configuration</div>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full text-xs font-medium">Complete</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {buildConfigs.find(c => c.id === buildConfig)?.name} - {outputFormats.find(f => f.id === outputFormat)?.name}
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-gray-900 dark:text-white">Stability Checks</div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full text-xs font-medium">Running</span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {stabilityChecks.length} checks enabled
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
            Start Assembly
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onNavigate('phase3')}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          ← Back to Phase 3
        </button>
        <button
          onClick={() => onNavigate('phase5')}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Continue to Phase 5: Summary →
        </button>
      </div>
    </div>
  );
}
