// Multi-Agent System - 12 Specialized AI Agents
export type AgentRole = 
  | 'orchestrator'
  | 'triage'
  | 'web-js'
  | 'electron'
  | 'runtime-observer'
  | 'native'
  | 'network'
  | 'evidence-curator'
  | 'explainer'
  | 'reconstruction'
  | 'policy-safety'
  | 'setup-doctor';

export type AgentStatus = 'idle' | 'active' | 'waiting-approval' | 'done' | 'error';

export interface Agent {
  id: string;
  role: AgentRole;
  name: string;
  status: AgentStatus;
  budget: {
    maxCalls: number;
    callsUsed: number;
    maxTime: number;
    timeUsed: number;
  };
  toolAllowList: string[];
  lastAction?: string;
  startTime?: number;
  endTime?: number;
}

export interface AgentEvent {
  id: string;
  timestamp: number;
  agent: AgentRole;
  action: string;
  detail: string;
  evidenceIds?: string[];
  riskClass?: string;
  requiresApproval?: boolean;
  approved?: boolean;
}

export interface AgentBudget {
  maxCalls: number;
  maxTime: number;
}

// Agent definitions with specialized capabilities
export const AGENT_DEFINITIONS: Record<AgentRole, {
  name: string;
  description: string;
  budget: AgentBudget;
  tools: string[];
  icon: string;
}> = {
  orchestrator: {
    name: 'Orchestrator',
    description: 'Coordinates investigation and delegates tasks to specialized agents',
    budget: { maxCalls: 50, maxTime: 600 },
    tools: ['delegate', 'plan', 'reconcile', 'monitor'],
    icon: '🎯',
  },
  triage: {
    name: 'Triage Agent',
    description: 'Classifies target type and determines analysis strategy',
    budget: { maxCalls: 20, maxTime: 120 },
    tools: ['file-stat', 'mime-detect', 'source-map-check', 'magic-bytes'],
    icon: '🔍',
  },
  'web-js': {
    name: 'Web/JS Agent',
    description: 'Analyzes JavaScript bundles, web apps, and source maps',
    budget: { maxCalls: 100, maxTime: 300 },
    tools: ['ast-parse', 'string-search', 'call-graph', 'source-map-resolve', 'dependency-trace'],
    icon: '🌐',
  },
  electron: {
    name: 'Electron Agent',
    description: 'Analyzes Electron applications and their structure',
    budget: { maxCalls: 80, maxTime: 240 },
    tools: ['package-parse', 'asar-extract', 'main-process-analyze', 'renderer-analyze'],
    icon: '⚡',
  },
  'runtime-observer': {
    name: 'Runtime Observer',
    description: 'Monitors runtime behavior and API calls',
    budget: { maxCalls: 60, maxTime: 180 },
    tools: ['hook-api', 'trace-calls', 'monitor-network', 'observe-dom'],
    icon: '👁️',
  },
  native: {
    name: 'Native Agent',
    description: 'Analyzes native binaries using Ghidra-style analysis',
    budget: { maxCalls: 120, maxTime: 360 },
    tools: ['disassemble', 'decompile', 'xref-analyze', 'string-extract', 'pattern-match'],
    icon: '⚙️',
  },
  network: {
    name: 'Network Agent',
    description: 'Captures and analyzes network traffic',
    budget: { maxCalls: 40, maxTime: 120 },
    tools: ['packet-capture', 'protocol-analyze', 'endpoint-discover', 'tls-inspect'],
    icon: '🌍',
  },
  'evidence-curator': {
    name: 'Evidence Curator',
    description: 'Collects, verifies, and organizes evidence',
    budget: { maxCalls: 30, maxTime: 120 },
    tools: ['record-evidence', 'link-evidence', 'hash-verify', 'timestamp'],
    icon: '📋',
  },
  explainer: {
    name: 'Explainer Agent',
    description: 'Synthesizes findings into plain English explanations',
    budget: { maxCalls: 20, maxTime: 180 },
    tools: ['synthesize', 'diagram-gen', 'confidence-calc', 'summary-gen'],
    icon: '💬',
  },
  reconstruction: {
    name: 'Reconstruction Agent',
    description: 'Provides guides to recreate analyzed features',
    budget: { maxCalls: 30, maxTime: 240 },
    tools: ['code-gen', 'template-select', 'clean-room-impl', 'doc-gen'],
    icon: '🔨',
  },
  'policy-safety': {
    name: 'Policy/Safety Agent',
    description: 'Enforces safety policies and risk assessment',
    budget: { maxCalls: 10, maxTime: 60 },
    tools: ['risk-assess', 'authorize-check', 'policy-enforce', 'audit-log'],
    icon: '🛡️',
  },
  'setup-doctor': {
    name: 'Setup Doctor',
    description: 'Checks system setup and tool availability',
    budget: { maxCalls: 15, maxTime: 90 },
    tools: ['detect-tools', 'verify-install', 'check-deps', 'recommend-setup'],
    icon: '🔧',
  },
};

