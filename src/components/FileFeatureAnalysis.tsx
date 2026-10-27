import { BinaryAnalysisResult } from '../utils/binaryAnalyzer';
import { GhidraAnalysisResult } from '../utils/ghidraAnalyzer';

interface FileFeatureAnalysisProps {
  binaryAnalysis?: BinaryAnalysisResult;
  ghidraAnalysis?: GhidraAnalysisResult;
}

export function FileFeatureAnalysis({ binaryAnalysis, ghidraAnalysis }: FileFeatureAnalysisProps) {
  if (!binaryAnalysis && !ghidraAnalysis) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400 text-center">No analysis data available</p>
      </div>
    );
  }

  // Calculate feature scores
  const calculateFeatureScores = () => {
    const features = {
      networkCapabilities: 0,
      fileSystemAccess: 0,
      processManipulation: 0,
      registryAccess: 0,
      cryptoUsage: 0,
      antiDebugging: 0,
      packingEntropy: 0,
      complexity: 0,
    };

    if (ghidraAnalysis) {
      // Network capabilities
      const networkImports = ghidraAnalysis.imports.filter(imp => 
        imp.name.toLowerCase().includes('ws2_32') ||
        imp.name.toLowerCase().includes('wininet') ||
        imp.name.toLowerCase().includes('winhttp') ||
        imp.name.toLowerCase().includes('socket')
      );
      features.networkCapabilities = Math.min(100, networkImports.length * 25);

      // File system access
      const fsImports = ghidraAnalysis.imports.filter(imp =>
        imp.name.toLowerCase().includes('kernel32') ||
        imp.name.toLowerCase().includes('file') ||
        imp.name.toLowerCase().includes('createfile')
      );
      features.fileSystemAccess = Math.min(100, fsImports.length * 20);

      // Process manipulation
      const processImports = ghidraAnalysis.imports.filter(imp =>
        imp.name.toLowerCase().includes('createprocess') ||
        imp.name.toLowerCase().includes('openprocess') ||
        imp.name.toLowerCase().includes('terminat')
      );
      features.processManipulation = Math.min(100, processImports.length * 30);

      // Registry access
      const registryImports = ghidraAnalysis.imports.filter(imp =>
        imp.name.toLowerCase().includes('advapi32') ||
        imp.name.toLowerCase().includes('reg')
      );
      features.registryAccess = Math.min(100, registryImports.length * 25);

      // Crypto usage
      const cryptoStrings = ghidraAnalysis.strings.filter(str =>
        str.value.toLowerCase().includes('encrypt') ||
        str.value.toLowerCase().includes('decrypt') ||
        str.value.toLowerCase().includes('aes') ||
        str.value.toLowerCase().includes('rsa') ||
        str.value.toLowerCase().includes('hash')
      );
      features.cryptoUsage = Math.min(100, cryptoStrings.length * 20);

      // Anti-debugging
      const antiDebugStrings = ghidraAnalysis.strings.filter(str =>
        str.value.toLowerCase().includes('debug') ||
        str.value.toLowerCase().includes('breakpoint') ||
        str.value.toLowerCase().includes('isdebugger')
      );
      features.antiDebugging = Math.min(100, antiDebugStrings.length * 30);

      // Packing entropy
      const avgEntropy = ghidraAnalysis.sections.reduce((sum, sec) => sum + sec.entropy, 0) / ghidraAnalysis.sections.length;
      features.packingEntropy = Math.min(100, (avgEntropy / 8) * 100);

      // Complexity
      const avgComplexity = ghidraAnalysis.functions.reduce((sum, func) => sum + func.complexity, 0) / Math.max(1, ghidraAnalysis.functions.length);
      features.complexity = Math.min(100, (avgComplexity / 10) * 100);
    }

    return features;
  };

  const featureScores = calculateFeatureScores();

  const getFeatureColor = (score: number): string => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 25) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRiskLevel = (score: number): string => {
    if (score >= 75) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 25) return 'Low Risk';
    return 'Minimal Risk';
  };

  return (
    <div className="space-y-6">
      {/* Feature Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Feature Analysis</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(featureScores).map(([feature, score]) => (
            <div key={feature} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getRiskLevel(score)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getFeatureColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                {score}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Capabilities */}
      {ghidraAnalysis && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Detailed Capabilities</h3>
          
          {/* Network Capabilities */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Network Capabilities
            </h4>
            <div className="space-y-1">
              {ghidraAnalysis.imports
                .filter(imp => 
                  imp.name.toLowerCase().includes('ws2_32') ||
                  imp.name.toLowerCase().includes('wininet') ||
                  imp.name.toLowerCase().includes('winhttp')
                )
                .slice(0, 5)
                .map((imp, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-mono">{imp.name}</span>
                  </div>
                ))}
              {ghidraAnalysis.imports.filter(imp => 
                imp.name.toLowerCase().includes('ws2_32') ||
                imp.name.toLowerCase().includes('wininet')
              ).length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No network-related imports detected
                </div>
              )}
            </div>
          </div>

          {/* File System Access */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              File System Access
            </h4>
            <div className="space-y-1">
              {ghidraAnalysis.strings
                .filter(str => 
                  str.value.includes('\\') || 
                  str.value.includes('/') ||
                  str.value.toLowerCase().includes('file')
                )
                .slice(0, 5)
                .map((str, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="font-mono truncate max-w-md">{str.value}</span>
                  </div>
                ))}
              {ghidraAnalysis.strings.filter(str => 
                str.value.includes('\\') || str.value.includes('/')
              ).length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No file path strings detected
                </div>
              )}
            </div>
          </div>

          {/* Cryptographic Usage */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Cryptographic Usage
            </h4>
            <div className="space-y-1">
              {ghidraAnalysis.strings
                .filter(str => 
                  str.value.toLowerCase().includes('encrypt') ||
                  str.value.toLowerCase().includes('decrypt') ||
                  str.value.toLowerCase().includes('aes') ||
                  str.value.toLowerCase().includes('rsa') ||
                  str.value.toLowerCase().includes('hash') ||
                  str.value.toLowerCase().includes('crypto')
                )
                .slice(0, 5)
                .map((str, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-mono">{str.value}</span>
                  </div>
                ))}
              {ghidraAnalysis.strings.filter(str => 
                str.value.toLowerCase().includes('encrypt') ||
                str.value.toLowerCase().includes('crypto')
              ).length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No cryptographic strings detected
                </div>
              )}
            </div>
          </div>

          {/* Anti-Analysis Techniques */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Anti-Analysis Techniques
            </h4>
            <div className="space-y-1">
              {ghidraAnalysis.strings
                .filter(str => 
                  str.value.toLowerCase().includes('debug') ||
                  str.value.toLowerCase().includes('breakpoint') ||
                  str.value.toLowerCase().includes('vmware') ||
                  str.value.toLowerCase().includes('virtual') ||
                  str.value.toLowerCase().includes('sandbox')
                )
                .slice(0, 5)
                .map((str, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span className="font-mono">{str.value}</span>
                  </div>
                ))}
              {ghidraAnalysis.strings.filter(str => 
                str.value.toLowerCase().includes('debug') ||
                str.value.toLowerCase().includes('virtual')
              ).length === 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400 italic">
                  No anti-analysis techniques detected
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Security Recommendations</h3>
        <div className="space-y-3">
          {featureScores.networkCapabilities >= 50 && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="text-blue-500 mt-0.5">ℹ️</span>
              <div>
                <div className="font-medium text-blue-900 dark:text-blue-300 text-sm">
                  Network Activity Detected
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-400">
                  Monitor network connections and verify legitimate communication endpoints.
                </div>
              </div>
            </div>
          )}
          
          {featureScores.cryptoUsage >= 50 && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <span className="text-purple-500 mt-0.5">🔐</span>
              <div>
                <div className="font-medium text-purple-900 dark:text-purple-300 text-sm">
                  Cryptographic Operations
                </div>
                <div className="text-sm text-purple-800 dark:text-purple-400">
                  Verify encryption implementation and key management practices.
                </div>
              </div>
            </div>
          )}
          
          {featureScores.antiDebugging >= 50 && (
            <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="text-red-500 mt-0.5">⚠️</span>
              <div>
                <div className="font-medium text-red-900 dark:text-red-300 text-sm">
                  Anti-Debugging Detected
                </div>
                <div className="text-sm text-red-800 dark:text-red-400">
                  Use advanced debugging techniques and consider dynamic analysis in VM.
                </div>
              </div>
            </div>
          )}
          
          {featureScores.packingEntropy >= 75 && (
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span className="text-orange-500 mt-0.5">📦</span>
              <div>
                <div className="font-medium text-orange-900 dark:text-orange-300 text-sm">
                  High Entropy (Possible Packing)
                </div>
                <div className="text-sm text-orange-800 dark:text-orange-400">
                  Consider unpacking before analysis. Use memory dumping techniques.
                </div>
              </div>
            </div>
          )}

          {featureScores.processManipulation >= 50 && (
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <span className="text-yellow-500 mt-0.5">⚙️</span>
              <div>
                <div className="font-medium text-yellow-900 dark:text-yellow-300 text-sm">
                  Process Manipulation
                </div>
                <div className="text-sm text-yellow-800 dark:text-yellow-400">
                  Monitor for process injection, code injection, or process hollowing.
                </div>
              </div>
            </div>
          )}

          {Object.values(featureScores).every(score => score < 25) && (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="text-green-500 mt-0.5">✓</span>
              <div>
                <div className="font-medium text-green-900 dark:text-green-300 text-sm">
                  Low Risk Profile
                </div>
                <div className="text-sm text-green-800 dark:text-green-400">
                  No significant suspicious features detected. Standard analysis sufficient.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
