/**
 * Generate a simple PNG icon for REA Agentic AI
 * This creates a valid 256x256 PNG file with a gradient design
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// PNG file structure
function createPNG(width, height) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk (image header)
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // bit depth
  ihdr.writeUInt8(2, 17); // color type (RGB)
  ihdr.writeUInt8(0, 18); // compression
  ihdr.writeUInt8(0, 19); // filter
  ihdr.writeUInt8(0, 20); // interlace
  
  // Calculate CRC for IHDR
  const crc32 = require('./crc32');
  const ihdrCrc = crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);
  
  // IDAT chunk (image data)
  const rawData = [];
  
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte (none)
    
    for (let x = 0; x < width; x++) {
      // Create circular gradient
      const centerX = width / 2;
      const centerY = height / 2;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      const maxDistance = width / 2;
      
      if (distance <= maxDistance) {
        // Inside circle - blue to purple gradient
        const ratio = distance / maxDistance;
        const r = Math.floor(79 + (124 - 79) * ratio);
        const g = Math.floor(70 + (58 - 70) * ratio);
        const b = Math.floor(229 + (237 - 229) * ratio);
        rawData.push(r, g, b);
      } else {
        // Outside circle - transparent (white for simplicity)
        rawData.push(255, 255, 255);
      }
    }
  }
  
  const compressed = zlib.deflateSync(Buffer.from(rawData));
  
  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  idat.writeUInt32BE(idatCrc, 8 + compressed.length);
  
  // IEND chunk
  const iend = Buffer.from([0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]);
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Simple CRC32 implementation
function crc32(buf) {
  let crc = 0xFFFFFFFF;
  const table = [];
  
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if (c & 1) {
        c = 0xEDB88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[i] = c;
  }
  
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// Generate icon
const icon = createPNG(256, 256);
const iconPath = path.join(__dirname, '../public/icon.png');
fs.writeFileSync(iconPath, icon);
console.log(`Icon generated: ${iconPath}`);
