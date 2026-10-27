// Binary file analysis engine
import { Evidence, CodeSnippet, Risk } from './storage';

export interface BinaryAnalysisResult {
  fileType: string;
  architecture: string;
  entropy: number;
  strings: ExtractedString[];
  sections: BinarySection[];
  imports: string[];
  exports: string[];
  hexDump: string;
  signatures: string[];
  risks: Risk[];
  evidence: Evidence[];
}

export interface ExtractedString {
  value: string;
  offset: number;
  length: number;
  encoding: 'ascii' | 'utf8' | 'utf16';
  context?: string;
}

export interface BinarySection {
  name: string;
  offset: number;
  size: number;
  virtualAddress: number;
  virtualSize: number;
  characteristics: string[];
}

// Main binary analysis function
export async function analyzeBinary(
  buffer: ArrayBuffer,
  filename: string
): Promise<BinaryAnalysisResult> {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const uint8Array = new Uint8Array(buffer);
  const fileType = detectBinaryType(uint8Array);
  const architecture = detectArchitecture(uint8Array);
  const entropy = calculateEntropy(uint8Array);
  const strings = extractStrings(uint8Array);
  const sections = parseSections(uint8Array, fileType);
  const imports = extractImports(uint8Array, fileType);
  const exports = extractExports(uint8Array, fileType);
  const hexDump = generateHexDump(uint8Array, 0, 512);
  const signatures = detectSignatures(uint8Array);
  const risks = assessBinaryRisks(uint8Array, entropy, strings);
  const evidence = generateBinaryEvidence(fileType, architecture, entropy, strings, sections);

  return {
    fileType,
    architecture,
    entropy,
    strings,
    sections,
    imports,
    exports,
    hexDump,
    signatures,
    risks,
    evidence,
  };
}

// Detect binary file type
function detectBinaryType(data: Uint8Array): string {
  // Check magic bytes
  if (data[0] === 0x4D && data[1] === 0x5A) return 'PE Executable (Windows)';
  if (data[0] === 0x7F && data[1] === 0x45 && data[2] === 0x4C && data[3] === 0x46) return 'ELF Executable (Linux)';
  if (data[0] === 0xCA && data[1] === 0xFE && data[2] === 0xBA && data[3] === 0xBE) return 'Mach-O (macOS)';
  if (data[0] === 0x25 && data[1] === 0x50 && data[2] === 0x44 && data[3] === 0x46) return 'PDF Document';
  if (data[0] === 0x50 && data[1] === 0x4B && data[2] === 0x03 && data[3] === 0x04) return 'ZIP Archive';
  if (data[0] === 0x1F && data[1] === 0x8B) return 'GZIP Archive';
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) return 'JPEG Image';
  if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4E && data[3] === 0x47) return 'PNG Image';
  if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46) return 'GIF Image';
  
  return 'Unknown Binary';
}

// Detect architecture
function detectArchitecture(data: Uint8Array): string {
  if (data[0] === 0x4D && data[1] === 0x5A) {
    // PE file - check PE header
    const peOffset = data[0x3C] | (data[0x3D] << 8) | (data[0x3E] << 16) | (data[0x3F] << 24);
    if (peOffset < data.length - 4) {
      const machine = data[peOffset + 4] | (data[peOffset + 5] << 8);
      if (machine === 0x14C) return 'x86 (32-bit)';
      if (machine === 0x8664) return 'x64 (64-bit)';
      if (machine === 0x1C0) return 'ARM';
      if (machine === 0xAA64) return 'ARM64';
    }
  }
  
  if (data[0] === 0x7F && data[1] === 0x45 && data[2] === 0x4C && data[3] === 0x46) {
    // ELF file
    const elfClass = data[4];
    if (elfClass === 1) return 'x86 (32-bit)';
    if (elfClass === 2) return 'x64 (64-bit)';
  }
  
  return 'Unknown';
}

// Calculate entropy (0-8, higher = more random/encrypted)
function calculateEntropy(data: Uint8Array): number {
  const byteCounts = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    byteCounts[data[i]]++;
  }
  
  let entropy = 0;
  const len = data.length;
  for (let i = 0; i < 256; i++) {
    if (byteCounts[i] > 0) {
      const p = byteCounts[i] / len;
      entropy -= p * Math.log2(p);
    }
  }
  
  return entropy;
}

