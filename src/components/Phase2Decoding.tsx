import { useState } from 'react';
import { DisassemblyViewer } from './DisassemblyViewer';
import { FileFeatureAnalysis } from './FileFeatureAnalysis';

interface Phase2DecodingProps {
  analysisResult: any;
  onComplete: (decodingResult: any) => void;
}

export function Phase2Decoding({ analysisResult, onComplete }: Phase2DecodingProps) {
  const [activeTab, setActiveTab] = useState<'disassembly' | 'features' | 'flaws' | 'strengths' | 'attributes'>('disassembly');
  const [decodingProgress, setDecodingProgress] = useState(0);

  // Simulate decoding progress
  useState(() => {
    const interval = setInterval(() => {
      setDecodingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  });

  // Mock disassembly lines
  const disassemblyLines = [
    { address: '0x00401000', bytes: '55', mnemonic: 'push', operands: 'ebp', comment: 'Function prologue' },
    { address: '0x00401001', bytes: '89 E5', mnemonic: 'mov', operands: 'ebp, esp', comment: '' },
    { address: '0x00401003', bytes: '83 EC 20', mnemonic: 'sub', operands: 'esp, 0x20', comment: 'Allocate stack space' },
    { address: '0x00401006', bytes: 'C7 45 FC 00 00 00 00', mnemonic: 'mov', operands: '[ebp-0x4], 0x0', comment: 'Initialize variable' },
    { address: '0x0040100D', bytes: 'E8 00 00 00 00', mnemonic: 'call', operands: '0x00401100', comment: 'Call function' },
    { address: '0x00401012', bytes: '89 45 F8', mnemonic: 'mov', operands: '[ebp-0x8], eax', comment: 'Store result' },
    { address: '0x00401015', bytes: '83 7D F8 00', mnemonic: 'cmp', operands: '[ebp-0x8], 0x0', comment: 'Check result' },
    { address: '0x00401019', bytes: '74 0A', mnemonic: 'je', operands: '0x00401025', comment: 'Jump if zero' },
    { address: '0x0040101B', bytes: '8B 45 F8', mnemonic: 'mov', operands: 'eax, [ebp-0x8]', comment: 'Load result' },
    { address: '0x0040101E', bytes: '83 C4 20', mnemonic: 'add', operands: 'esp, 0x20', comment: 'Clean stack' },
    { address: '0x00401021', bytes: '5D', mnemonic: 'pop', operands: 'ebp', comment: 'Restore frame' },
    { address: '0x00401022', bytes: 'C3', mnemonic: 'ret', operands: '', comment: 'Return' },
  ];

  // Mock flaws
  const flaws = [
    {
      id: 1,
      severity: 'high',
      title: 'Buffer Overflow Vulnerability',
      description: 'Function at 0x00401000 does not validate input length before copying to buffer',
      location: '0x00401006 - mov [ebp-0x4], 0x0',
      impact: 'Potential code execution',
      recommendation: 'Add bounds checking before buffer operations',
    },
    {
      id: 2,
      severity: 'medium',
      title: 'Hardcoded Credentials',
      description: 'String "password123" found at offset 0x00402000',
      location: '0x00402000 - .data section',
      impact: 'Security risk if exposed',
      recommendation: 'Move credentials to secure storage',
    },
    {
      id: 3,
      severity: 'low',
      title: 'Unvalidated Network Input',
      description: 'Network data processed without validation at 0x00401100',
      location: '0x00401100 - recv() call',
      impact: 'Potential injection attacks',
      recommendation: 'Validate all network input',
    },
  ];

  // Mock strengths
  const strengths = [
    {
      id: 1,
      title: 'Proper Error Handling',
      description: 'All system calls check return values and handle errors appropriately',
      location: 'Multiple locations',
      benefit: 'Improved stability and debugging',
    },
    {
      id: 2,
      title: 'Memory Management',
      description: 'Proper allocation and deallocation of resources',
      location: '0x00401000 - 0x00401022',
      benefit: 'No memory leaks detected',
    },
    {
      id: 3,
      title: 'Input Validation',
      description: 'User input is validated before processing in most functions',
      location: '0x00401200 - validateInput()',
      benefit: 'Reduced attack surface',
    },
  ];

  // Mock attributes
  const attributes = {
    architecture: 'x86-64',
    compiler: 'GCC 11.3.0',
    language: 'C/C++',
    optimizations: 'O2',
    stripped: false,
    packed: false,
    encrypted: false,
    signed: true,
    sections: [
      { name: '.text', size: 4096, entropy: 6.2, type: 'code' },
      { name: '.data', size: 1024, entropy: 4.8, type: 'data' },
      { name: '.rodata', size: 512, entropy: 5.1, type: 'readonly' },
      { name: '.bss', size: 256, entropy: 0.0, type: 'uninitialized' },
      { name: '.rsrc', size: 2048, entropy: 5.5, type: 'resource' },
    ],
    imports: ['kernel32.dll', 'user32.dll', 'advapi32.dll', 'ws2_32.dll'],
    exports: ['main', 'processData', 'validateInput'],
    strings: 87,
    functions: 12,
  };

  const handleComplete = () => {
    onComplete({
      flaws,
      strengths,
      attributes,
      decodingComplete: true,
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Phase 2: Decoding & Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Deep analysis of {analysisResult.fileName} - Disassembly, Features, Flaws, Strengths & Attributes
        </p>
      </div>

      {/* Decoding Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Decoding Progress</h3>
          <span className="text-2xl font-bold text-indigo-600">{decodingProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${decodingProgress}%` }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'disassembly', label: 'Disassembly', icon: '💻' },
          { id: 'features', label: 'Features', icon: '⚙️' },
          { id: 'flaws', label: 'Flaws & Vulnerabilities', icon: '⚠️' },
          { id: 'strengths', label: 'Strengths', icon: '✅' },
          { id: 'attributes', label: 'Attributes', icon: '📊' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'disassembly' && (
        <div className="space-y-6">
          <DisassemblyViewer lines={disassemblyLines} />
          
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Disassembly Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-600">{disassemblyLines.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Instructions</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-600">{analysisResult.functionCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Functions</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-600">{analysisResult.stringCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Strings</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-2xl font-bold text-indigo-600">{analysisResult.importCount}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Imports</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'features' && (
        <FileFeatureAnalysis binaryAnalysis={undefined} ghidraAnalysis={undefined} />
      )}

      {activeTab === 'flaws' && (
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <h3 className="font-semibold text-red-900 dark:text-red-300 mb-4">
              ⚠️ Identified Flaws & Vulnerabilities ({flaws.length})
            </h3>
            <div className="space-y-4">
              {flaws.map(flaw => (
                <div key={flaw.id} className={`p-4 rounded-lg border-l-4 ${
                  flaw.severity === 'high' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
                  flaw.severity === 'medium' ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-500' :
                  'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-500'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{flaw.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      flaw.severity === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      flaw.severity === 'medium' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {flaw.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{flaw.description}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div><strong>Location:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{flaw.location}</code></div>
                    <div><strong>Impact:</strong> {flaw.impact}</div>
                    <div><strong>Recommendation:</strong> {flaw.recommendation}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'strengths' && (
        <div className="space-y-4">
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h3 className="font-semibold text-green-900 dark:text-green-300 mb-4">
              ✅ Identified Strengths ({strengths.length})
            </h3>
            <div className="space-y-4">
              {strengths.map(strength => (
                <div key={strength.id} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{strength.title}</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{strength.description}</p>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div><strong>Location:</strong> <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">{strength.location}</code></div>
                    <div><strong>Benefit:</strong> {strength.benefit}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attributes' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Binary Attributes</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Architecture</div>
                <div className="font-mono text-sm text-gray-900 dark:text-white">{attributes.architecture}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Compiler</div>
                <div className="font-mono text-sm text-gray-900 dark:text-white">{attributes.compiler}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Language</div>
                <div className="font-mono text-sm text-gray-900 dark:text-white">{attributes.language}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Optimizations</div>
                <div className="font-mono text-sm text-gray-900 dark:text-white">{attributes.optimizations}</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sections ({attributes.sections.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Name</th>
                    <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Size</th>
                    <th className="text-right py-2 px-3 text-gray-600 dark:text-gray-400">Entropy</th>
                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.sections.map((section, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-2 px-3 font-mono text-gray-900 dark:text-white">{section.name}</td>
                      <td className="py-2 px-3 text-right font-mono text-gray-700 dark:text-gray-300">{section.size}</td>
                      <td className="py-2 px-3 text-right font-mono text-gray-700 dark:text-gray-300">{section.entropy.toFixed(2)}</td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{section.type}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Imports ({attributes.imports.length})</h3>
              <div className="space-y-2">
                {attributes.imports.map((imp, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-blue-500">📦</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{imp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Exports ({attributes.exports.length})</h3>
              <div className="space-y-2">
                {attributes.exports.map((exp, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded">
                    <span className="text-green-500">🔓</span>
                    <span className="font-mono text-sm text-gray-900 dark:text-white">{exp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Continue Button */}
      {decodingProgress === 100 && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors"
          >
            Continue to Phase 3: Fixing →
          </button>
        </div>
      )}
    </div>
  );
}
