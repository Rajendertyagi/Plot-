import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const iconsDir = path.resolve(__dirname, '..', 'src-tauri', 'icons');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCheck = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCheck);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Creates a valid RGBA PNG image buffer with a stylish ProjectFlow folder/board design
 */
function generatePng(size) {
  const width = size;
  const height = size;

  // Raw uncompressed scanlines: each row starts with filter byte 0
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  // Colors
  // Background: dark slate / indigo gradient
  // Center: rounded card with check/folder icon
  const cx = width / 2;
  const cy = width / 2;
  const r = width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Check if inside rounded squircle
      const inBox = Math.abs(dx) <= r && Math.abs(dy) <= r;
      const cornerDx = Math.max(0, Math.abs(dx) - (r - width * 0.15));
      const cornerDy = Math.max(0, Math.abs(dy) - (r - width * 0.15));
      const inCorner = Math.sqrt(cornerDx * cornerDx + cornerDy * cornerDy) <= width * 0.15;

      if (inBox && inCorner) {
        // Gradient from indigo (99, 102, 241) to sky (14, 165, 233)
        const t = (x + y) / (width * 2);
        let red = Math.round(99 + t * (14 - 99));
        let green = Math.round(102 + t * (165 - 102));
        let blue = Math.round(241 + t * (233 - 241));

        // Draw a clean white checkmark / chevron in the center
        const relX = (x - cx) / (width * 0.5);
        const relY = (y - cy) / (width * 0.5);

        // Checkmark geometry
        const onLeftArm = Math.abs(relX - relY * 0.8 + 0.1) < 0.12 && relX >= -0.4 && relX <= 0.0 && relY >= -0.2 && relY <= 0.3;
        const onRightArm = Math.abs(relX * 0.6 + relY * 0.6 - 0.15) < 0.12 && relX >= -0.05 && relX <= 0.45 && relY >= -0.4 && relY <= 0.3;

        if (onLeftArm || onRightArm) {
          red = 255;
          green = 255;
          blue = 255;
        }

        rawData[pxOffset] = red;
        rawData[pxOffset + 1] = green;
        rawData[pxOffset + 2] = blue;
        rawData[pxOffset + 3] = 255; // Alpha
      } else {
        // Transparent outside
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  // Compress with deflate
  const compressed = zlib.deflateSync(rawData, { level: 9 });

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression: 0
  ihdrData[11] = 0; // Filter: 0
  ihdrData[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

/**
 * Builds a multi-resolution Windows .ico file containing embedded PNG images
 */
function generateIco(pngBuffersBySize) {
  // ICO header: 6 bytes
  // 0-1: Reserved (0)
  // 2-3: Image type (1 for icon)
  // 4-5: Number of images
  const count = pngBuffersBySize.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  // Directory entries: 16 bytes each
  const dirSize = count * 16;
  let currentOffset = 6 + dirSize;

  const dirBuffers = [];
  const imageBuffers = [];

  for (const { size, png } of pngBuffersBySize) {
    const dirEntry = Buffer.alloc(16);
    dirEntry[0] = size >= 256 ? 0 : size; // Width (0 means 256)
    dirEntry[1] = size >= 256 ? 0 : size; // Height
    dirEntry[2] = 0; // Palette
    dirEntry[3] = 0; // Reserved
    dirEntry.writeUInt16LE(1, 4); // Color planes
    dirEntry.writeUInt16LE(32, 6); // Bits per pixel
    dirEntry.writeUInt32LE(png.length, 8); // Image data size
    dirEntry.writeUInt32LE(currentOffset, 12); // Offset of image data

    dirBuffers.push(dirEntry);
    imageBuffers.push(png);

    currentOffset += png.length;
  }

  return Buffer.concat([header, ...dirBuffers, ...imageBuffers]);
}

console.log('[INFO] Generating native icon assets for Tauri Windows resource compiler...');

fs.mkdirSync(iconsDir, { recursive: true });

const png32 = generatePng(32);
const png64 = generatePng(64);
const png128 = generatePng(128);
const png256 = generatePng(256);
const png512 = generatePng(512);

// Write standalone PNG icons
fs.writeFileSync(path.join(iconsDir, 'icon.png'), png512);
fs.writeFileSync(path.join(iconsDir, '32x32.png'), png32);
fs.writeFileSync(path.join(iconsDir, '128x128.png'), png128);
fs.writeFileSync(path.join(iconsDir, 'Square30x30Logo.png'), png32);
fs.writeFileSync(path.join(iconsDir, 'Square44x44Logo.png'), generatePng(44));
fs.writeFileSync(path.join(iconsDir, 'Square71x71Logo.png'), generatePng(71));
fs.writeFileSync(path.join(iconsDir, 'Square89x89Logo.png'), generatePng(89));
fs.writeFileSync(path.join(iconsDir, 'Square107x107Logo.png'), generatePng(107));
fs.writeFileSync(path.join(iconsDir, 'Square142x142Logo.png'), generatePng(142));
fs.writeFileSync(path.join(iconsDir, 'Square150x150Logo.png'), generatePng(150));
fs.writeFileSync(path.join(iconsDir, 'Square284x284Logo.png'), generatePng(284));
fs.writeFileSync(path.join(iconsDir, 'Square310x310Logo.png'), generatePng(310));
fs.writeFileSync(path.join(iconsDir, 'StoreLogo.png'), generatePng(50));

// Build and write Windows icon.ico containing 16, 32, 48, 64, 128, and 256px
const icoBuffer = generateIco([
  { size: 16, png: generatePng(16) },
  { size: 32, png: png32 },
  { size: 48, png: generatePng(48) },
  { size: 64, png: png64 },
  { size: 128, png: png128 },
  { size: 256, png: png256 },
]);
fs.writeFileSync(path.join(iconsDir, 'icon.ico'), icoBuffer);

console.log('[OK] Generated icons in src-tauri/icons:');
console.log(' - src-tauri/icons/icon.ico (Windows Resource file requirement)');
console.log(' - src-tauri/icons/icon.png and companion sizes');
