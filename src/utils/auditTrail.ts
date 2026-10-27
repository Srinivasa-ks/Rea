// Complete Audit Trail System
// Full event logging and history tracking for all operations

export type AuditEventType =
  | 'investigation_start'
  | 'investigation_complete'
  | 'investigation_delete'
  | 'file_upload'
  | 'file_analysis'
  | 'agent_action'
  | 'sandbox_execute'
  | 'sandbox_stop'
  | 'export_report'
  | 'settings_change'
  | 'mcp_connection'
  | 'error'
  | 'warning'
  | 'info';

export type AuditSeverity = 'low' | 'medium' | 'high' | 'critical' | 'info' | 'warning';

export interface AuditEvent {
  id: string;
  timestamp: number;
  type: AuditEventType;
  severity: AuditSeverity;
  agent?: string;
  action: string;
  details: string;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  duration?: number;
  success?: boolean;
  error?: string;
}

export interface AuditLog {
  events: AuditEvent[];
  totalEvents: number;
  startTime: number;
  lastUpdated: number;
}

const STORAGE_KEY = 'rea_audit_trail';
const MAX_EVENTS = 10000; // Keep last 10,000 events

// Audit Trail Manager
export class AuditTrail {
  private events: AuditEvent[];
  private sessionId: string;

  constructor() {
    this.events = this.loadEvents();
    this.sessionId = this.generateSessionId();
  }

  // Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Load events from localStorage
  private loadEvents(): AuditEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load audit trail:', error);
      return [];
    }
  }

  // Save events to localStorage
  private saveEvents(): void {
    try {
      // Keep only the last MAX_EVENTS
      const eventsToSave = this.events.slice(-MAX_EVENTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Failed to save audit trail:', error);
    }
  }

  // Log a new event
  log(event: Omit<AuditEvent, 'id' | 'timestamp' | 'sessionId'>): AuditEvent {
    const auditEvent: AuditEvent = {
      ...event,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(auditEvent);
    this.saveEvents();

    return auditEvent;
  }

  // Log investigation start
  logInvestigationStart(investigationId: string, question: string, targetPath: string): void {
    this.log({
      type: 'investigation_start',
      severity: 'info',
      action: 'Investigation Started',
      details: `Started investigation for: ${question}`,
      metadata: { investigationId, question, targetPath },
      success: true,
    });
  }

  // Log investigation complete
  logInvestigationComplete(investigationId: string, duration: number, evidenceCount: number): void {
    this.log({
      type: 'investigation_complete',
      severity: 'info',
      action: 'Investigation Completed',
      details: `Completed investigation with ${evidenceCount} evidence items`,
      metadata: { investigationId, duration, evidenceCount },
      duration,
      success: true,
    });
  }

  // Log investigation delete
  logInvestigationDelete(investigationId: string): void {
    this.log({
      type: 'investigation_delete',
      severity: 'medium',
      action: 'Investigation Deleted',
      details: `Deleted investigation ${investigationId}`,
      metadata: { investigationId },
      success: true,
    });
  }

  // Log file upload
  logFileUpload(fileName: string, fileSize: number, fileType: string): void {
    this.log({
      type: 'file_upload',
      severity: 'info',
      action: 'File Uploaded',
      details: `Uploaded file: ${fileName} (${fileSize} bytes, ${fileType})`,
      metadata: { fileName, fileSize, fileType },
      success: true,
    });
  }

  // Log file analysis
  logFileAnalysis(fileName: string, analysisType: string, duration: number): void {
    this.log({
      type: 'file_analysis',
      severity: 'info',
      action: 'File Analyzed',
      details: `Analyzed ${fileName} using ${analysisType}`,
      metadata: { fileName, analysisType },
      duration,
      success: true,
    });
  }

  // Log agent action
  logAgentAction(agentName: string, action: string, details: string): void {
    this.log({
      type: 'agent_action',
      severity: 'info',
      agent: agentName,
      action,
      details,
      success: true,
    });
  }

  // Log sandbox execution
  logSandboxExecute(code: string, duration: number, success: boolean): void {
    this.log({
      type: 'sandbox_execute',
      severity: success ? 'info' : 'warning',
      action: 'Sandbox Execution',
      details: `Executed code in sandbox (${duration}ms)`,
      metadata: { codeLength: code.length },
      duration,
      success,
    });
  }

  // Log sandbox stop
  logSandboxStop(): void {
    this.log({
      type: 'sandbox_stop',
      severity: 'info',
      action: 'Sandbox Stopped',
      details: 'Sandbox environment stopped',
      success: true,
    });
  }

  // Log report export
  logExportReport(investigationId: string, format: string): void {
    this.log({
      type: 'export_report',
      severity: 'info',
      action: 'Report Exported',
      details: `Exported investigation ${investigationId} as ${format}`,
      metadata: { investigationId, format },
      success: true,
    });
  }

  // Log settings change
  logSettingsChange(setting: string, oldValue: any, newValue: any): void {
    this.log({
      type: 'settings_change',
      severity: 'low',
      action: 'Settings Changed',
      details: `Changed ${setting} from ${oldValue} to ${newValue}`,
      metadata: { setting, oldValue, newValue },
      success: true,
    });
  }

  // Log MCP connection
  logMCPConnection(tool: string, connected: boolean): void {
    this.log({
      type: 'mcp_connection',
      severity: connected ? 'info' : 'warning',
      action: 'MCP Connection',
      details: `${connected ? 'Connected to' : 'Disconnected from'} ${tool}`,
      metadata: { tool, connected },
      success: connected,
    });
  }

  // Log error
  logError(action: string, error: string, metadata?: Record<string, any>): void {
    this.log({
      type: 'error',
      severity: 'high',
      action,
      details: `Error: ${error}`,
      metadata,
      success: false,
      error,
    });
  }

  // Log warning
  logWarning(action: string, details: string, metadata?: Record<string, any>): void {
    this.log({
      type: 'warning',
      severity: 'medium',
      action,
      details,
      metadata,
      success: true,
    });
  }

  // Log info
  logInfo(action: string, details: string, metadata?: Record<string, any>): void {
    this.log({
      type: 'info',
      severity: 'low',
      action,
      details,
      metadata,
      success: true,
    });
  }

  // Get all events
  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  // Get events by type
  getEventsByType(type: AuditEventType): AuditEvent[] {
    return this.events.filter(e => e.type === type);
  }

  // Get events by severity
  getEventsBySeverity(severity: AuditSeverity): AuditEvent[] {
    return this.events.filter(e => e.severity === severity);
  }

  // Get events by agent
  getEventsByAgent(agent: string): AuditEvent[] {
    return this.events.filter(e => e.agent === agent);
  }

  // Get events in time range
  getEventsInRange(startTime: number, endTime: number): AuditEvent[] {
    return this.events.filter(e => e.timestamp >= startTime && e.timestamp <= endTime);
  }

  // Get recent events
  getRecentEvents(count: number = 100): AuditEvent[] {
    return this.events.slice(-count);
  }

  // Get audit log summary
  getSummary(): AuditLog {
    return {
      events: this.events,
      totalEvents: this.events.length,
      startTime: this.events.length > 0 ? this.events[0].timestamp : Date.now(),
      lastUpdated: this.events.length > 0 ? this.events[this.events.length - 1].timestamp : Date.now(),
    };
  }

  // Clear all events
  clear(): void {
    this.events = [];
    this.saveEvents();
  }

  // Export audit log
  exportLog(): string {
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: Date.now(),
      sessionId: this.sessionId,
      events: this.events,
    }, null, 2);
  }

  // Import audit log
  importLog(json: string): void {
    try {
      const data = JSON.parse(json);
      if (data.events && Array.isArray(data.events)) {
        this.events = [...this.events, ...data.events];
        this.saveEvents();
      }
    } catch (error) {
      console.error('Failed to import audit log:', error);
    }
  }

  // Search events
  searchEvents(query: string): AuditEvent[] {
    const lowerQuery = query.toLowerCase();
    return this.events.filter(e =>
      e.action.toLowerCase().includes(lowerQuery) ||
      e.details.toLowerCase().includes(lowerQuery) ||
      (e.agent && e.agent.toLowerCase().includes(lowerQuery))
    );
  }

  // Get statistics
  getStatistics(): {
    totalEvents: number;
    eventsByType: Record<AuditEventType, number>;
    eventsBySeverity: Record<AuditSeverity, number>;
    averageDuration: number;
    successRate: number;
  } {
    const eventsByType = {} as Record<AuditEventType, number>;
    const eventsBySeverity = {} as Record<AuditSeverity, number>;
    let totalDuration = 0;
    let durationCount = 0;
    let successCount = 0;

    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1;
      
      if (event.duration !== undefined) {
        totalDuration += event.duration;
        durationCount++;
      }
      
      if (event.success) {
        successCount++;
      }
    });

    return {
      totalEvents: this.events.length,
      eventsByType,
      eventsBySeverity,
      averageDuration: durationCount > 0 ? totalDuration / durationCount : 0,
      successRate: this.events.length > 0 ? (successCount / this.events.length) * 100 : 0,
    };
  }
}

// Global audit trail instance
export const auditTrail = new AuditTrail();
