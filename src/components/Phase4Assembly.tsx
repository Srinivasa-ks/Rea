import { useState } from 'react';

interface Phase4Config {
  licenseType: 'mit' | 'apache' | 'gpl' | 'proprietary';
  stabilityChecks: string[];
  buildConfig: string;
  outputFormat: 'exe' | 'dll' | 'lib' | 'source';
}

interface Phase4AssemblyProps {
  fixes: any;
  onComplete: (assemblyResult: any) => void;
  config: Phase4Config;
  onConfigChange: (config: Phase4Config) => void;
}

export function Phase4Assembly({ fixes, onComplete, config, onConfigChange }: Phase4AssemblyProps) {
  const [licenseType, setLicenseType] = useState<'mit' | 'apache' | 'gpl' | 'proprietary'>(config.licenseType);
  const [assemblyProgress, setAssemblyProgress] = useState(0);
  const [stabilityChecks, setStabilityChecks] = useState({
    compilation: false,
    tests: false,
    security: false,
    performance: false,
  });
  const [showConfig, setShowConfig] = useState(false);

  const handleAssemble = async () => {
    // Simulate assembly process
    for (let i = 0; i <= 100; i += 5) {
      setAssemblyProgress(i);
      
      if (i === 20) {
        setStabilityChecks(prev => ({ ...prev, compilation: true }));
      } else if (i === 40) {
        setStabilityChecks(prev => ({ ...prev, tests: true }));
      } else if (i === 60) {
        setStabilityChecks(prev => ({ ...prev, security: true }));
      } else if (i === 80) {
        setStabilityChecks(prev => ({ ...prev, performance: true }));
      }
      
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  };

  const handleComplete = () => {
    onComplete({
      licenseType,
      assemblyComplete: true,
      stabilityChecks,
      totalFixes: fixes.totalFixes,
    });
  };

  const licenses = {
    mit: {
      name: 'MIT License',
      description: 'Permissive license allowing free use, modification, and distribution',
      permissions: ['Commercial use', 'Modification', 'Distribution', 'Private use'],
      conditions: ['Include copyright notice', 'Include license text'],
    },
    apache: {
      name: 'Apache License 2.0',
      description: 'Permissive license with patent grant',
      permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
      conditions: ['Include copyright notice', 'Include license text', 'State changes'],
    },
    gpl: {
      name: 'GNU GPL v3',
      description: 'Copyleft license requiring derivative works to be open source',
      permissions: ['Commercial use', 'Modification', 'Distribution', 'Patent use', 'Private use'],
      conditions: ['Include copyright notice', 'Include license text', 'Disclose source', 'Same license'],
    },
    proprietary: {
      name: 'Proprietary License',
      description: 'Custom license with restricted rights',
      permissions: ['Commercial use', 'Private use'],
      conditions: ['Custom terms apply'],
    },
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Phase 4: Assembly & Licensing
          </h2>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showConfig ? 'Hide' : 'Show'} Configuration
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Assemble modified code, apply license, ensure stability, and prepare for deployment
        </p>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⚙️ Phase 4 Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* License & Build */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                License Type
              </label>
              <select
                value={config.licenseType}
                onChange={(e) => {
                  const newLicense = e.target.value as any;
                  setLicenseType(newLicense);
                  onConfigChange({ ...config, licenseType: newLicense });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="mit">MIT License</option>
                <option value="apache">Apache 2.0</option>
                <option value="gpl">GNU GPL v3</option>
                <option value="proprietary">Proprietary</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
                Build Configuration
              </label>
              <select
                value={config.buildConfig}
                onChange={(e) => onConfigChange({ ...config, buildConfig: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="debug">Debug (with symbols)</option>
                <option value="release">Release (optimized)</option>
                <option value="production">Production (minified)</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
                Output Format
              </label>
              <select
                value={config.outputFormat}
                onChange={(e) => onConfigChange({ ...config, outputFormat: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="exe">Executable (.exe)</option>
                <option value="dll">Dynamic Library (.dll)</option>
                <option value="lib">Static Library (.lib)</option>
                <option value="source">Source Code Only</option>
              </select>
            </div>

            {/* Stability Checks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stability Checks to Run
              </label>
              <div className="space-y-2">
                {['compilation', 'tests', 'security', 'performance', 'compatibility', 'memory'].map(check => (
                  <label key={check} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.stabilityChecks.includes(check)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onConfigChange({ ...config, stabilityChecks: [...config.stabilityChecks, check] });
                        } else {
                          onConfigChange({ ...config, stabilityChecks: config.stabilityChecks.filter(c => c !== check) });
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{check}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assembly Progress */}
      {assemblyProgress > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Assembly Progress</h3>
            <span className="text-2xl font-bold text-indigo-600">{assemblyProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${assemblyProgress}%` }}
            />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-3 rounded-lg border-2 ${stabilityChecks.compilation ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Compilation</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stabilityChecks.compilation ? '✅ Passed' : '⏳ Pending'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border-2 ${stabilityChecks.tests ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Tests</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stabilityChecks.tests ? '✅ Passed' : '⏳ Pending'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border-2 ${stabilityChecks.security ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Security</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stabilityChecks.security ? '✅ Passed' : '⏳ Pending'}
              </div>
            </div>
            <div className={`p-3 rounded-lg border-2 ${stabilityChecks.performance ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Performance</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {stabilityChecks.performance ? '✅ Passed' : '⏳ Pending'}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* License Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            📜 Select License
          </h3>
          <div className="space-y-3">
            {Object.entries(licenses).map(([key, license]) => (
              <div
                key={key}
                onClick={() => setLicenseType(key as any)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  licenseType === key
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">{license.name}</h4>
                  {licenseType === key && (
                    <span className="text-indigo-600 dark:text-indigo-400">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{license.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  <strong>Permissions:</strong> {license.permissions.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assembly Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            🔨 Assembly Summary
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Fixes Applied</div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{fixes.totalFixes}</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Selected License</div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{licenses[licenseType].name}</div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Stability Checks</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Compilation</span>
                  <span className={stabilityChecks.compilation ? 'text-green-600' : 'text-gray-400'}>
                    {stabilityChecks.compilation ? '✅ Pass' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Tests</span>
                  <span className={stabilityChecks.tests ? 'text-green-600' : 'text-gray-400'}>
                    {stabilityChecks.tests ? '✅ Pass' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Security</span>
                  <span className={stabilityChecks.security ? 'text-green-600' : 'text-gray-400'}>
                    {stabilityChecks.security ? '✅ Pass' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Performance</span>
                  <span className={stabilityChecks.performance ? 'text-green-600' : 'text-gray-400'}>
                    {stabilityChecks.performance ? '✅ Pass' : '⏳ Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          🚀 Assembly Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleAssemble}
            disabled={assemblyProgress > 0 && assemblyProgress < 100}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {assemblyProgress === 0 ? 'Start Assembly' : assemblyProgress < 100 ? 'Assembling...' : 'Assembly Complete'}
          </button>
          <button
            disabled={assemblyProgress < 100}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            Generate Report
          </button>
          <button
            disabled={assemblyProgress < 100}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            Create New App
          </button>
        </div>
      </div>

      {/* Continue Button */}
      {assemblyProgress === 100 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
          >
            Continue to Phase 5: Summary →
          </button>
        </div>
      )}
    </div>
  );
}