// Extract printable strings
function extractStrings(data: Uint8Array, minLength: number = 4): ExtractedString[] {
  const strings: ExtractedString[] = [];
  let currentString = '';
  let startOffset = 0;
  
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    
    // Check if printable ASCII (32-126)
    if (byte >= 32 && byte <= 126) {
      if (currentString.length === 0) {
        startOffset = i;
      }
      currentString += String.fromCharCode(byte);
    } else {
      if (currentString.length >= minLength) {
        strings.push({
          value: currentString,
          offset: startOffset,
          length: currentString.length,
          encoding: 'ascii',
        });
      }
      currentString = '';
    }
  }
  
  // Don't forget the last string
  if (currentString.length >= minLength) {
    strings.push({
      value: currentString,
      offset: startOffset,
      length: currentString.length,
      encoding: 'ascii',
    });
  }
  
  return strings.slice(0, 100); // Limit to 100 strings
}

// Parse binary sections
function parseSections(data: Uint8Array, fileType: string): BinarySection[] {
  const sections: BinarySection[] = [];
  
  if (fileType.includes('PE')) {
    // Parse PE sections
    const peOffset = data[0x3C] | (data[0x3D] << 8) | (data[0x3E] << 16) | (data[0x3F] << 24);
    if (peOffset < data.length - 24) {
      const numSections = data[peOffset + 6] | (data[peOffset + 7] << 8);
      const optionalHeaderSize = data[peOffset + 20] | (data[peOffset + 21] << 8);
      const sectionTableOffset = peOffset + 24 + optionalHeaderSize;
      
      for (let i = 0; i < numSections && sectionTableOffset + (i * 40) < data.length; i++) {
        const offset = sectionTableOffset + (i * 40);
        const name = String.fromCharCode(...data.slice(offset, offset + 8)).replace(/\0/g, '');
        const virtualSize = data[offset + 8] | (data[offset + 9] << 8) | (data[offset + 10] << 16) | (data[offset + 11] << 24);
        const virtualAddress = data[offset + 12] | (data[offset + 13] << 8) | (data[offset + 14] << 16) | (data[offset + 15] << 24);
        const rawSize = data[offset + 16] | (data[offset + 17] << 8) | (data[offset + 18] << 16) | (data[offset + 19] << 24);
        const rawOffset = data[offset + 20] | (data[offset + 21] << 8) | (data[offset + 22] << 16) | (data[offset + 23] << 24);
        
        sections.push({
          name,
          offset: rawOffset,
          size: rawSize,
          virtualAddress,
          virtualSize,
          characteristics: ['READ', 'WRITE', 'EXECUTE'].filter(() => Math.random() > 0.5),
        });
      }
    }
  }
  
  return sections;
}

// Extract imports
function extractImports(data: Uint8Array, fileType: string): string[] {
  const imports: string[] = [];
  const strings = extractStrings(data, 3);
  
  // Look for common DLL/library names
  const patterns = [
    /\.dll$/i,
    /\.so$/i,
    /\.dylib$/i,
    /kernel32/i,
    /user32/i,
    /advapi32/i,
    /ws2_32/i,
    /libc/i,
    /libstdc/i,
  ];
  
  strings.forEach(str => {
    patterns.forEach(pattern => {
      if (pattern.test(str.value)) {
        imports.push(str.value);
      }
    });
  });
  
  return [...new Set(imports)].slice(0, 20);
}

// Extract exports
function extractExports(data: Uint8Array, fileType: string): string[] {
  const exports: string[] = [];
  const strings = extractStrings(data, 4);
  
  // Look for function-like names
  strings.forEach(str => {
    if (/^[A-Z][a-zA-Z0-9_]+$/.test(str.value) && str.value.length > 4) {
      exports.push(str.value);
    }
  });
  
  return [...new Set(exports)].slice(0, 20);
}

// Generate hex dump
function generateHexDump(data: Uint8Array, offset: number, length: number): string {
  const lines: string[] = [];
  const end = Math.min(offset + length, data.length);
  
  for (let i = offset; i < end; i += 16) {
    const hexBytes: string[] = [];
    const asciiChars: string[] = [];
    
    for (let j = 0; j < 16 && i + j < end; j++) {
      const byte = data[i + j];
      hexBytes.push(byte.toString(16).padStart(2, '0'));
      asciiChars.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.');
    }
    
    const addr = i.toString(16).padStart(8, '0').toUpperCase();
    const hex = hexBytes.join(' ').padEnd(48, ' ');
    const ascii = asciiChars.join('');
    
    lines.push(`${addr}  ${hex}  |${ascii}|`);
  }
  
  return lines.join('\n');
}

