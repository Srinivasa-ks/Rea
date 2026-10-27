export function LicensingInfo() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Licensing & Legal Information</h3>
      
      <div className="space-y-6">
        {/* Application License */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            REA Agentic AI - MIT License
          </h4>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300">
            <p className="mb-2">
              Copyright (c) 2026 REA Agentic AI Project
            </p>
            <p className="mb-2">
              Permission is hereby granted, free of charge, to any person obtaining a copy
              of this software and associated documentation files (the "Software"), to deal
              in the Software without restriction, including without limitation the rights
              to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
              copies of the Software, and to permit persons to whom the Software is
              furnished to do so, subject to the following conditions:
            </p>
            <p className="mb-2">
              The above copyright notice and this permission notice shall be included in all
              copies or substantial portions of the Software.
            </p>
            <p>
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
              FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
            </p>
          </div>
        </div>

        {/* Third-Party Licenses */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Third-Party Components
          </h4>
          <div className="space-y-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900 dark:text-white">Ghidra</span>
                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                  Apache 2.0
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                NSA's reverse engineering framework. Used under Apache License 2.0.
                <br />
                <a href="https://github.com/NationalSecurityAgency/ghidra" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  https://github.com/NationalSecurityAgency/ghidra
                </a>
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900 dark:text-white">REA Core</span>
                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                  MIT
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Core reverse engineering agent library.
                <br />
                <a href="https://github.com/morluto/rea" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                  https://github.com/morluto/rea
                </a>
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900 dark:text-white">React</span>
                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                  MIT
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                JavaScript library for building user interfaces.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm text-gray-900 dark:text-white">Tailwind CSS</span>
                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded">
                  MIT
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Utility-first CSS framework.
              </p>
            </div>
          </div>
        </div>

        {/* Usage Terms */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Usage Terms & Restrictions
          </h4>
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="space-y-2 text-sm text-amber-900 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                <span><strong>Permitted:</strong> Security research, malware analysis, educational purposes, interoperability testing</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-600 dark:text-amber-400 mt-0.5">✓</span>
                <span><strong>Permitted:</strong> Analyzing software you own or have explicit authorization to analyze</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                <span><strong>Prohibited:</strong> Creating malware, exploits, or attack tools</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                <span><strong>Prohibited:</strong> Bypassing software licenses, DRM, or copy protection</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                <span><strong>Prohibited:</strong> Attacking third-party systems without authorization</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-600 dark:text-red-400 mt-0.5">✗</span>
                <span><strong>Prohibited:</strong> Any illegal activities or activities violating local laws</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Legal Disclaimer
          </h4>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-900 dark:text-red-300">
            <p className="mb-2">
              <strong>IMPORTANT:</strong> This software is provided for legitimate security research and educational purposes only.
            </p>
            <p className="mb-2">
              Users are solely responsible for ensuring their use of this software complies with all applicable laws, regulations, and ethical guidelines.
            </p>
            <p>
              The developers assume no liability for misuse of this software or any consequences arising from its use. By using this software, you agree to use it responsibly and ethically.
            </p>
          </div>
        </div>

        {/* Compliance */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Compliance & Standards
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">DMCA Compliance</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Complies with DMCA Section 1201(f) for reverse engineering interoperability
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">EU Directive</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Complies with EU Software Directive Article 6 for decompilation
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">Ethical Guidelines</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Follows responsible disclosure and ethical hacking principles
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
              <div className="font-medium text-sm text-gray-900 dark:text-white mb-1">Data Privacy</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                All analysis performed locally, no data transmitted externally
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Contact & Support
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>For licensing questions or support:</p>
            <p className="font-mono text-xs">
              GitHub: <a href="https://github.com/Srinivasa-ks/Rea-Agenti-AI" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                https://github.com/Srinivasa-ks/Rea-Agenti-AI
              </a>
            </p>
            <p className="font-mono text-xs">
              Issues: <a href="https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                https://github.com/Srinivasa-ks/Rea-Agenti-AI/issues
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
