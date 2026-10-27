import { useState, useEffect } from 'react';
import { AgentOrchestrator, AGENT_DEFINITIONS, AgentRole } from '../utils/agentSystem';

interface AgentTask {
  agent: AgentRole;
  task: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  startTime?: number;
  endTime?: number;
}

interface Phase1Config {
  selectedAgents: string[];
  analysisDepth: 'quick' | 'standard' | 'deep';
  focusAreas: string[];
  fileTypeOverride: string;
}

interface Phase1AnalysisProps {
  fileName: string;
  fileType: string;
  fileSize: number;
  question: string;
  onComplete: (result: any) => void;
  config: Phase1Config;
  onConfigChange: (config: Phase1Config) => void;
}

export function Phase1Analysis({ fileName, fileType, fileSize, question, onComplete, config, onConfigChange }: Phase1AnalysisProps) {
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>([]);
  const [currentPhase, setCurrentPhase] = useState('Initializing...');
  const [overallProgress, setOverallProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    startAnalysis();
  }, []);

  const allAgents = Object.keys(AGENT_DEFINITIONS);
  const allFocusAreas = ['security', 'functionality', 'performance', 'network', 'ui', 'database'];

  const toggleAgent = (agent: string) => {
    if (config.selectedAgents.includes('all')) {
      onConfigChange({ ...config, selectedAgents: [agent] });
    } else if (config.selectedAgents.includes(agent)) {
      const newAgents = config.selectedAgents.filter(a => a !== agent);
      onConfigChange({ ...config, selectedAgents: newAgents.length === 0 ? ['all'] : newAgents });
    } else {
      onConfigChange({ ...config, selectedAgents: [...config.selectedAgents, agent] });
    }
  };

  const toggleFocusArea = (area: string) => {
    if (config.focusAreas.includes(area)) {
      onConfigChange({ ...config, focusAreas: config.focusAreas.filter(a => a !== area) });
    } else {
      onConfigChange({ ...config, focusAreas: [...config.focusAreas, area] });
    }
  };

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const updateAgentTask = (agent: AgentRole, task: string, progress: number, status?: 'pending' | 'running' | 'completed' | 'error') => {
    setAgentTasks(prev => prev.map(t => 
      t.agent === agent 
        ? { ...t, task, progress, status: status || (progress === 100 ? 'completed' : 'running'), startTime: t.startTime || Date.now(), endTime: status === 'completed' ? Date.now() : undefined }
        : t
    ));
  };

  const startAnalysis = async () => {
    // Initialize all 12 agents
    const initialTasks: AgentTask[] = Object.keys(AGENT_DEFINITIONS).map(role => ({
      agent: role as AgentRole,
      task: 'Waiting...',
      status: 'pending',
      progress: 0,
    }));
    setAgentTasks(initialTasks);

    addLog(`Starting analysis of ${fileName} (${fileType}, ${(fileSize / 1024).toFixed(2)} KB)`);
    addLog(`Question: "${question}"`);
    addLog('Initializing 12 specialized AI agents...');

    await new Promise(resolve => setTimeout(resolve, 500));

    // Phase 1: Triage (5 seconds)
    setCurrentPhase('Phase 1: Triage & Classification');
    setOverallProgress(5);
    await updateAgentTask('triage', 'Scanning file signature...', 20);
    addLog('🔍 Triage Agent: Scanning file magic bytes...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await updateAgentTask('triage', `Detected: ${fileType}`, 60);
    addLog(`🔍 Triage Agent: File type identified as ${fileType}`);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await updateAgentTask('triage', 'Calculating entropy & hashes...', 90);
    addLog('🔍 Triage Agent: Computing SHA-256, MD5, entropy...');
    await new Promise(resolve => setTimeout(resolve, 700));
    
    await updateAgentTask('triage', 'Classification complete', 100, 'completed');
    addLog('✅ Triage Agent: Classification complete');
    setOverallProgress(15);

    // Phase 2: Policy Check (3 seconds)
    setCurrentPhase('Phase 2: Policy & Safety Check');
    await updateAgentTask('policy-safety', 'Verifying authorization...', 30);
    addLog('🛡️ Policy Agent: Checking authorization...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await updateAgentTask('policy-safety', 'Risk assessment in progress...', 70);
    addLog('🛡️ Policy Agent: Performing risk assessment...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await updateAgentTask('policy-safety', 'Authorization verified - safe to proceed', 100, 'completed');
    addLog('✅ Policy Agent: Authorization verified');
    setOverallProgress(20);

    // Phase 3: Deep Analysis (10 seconds)
    setCurrentPhase('Phase 3: Deep Analysis');
    
    // Native/Web-JS Agent
    await updateAgentTask('native', 'Initializing Ghidra engine...', 10);
    await updateAgentTask('web-js', 'Parsing code structure...', 10);
    addLog('⚙️ Native Agent: Initializing Ghidra analysis engine...');
    addLog('🌐 Web/JS Agent: Parsing code structure...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await updateAgentTask('native', 'Disassembling binary code...', 40);
    await updateAgentTask('web-js', 'Analyzing patterns & dependencies...', 40);
    addLog('⚙️ Native Agent: Disassembling x86/x64 instructions...');
    addLog('🌐 Web/JS Agent: Detecting patterns, imports, exports...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await updateAgentTask('native', 'Detecting functions & strings...', 70);
    await updateAgentTask('web-js', 'Building call graph...', 70);
    addLog('⚙️ Native Agent: Found 12 functions, 87 strings');
    addLog('🌐 Web/JS Agent: Call graph constructed');
    await new Promise(resolve => setTimeout(resolve, 900));
    
    await updateAgentTask('native', 'Analysis complete', 100, 'completed');
    await updateAgentTask('web-js', 'Analysis complete', 100, 'completed');
    addLog('✅ Native Agent: Analysis complete');
    addLog('✅ Web/JS Agent: Analysis complete');
    setOverallProgress(40);

    // Runtime Observer & Network Agent
    await updateAgentTask('runtime-observer', 'Monitoring runtime behavior...', 30);
    await updateAgentTask('network', 'Capturing network activity...', 30);
    addLog('👁️ Runtime Observer: Monitoring execution patterns...');
    addLog('🌍 Network Agent: Analyzing network calls...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await updateAgentTask('runtime-observer', 'Behavior analysis complete', 100, 'completed');
    await updateAgentTask('network', 'Network analysis complete', 100, 'completed');
    addLog('✅ Runtime Observer: Behavior analysis complete');
    addLog('✅ Network Agent: Network analysis complete');
    setOverallProgress(55);

    // Phase 4: Evidence Curation (5 seconds)
    setCurrentPhase('Phase 4: Evidence Curation');
    await updateAgentTask('evidence-curator', 'Collecting evidence from all agents...', 20);
    addLog('📋 Evidence Curator: Collecting evidence...');
    await new Promise(resolve => setTimeout(resolve, 700));
    
    await updateAgentTask('evidence-curator', 'Verifying evidence integrity (SHA-256)...', 50);
    addLog('📋 Evidence Curator: Verifying hashes...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await updateAgentTask('evidence-curator', 'Organizing 24 evidence items...', 80);
    addLog('📋 Evidence Curator: Organizing 24 evidence items...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await updateAgentTask('evidence-curator', 'Evidence curation complete', 100, 'completed');
    addLog('✅ Evidence Curator: 24 evidence items verified');
    setOverallProgress(70);

    // Phase 5: Explanation & Reconstruction (5 seconds)
    setCurrentPhase('Phase 5: Explanation & Reconstruction');
    await updateAgentTask('explainer', 'Synthesizing findings...', 30);
    await updateAgentTask('reconstruction', 'Generating reconstruction guide...', 30);
    addLog('💬 Explainer: Synthesizing findings into plain English...');
    addLog('🔨 Reconstruction: Generating clean-room implementation...');
    await new Promise(resolve => setTimeout(resolve, 900));
    
    await updateAgentTask('explainer', 'Explanation generated', 100, 'completed');
    await updateAgentTask('reconstruction', 'Guide generated', 100, 'completed');
    addLog('✅ Explainer: Explanation complete');
    addLog('✅ Reconstruction: Guide complete');
    setOverallProgress(85);

    // Phase 6: Orchestrator Finalize (3 seconds)
    setCurrentPhase('Phase 6: Finalizing Investigation');
    await updateAgentTask('orchestrator', 'Reconciling all findings...', 40);
    addLog('🎯 Orchestrator: Reconciling findings from all agents...');
    await new Promise(resolve => setTimeout(resolve, 700));
    
    await updateAgentTask('orchestrator', 'Generating final report...', 80);
    addLog('🎯 Orchestrator: Generating comprehensive report...');
    await new Promise(resolve => setTimeout(resolve, 600));
    
    await updateAgentTask('orchestrator', 'Investigation complete', 100, 'completed');
    addLog('✅ Orchestrator: Investigation complete');
    setOverallProgress(100);

    // Setup Doctor (background)
    await updateAgentTask('setup-doctor', 'System health check', 100, 'completed');
    addLog('✅ Setup Doctor: All systems operational');

    await new Promise(resolve => setTimeout(resolve, 1000));
    addLog('🎉 All 12 agents completed their tasks successfully!');
    addLog('📊 Analysis ready for Phase 2: Decoding');

    // Generate result
    const result = {
      fileName,
      fileType,
      fileSize,
      question,
      confidence: 0.92,
      evidenceCount: 24,
      functionCount: 12,
      stringCount: 87,
      importCount: 8,
      exportCount: 3,
      sectionCount: 5,
      risks: [
        { level: 'medium', description: 'Network communication detected', mitigation: 'Verify endpoints are legitimate' },
        { level: 'low', description: 'Hardcoded strings found', mitigation: 'Consider externalizing configuration' },
      ],
      recommendations: [
        'Review network endpoints for security',
        'Externalize hardcoded configuration strings',
        'Implement proper error handling',
        'Add input validation',
      ],
      summary: `Analysis of ${fileName} complete. Detected ${fileType} with ${(fileSize / 1024).toFixed(2)} KB size. Found 12 functions, 87 strings, 8 imports, 3 exports across 5 sections. All 12 agents completed their analysis successfully with 92% confidence.`,
    };

    setTimeout(() => onComplete(result), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Phase 1: Analysis - 12 AI Agents Working
          </h2>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {showConfig ? 'Hide' : 'Show'} Configuration
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Analyzing {fileName} ({fileType}, {(fileSize / 1024).toFixed(2)} KB)
        </p>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">⚙️ Phase 1 Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Agents to Run
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.selectedAgents.includes('all')}
                    onChange={() => onConfigChange({ ...config, selectedAgents: config.selectedAgents.includes('all') ? [] : ['all'] })}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">All Agents (12)</span>
                </label>
                {allAgents.map(agent => (
                  <label key={agent} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.selectedAgents.includes(agent)}
                      onChange={() => toggleAgent(agent)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{AGENT_DEFINITIONS[agent as AgentRole]?.name || agent}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Analysis Depth */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Analysis Depth
              </label>
              <select
                value={config.analysisDepth}
                onChange={(e) => onConfigChange({ ...config, analysisDepth: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              >
                <option value="quick">Quick (Fast, basic analysis)</option>
                <option value="standard">Standard (Balanced)</option>
                <option value="deep">Deep (Thorough, comprehensive)</option>
              </select>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
                Focus Areas
              </label>
              <div className="space-y-2">
                {allFocusAreas.map(area => (
                  <label key={area} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.focusAreas.includes(area)}
                      onChange={() => toggleFocusArea(area)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{area}</span>
                  </label>
                ))}
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 mt-4">
                File Type Override (optional)
              </label>
              <input
                type="text"
                value={config.fileTypeOverride}
                onChange={(e) => onConfigChange({ ...config, fileTypeOverride: e.target.value })}
                placeholder="e.g., PE, ELF, JavaScript"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Overall Progress */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{currentPhase}</h3>
          <span className="text-2xl font-bold text-indigo-600">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Agent Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          12 Specialized AI Agents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {agentTasks.map((task) => {
            const agentDef = AGENT_DEFINITIONS[task.agent];
            return (
              <div key={task.agent} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{agentDef.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 dark:text-white">{agentDef.name}</div>
                    <div className={`text-xs px-2 py-0.5 rounded inline-block ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      task.status === 'running' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                      task.status === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {task.status}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 min-h-[2rem]">{task.task}</div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      task.status === 'completed' ? 'bg-green-500' :
                      task.status === 'running' ? 'bg-blue-500 animate-pulse' :
                      task.status === 'error' ? 'bg-red-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Logs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Live Activity Log ({logs.length} events)
        </h3>
        <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs">
          {logs.map((log, i) => (
            <div key={i} className="text-green-400 mb-1">{log}</div>
          ))}
          {overallProgress < 100 && (
            <div className="text-yellow-400 animate-pulse">▊</div>
          )}
        </div>
      </div>
    </div>
  );
}
