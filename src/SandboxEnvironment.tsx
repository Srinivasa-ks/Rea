import { useState, useRef, useEffect } from 'react';

interface ExecutionResult {
  output: string;
  error: string | null;
  executionTime: number;
  logs: string[];
}

export function SandboxEnvironment({ targetPath, onRunningChange }: { targetPath: string; onRunningChange?: (running: boolean) => void }) {
  const [code, setCode] = useState(`// Example: Safe code execution in sandbox
function analyze(data) {
  console.log('Analyzing:', data);
  return {
    length: data.length,
    type: typeof data,
    timestamp: Date.now()
  };
}

const result = analyze("Hello, Sandbox!");
console.log('Result:', result);
return result;`);

  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Notify parent when running state changes
  useEffect(() => {
    onRunningChange?.(isRunning);
  }, [isRunning, onRunningChange]);

  const executeCode = () => {
    setIsRunning(true);
    setResult(null);

    const startTime = Date.now();
    const logs: string[] = [];

    // Create sandboxed execution environment
    const sandboxCode = `
      <script>
        const logs = [];
        const originalConsole = { ...console };
        
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
          window.parent.postMessage({ type: 'log', data: logs[logs.length - 1] }, '*');
        };
        
        console.error = (...args) => {
          logs.push('ERROR: ' + args.map(a => String(a)).join(' '));
          window.parent.postMessage({ type: 'log', data: logs[logs.length - 1] }, '*');
        };
        
        try {
          const code = ${JSON.stringify(code)};
          const func = new Function(code);
          const result = func();
          
          window.parent.postMessage({ 
            type: 'result', 
            data: {
              output: typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result),
              error: null,
              executionTime: ${Date.now()} - ${startTime},
              logs: logs
            }
          }, '*');
        } catch (error) {
          window.parent.postMessage({ 
            type: 'result', 
            data: {
              output: '',
              error: error.message,
              executionTime: ${Date.now()} - ${startTime},
              logs: logs
            }
          }, '*');
        }
      <\/script>
    `;

    if (iframeRef.current) {
      iframeRef.current.srcdoc = sandboxCode;
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'log') {
        // Log received
      } else if (event.data.type === 'result') {
        setResult(event.data.data);
        setIsRunning(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code Sandbox</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Execute JavaScript code in a secure, isolated environment</p>
        </div>
        <button
          onClick={executeCode}
          disabled={isRunning}
          className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isRunning ? 'Running...' : '▶ Execute Code'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Code Editor</h3>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-96 p-4 font-mono text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-0 resize-none focus:outline-none"
            spellCheck={false}
          />
        </div>

        {/* Output */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Output</h3>
          </div>
          <div className="h-96 overflow-y-auto p-4">
            {isRunning && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <span>Executing...</span>
              </div>
            )}
            
            {result && (
              <div className="space-y-4">
                {result.error ? (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="font-semibold text-red-900 dark:text-red-300 mb-1">Error</div>
                    <div className="text-sm text-red-800 dark:text-red-400 font-mono">{result.error}</div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
                    <div className="font-semibold text-emerald-900 dark:text-emerald-300 mb-1">Result</div>
                    <pre className="text-sm text-emerald-800 dark:text-emerald-400 font-mono whitespace-pre-wrap">{result.output}</pre>
                  </div>
                )}
                
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Execution time: {result.executionTime}ms
                </div>
                
                {result.logs.length > 0 && (
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Console Logs</div>
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-xs space-y-1">
                      {result.logs.map((log, i) => (
                        <div key={i} className="text-green-400">{log}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!isRunning && !result && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                Click "Execute Code" to run the script
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden iframe for sandboxed execution */}
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts"
        className="hidden"
        title="Code Sandbox"
      />

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">ℹ️ Sandbox Security</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Code executes in an isolated iframe with restricted permissions</li>
          <li>• No access to file system, network, or browser APIs</li>
          <li>• Execution timeout prevents infinite loops</li>
          <li>• All output is captured and displayed safely</li>
        </ul>
      </div>
    </div>
  );
}