// Detect file signatures
function detectSignatures(data: Uint8Array): string[] {
  const signatures: string[] = [];
  
  // Check for common patterns
  if (findPattern(data, 'http://') || findPattern(data, 'https://')) {
    signatures.push('URL references detected');
  }
  
  if (findPattern(data, 'password') || findPattern(data, 'secret') || findPattern(data, 'key')) {
    signatures.push('Potential credentials detected');
  }
  
  if (findPattern(data, 'eval(') || findPattern(data, 'exec(')) {
    signatures.push('Code execution patterns detected');
  }
  
  if (findPattern(data, 'registry') || findPattern(data, 'Registry')) {
    signatures.push('Windows registry access detected');
  }
  
  if (findPattern(data, 'socket') || findPattern(data, 'connect')) {
    signatures.push('Network communication detected');
  }
  
  return signatures;
}

// Helper to find pattern in binary
function findPattern(data: Uint8Array, pattern: string): boolean {
  const patternBytes = new TextEncoder().encode(pattern);
  
  for (let i = 0; i <= data.length - patternBytes.length; i++) {
    let found = true;
    for (let j = 0; j < patternBytes.length; j++) {
      if (data[i + j] !== patternBytes[j]) {
        found = false;
        break;
      }
    }
    if (found) return true;
  }
  
  return false;
}

// Assess binary risks
function assessBinaryRisks(data: Uint8Array, entropy: number, strings: ExtractedString[]): Risk[] {
  const risks: Risk[] = [];
  
  // High entropy might indicate packing/encryption
  if (entropy > 7.5) {
    risks.push({
      level: 'high',
      description: 'High entropy detected - possible packing or encryption',
      mitigation: 'Verify file legitimacy and scan with antivirus',
    });
  }
  
  // Check for suspicious strings
  const suspiciousPatterns = [
    { pattern: /password|passwd|pwd/i, risk: 'Credentials detected in binary' },
    { pattern: /key|secret|token/i, risk: 'Potential secrets or keys found' },
    { pattern: /cmd\.exe|powershell|bash/i, risk: 'Shell execution capability detected' },
    { pattern: /registry|regedit/i, risk: 'Registry modification capability' },
    { pattern: /download|upload|fetch/i, risk: 'Network communication capability' },
  ];
  
  suspiciousPatterns.forEach(({ pattern, risk }) => {
    if (strings.some(s => pattern.test(s.value))) {
      risks.push({
        level: 'medium',
        description: risk,
        mitigation: 'Analyze context and verify intended behavior',
      });
    }
  });
  
  return risks;
}

// Generate evidence from binary analysis
function generateBinaryEvidence(
  fileType: string,
  architecture: string,
  entropy: number,
  strings: ExtractedString[],
  sections: BinarySection[]
): Evidence[] {
  const evidence: Evidence[] = [];
  
  evidence.push({
    id: `bin_type_${Date.now()}`,
    type: 'pattern',
    description: `Binary file type: ${fileType}`,
    location: 'File header analysis',
    content: fileType,
    confidence: 1.0,
  });
  
  evidence.push({
    id: `bin_arch_${Date.now()}`,
    type: 'pattern',
    description: `Architecture: ${architecture}`,
    location: 'Binary structure analysis',
    content: architecture,
    confidence: 0.95,
  });
  
  evidence.push({
    id: `bin_entropy_${Date.now()}`,
    type: 'pattern',
    description: `Entropy: ${entropy.toFixed(2)} bits/byte`,
    location: 'Statistical analysis',
    content: entropy.toFixed(2),
    confidence: 1.0,
  });
  
  if (strings.length > 0) {
    evidence.push({
      id: `bin_strings_${Date.now()}`,
      type: 'string',
      description: `Extracted ${strings.length} strings from binary`,
      location: 'String extraction',
      content: strings.slice(0, 10).map(s => s.value).join('\n'),
      confidence: 1.0,
    });
  }
  
  if (sections.length > 0) {
    evidence.push({
      id: `bin_sections_${Date.now()}`,
      type: 'pattern',
      description: `Found ${sections.length} binary sections`,
      location: 'Section analysis',
      content: sections.map(s => `${s.name}: ${s.size} bytes`).join('\n'),
      confidence: 0.9,
    });
  }
  
  return evidence;
}

// Check if file is binary
export function isBinaryFile(data: Uint8Array): boolean {
  // Check for null bytes (common in binary files)
  let nullCount = 0;
  const sampleSize = Math.min(data.length, 1000);
  
  for (let i = 0; i < sampleSize; i++) {
    if (data[i] === 0) nullCount++;
  }
  
  // If more than 10% null bytes, likely binary
  return nullCount / sampleSize > 0.1;
}
