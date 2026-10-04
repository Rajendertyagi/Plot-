import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const targetDir = path.join(rootDir, 'projectflow-windows-x64-portable');
const webDir = path.join(targetDir, 'web');
const dataDir = path.join(targetDir, 'data');
const webviewDir = path.join(dataDir, 'webview');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 Assembling 100% Self-Contained Portable Windows Package...');

// 1. Ensure target structure exists and clean web/
if (fs.existsSync(webDir)) {
  fs.rmSync(webDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });
fs.mkdirSync(webDir, { recursive: true });
fs.mkdirSync(webviewDir, { recursive: true });

// 2. Copy dist assets into web/ next to the exe
if (fs.existsSync(distDir)) {
  fs.cpSync(distDir, webDir, { recursive: true });
  console.log('✅ Web assets copied to ./web (placed next to executable)');
} else {
  console.warn('⚠️ "dist" folder not found. Please run "npm run build" or "bun run build" first.');
}

// 3. Initialize data/projects.json
const targetProjectsJson = path.join(dataDir, 'projects.json');
const sourceProjectsJson = path.join(rootDir, 'data', 'projects.json');
if (fs.existsSync(sourceProjectsJson)) {
  fs.copyFileSync(sourceProjectsJson, targetProjectsJson);
} else {
  fs.writeFileSync(
    targetProjectsJson,
    JSON.stringify({ projects: [], features: [], tasks: [], viewLayout: 'tree' }, null, 2),
    'utf-8'
  );
}
console.log('✅ Local data isolated in ./data/projects.json (Zero AppData usage)');

// 4. Copy launcher scripts, server runtime and documentation
const filesToCopy = [
  'start-web-mode.bat',
  'start-desktop-mode.bat',
  'README.txt',
  'server.ts',
  'package.json'
];
for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}
console.log('✅ Launchers & server.ts copied into portable package');

// 5. Copy executable if already built by cargo/tauri
const candidateExes = [
  path.join(rootDir, 'src-tauri', 'target', 'release', 'projectflow.exe'),
  path.join(rootDir, 'target', 'release', 'projectflow.exe'),
];
let exeFound = false;
for (const exe of candidateExes) {
  if (fs.existsSync(exe)) {
    fs.copyFileSync(exe, path.join(targetDir, 'projectflow.exe'));
    console.log(`✅ projectflow.exe copied from ${exe} into portable package`);
    exeFound = true;
    break;
  }
}

if (!exeFound) {
  if (process.env.CI) {
    throw new Error('❌ Fatal in CI: projectflow.exe was not found in release target directories.');
  } else {
    console.log('ℹ️ projectflow.exe will be placed here automatically when compiled by GitHub Actions or "cargo build --release"');
  }
}

console.log('\n🎉 Self-contained package layout prepared:');
console.log(targetDir);
