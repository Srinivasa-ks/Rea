// REA Agentic AI — Core Domain Types
// These types define the contracts shared by CLI, MCP, and App

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

export type RiskClass = 'static-read' | 'sandbox' | 'debugger' | 'injection' | 'file-change' | 'live-network' | 'install';

export type EvidenceType = 'source-excerpt' | 'decompiled' | 'network-capture' | 'screenshot' | 'string-match' | 'xref' | 'call-graph' | 'runtime-trace' | 'doc-reference';

export type ConfidenceLevel = 'confirmed' | 'high' | 'medium' | 'low' | 'hypothesis';

export type InvestigationStatus = 'intake' | 'triage' | 'planning' | 'investigating' | 'reconciling' | 'explaining' | 'reconstructing' | 'archived' | 'paused';

export interface Agent {
  id: string;
  role: AgentRole;
  status: 'idle' | 'active' | 'waiting-approval' | 'done' | 'error';
  budget: { maxCalls: number; callsUsed: number; maxTime: number; timeUsed: number };
  toolAllowList: string[];
  lastAction?: string;
}

export interface EvidenceRecord {
  id: string;
  type: EvidenceType;
  source: string;
  tool: string;
  parameters: Record<string, unknown>;
  timestamp: string;
  hash: string;
  caption: string;
  excerpt?: string;
  address?: string;
  function?: string;
  confidence: ConfidenceLevel;
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  agent: AgentRole;
  action: string;
  detail: string;
  evidenceIds?: string[];
  riskClass?: RiskClass;
  requiresApproval?: boolean;
  approved?: boolean;
}

export interface Investigation {
  id: string;
  question: string;
  target: {
    name: string;
    type: 'web-app' | 'js-bundle' | 'electron' | 'native-binary' | 'unknown';
    path: string;
    hash: string;
    size: number;
  };
  status: InvestigationStatus;
  createdAt: string;
  updatedAt: string;
  agents: Agent[];
  events: AgentEvent[];
  evidence: EvidenceRecord[];
  answer?: FinalAnswer;
  authorizationConfirmed: boolean;
  tags: string[];
}

export interface FinalAnswer {
  summary: string;
  flow: string; // Mermaid diagram
  steps: string[];
  evidenceRefs: string[];
  confidence: ConfidenceLevel;
  openQuestions: string[];
  behaviorSpec: string;
  reconstruction: string;
  reproduceCommands: string[];
}

export interface SetupItem {
  name: string;
  status: 'present' | 'missing' | 'outdated' | 'optional';
  version?: string;
  required: boolean;
  installCommand?: string;
  size?: string;
  description: string;
}

export type Screen =
  | 'welcome'
  | 'setup'
  | 'ask'
  | 'investigation'
  | 'result'
  | 'history'
  | 'native'
  | 'logs'
  | 'settings'
  | 'mcp'
  | 'architecture'
  | 'approvals'
  | 'sandbox';
