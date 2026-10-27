// Real cryptographic utilities using Web Crypto API
export async function calculateHashes(buffer: ArrayBuffer): Promise<{
  md5: string;
  sha1: string;
  sha256: string;
  sha512: string;
}> {
  // MD5 (simple implementation for compatibility)
  const md5 = await calculateMD5(new Uint8Array(buffer));
  
  // SHA-1
  const sha1Buffer = await crypto.subtle.digest('SHA-1', buffer);
  const sha1 = arrayBufferToHex(sha1Buffer);
  
  // SHA-256
  const sha256Buffer = await crypto.subtle.digest('SHA-256', buffer);
  const sha256 = arrayBufferToHex(sha256Buffer);
  
  // SHA-512
  const sha512Buffer = await crypto.subtle.digest('SHA-512', buffer);
  const sha512 = arrayBufferToHex(sha512Buffer);
  
  return { md5, sha1, sha256, sha512 };
}

function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// MD5 implementation (RFC 1321)
async function calculateMD5(data: Uint8Array): Promise<string> {
  // Pre-processing: adding padding bits
  const msgLen = data.length;
  const bitLen = msgLen * 8;
  
  // Message needs to be congruent to 448 mod 512 bits (56 mod 64 bytes)
  const padLen = (56 - (msgLen + 1) % 64 + 64) % 64;
  const padded = new Uint8Array(msgLen + 1 + padLen + 8);
  padded.set(data);
  padded[msgLen] = 0x80;
  
  // Append length in bits as 64-bit little-endian
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLen >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true);
  
  // Initialize hash values
  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;
  
  // Per-round shift amounts
  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];
  
  // Pre-computed T values
  const K = new Array(64);
  for (let i = 0; i < 64; i++) {
    K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000);
  }
  
  // Process each 512-bit chunk
  for (let offset = 0; offset < padded.length; offset += 64) {
    const M = new Array(16);
    for (let j = 0; j < 16; j++) {
      M[j] = view.getUint32(offset + j * 4, true);
    }
    
    let A = a0, B = b0, C = c0, D = d0;
    
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      
      F = (F + A + K[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << s[i]) | (F >>> (32 - s[i])))) >>> 0;
    }
    
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }
  
  // Produce the final hash value (little-endian)
  const result = new Uint8Array(16);
  const resultView = new DataView(result.buffer);
  resultView.setUint32(0, a0, true);
  resultView.setUint32(4, b0, true);
  resultView.setUint32(8, c0, true);
  resultView.setUint32(12, d0, true);
  
  return arrayBufferToHex(result.buffer);
}

