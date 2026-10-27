import { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';

// ─── Types ───────────────────────────────────────────────────────────────────
type SandboxStatus = 'idle' | 'starting' | 'running' | 'paused' | 'stopping' | 'error';
type IsolationMode = 'strict' | 'standard' | 'permissive';

interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: 'running' | 'sleeping' | 'stopped' | 'zombie';
  startTime: number;
}

interface FileSystemItem {
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  permissions: string;
  modified: string;
}

interface SandboxLog {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
}

interface SecurityEvent {
  id: string;
  timestamp: number;
  type: 'network' | 'file' | 'process' | 'syscall' | 'memory';
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  blocked: boolean;
  detail: string;
}

interface NetworkConnection {
  id: string;
  protocol: 'TCP' | 'UDP';
  localAddr: string;
  remoteAddr: string;
  state: 'ESTABLISHED' | 'LISTEN' | 'CLOSED' | 'BLOCKED';
  bytes: number;
}

interface SandboxConfig {
  isolationMode: IsolationMode;
  networkAccess: boolean;
  fileWrite: boolean;
  processSpawn: boolean;
  maxCpu: number;
  maxMemory: number;
  timeout: number;
  snapshotOnExit: boolean;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function SandboxEnvironment({ targetPath }: { targetPath: string }) {
  const [status, setStatus] = useState<SandboxStatus>('idle');
  const [config, setConfig] = useState<SandboxConfig>({
    isolationMode: 'standard',
    networkAccess: false,
    fileWrite: false,
    processSpawn: false,
    maxCpu: 50,
    maxMemory: 256,
    timeout: 300,
    snapshotOnExit: true,
  });
  const [showConfig, setShowConfig] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'processes' | 'filesystem' | 'network' | 'security' | 'logs'>('overview');
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [uptime, setUptime] = useState(0);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [fileSystem] = useState<FileSystemItem[]>([
    { path: '/sandbox/', type: 'directory', size: 0, permissions: 'rwx', modified: new Date().toISOString() },
    { path: '/sandbox/target/', type: 'directory', size: 0, permissions: 'r-x', modified: new Date().toISOString() },
    { path: '/sandbox/target/sample-app.js', type: 'file', size: 245760, permissions: 'r--', modified: new Date().toISOString() },
    { path: '/sandbox/target/package.json', type: 'file', size: 1240, permissions: 'r--', modified: new Date().toISOString() },
    { path: '/sandbox/tmp/', type: 'directory', size: 0, permissions: 'rwx', modified: new Date().toISOString() },
    { path: '/sandbox/logs/', type: 'directory', size: 0, permissions: 'rw-', modified: new Date().toISOString() },
    { path: '/sandbox/node_modules/', type: 'directory', size: 0, permissions: 'r-x', modified: new Date().toISOString() },
  ]);
  const [logs, setLogs] = useState<SandboxLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [connections, setConnections] = useState<NetworkConnection[]>([]);
  const [totalNetIn, setTotalNetIn] = useState(0);
  const [totalNetOut, setTotalNetOut] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Simulation loop
  useEffect(() => {
    if (status !== 'running') return;

    const interval = setInterval(() => {
      setCpu(prev => Math.max(0, Math.min(95, prev + (Math.random() - 0.5) * 15)));
      setMemory(prev => Math.max(32, Math.min(config.maxMemory, prev + (Math.random() - 0.4) * 8)));
      setUptime(prev => prev + 1);
      setTotalNetIn(prev => prev + Math.random() * 50);
      setTotalNetOut(prev => prev + Math.random() * 25);

      // Add log entry
      if (Math.random() > 0.3) {
        setLogs(prev => [...prev, {
          timestamp: Date.now(),
          level: (Math.random() > 0.92 ? 'warn' : Math.random() > 0.97 ? 'error' : 'info') as any,
          source: ['syscall', 'network', 'fs', 'process', 'runtime'][Math.floor(Math.random() * 5)],
          message: generateLogMessage(),
        }].slice(-200));
      }

      // Add security event
      if (Math.random() > 0.92) {
        setSecurityEvents(prev => [...prev, {
          id: `sec-${Date.now()}`,
          timestamp: Date.now(),
          type: (['network', 'file', 'process', 'syscall'][Math.floor(Math.random() * 4)]) as any,
          severity: (['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)]) as any,
          action: generateSecurityAction(),
          blocked: config.isolationMode === 'strict' ? true : Math.random() > 0.5,
          detail: generateSecurityDetail(),
        }].slice(-100));
      }

      // Update process stats
      setProcesses(prev => prev.map(p => ({
        ...p,
        cpu: Math.max(0, Math.min(100, p.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(8, p.memory + (Math.random() - 0.5) * 5),
      })));

      // Update connections
      if (config.networkAccess && Math.random() > 0.8) {
        setConnections(prev => {
          if (prev.length < 3 && Math.random() > 0.5) {
            return [...prev, {
              id: `conn-${Date.now()}`,
              protocol: 'TCP' as const,
              localAddr: `127.0.0.1:${3000 + Math.floor(Math.random() * 1000)}`,
              remoteAddr: config.isolationMode === 'strict' ? 'BLOCKED' : `api.service.local:${443 + Math.floor(Math.random() * 100)}`,
              state: config.isolationMode === 'strict' ? 'BLOCKED' as const : 'ESTABLISHED' as const,
              bytes: Math.floor(Math.random() * 10000),
            }];
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, config]);

  // Auto-scroll logs
  useEffect(() => {
    if (activeTab === 'logs' && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  const startSandbox = () => {
    setStatus('starting');
    setLogs([{
      timestamp: Date.now(),
      level: 'info',
      source: 'system',
      message: `Initializing sandbox environment (mode: ${config.isolationMode})`,
    }]);
    setSecurityEvents([]);
    setConnections([]);
    setCpu(0);
    setMemory(0);
    setUptime(0);
    setTotalNetIn(0);
    setTotalNetOut(0);

    setTimeout(() => {
      setLogs(prev => [...prev, {
        timestamp: Date.now(),
        level: 'info',
        source: 'system',
        message: `Loading target: ${targetPath}`,
      }]);
    }, 500);

    setTimeout(() => {
      setProcesses([
        { pid: 1, name: 'sandbox-runtime', cpu: 2, memory: 24, status: 'running', startTime: Date.now() },
        { pid: 2, name: 'fs-monitor', cpu: 0.5, memory: 12, status: 'running', startTime: Date.now() },
        { pid: 3, name: 'net-guard', cpu: 0.3, memory: 8, status: 'running', startTime: Date.now() },
      ]);
      setLogs(prev => [...prev, {
        timestamp: Date.now(),
        level: 'info',
        source: 'system',
        message: 'Core services started: runtime, fs-monitor, net-guard',
      }]);
    }, 1200);

    setTimeout(() => {
      setProcesses(prev => [...prev, {
        pid: 100,
        name: targetPath.split('/').pop() || 'target',
        cpu: 12,
        memory: 64,
        status: 'running',
        startTime: Date.now(),
      }]);
      setLogs(prev => [...prev, {
        timestamp: Date.now(),
        level: 'info',
        source: 'process',
        message: `Target process spawned (PID: 100)`,
      }]);
      setStatus('running');
      setStartTime(Date.now());
    }, 2000);
  };

  const pauseSandbox = () => {
    setStatus('paused');
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      level: 'info',
      source: 'system',
      message: 'Sandbox paused - all processes suspended',
    }]);
  };

  const resumeSandbox = () => {
    setStatus('running');
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      level: 'info',
      source: 'system',
      message: 'Sandbox resumed',
    }]);
  };

  const stopSandbox = () => {
    setStatus('stopping');
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      level: 'info',
      source: 'system',
      message: 'Terminating sandbox - sending SIGTERM to all processes',
    }]);

    setTimeout(() => {
      setProcesses([]);
      setConnections([]);
      setStatus('idle');
      setStartTime(null);
      setLogs(prev => [...prev, {
        timestamp: Date.now(),
        level: 'info',
        source: 'system',
        message: config.snapshotOnExit ? 'Snapshot saved: sandbox-snapshot-' + Date.now() + '.tar.gz' : 'Sandbox terminated (no snapshot)',
      }]);
    }, 1500);
  };

  const takeSnapshot = () => {
    setLogs(prev => [...prev, {
      timestamp: Date.now(),
      level: 'info',
      source: 'system',
      message: `Snapshot created: snapshot-${Date.now()}.tar.gz (${Math.floor(memory)}MB memory state)`,
    }]);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
              <Icons.Shield />
            </span>
            Sandbox Environment
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Isolated execution environment for safe target analysis</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Icons.Settings />
          </button>
          {status === 'idle' && (
            <button onClick={startSandbox} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Icons.Play /> Start Sandbox
            </button>
          )}
          {status === 'running' && (
            <>
              <button onClick={pauseSandbox} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors">
                Pause
              </button>
              <button onClick={takeSnapshot} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Snapshot
              </button>
              <button onClick={stopSandbox} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Stop
              </button>
            </>
          )}
          {status === 'paused' && (
            <>
              <button onClick={resumeSandbox} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                Resume
              </button>
              <button onClick={stopSandbox} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                Stop
              </button>
            </>
          )}
          {status === 'starting' && (
            <div className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Starting...
            </div>
          )}
          {status === 'stopping' && (
            <div className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              Stopping...
            </div>
          )}
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Sandbox Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Isolation Mode</label>
              <select
                value={config.isolationMode}
                onChange={(e) => setConfig(prev => ({ ...prev, isolationMode: e.target.value as IsolationMode }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              >
                <option value="strict">Strict (block all external access)</option>
                <option value="standard">Standard (allow loopback only)</option>
                <option value="permissive">Permissive (allow documented hosts)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max CPU (%)</label>
              <input
                type="range"
                min={10}
                max={100}
                value={config.maxCpu}
                onChange={(e) => setConfig(prev => ({ ...prev, maxCpu: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{config.maxCpu}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Memory (MB)</label>
              <input
                type="range"
                min={64}
                max={1024}
                step={64}
                value={config.maxMemory}
                onChange={(e) => setConfig(prev => ({ ...prev, maxMemory: Number(e.target.value) }))}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{config.maxMemory} MB</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeout (seconds)</label>
              <input
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig(prev => ({ ...prev, timeout: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={config.networkAccess} onChange={(e) => setConfig(prev => ({ ...prev, networkAccess: e.target.checked }))} className="rounded" />
                Allow network access
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={config.fileWrite} onChange={(e) => setConfig(prev => ({ ...prev, fileWrite: e.target.checked }))} className="rounded" />
                Allow file writes
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={config.processSpawn} onChange={(e) => setConfig(prev => ({ ...prev, processSpawn: e.target.checked }))} className="rounded" />
                Allow process spawn
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={config.snapshotOnExit} onChange={(e) => setConfig(prev => ({ ...prev, snapshotOnExit: e.target.checked }))} className="rounded" />
                Snapshot on exit
              </label>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Banner */}
      <div className={`p-4 rounded-xl mb-6 border ${
        status === 'running' ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
        status === 'paused' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
        status === 'starting' || status === 'stopping' ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' :
        status === 'error' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
        'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status === 'running' ? 'bg-emerald-500 animate-pulse' :
              status === 'paused' ? 'bg-amber-500' :
              status === 'starting' || status === 'stopping' ? 'bg-blue-500 animate-pulse' :
              status === 'error' ? 'bg-red-500' :
              'bg-gray-400'
            }`} />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">{status}</div>
              {status !== 'idle' && <div className="text-sm text-gray-600 dark:text-gray-400">Target: {targetPath} • Mode: {config.isolationMode}</div>}
            </div>
          </div>
          {startTime && (
            <div className="text-right">
              <div className="text-sm font-mono text-gray-900 dark:text-white">{formatUptime(uptime)}</div>
              <div className="text-xs text-gray-500">Uptime</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {([
          { id: 'overview', label: 'Overview', count: null },
          { id: 'processes', label: 'Processes', count: processes.length },
          { id: 'filesystem', label: 'File System', count: fileSystem.length },
          { id: 'network', label: 'Network', count: connections.length },
          { id: 'security', label: 'Security', count: securityEvents.length },
          { id: 'logs', label: 'Logs', count: logs.length },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab cpu={cpu} memory={memory} maxMemory={config.maxMemory} totalNetIn={totalNetIn} totalNetOut={totalNetOut} config={config} securityEvents={securityEvents} status={status} />}
      {activeTab === 'processes' && <ProcessesTab processes={processes} />}
      {activeTab === 'filesystem' && <FileSystemTab items={fileSystem} />}
      {activeTab === 'network' && <NetworkTab connections={connections} totalIn={totalNetIn} totalOut={totalNetOut} status={status} config={config} />}
      {activeTab === 'security' && <SecurityTab events={securityEvents} config={config} />}
      {activeTab === 'logs' && <LogsTab logs={logs} logEndRef={logEndRef} onClear={() => setLogs([])} />}
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function OverviewTab({ cpu, memory, maxMemory, totalNetIn, totalNetOut, config, securityEvents, status }: {
  cpu: number; memory: number; maxMemory: number; totalNetIn: number; totalNetOut: number;
  config: SandboxConfig; securityEvents: SecurityEvent[]; status: SandboxStatus;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="CPU Usage" value={`${cpu.toFixed(1)}%`} percentage={cpu} color="blue" />
        <MetricCard title="Memory" value={`${memory.toFixed(0)} / ${maxMemory} MB`} percentage={(memory / maxMemory) * 100} color="purple" />
        <MetricCard title="Network In" value={`${(totalNetIn / 1024).toFixed(1)} KB`} percentage={Math.min(100, totalNetIn / 50)} color="green" />
        <MetricCard title="Network Out" value={`${(totalNetOut / 1024).toFixed(1)} KB`} percentage={Math.min(100, totalNetOut / 25)} color="orange" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Policy */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Security Policy</h3>
          <div className="space-y-3">
            <PolicyRow label="Network Access" value={config.networkAccess ? 'allowed' : 'blocked'} />
            <PolicyRow label="File Write" value={config.fileWrite ? 'allowed' : 'blocked'} />
            <PolicyRow label="Process Spawn" value={config.processSpawn ? 'allowed' : 'blocked'} />
            <PolicyRow label="Isolation Mode" value={config.isolationMode} />
            <PolicyRow label="Max CPU" value={`${config.maxCpu}%`} />
            <PolicyRow label="Max Memory" value={`${config.maxMemory} MB`} />
          </div>
        </div>

        {/* Recent Security Events */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Security Events</h3>
          {securityEvents.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {status === 'idle' ? 'Start the sandbox to monitor security events.' : 'No security events recorded yet.'}
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {securityEvents.slice(-5).reverse().map(event => (
                <div key={event.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    event.severity === 'critical' ? 'bg-red-500' :
                    event.severity === 'high' ? 'bg-orange-500' :
                    event.severity === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{event.action}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${event.blocked ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                    {event.blocked ? 'blocked' : 'allowed'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CPU/Memory Graph (simplified) */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Resource Usage</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">CPU</span>
              <span className="text-gray-900 dark:text-white font-medium">{cpu.toFixed(1)}%</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${cpu}%` }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">Memory</span>
              <span className="text-gray-900 dark:text-white font-medium">{memory.toFixed(0)} / {maxMemory} MB</span>
            </div>
            <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: `${(memory / maxMemory) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProcessesTab({ processes }: { processes: Process[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {processes.length === 0 ? (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">No processes running. Start the sandbox.</div>
      ) : (
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">PID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CPU</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Memory</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Uptime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {processes.map(proc => (
              <tr key={proc.pid} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white">{proc.pid}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{proc.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, proc.cpu)}%` }} />
                    </div>
                    <span>{proc.cpu.toFixed(1)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{proc.memory.toFixed(1)} MB</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    proc.status === 'running' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    proc.status === 'sleeping' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                    proc.status === 'zombie' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {proc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-mono">{formatUptime(Math.floor((Date.now() - proc.startTime) / 1000))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function FileSystemTab({ items }: { items: FileSystemItem[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-900">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Path</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Permissions</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Modified</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item, i) => (
            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
              <td className="px-4 py-3 text-sm font-mono text-gray-900 dark:text-white flex items-center gap-2">
                <span className={item.type === 'directory' ? 'text-amber-500' : 'text-gray-400'}>
                  {item.type === 'directory' ? '📁' : item.type === 'symlink' ? '🔗' : '📄'}
                </span>
                {item.path}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.type}</td>
              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{item.size > 0 ? formatBytes(item.size) : '-'}</td>
              <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400">{item.permissions}</td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(item.modified).toLocaleTimeString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NetworkTab({ connections, totalIn, totalOut, status, config }: {
  connections: NetworkConnection[]; totalIn: number; totalOut: number; status: SandboxStatus; config: SandboxConfig;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Active Connections" value={connections.length.toString()} percentage={connections.length * 20} color="blue" />
        <MetricCard title="Total In" value={`${(totalIn / 1024).toFixed(1)} KB`} percentage={Math.min(100, totalIn / 100)} color="green" />
        <MetricCard title="Total Out" value={`${(totalOut / 1024).toFixed(1)} KB`} percentage={Math.min(100, totalOut / 50)} color="orange" />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Connections</h3>
        {status === 'idle' ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">Start the sandbox to monitor network connections.</p>
        ) : !config.networkAccess ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-400">Network access is disabled in sandbox configuration.</p>
          </div>
        ) : connections.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No active connections.</p>
        ) : (
          <div className="space-y-2">
            {connections.map(conn => (
              <div key={conn.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                conn.state === 'BLOCKED' ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
                'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    conn.state === 'ESTABLISHED' ? 'bg-emerald-500' :
                    conn.state === 'BLOCKED' ? 'bg-red-500' :
                    conn.state === 'LISTEN' ? 'bg-blue-500' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm font-mono text-gray-900 dark:text-white">{conn.localAddr}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{conn.remoteAddr}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{conn.protocol}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    conn.state === 'ESTABLISHED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    conn.state === 'BLOCKED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {conn.state}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SecurityTab({ events, config }: { events: SecurityEvent[]; config: SandboxConfig }) {
  const blocked = events.filter(e => e.blocked).length;
  const allowed = events.filter(e => !e.blocked).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{events.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Blocked</div>
          <div className="text-2xl font-bold text-red-600">{blocked}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-emerald-200 dark:border-emerald-800 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Allowed</div>
          <div className="text-2xl font-bold text-emerald-600">{allowed}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Mode</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white capitalize">{config.isolationMode}</div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white">Event Log</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">No security events recorded yet. Start the sandbox.</div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {events.slice().reverse().map(event => (
                <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        event.blocked ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                      }`}>
                        {event.blocked ? 'BLOCKED' : 'ALLOWED'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        event.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        event.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        event.severity === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {event.severity}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{event.type}</span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">{event.action}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">{event.detail}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LogsTab({ logs, logEndRef, onClear }: { logs: SandboxLog[]; logEndRef: React.RefObject<HTMLDivElement>; onClear: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 dark:text-white">Execution Logs ({logs.length})</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              const data = logs.map(l => `[${new Date(l.timestamp).toISOString()}] [${l.level.toUpperCase()}] [${l.source}] ${l.message}`).join('\n');
              const blob = new Blob([data], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `sandbox-logs-${Date.now()}.txt`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Export
          </button>
          <button 
            onClick={onClear}
            className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="max-h-[500px] overflow-y-auto font-mono text-xs p-4 bg-gray-900 dark:bg-black">
        {logs.length === 0 ? (
          <div className="text-gray-500">Waiting for logs...</div>
        ) : (
          <div className="space-y-0.5">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 py-0.5">
                <span className="text-gray-500 flex-shrink-0 w-20">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`flex-shrink-0 w-12 font-bold ${
                  log.level === 'error' ? 'text-red-400' :
                  log.level === 'warn' ? 'text-amber-400' :
                  log.level === 'debug' ? 'text-gray-500' :
                  'text-emerald-400'
                }`}>
                  {log.level === 'info' ? 'INF' : log.level.toUpperCase()}
                </span>
                <span className="text-indigo-400 flex-shrink-0 w-20 truncate">[{log.source}]</span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Utility Components ──────────────────────────────────────────────────────
function MetricCard({ title, value, percentage, color }: { title: string; value: string; percentage: number; color: 'blue' | 'green' | 'orange' | 'purple' }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
  };
  const barColors = {
    blue: 'bg-blue-500',
    green: 'bg-emerald-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</div>
      <div className={`text-2xl font-bold bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent mb-2`}>
        {value}
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${barColors[color]} rounded-full transition-all duration-500`} style={{ width: `${Math.min(100, percentage)}%` }} />
      </div>
    </div>
  );
}

function PolicyRow({ label, value }: { label: string; value: string }) {
  const isAllowed = value === 'allowed';
  const isBlocked = value === 'blocked';

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
        isAllowed ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
        isBlocked ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      }`}>
        {value}
      </span>
    </div>
  );
}

// ─── Utilities ───────────────────────────────────────────────────────────────
function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function generateLogMessage(): string {
  const messages = [
    'File read: /sandbox/target/sample-app.js (245760 bytes)',
    'Memory allocation: 4096 bytes at 0x7fff5fbff8a0',
    'Function call: main() → processInput()',
    'String operation: String.prototype.match(/search/i)',
    'Array access: results[42] (length: 100)',
    'Timer fired: setTimeout callback (id: 7)',
    'Module loaded: ./utils/search.js',
    'Event emitted: "search:query" with 2 listeners',
    'Promise resolved: fetchSearch() → 200 OK',
    'GC cycle: freed 128 bytes (2 objects)',
    'Syscall: read(3, buf, 1024) = 1024',
    'Syscall: mmap(NULL, 4096, PROT_READ) = 0x7f8a1c000',
    'Environment access: process.env.NODE_ENV',
    'RegExp exec: /api\\/v\\d+\\/search/.test(url)',
    'Buffer alloc: Buffer.alloc(16) for key material',
    'Socket check: localhost:9841 (MCP server)',
    'DNS lookup blocked: api.external.com',
    'File stat: /sandbox/target/package.json',
    'Require cache hit: ./hooks/useDebounce',
    'Stack trace: searchAPI → fetch → TCP connect',
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

function generateSecurityAction(): string {
  const actions = [
    'Outbound TCP connection attempt',
    'File write to /tmp/cache',
    'Child process spawn: /bin/sh',
    'Privilege escalation: setuid(0)',
    'Raw socket creation (AF_PACKET)',
    'Memory-mapped executable region',
    'DNS resolution request',
    'Shared memory segment alloc',
    'Environment variable read: SECRET_KEY',
    'Registry key access (Windows)',
    'Signal sent to parent process',
    'Network interface enumeration',
  ];
  return actions[Math.floor(Math.random() * actions.length)];
}

function generateSecurityDetail(): string {
  const details = [
    'dst: api.malicious.com:443 (blocked by policy)',
    'path: /sandbox/tmp/evil.sh (write denied)',
    'cmd: /bin/sh -c "curl http://..." (denied)',
    'target uid: 0 (current: 1000)',
    'type: SOCK_RAW, protocol: 0x0800',
    'addr: 0x7f8a1c000, prot: PROT_EXEC|PROT_WRITE',
    'query: api.external.com (no DNS in sandbox)',
    'key: IPC_PRIVATE, size: 65536',
    'key: SECRET_KEY (masked in output)',
    'path: HKLM\\SOFTWARE\\Microsoft\\...',
    'signal: SIGKILL → pid 1 (denied)',
    'interfaces: eth0, lo, docker0',
  ];
  return details[Math.floor(Math.random() * details.length)];
}
