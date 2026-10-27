import { useState, useEffect } from 'react';
import { AgentOrchestrator, AGENT_DEFINITIONS, AgentRole } from '../utils/agentSystem';
import { auditTrail } from '../utils/auditTrail';
import { MCPServer, MCP_SERVER_CONFIG, MCP_CLIENT_CONFIGS, generateClientConfig } from '../utils/mcpIntegration';

export function AgentSystemScreen() {
  const [orchestrator] = useState(new AgentOrchestrator());
  const [agents, setAgents] = useState(orchestrator.getAgents());
  const [events, setEvents] = useState(orchestrator.getEvents());
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentRole | null>(null);

  // Update agents and events periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(orchestrator.getAgents());
      setEvents(orchestrator.getEvents());
    }, 500);

    return () => clearInterval(interval);
  }, [orchestrator]);

  const handleStartInvestigation = async () => {
    setIsRunning(true);
    auditTrail.logInfo('Agent System', 'Starting multi-agent investigation');
    
    try {
      await orchestrator.startInvestigation(
        'How does this application work?',
        '/sample/app.exe'
      );
      
      auditTrail.logInvestigationComplete('inv-001', 5000, 15);
    } catch (error) {
      auditTrail.logError('Agent System', error instanceof Error ? error.message : 'Unknown error');
    }
    
    setIsRunning(false);
    setAgents(orchestrator.getAgents());
    setEvents(orchestrator.getEvents());
  };

  const handleReset = () => {
    orchestrator.reset();
    setAgents(orchestrator.getAgents());
    setEvents(orchestrator.getEvents());
    setSelectedAgent(null);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Multi-Agent System</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            12 specialized AI agents working collaboratively
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleStartInvestigation}
            disabled={isRunning}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isRunning ? 'Running...' : 'Start Investigation'}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {agents.map((agent) => {
          const def = AGENT_DEFINITIONS[agent.role];
          const isSelected = selectedAgent === agent.role;
          
          return (
            <div
              key={agent.id}
              onClick={() => setSelectedAgent(isSelected ? null : agent.role)}
              className={`bg-white dark:bg-gray-800 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-indigo-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{def.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{def.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                      agent.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      agent.status === 'done' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      agent.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {agent.status}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {def.description}
              </p>
              
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Calls</span>
                    <span>{agent.budget.callsUsed} / {agent.budget.maxCalls}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(agent.budget.callsUsed / agent.budget.maxCalls) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Time</span>
                    <span>{agent.budget.timeUsed}ms / {agent.budget.maxTime * 1000}ms</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(agent.budget.timeUsed / (agent.budget.maxTime * 1000)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {agent.lastAction && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last: {agent.lastAction}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Agent Details */}
      {selectedAgent && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {AGENT_DEFINITIONS[selectedAgent].icon} {AGENT_DEFINITIONS[selectedAgent].name} Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Tools</h4>
              <div className="flex flex-wrap gap-2">
                {AGENT_DEFINITIONS[selectedAgent].tools.map((tool) => (
                  <span
                    key={tool}
                    className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded text-xs font-mono"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget</h4>
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <div>Max Calls: {agents.find(a => a.role === selectedAgent)?.budget.maxCalls}</div>
                <div>Max Time: {agents.find(a => a.role === selectedAgent)?.budget.maxTime}s</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Event Timeline */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Event Timeline ({events.length} events)
        </h3>
        
        {events.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No events yet. Start an investigation to see agent activity.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {events.slice().reverse().map((event) => {
              const agentDef = AGENT_DEFINITIONS[event.agent];
              
              return (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                >
                  <span className="text-xl">{agentDef.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {agentDef.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{event.action}</span>
                      {event.detail && <span className="ml-2 text-gray-500 dark:text-gray-400">— {event.detail}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function MCPScreen() {
  const [mcpServer] = useState(new MCPServer());
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTool, setSelectedTool] = useState<keyof typeof MCP_CLIENT_CONFIGS | null>(null);

  const handleConnect = async () => {
    await mcpServer.start();
    setIsConnected(true);
    auditTrail.logMCPConnection('MCP Server', true);
  };

  const handleDisconnect = async () => {
    await mcpServer.stop();
    setIsConnected(false);
    auditTrail.logMCPConnection('MCP Server', false);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">MCP Integration</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect with Claude, Codex, Cursor, and VS Code
          </p>
        </div>
        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          className={`px-4 py-2 font-medium rounded-lg transition-colors ${
            isConnected
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>

      {/* Server Status */}
      <div className={`rounded-xl border-2 p-6 mb-6 ${
        isConnected
          ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          }`} />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {MCP_SERVER_CONFIG.name} v{MCP_SERVER_CONFIG.version}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isConnected ? 'Connected and ready' : 'Disconnected'}
            </p>
          </div>
        </div>
      </div>

      {/* Available Tools */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Available Tools ({MCP_SERVER_CONFIG.tools.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MCP_SERVER_CONFIG.tools.map((tool) => (
            <div
              key={tool.name}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="font-mono text-sm font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                {tool.name}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Client Configurations */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Client Configurations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(MCP_CLIENT_CONFIGS).map(([key, config]) => (
            <div
              key={key}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {config.name}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {config.instructions}
              </p>
              <button
                onClick={() => {
                  const configStr = generateClientConfig(key as keyof typeof MCP_CLIENT_CONFIGS);
                  navigator.clipboard.writeText(configStr);
                  auditTrail.logInfo('MCP', `Copied ${config.name} configuration`);
                  alert(`${config.name} configuration copied to clipboard!`);
                }}
                className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded text-sm font-medium transition-colors"
              >
                Copy Configuration
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AuditTrailScreen() {
  const [events, setEvents] = useState(auditTrail.getEvents());
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(auditTrail.getEvents());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(event => {
    if (filter !== 'all' && event.type !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.action.toLowerCase().includes(query) ||
        event.details.toLowerCase().includes(query) ||
        (event.agent && event.agent.toLowerCase().includes(query))
      );
    }
    return true;
  });

  const stats = auditTrail.getStatistics();

  const handleExport = () => {
    const log = auditTrail.exportLog();
    const blob = new Blob([log], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trail-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    auditTrail.logInfo('Audit Trail', 'Exported audit log');
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all audit events?')) {
      auditTrail.clear();
      setEvents([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Trail</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Complete event logging and history tracking
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
          >
            Export Log
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Events</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalEvents}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate</div>
          <div className="text-2xl font-bold text-green-600">{stats.successRate.toFixed(1)}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Duration</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageDuration.toFixed(0)}ms</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Errors</div>
          <div className="text-2xl font-bold text-red-600">{stats.eventsBySeverity.high || 0}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="investigation_start">Investigation Start</option>
            <option value="investigation_complete">Investigation Complete</option>
            <option value="file_upload">File Upload</option>
            <option value="file_analysis">File Analysis</option>
            <option value="agent_action">Agent Action</option>
            <option value="sandbox_execute">Sandbox Execute</option>
            <option value="export_report">Export Report</option>
            <option value="error">Errors</option>
            <option value="warning">Warnings</option>
          </select>
        </div>
      </div>

      {/* Event List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Events ({filteredEvents.length})
        </h3>
        
        {filteredEvents.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            No events found.
          </p>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredEvents.slice().reverse().map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border-l-4 ${
                  event.severity === 'critical' ? 'bg-red-50 dark:bg-red-900/10 border-red-500' :
                  event.severity === 'high' ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-500' :
                  event.severity === 'medium' || event.severity === 'warning' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-500' :
                  'bg-blue-50 dark:bg-blue-900/10 border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      event.success === false ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {event.type.replace(/_/g, ' ').toUpperCase()}
                    </span>
                    {event.agent && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {event.agent}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="text-sm text-gray-900 dark:text-white font-medium mb-1">
                  {event.action}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {event.details}
                </div>
                {event.duration !== undefined && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Duration: {event.duration}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
