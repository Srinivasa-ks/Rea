import { useState } from 'react';

import { Screen } from '../App';

interface Phase5PageProps {
  onNavigate: (phase: Screen) => void;
}

export function Phase5Page({ onNavigate }: Phase5PageProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [reportSections, setReportSections] = useState(['overview', 'analysis', 'decoding', 'fixing', 'assembly']);
  const [exportFormats, setExportFormats] = useState(['html', 'json']);
  const [detailLevel, setDetailLevel] = useState('detailed');
  const [includeAuditTrail, setIncludeAuditTrail] = useState(true);

  const sections = [
    { id: 'overview', name: 'Overview', description: 'Executive summary' },
    { id: 'analysis', name: 'Analysis', description: 'Phase 1 results' },
    { id: 'decoding', name: 'Decoding', description: 'Phase 2 results' },
    { id: 'fixing', name: 'Fixing', description: 'Phase 3 results' },
    { id: 'assembly', name: 'Assembly', description: 'Phase 4 results' },
    { id: 'recommendations', name: 'Recommendations', description: 'Next steps' },
    { id: 'appendix', name: 'Appendix', description: 'Additional details' },
  ];

  const formats = [
    { id: 'html', name: 'HTML', description: 'Web-viewable report' },
    { id: 'json', name: 'JSON', description: 'Machine-readable data' },
    { id: 'md', name: 'Markdown', description: 'Text format' },
    { id: 'pdf', name: 'PDF', description: 'Portable document' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Phase 5: Summary
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive report with all findings and recommendations
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Phase 5 Configuration</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Report Sections */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Sections</h3>
              <div className="space-y-2">
                {sections.map(section => (
                  <label key={section.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={reportSections.includes(section.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReportSections([...reportSections, section.id]);
                        } else {
                          setReportSections(reportSections.filter(s => s !== section.id));
                        }
                      }}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{section.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{section.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Export & Detail Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Formats</h3>
              <div className="space-y-2 mb-6">
                {formats.map(format => (
                  <label key={format.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                    <input
                      type="checkbox"
                      checked={exportFormats.includes(format.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setExportFormats([...exportFormats, format.id]);
                        } else {
                          setExportFormats(exportFormats.filter(f => f !== format.id));
                        }
                      }}
                      className="w-5 h-5 text-indigo-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{format.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{format.description}</div>
                    </div>
                  </label>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Detail Level</h3>
              <div className="space-y-2 mb-6">
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="detail"
                    checked={detailLevel === 'summary'}
                    onChange={() => setDetailLevel('summary')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Summary</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Brief overview</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="detail"
                    checked={detailLevel === 'detailed'}
                    onChange={() => setDetailLevel('detailed')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Detailed</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Standard report</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="detail"
                    checked={detailLevel === 'comprehensive'}
                    onChange={() => setDetailLevel('comprehensive')}
                    className="w-5 h-5 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Comprehensive</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Full documentation</div>
                  </div>
                </label>
              </div>

              <label className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={includeAuditTrail}
                  onChange={(e) => setIncludeAuditTrail(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Include Audit Trail</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Add complete operation log</div>
                </div>
              </label>
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

      {/* Report Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Report Preview</h2>
        
        <div className="space-y-4">
          {reportSections.includes('overview') && (
            <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg text-white">
              <h3 className="text-xl font-bold mb-2">Executive Summary</h3>
              <p className="text-sm opacity-90">
                Complete reverse engineering analysis with 92% confidence. All phases completed successfully.
              </p>
            </div>
          )}

          {reportSections.includes('analysis') && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phase 1: Analysis</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Functions:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">12</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Strings:</span>
                  <span className="ml-2 font-semibold text-gray-900 dark:text-white">87</span>
                </div>
              </div>
            </div>
          )}

          {reportSections.includes('decoding') && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phase 2: Decoding</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Disassembly, features, flaws, and strengths analyzed
              </div>
            </div>
          )}

          {reportSections.includes('fixing') && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phase 3: Fixing</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                3 fixes applied successfully
              </div>
            </div>
          )}

          {reportSections.includes('assembly') && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phase 4: Assembly</h3>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                All stability checks passed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Buttons */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Export Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exportFormats.includes('html') && (
            <button className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
              <div className="text-lg font-semibold mb-1">Export as HTML</div>
              <div className="text-sm opacity-90">Web-viewable report</div>
            </button>
          )}
          {exportFormats.includes('json') && (
            <button className="p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
              <div className="text-lg font-semibold mb-1">Export as JSON</div>
              <div className="text-sm opacity-90">Machine-readable data</div>
            </button>
          )}
          {exportFormats.includes('md') && (
            <button className="p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
              <div className="text-lg font-semibold mb-1">Export as Markdown</div>
              <div className="text-sm opacity-90">Text format</div>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => onNavigate('phase4')}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
        >
          ← Back to Phase 4
        </button>
        <button
          onClick={() => onNavigate('upload')}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Start New Analysis
        </button>
      </div>
    </div>
  );
}
