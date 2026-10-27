// Real data persistence and state management
import type { BinaryAnalysisResult } from './binaryAnalyzer';

import type { GhidraAnalysisResult } from './ghidraAnalyzer';

export interface Investigation {
  id: string;
  question: string;
  targetPath: string;
  targetType: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  result?: InvestigationResult;
  fileSize?: number;
  fileHash?: string;
  binaryAnalysis?: BinaryAnalysisResult;
  ghidraAnalysis?: GhidraAnalysisResult;
}

export interface InvestigationResult {
  summary: string;
  confidence: number;
  evidence: Evidence[];
  steps: string[];
  codeSnippets: CodeSnippet[];
  recommendations: string[];
  risks: Risk[];
  fileInfo?: {
    type: string;
    mime: string;
    extension: string;
    hashes: {
      md5: string;
      sha1: string;
      sha256: string;
      sha512: string;
    };
    entropy: number;
    packers: string[];
    stringCount: number;
  };
}

export interface Evidence {
  id: string;
  type: 'code' | 'string' | 'pattern' | 'dependency' | 'api';
  description: string;
  location: string;
  content: string;
  confidence: number;
}

export interface CodeSnippet {
  id: string;
  title: string;
  language: string;
  code: string;
  lineStart: number;
  lineEnd: number;
}

export interface Risk {
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  mitigation: string;
}

export interface AnalysisResult {
  summary: string;
  confidence: number;
  evidence: Evidence[];
  steps: string[];
  codeSnippets: CodeSnippet[];
  recommendations: string[];
  risks: Risk[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoApproveReads: boolean;
  historyRetention: 'never' | '30' | '90' | '365';
  secretMasking: boolean;
  maxFileSize: number; // MB
  allowedExtensions: string[];
}

const STORAGE_KEYS = {
  INVESTIGATIONS: 'rea_investigations',
  SETTINGS: 'rea_settings',
  ACKNOWLEDGED: 'rea_acknowledged',
};

// Investigation Management
export function saveInvestigation(investigation: Investigation): void {
  const investigations = getAllInvestigations();
  const existingIndex = investigations.findIndex(i => i.id === investigation.id);
  
  if (existingIndex >= 0) {
    investigations[existingIndex] = investigation;
  } else {
    investigations.unshift(investigation);
  }
  
  localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
}

export function getAllInvestigations(): Investigation[] {
  const data = localStorage.getItem(STORAGE_KEYS.INVESTIGATIONS);
  return data ? JSON.parse(data) : [];
}

export function getInvestigation(id: string): Investigation | undefined {
  return getAllInvestigations().find(i => i.id === id);
}

export function deleteInvestigation(id: string): void {
  const investigations = getAllInvestigations().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(investigations));
}

export function exportInvestigations(): string {
  return JSON.stringify(getAllInvestigations(), null, 2);
}

export function importInvestigations(json: string): void {
  const imported = JSON.parse(json);
  const existing = getAllInvestigations();
  const merged = [...imported, ...existing];
  
  // Remove duplicates by id
  const unique = merged.reduce((acc: Investigation[], curr) => {
    if (!acc.find(i => i.id === curr.id)) {
      acc.push(curr);
    }
    return acc;
  }, []);
  
  localStorage.setItem(STORAGE_KEYS.INVESTIGATIONS, JSON.stringify(unique));
}

// Settings Management
export function getSettings(): AppSettings {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return data ? JSON.parse(data) : getDefaultSettings();
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

export function getDefaultSettings(): AppSettings {
  return {
    theme: 'system',
    autoApproveReads: true,
    historyRetention: 'never',
    secretMasking: true,
    maxFileSize: 10,
    allowedExtensions: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.go', '.rs'],
  };
}

// Acknowledgment
export function hasAcknowledged(): boolean {
  return localStorage.getItem(STORAGE_KEYS.ACKNOWLEDGED) === 'true';
}

export function setAcknowledged(): void {
  localStorage.setItem(STORAGE_KEYS.ACKNOWLEDGED, 'true');
}

// Utility Functions
export function generateId(): string {
  return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function calculateHash(content: string): string {
  // Simple hash for demo (in production, use crypto.subtle)
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}
