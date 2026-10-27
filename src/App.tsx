import { useState, useEffect } from 'react';
import { Screen, Investigation, AgentEvent } from './types';
import { sampleInvestigation, setupItems, historyItems, logEntries } from './data/mockData';

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icons = {
  Home: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  Search: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Settings: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  History: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
  Terminal: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Cpu: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>,
  FileText: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  Bell: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
  Link: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
  Play: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  AlertTriangle: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Eye: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
};

// ─── Utility Components ──────────────────────────────────────────────────────
function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' }) {
  const colors = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>{children}</span>;
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>{children}</div>;
}

// ─── Welcome Screen ──────────────────────────────────────────────────────────
function WelcomeScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-6 shadow-lg">
          <Icons.Cpu />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">REA Agentic AI</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">Reverse Engineer Anything — Locally, Safely, With Evidence</p>
      </div>

      <Card className="p-6 mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
        <div className="flex items-start gap-3">
          <Icons.AlertTriangle />
          <div>
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Legal & Ethical Notice</h3>
            <p className="text-sm text-amber-800 dark:text-amber-400">
              This tool is for authorized analysis only. You must own or have explicit permission to analyze any target. 
              REA Agentic AI will not assist with malware creation, exploit development, license bypass, DRM circumvention, 
              or attacks on third-party systems. All analysis is local-only — no telemetry, no cloud, no API keys required.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="p-5">
          <div className="text-indigo-500 mb-3"><Icons.Terminal /></div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">CLI</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Full-featured command line: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-xs">rea-agent investigate</code></p>
        </Card>
        <Card className="p-5">
          <div className="text-indigo-500 mb-3"><Icons.Link /></div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">MCP Server</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Model Context Protocol for Claude, Codex, Cursor & VS Code</p>
        </Card>
        <Card className="p-5">
          <div className="text-indigo-500 mb-3"><Icons.Eye /></div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">REA App</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Desktop GUI — install and investigate in under 10 minutes</p>
        </Card>
      </div>

      <div className="text-center">
        <button onClick={onStart} className="inline-flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg transition-colors">
          <Icons.Play />
          Start Investigation
        </button>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">Independent project • Not affiliated with upstream REA.exe trojan (Oct 2026)</p>
      </div>
    </div>
  );
}