// Calculate file entropy (Shannon entropy)
export function calculateEntropy(data: Uint8Array): number {
  if (data.length === 0) return 0;
  
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

// Calculate entropy for a specific region
export function calculateRegionEntropy(data: Uint8Array, offset: number, size: number): number {
  const region = data.slice(offset, Math.min(offset + size, data.length));
  return calculateEntropy(region);
}

// Detect file type by magic bytes
export function detectFileTypeByMagic(data: Uint8Array): {
  type: string;
  mime: string;
  extension: string;
  confidence: number;
} {
  if (data.length < 4) {
    return { type: 'Unknown', mime: 'application/octet-stream', extension: 'bin', confidence: 0 };
  }
  
  // Check magic bytes
  const signatures = [
    // Executables
    { bytes: [0x4D, 0x5A], type: 'PE Executable', mime: 'application/vnd.microsoft.portable-executable', extension: 'exe', confidence: 1.0 },
    { bytes: [0x7F, 0x45, 0x4C, 0x46], type: 'ELF Executable', mime: 'application/x-elf', extension: 'elf', confidence: 1.0 },
    { bytes: [0xFE, 0xED, 0xFA, 0xCE], type: 'Mach-O 32-bit', mime: 'application/x-mach-binary', extension: 'macho', confidence: 1.0 },
    { bytes: [0xFE, 0xED, 0xFA, 0xCF], type: 'Mach-O 64-bit', mime: 'application/x-mach-binary', extension: 'macho', confidence: 1.0 },
    { bytes: [0xCA, 0xFE, 0xBA, 0xBE], type: 'Mach-O Universal', mime: 'application/x-mach-binary', extension: 'macho', confidence: 1.0 },
    
    // Archives
    { bytes: [0x50, 0x4B, 0x03, 0x04], type: 'ZIP Archive', mime: 'application/zip', extension: 'zip', confidence: 1.0 },
    { bytes: [0x1F, 0x8B], type: 'GZIP Archive', mime: 'application/gzip', extension: 'gz', confidence: 1.0 },
    { bytes: [0x42, 0x5A, 0x68], type: 'BZIP2 Archive', mime: 'application/x-bzip2', extension: 'bz2', confidence: 1.0 },
    { bytes: [0xFD, 0x37, 0x7A, 0x58], type: 'XZ Archive', mime: 'application/x-xz', extension: 'xz', confidence: 1.0 },
    { bytes: [0x52, 0x61, 0x72, 0x21], type: 'RAR Archive', mime: 'application/vnd.rar', extension: 'rar', confidence: 1.0 },
    { bytes: [0x37, 0x7A, 0xBC, 0xAF], type: '7-Zip Archive', mime: 'application/x-7z-compressed', extension: '7z', confidence: 1.0 },
    
    // Documents
    { bytes: [0x25, 0x50, 0x44, 0x46], type: 'PDF Document', mime: 'application/pdf', extension: 'pdf', confidence: 1.0 },
    { bytes: [0xD0, 0xCF, 0x11, 0xE0], type: 'Microsoft Office Document', mime: 'application/x-msword', extension: 'doc', confidence: 0.9 },
    
    // Images
    { bytes: [0xFF, 0xD8, 0xFF], type: 'JPEG Image', mime: 'image/jpeg', extension: 'jpg', confidence: 1.0 },
    { bytes: [0x89, 0x50, 0x4E, 0x47], type: 'PNG Image', mime: 'image/png', extension: 'png', confidence: 1.0 },
    { bytes: [0x47, 0x49, 0x46], type: 'GIF Image', mime: 'image/gif', extension: 'gif', confidence: 1.0 },
    { bytes: [0x42, 0x4D], type: 'BMP Image', mime: 'image/bmp', extension: 'bmp', confidence: 1.0 },
    { bytes: [0x52, 0x49, 0x46, 0x46], type: 'RIFF Container', mime: 'application/octet-stream', extension: 'riff', confidence: 0.8 },
    
    // Code/Data
    { bytes: [0x23, 0x21], type: 'Shell Script', mime: 'text/x-shellscript', extension: 'sh', confidence: 0.9 },
  ];
  
  for (const sig of signatures) {
    let match = true;
    for (let i = 0; i < sig.bytes.length; i++) {
      if (data[i] !== sig.bytes[i]) {
        match = false;
        break;
      }
    }
    if (match) return sig;
  }
  
  // Try to detect text files
  let isText = true;
  let nullCount = 0;
  const sampleSize = Math.min(data.length, 1000);
  
  for (let i = 0; i < sampleSize; i++) {
    const byte = data[i];
    if (byte === 0) nullCount++;
    if (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13) {
      isText = false;
      break;
    }
  }
  
  if (isText && nullCount / sampleSize < 0.01) {
    return { type: 'Text File', mime: 'text/plain', extension: 'txt', confidence: 0.8 };
  }
  
  return { type: 'Unknown Binary', mime: 'application/octet-stream', extension: 'bin', confidence: 0.5 };
}

// Extract strings with encoding detection
export function extractStrings(data: Uint8Array, minLength: number = 4): Array<{
  value: string;
  offset: number;
  length: number;
  encoding: 'ascii' | 'utf8' | 'utf16le' | 'utf16be';
}> {
  const strings: Array<{
    value: string;
    offset: number;
    length: number;
    encoding: 'ascii' | 'utf8' | 'utf16le' | 'utf16be';
  }> = [];
  
  // ASCII strings
  let currentString = '';
  let startOffset = 0;
  
  for (let i = 0; i < data.length; i++) {
    const byte = data[i];
    
    if (byte >= 32 && byte <= 126) {
      if (currentString.length === 0) startOffset = i;
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
  
  if (currentString.length >= minLength) {
    strings.push({
      value: currentString,
      offset: startOffset,
      length: currentString.length,
      encoding: 'ascii',
    });
  }
  
  // UTF-16 LE strings
  currentString = '';
  startOffset = 0;
  
  for (let i = 0; i < data.length - 1; i += 2) {
    const low = data[i];
    const high = data[i + 1];
    
    if (high === 0 && low >= 32 && low <= 126) {
      if (currentString.length === 0) startOffset = i;
      currentString += String.fromCharCode(low);
    } else {
      if (currentString.length >= minLength) {
        strings.push({
          value: currentString,
          offset: startOffset,
          length: currentString.length,
          encoding: 'utf16le',
        });
      }
      currentString = '';
    }
  }
  
  if (currentString.length >= minLength) {
    strings.push({
      value: currentString,
      offset: startOffset,
      length: currentString.length,
      encoding: 'utf16le',
    });
  }
  
  return strings;
}

// Detect packers/protectors
export function detectPackers(data: Uint8Array, strings: Array<{ value: string }>): string[] {
  const packers: string[] = [];
  const text = new TextDecoder().decode(data.slice(0, Math.min(data.length, 100000)));
  
  const packerSignatures = [
    { name: 'UPX', patterns: ['UPX!', 'UPX0', 'UPX1', 'This program cannot be run in DOS mode'] },
    { name: 'ASPack', patterns: ['.aspack', '.adata'] },
    { name: 'PECompact', patterns: ['PEC2', 'PEC2DLL'] },
    { name: 'MPRESS', patterns: ['.MPRESS1', '.MPRESS2'] },
    { name: 'Themida', patterns: ['Themida', '.themida'] },
    { name: 'VMProtect', patterns: ['VMProtect', '.vmp'] },
    { name: 'Armadillo', patterns: ['Armadillo'] },
    { name: 'Obsidium', patterns: ['Obsidium'] },
    { name: 'Enigma', patterns: ['Enigma protector'] },
    { name: 'ExeStealth', patterns: ['ExeStealth'] },
  ];
  
  packerSignatures.forEach(packer => {
    const found = packer.patterns.some(pattern => 
      text.includes(pattern) || strings.some(s => s.value.includes(pattern))
    );
    if (found) packers.push(packer.name);
  });
  
  return packers;
}

// Calculate byte frequency distribution
export function calculateByteDistribution(data: Uint8Array): number[] {
  const distribution = new Array(256).fill(0);
  for (let i = 0; i < data.length; i++) {
    distribution[data[i]]++;
  }
  return distribution;
}

// Detect anomalies in byte distribution
export function detectAnomalies(distribution: number[], totalBytes: number): {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}[] {
  const anomalies: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }> = [];
  
  // Check for unusual byte distributions
  const nullBytes = distribution[0];
  const nullRatio = nullBytes / totalBytes;
  
  if (nullRatio > 0.5) {
    anomalies.push({
      type: 'High Null Byte Ratio',
      description: `${(nullRatio * 100).toFixed(1)}% null bytes detected - possible sparse file or padding`,
      severity: 'low',
    });
  }
  
  // Check for printable ASCII ratio
  let printableCount = 0;
  for (let i = 32; i <= 126; i++) {
    printableCount += distribution[i];
  }
  const printableRatio = printableCount / totalBytes;
  
  if (printableRatio > 0.8) {
    anomalies.push({
      type: 'High Printable ASCII Ratio',
      description: `${(printableRatio * 100).toFixed(1)}% printable ASCII - likely text or script`,
      severity: 'low',
    });
  }
  
  return anomalies;
}