// Create initial agent instances
export function createAgents(): Agent[] {
  return Object.entries(AGENT_DEFINITIONS).map(([role, def]) => ({
    id: `agent-${role}`,
    role: role as AgentRole,
    name: def.name,
    status: 'idle',
    budget: {
      maxCalls: def.budget.maxCalls,
      callsUsed: 0,
      maxTime: def.budget.maxTime,
      timeUsed: 0,
    },
    toolAllowList: def.tools,
  }));
}

// Agent orchestration
export class AgentOrchestrator {
  private agents: Agent[];
  private events: AgentEvent[];
  private currentPhase: string;

  constructor() {
    this.agents = createAgents();
    this.events = [];
    this.currentPhase = 'idle';
  }

  // Start investigation
  async startInvestigation(question: string, targetPath: string): Promise<void> {
    this.currentPhase = 'intake';
    
    // Phase 1: Triage
    await this.runAgent('triage', 'classify_target', `Analyzing ${targetPath}`);
    
    // Phase 2: Planning
    this.currentPhase = 'planning';
    await this.runAgent('orchestrator', 'create_plan', `Planning analysis for: ${question}`);
    
    // Phase 3: Investigation
    this.currentPhase = 'investigating';
    await this.runAgent('native', 'analyze_binary', 'Performing binary analysis');
    await this.runAgent('web-js', 'analyze_code', 'Analyzing code patterns');
    
    // Phase 4: Evidence curation
    this.currentPhase = 'reconciling';
    await this.runAgent('evidence-curator', 'verify_evidence', 'Verifying collected evidence');
    
    // Phase 5: Explanation
    this.currentPhase = 'explaining';
    await this.runAgent('explainer', 'synthesize', 'Generating explanation');
    
    this.currentPhase = 'completed';
  }

  // Run a specific agent action
  private async runAgent(role: AgentRole, action: string, detail: string): Promise<void> {
    const agent = this.agents.find(a => a.role === role);
    if (!agent) return;

    agent.status = 'active';
    agent.lastAction = action;
    agent.startTime = Date.now();
    agent.budget.callsUsed++;

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 500));

    agent.status = 'done';
    agent.endTime = Date.now();
    agent.budget.timeUsed = agent.endTime - (agent.startTime || 0);

    // Record event
    this.events.push({
      id: `evt-${Date.now()}`,
      timestamp: Date.now(),
      agent: role,
      action,
      detail,
    });
  }

  // Get all agents
  getAgents(): Agent[] {
    return this.agents;
  }

  // Get all events
  getEvents(): AgentEvent[] {
    return this.events;
  }

  // Get current phase
  getPhase(): string {
    return this.currentPhase;
  }

  // Reset orchestrator
  reset(): void {
    this.agents = createAgents();
    this.events = [];
    this.currentPhase = 'idle';
  }
}
