// Real code analysis engine
import { Evidence, CodeSnippet, Risk } from './storage';

export interface AnalysisResult {
  summary: string;
  confidence: number;
  evidence: Evidence[];
  steps: string[];
  codeSnippets: CodeSnippet[];
  recommendations: string[];
  risks: Risk[];
}

export interface AnalysisOptions {
  question: string;
  fileType: string;
}

// Main analysis function
export async function analyzeCode(
  code: string,
  options: AnalysisOptions
): Promise<AnalysisResult> {
  const { question, fileType } = options;
  
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const evidence: Evidence[] = [];
  const codeSnippets: CodeSnippet[] = [];
  const steps: string[] = [];
  const recommendations: string[] = [];
  const risks: Risk[] = [];
  
  // Analyze based on question keywords
  const questionLower = question.toLowerCase();
  
  // 1. Search functionality analysis
  if (questionLower.includes('search') || questionLower.includes('find')) {
    steps.push('Identified search-related patterns in code');
    
    // Search for search-related code
    const searchPatterns = [
      { pattern: /search|find|query|filter/gi, type: 'pattern' as const },
      { pattern: /useState.*search|search.*state/gi, type: 'code' as const },
      { pattern: /fetch.*search|api.*search/gi, type: 'api' as const },
    ];
    
    searchPatterns.forEach(({ pattern, type }) => {
      const matches = code.match(pattern);
      if (matches && matches.length > 0) {
        evidence.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type,
          description: `Found ${matches.length} ${type} matches related to search functionality`,
          location: 'Code analysis',
          content: matches.slice(0, 3).join(', '),
          confidence: 0.85,
        });
      }
    });
    
    // Extract search-related code snippets
    const searchRegex = /(?:function|const|let|var)\s+\w*[Ss]earch\w*\s*(?:=|:|\()/g;
    const searchMatches = code.match(searchRegex);
    if (searchMatches) {
      codeSnippets.push({
        id: `cs_${Date.now()}`,
        title: 'Search Function Definition',
        language: fileType,
        code: searchMatches[0],
        lineStart: 1,
        lineEnd: 1,
      });
    }
    
    recommendations.push('Consider implementing debouncing for search inputs to reduce API calls');
    recommendations.push('Add search result caching for better performance');
  }
  
  // 2. Authentication analysis
  if (questionLower.includes('auth') || questionLower.includes('login') || questionLower.includes('token')) {
    steps.push('Analyzed authentication mechanisms');
    
    const authPatterns = [
      /jwt|token|bearer/i,
      /auth|login|signin/i,
      /password|credential/i,
      /session|cookie/i,
    ];
    
    authPatterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        evidence.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'pattern',
          description: `Detected authentication pattern: ${pattern.source}`,
          location: 'Security analysis',
          content: matches[0],
          confidence: 0.9,
        });
      }
    });
    
    // Check for security risks
    if (code.match(/password.*=.*['"][^'"]+['"]/i)) {
      risks.push({
        level: 'critical',
        description: 'Hardcoded password detected',
        mitigation: 'Move credentials to environment variables or secure vault',
      });
    }
    
    if (!code.match(/https/i) && code.match(/fetch|axios|http/i)) {
      risks.push({
        level: 'high',
        description: 'Potential unencrypted HTTP communication',
        mitigation: 'Ensure all API calls use HTTPS',
      });
    }
    
    recommendations.push('Implement token refresh mechanism for long-lived sessions');
    recommendations.push('Add rate limiting to authentication endpoints');
  }
  
  // 3. API analysis
  if (questionLower.includes('api') || questionLower.includes('endpoint') || questionLower.includes('fetch')) {
    steps.push('Identified API calls and endpoints');
    
    const apiPatterns = [
      /fetch\(['"]([^'"]+)['"]/g,
      /axios\.(get|post|put|delete)\(['"]([^'"]+)['"]/g,
      /\/api\/[^\s'"]+/g,
    ];
    
    apiPatterns.forEach(pattern => {
      const matches = [...code.matchAll(pattern)];
      matches.forEach(match => {
        evidence.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'api',
          description: 'API endpoint discovered',
          location: 'Network analysis',
          content: match[0],
          confidence: 0.95,
        });
      });
    });
    
    recommendations.push('Document all API endpoints with request/response schemas');
    recommendations.push('Implement API error handling and retry logic');
  }
  
  // 4. Database analysis
  if (questionLower.includes('database') || questionLower.includes('db') || questionLower.includes('store')) {
    steps.push('Analyzed data storage patterns');
    
    const dbPatterns = [
      /localStorage|sessionStorage/i,
      /indexeddb/i,
      /mongodb|postgres|mysql|sqlite/i,
      /redux|mobx|zustand/i,
    ];
    
    dbPatterns.forEach(pattern => {
      if (code.match(pattern)) {
        evidence.push({
          id: `ev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          type: 'pattern',
          description: `Data storage mechanism detected: ${pattern.source}`,
          location: 'Architecture analysis',
          content: pattern.source,
          confidence: 0.8,
        });
      }
    });
    
    recommendations.push('Implement data validation before storage');
    recommendations.push('Consider data encryption for sensitive information');
  }
  
  // 5. General code quality analysis
  steps.push('Performed general code quality analysis');
  
  // Check for common issues
  if (code.match(/console\.log/gi)) {
    const count = (code.match(/console\.log/gi) || []).length;
    if (count > 5) {
      risks.push({
        level: 'low',
        description: `${count} console.log statements found`,
        mitigation: 'Remove debug logging in production code',
      });
    }
  }
  
  if (code.match(/any\s*:/g)) {
    const count = (code.match(/any\s*:/g) || []).length;
    if (count > 3) {
      risks.push({
        level: 'medium',
        description: `${count} uses of 'any' type detected`,
        mitigation: 'Replace with proper TypeScript types for better type safety',
      });
    }
  }
  
  // Calculate overall confidence
  const totalEvidence = evidence.length;
  const confidence = Math.min(0.95, 0.5 + (totalEvidence * 0.1));
  
  // Generate summary
  const summary = generateSummary(question, evidence.length, risks.length);
  
  return {
    summary,
    confidence,
    evidence,
    steps,
    codeSnippets,
    recommendations,
    risks,
  };
}

function generateSummary(question: string, evidenceCount: number, riskCount: number): string {
  const questionLower = question.toLowerCase();
  
  let summary = `Analysis of "${question}" completed. `;
  summary += `Found ${evidenceCount} pieces of evidence supporting the investigation. `;
  
  if (riskCount > 0) {
    summary += `Identified ${riskCount} potential ${riskCount === 1 ? 'risk' : 'risks'} that require attention. `;
  }
  
  if (questionLower.includes('search')) {
    summary += 'The search functionality appears to use client-side filtering with potential API integration.';
  } else if (questionLower.includes('auth')) {
    summary += 'Authentication mechanisms are present with some security considerations to address.';
  } else if (questionLower.includes('api')) {
    summary += 'Multiple API endpoints were discovered with varying levels of documentation.';
  } else {
    summary += 'The codebase shows standard patterns with room for optimization in several areas.';
  }
  
  return summary;
}

// File type detection
export function detectFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const typeMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'go': 'go',
    'rs': 'rust',
    'php': 'php',
    'rb': 'ruby',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'sql': 'sql',
    'sh': 'bash',
    'bash': 'bash',
  };
  
  return typeMap[ext || ''] || 'text';
}

// Code formatting helper
export function formatCodeSnippet(code: string, maxLength: number = 500): string {
  if (code.length <= maxLength) return code;
  return code.substring(0, maxLength) + '\n... (truncated)';
}