// ─── Setup Screen ────────────────────────────────────────────────────────────
function SetupScreen() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Setup & Health</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">System requirements and tool availability. Run <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded text-sm">rea-agent doctor</code> for diagnostics.</p>

      <div className="flex gap-3 mb-6">
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Run Doctor</button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Dry Run</button>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Rerun Setup</button>
      </div>

      <Card>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {setupItems.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${item.status === 'present' ? 'bg-emerald-500' : item.status === 'missing' ? 'bg-red-500' : item.status === 'optional' ? 'bg-gray-400' : 'bg-amber-500'}`} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.version && <span className="text-sm text-gray-500 dark:text-gray-400">v{item.version}</span>}
                <Badge variant={item.status === 'present' ? 'success' : item.status === 'missing' ? 'error' : item.status === 'optional' ? 'default' : 'warning'}>
                  {item.status}
                </Badge>
                {item.status === 'missing' && item.installCommand && (
                  <button className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors">
                    Install
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Health Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div><div className="text-2xl font-bold text-emerald-600">5</div><div className="text-xs text-gray-500">Present</div></div>
          <div><div className="text-2xl font-bold text-red-600">2</div><div className="text-xs text-gray-500">Missing</div></div>
          <div><div className="text-2xl font-bold text-gray-600">1</div><div className="text-xs text-gray-500">Optional</div></div>
          <div><div className="text-2xl font-bold text-gray-900 dark:text-white">0</div><div className="text-xs text-gray-500">Outdated</div></div>
        </div>
      </Card>
    </div>
  );
}

// ─── Ask Screen ──────────────────────────────────────────────────────────────
function AskScreen({ onInvestigate }: { onInvestigate: () => void }) {
  const [question, setQuestion] = useState('');
  const [targetPath, setTargetPath] = useState('');

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ask a Question</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Describe what you want to understand about a target application or binary.</p>

      <Card className="p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., How does search work in this app? What authentication mechanism is used? How is data encrypted?"
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          rows={3}
        />

        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">Target File or Directory</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetPath}
            onChange={(e) => setTargetPath(e.target.value)}
            placeholder="/path/to/target.js or /path/to/app/"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            Browse
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">Target type:</span>
          {['Web App', 'JS Bundle', 'Electron', 'Native Binary'].map(t => (
            <button key={t} className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-full text-gray-600 dark:text-gray-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              {t}
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Authorization</h3>
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="mt-1 w-4 h-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            I confirm that I own this target or have explicit authorization to analyze it. I understand that REA Agentic AI is for legitimate reverse engineering purposes only.
          </span>
        </label>
      </Card>

      <div className="flex gap-3">
        <button onClick={onInvestigate} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow transition-colors">
          Start Investigation
        </button>
        <button className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          Dry Run (Preview Plan)
        </button>
      </div>
    </div>
  );
}

// ─── Live Investigation Screen ───────────────────────────────────────────────
function InvestigationScreen({ investigation, onViewResult }: { investigation: Investigation; onViewResult: () => void }) {
  const [events] = useState<AgentEvent[]>(investigation.events);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    idle: 'bg-gray-400',
    active: 'bg-emerald-500 animate-pulse',
    'waiting-approval': 'bg-amber-500 animate-pulse',
    done: 'bg-blue-500',
    error: 'bg-red-500',
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Live Investigation</h2>
          <p className="text-gray-600 dark:text-gray-400">{investigation.question}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="info">{investigation.status}</Badge>
          <button onClick={onViewResult} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
            View Results
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents Panel */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Agents</h3>
          <div className="space-y-2">
            {investigation.agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedAgent === agent.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{agent.role.replace('-', ' ')}</span>
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[agent.status]}`} />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {agent.lastAction || 'Waiting...'}
                </div>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                  <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${(agent.budget.callsUsed / agent.budget.maxCalls) * 100}%` }} />
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Event Timeline */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Event Timeline</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {[...events].reverse().map((event) => (
              <div key={event.id} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <div className="flex-shrink-0 w-16 text-xs text-gray-400 font-mono pt-0.5">
                  {new Date(event.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
                <div className="flex-shrink-0">
                  <Badge variant={event.agent === 'orchestrator' ? 'purple' : event.agent === 'policy-safety' ? 'warning' : 'info'}>
                    {event.agent}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900 dark:text-white font-medium">{event.action.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{event.detail}</div>
                  {event.evidenceIds && (
                    <div className="flex gap-1 mt-1">
                      {event.evidenceIds.map(id => (
                        <span key={id} className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded">{id}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Evidence Summary */}
      <Card className="mt-6 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Evidence Collected ({investigation.evidence.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {investigation.evidence.map((ev) => (
            <div key={ev.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400">{ev.id}</span>
                <Badge variant={ev.confidence === 'confirmed' ? 'success' : ev.confidence === 'high' ? 'info' : 'warning'}>
                  {ev.confidence}
                </Badge>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{ev.type}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300">{ev.caption}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Result Screen ───────────────────────────────────────────────────────────
function ResultScreen({ investigation }: { investigation: Investigation }) {
  const [activeTab, setActiveTab] = useState<'answer' | 'evidence' | 'reconstruct' | 'commands'>('answer');
  const answer = investigation.answer!;

  const tabs = [
    { id: 'answer' as const, label: 'Answer' },
    { id: 'evidence' as const, label: `Evidence (${investigation.evidence.length})` },
    { id: 'reconstruct' as const, label: 'Recreate It' },
    { id: 'commands' as const, label: 'Commands' },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Investigation Result</h2>
          <p className="text-gray-600 dark:text-gray-400">{investigation.question}</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1">
            <Icons.Download /> Export
          </button>
        </div>
      </div>

      {/* Confidence Banner */}
      <Card className={`p-4 mb-6 ${answer.confidence === 'high' ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10' : 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${answer.confidence === 'high' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'}`}>
              <Icons.Check />
            </div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">Confidence: {answer.confidence} (87%)</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{answer.evidenceRefs.length} evidence records • {answer.openQuestions.length} open questions</div>
            </div>
          </div>
          <Badge variant={answer.confidence === 'high' ? 'success' : 'warning'}>{answer.confidence}</Badge>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'answer' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{answer.summary}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Step-by-Step Flow</h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-700 dark:text-gray-300 whitespace-pre overflow-x-auto">
              {answer.flow}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Steps</h3>
            <ol className="space-y-2">
              {answer.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </Card>

          {answer.openQuestions.length > 0 && (
            <Card className="p-6 border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-3">Open Questions</h3>
              <ul className="space-y-1">
                {answer.openQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-amber-800 dark:text-amber-400 flex gap-2">
                    <span>•</span> {q}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'evidence' && (
        <div className="space-y-4">
          {investigation.evidence.map((ev) => (
            <Card key={ev.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{ev.id}</span>
                  <Badge variant={ev.confidence === 'confirmed' ? 'success' : 'info'}>{ev.confidence}</Badge>
                  <Badge>{ev.type}</Badge>
                </div>
                <span className="text-xs text-gray-400 font-mono">{ev.hash.slice(0, 16)}...</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Source: {ev.source}</div>
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-3">{ev.caption}</div>
              {ev.excerpt && (
                <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                  {ev.excerpt}
                </pre>
              )}
            </Card>
          ))}
        </div>
      )}

      {activeTab === 'reconstruct' && (
        <Card className="p-6">
          <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
            {answer.reconstruction}
          </pre>
        </Card>
      )}

      {activeTab === 'commands' && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Reproduce Commands</h3>
          <div className="space-y-3">
            {answer.reproduceCommands.map((cmd, i) => (
              <div key={i} className="bg-gray-900 dark:bg-black rounded-lg p-3 font-mono text-sm text-green-400 flex items-center justify-between">
                <code>{cmd}</code>
                <button className="text-gray-400 hover:text-white transition-colors ml-2">
                  <Icons.Download />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── History Screen ──────────────────────────────────────────────────────────
function HistoryScreen() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">History</h2>
        <div className="flex gap-2">
          <input type="text" placeholder="Search investigations..." className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400" />
          <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Export All
          </button>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {historyItems.map((item) => (
            <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-900 dark:text-white">{item.question}</span>
                <Badge variant={item.status === 'archived' ? 'success' : item.status === 'paused' ? 'warning' : 'info'}>
                  {item.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{item.target}</span>
                <span>•</span>
                <span>{item.date}</span>
                <span>•</span>
                <span className="font-mono text-xs">{item.id}</span>
              </div>
              <div className="flex gap-1 mt-2">
                {item.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Native Workspace Screen ─────────────────────────────────────────────────
function NativeScreen() {
  const functions = [
    { name: 'main', address: '0x00401000', size: 256, xrefs: 3 },
    { name: 'process_input', address: '0x00401140', size: 128, xrefs: 1 },
    { name: 'validate_token', address: '0x004011C0', size: 96, xrefs: 2 },
    { name: 'decrypt_payload', address: '0x00401220', size: 192, xrefs: 1 },
    { name: 'send_response', address: '0x004012E0', size: 164, xrefs: 2 },
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Native Workspace</h2>
          <p className="text-gray-600 dark:text-gray-400">Ghidra-powered binary analysis • target.bin (x86_64, PE)</p>
        </div>
        <Badge variant="info">Ghidra MCP Connected</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Functions List */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Functions</h3>
          <div className="space-y-1">
            {functions.map((fn) => (
              <div key={fn.address} className="p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer text-sm">
                <div className="font-mono text-indigo-600 dark:text-indigo-400 text-xs">{fn.address}</div>
                <div className="text-gray-900 dark:text-white font-medium">{fn.name}</div>
                <div className="text-xs text-gray-500">{fn.size}B • {fn.xrefs} xrefs</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Decompiler */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Decompiler — decrypt_payload</h3>
          <pre className="bg-gray-900 dark:bg-black rounded-lg p-4 text-xs font-mono text-green-400 overflow-x-auto leading-relaxed">
{`undefined8 decrypt_payload(byte *input, int len, byte *key) {
  int i;
  byte *output;
  undefined8 result;
  
  output = (byte *)malloc(len);
  if (output == (byte *)0x0) {
    return 0xffffffff;
  }
  
  for (i = 0; i < len; i = i + 1) {
    output[i] = input[i] ^ key[i % 16];
    output[i] = (output[i] - 0x42) & 0xff;
  }
  
  result = verify_checksum(output, len);
  if (result != 0) {
    free(output);
    return 0xffffffff;
  }
  
  memcpy(input, output, len);
  free(output);
  return 0;
}`}
          </pre>
        </Card>

        {/* Disassembly */}
        <Card className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Disassembly</h3>
          <div className="font-mono text-xs space-y-0.5 text-gray-700 dark:text-gray-300">
            <div><span className="text-indigo-500">0x1220:</span> push rbp</div>
            <div><span className="text-indigo-500">0x1221:</span> mov rbp,rsp</div>
            <div><span className="text-indigo-500">0x1224:</span> sub rsp,0x28</div>
            <div><span className="text-indigo-500">0x1228:</span> mov [rbp-0x18],rdi</div>
            <div><span className="text-indigo-500">0x122c:</span> mov [rbp-0x20],esi</div>
            <div><span className="text-indigo-500">0x122f:</span> mov edi,esi</div>
            <div><span className="text-indigo-500">0x1231:</span> call malloc</div>
            <div><span className="text-indigo-500">0x1236:</span> mov [rbp-0x8],rax</div>
            <div><span className="text-indigo-500">0x123a:</span> cmp rax,0x0</div>
            <div><span className="text-indigo-500">0x123e:</span> jne 0x1248</div>
            <div className="text-amber-600"><span className="text-indigo-500">0x1240:</span> mov eax,0xffffffff</div>
            <div className="text-amber-600"><span className="text-indigo-500">0x1245:</span> jmp 0x12a0</div>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Strings Found</h3>
        <div className="flex flex-wrap gap-2">
          {['AES-256-CBC', 'XOR_KEY_16', 'checksum_verify', 'payload_decrypt', 'invalid_key_length', 'malloc_failed', 'verify_checksum'].map(s => (
            <span key={s} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-mono text-xs">{s}</span>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Logs Screen ─────────────────────────────────────────────────────────────
function LogsScreen() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Event Logs</h2>
        <div className="flex gap-2">
          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option>All agents</option>
            <option>orchestrator</option>
            <option>web-js</option>
            <option>policy-safety</option>
          </select>
          <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
            <option>All levels</option>
            <option>info</option>
            <option>warn</option>
            <option>error</option>
          </select>
        </div>
      </div>

      <Card className="p-4">
        <div className="font-mono text-sm space-y-1">
          {logEntries.map((entry, i) => (
            <div key={i} className="flex gap-3 py-1 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700/30">
              <span className="text-gray-400 flex-shrink-0 w-16">{entry.timestamp}</span>
              <span className={`flex-shrink-0 w-8 ${entry.level === 'error' ? 'text-red-500' : entry.level === 'warn' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {entry.level === 'info' ? 'INF' : entry.level.toUpperCase()}
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 flex-shrink-0 w-28 truncate">{entry.agent}</span>
              <span className="text-gray-700 dark:text-gray-300">{entry.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── MCP Panel ───────────────────────────────────────────────────────────────
function MCPScreen() {
  const tools = [
    { name: 'ask_about_target', description: 'Ask a question about a target file or directory' },
    { name: 'start_investigation', description: 'Begin a new reverse engineering investigation' },
    { name: 'get_investigation_status', description: 'Get current status and progress of an investigation' },
    { name: 'get_explanation', description: 'Retrieve the plain-English explanation for a finding' },
    { name: 'get_evidence', description: 'Get evidence records supporting a conclusion' },
    { name: 'get_reconstruction_guide', description: 'Get guide to recreate a feature in your own project' },
    { name: 'list_investigations', description: 'List all past and active investigations' },
    { name: 'resume_investigation', description: 'Resume a paused or incomplete investigation' },
    { name: 'run_doctor', description: 'Run system health check and setup verification' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">MCP Server</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Model Context Protocol — connect Claude, Codex, Cursor, or VS Code to REA Core.</p>

      <Card className="p-4 mb-6 bg-gray-900 dark:bg-black border-gray-700">
        <div className="text-xs font-mono text-gray-400 mb-2">Connection</div>
        <div className="text-sm font-mono text-green-400">
          <div>stdio: rea-agent serve --mcp</div>
          <div>http: http://127.0.0.1:9841/mcp (loopback only)</div>
          <div className="text-gray-500 mt-1">Session token: rea_••••••••••••</div>
        </div>
      </Card>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Tools</h3>
      <Card>
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {tools.map((tool) => (
            <div key={tool.name} className="p-4">
              <div className="font-mono text-sm text-indigo-600 dark:text-indigo-400 mb-1">{tool.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{tool.description}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-6 p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Client Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Claude Desktop', 'Codex', 'Cursor', 'VS Code'].map(client => (
            <button key={client} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              {client}
              <div className="text-xs text-gray-400 mt-1">Copy config</div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Approvals Screen ────────────────────────────────────────────────────────
function ApprovalsScreen() {
  const pendingApprovals = [
    { id: 'appr-1', agent: 'web-js', action: 'Run in sandbox', detail: 'Execute sample-app.js in isolated sandbox to observe runtime behavior', risk: 'sandbox', target: 'sample-app.js' },
    { id: 'appr-2', agent: 'setup-doctor', action: 'Install Ghidra', detail: 'Download and install Ghidra 12.1.4 (~500MB) from official NSA mirror', risk: 'install', target: 'system' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Approvals Inbox</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Review and approve actions that require human oversight.</p>

      {pendingApprovals.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-emerald-500 mb-2"><Icons.Check /></div>
          <p className="text-gray-600 dark:text-gray-400">No pending approvals. All clear!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((appr) => (
            <Card key={appr.id} className="p-5 border-amber-200 dark:border-amber-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="warning">{appr.risk}</Badge>
                    <span className="text-sm text-gray-500 dark:text-gray-400">from {appr.agent}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{appr.action}</h3>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{appr.detail}</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
                  Approve
                </button>
                <button className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
                  Deny
                </button>
                <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  View Details
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Architecture Screen (M0 Recon) ──────────────────────────────────────────
function ArchitectureScreen() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Architecture & M0 Recon</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Platform design, upstream findings, and system architecture.</p>

      {/* Architecture Diagram */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">System Architecture</h3>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 font-mono text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
          <pre>{`
┌─────────────────────────────────────────────────────────────────┐
│                        REA App (Electron)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Welcome  │ │   Ask    │ │Investigate│ │    Results       │   │
│  │ Setup    │ │ Approvals│ │  Logs     │ │  History  Native │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬──────────┘   │
│       └─────────────┴────────────┴───────────────┘              │
│                          │  (no logic)                           │
├──────────────────────────┼──────────────────────────────────────┤
│                     REA Core (shared)                            │
│  ┌───────────────────────┴─────────────────────────────────┐    │
│  │                    Orchestrator                           │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐  │    │
│  │  │Triage│ │Web/JS│ │Native│ │Explain│ │Reconstruction│  │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────────────┘  │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────────┐  │    │
│  │  │Evid. │ │Policy│ │Setup │ │Net.  │ │   Runtime    │  │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────────────┘  │    │
│  └──────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐     │
│  │  Evidence  │  │  History   │  │   Setup / Doctor       │     │
│  │  Ledger    │  │  (SQLite)  │  │   (Guided Installer)   │     │
│  └────────────┘  └────────────┘  └────────────────────────┘     │
├──────────────────────────────────────────────────────────────────┤
│  CLI (rea-agent)          MCP Server (stdio + loopback HTTP)     │
└──────────────────────────────────────────────────────────────────┘
          `}</pre>
        </div>
      </Card>

      {/* M0 Findings */}
      <Card className="p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">M0 Recon Findings</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Upstream REA (github.com/morluto/rea)</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>• MIT licensed, npm package: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">rea-agents</code></li>
              <li>• Provides core agent library with tool execution framework</li>
              <li>• Has basic JS bundle analysis and source map support</li>
              <li>• <span className="text-amber-600">Missing:</span> No orchestration layer, no evidence ledger, no MCP server</li>
              <li>• <span className="text-amber-600">Missing:</span> No setup/doctor system, no history with FTS5</li>
              <li>• <span className="text-amber-600">Missing:</span> No desktop GUI, no approval workflow</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">GhidraMCP (Apache-2.0)</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>• Targets Ghidra 12.1.4, provides MCP interface for native analysis</li>
              <li>• Supports decompiler, disassembly, function listing, xrefs</li>
              <li>• Will be integrated as NativeAnalysisProvider behind our port</li>
              <li>• <span className="text-emerald-600">Good fit:</span> Read tools auto-approved, writes need approval</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Security Notes</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
              <li>• ⚠️ Fake "REA.exe" trojan reported Oct 2026 — use official sources only</li>
              <li>• Archive <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">Reverse_Engineer_Anything.rar</code> must be verified before use</li>
              <li>• All network access restricted to doc lookups and user-approved downloads</li>
              <li>• Electron renderer: context isolation, no Node, strict CSP</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Five Principles */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Five Agentic Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'Autonomy', desc: 'Per-agent tool allow-lists and budgets. Each agent has bounded authority.', icon: '🤖' },
            { name: 'Collaboration', desc: 'Shared board with handoffs. Orchestrator delegates and reconciles.', icon: '🤝' },
            { name: 'Alignment', desc: 'Policy engine plus goal-drift check. Every action is risk-classified.', icon: '🎯' },
            { name: 'Observability', desc: 'Event log, timeline, per-agent stats. Full audit trail.', icon: '👁️' },
            { name: 'Human Oversight', desc: 'Approval checkpoints for risky actions. Nothing happens without consent.', icon: '🛡️' },
          ].map(p => (
            <div key={p.name} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="text-2xl mb-2">{p.icon}</div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{p.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{p.desc}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── Settings Screen ─────────────────────────────────────────────────────────
function SettingsScreen() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h2>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">General</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Theme</div>
                <div className="text-xs text-gray-500">Light or dark mode</div>
              </div>
              <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">History Retention</div>
                <div className="text-xs text-gray-500">Auto-delete investigations older than</div>
              </div>
              <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                <option>Never</option>
                <option>30 days</option>
                <option>90 days</option>
                <option>1 year</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Auto-approve static reads</div>
                <div className="text-xs text-gray-500">Skip approval for read-only analysis</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Privacy & Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Network Access</div>
                <div className="text-xs text-gray-500">Only loopback + approved downloads</div>
              </div>
              <Badge variant="success">Strict</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Telemetry</div>
                <div className="text-xs text-gray-500">No data leaves your machine</div>
              </div>
              <Badge variant="success">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">Secret Masking</div>
                <div className="text-xs text-gray-500">Auto-mask API keys, tokens in evidence</div>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-gray-300 dark:border-gray-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Provenance</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex justify-between"><span>Upstream REA version:</span><span className="font-mono text-gray-900 dark:text-white">1.4.2 (commit: a3f8c2e)</span></div>
            <div className="flex justify-between"><span>GhidraMCP version:</span><span className="font-mono text-gray-900 dark:text-white">0.3.0 (Apache-2.0)</span></div>
            <div className="flex justify-between"><span>App version:</span><span className="font-mono text-gray-900 dark:text-white">0.1.0-m0</span></div>
            <div className="flex justify-between"><span>Lockfile hash:</span><span className="font-mono text-gray-900 dark:text-white text-xs">sha256:d4e5f6a7b8c9...</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [darkMode, setDarkMode] = useState(false);
  const [investigation] = useState<Investigation>(sampleInvestigation);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const navItems: { id: Screen; label: string; icon: React.ReactNode }[] = [
    { id: 'welcome', label: 'Home', icon: <Icons.Home /> },
    { id: 'ask', label: 'Ask', icon: <Icons.Search /> },
    { id: 'investigation', label: 'Investigation', icon: <Icons.Play /> },
    { id: 'result', label: 'Results', icon: <Icons.FileText /> },
    { id: 'approvals', label: 'Approvals', icon: <Icons.Bell /> },
    { id: 'history', label: 'History', icon: <Icons.History /> },
    { id: 'native', label: 'Native', icon: <Icons.Cpu /> },
    { id: 'setup', label: 'Setup', icon: <Icons.Settings /> },
    { id: 'mcp', label: 'MCP', icon: <Icons.Link /> },
    { id: 'logs', label: 'Logs', icon: <Icons.Terminal /> },
    { id: 'architecture', label: 'Architecture', icon: <Icons.Shield /> },
    { id: 'settings', label: 'Settings', icon: <Icons.Settings /> },
  ];

  const renderScreen = () => {
    switch (screen) {
      case 'welcome': return <WelcomeScreen onStart={() => setScreen('ask')} />;
      case 'setup': return <SetupScreen />;
      case 'ask': return <AskScreen onInvestigate={() => setScreen('investigation')} />;
      case 'investigation': return <InvestigationScreen investigation={investigation} onViewResult={() => setScreen('result')} />;
      case 'result': return <ResultScreen investigation={investigation} />;
      case 'history': return <HistoryScreen />;
      case 'native': return <NativeScreen />;
      case 'logs': return <LogsScreen />;
      case 'settings': return <SettingsScreen />;
      case 'mcp': return <MCPScreen />;
      case 'architecture': return <ArchitectureScreen />;
      case 'approvals': return <ApprovalsScreen />;
      default: return <WelcomeScreen onStart={() => setScreen('ask')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white">
              <Icons.Cpu />
            </div>
            <div>
              <div className="font-bold text-gray-900 dark:text-white text-sm">REA Agentic AI</div>
              <div className="text-xs text-gray-500">v0.1.0-m0</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5 ${
                screen === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
              {item.id === 'approvals' && (
                <span className="ml-auto w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">2</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-10 h-5 rounded-full transition-colors ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'} relative`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Local-only • No telemetry</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {renderScreen()}
      </main>
    </div>
  );
}
