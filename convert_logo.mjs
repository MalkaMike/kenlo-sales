import sharp from 'sharp';
import { readFileSync } from 'fs';

const svgPath = '/home/ubuntu/kenlo-sales/client/public/kenlo-logo-white.svg';
const pngPath = '/home/ubuntu/kenlo-sales/client/public/kenlo-logo-white.png';

// Read SVG file
const svgBuffer = readFileSync(svgPath);

// Convert to PNG with transparent background
await sharp(svgBuffer)
  .resize({ height: 100 }) // Resize to reasonable height
  .png()
  .toFile(pngPath);

console.log('✅ Logo converted successfully:', pngPath);
