// Minimal valid PNG file (1x1 pixel, blue)
// This is a placeholder - replace with a proper 256x256 icon
const fs = require('fs');
const path = require('path');

// Minimal PNG: 1x1 blue pixel
const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const pngBuffer = Buffer.from(pngBase64, 'base64');

const iconPath = path.join(__dirname, '../public/icon.png');
fs.writeFileSync(iconPath, pngBuffer);

console.log('✓ Placeholder icon created at: public/icon.png');
console.log('');
console.log('IMPORTANT: This is a placeholder icon (1x1 pixel).');
console.log('For production, replace it with a proper 256x256 PNG icon.');
console.log('');
console.log('You can:');
console.log('1. Use the SVG icon in public/icon.svg and convert to PNG');
console.log('2. Design a custom icon using Figma, Photoshop, or Canva');
console.log('3. Use an online icon generator');
console.log('');
console.log('Recommended specs: 256x256 or 512x512 PNG with transparency');
