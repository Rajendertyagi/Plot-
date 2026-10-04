import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Default to 4000 for local Windows runs; respect process.env.PORT if specified (e.g. 3000 in cloud preview)
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');

app.use(express.json({ limit: '20mb' }));

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// -------------------------------------------------------------
// REST Endpoints for Projects JSON persistence
// -------------------------------------------------------------
app.get('/api/data', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ error: 'Data file not found' });
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    res.json(data);
  } catch (error) {
    console.error('Error reading JSON from disk:', error);
    res.status(500).json({ error: 'Failed to read data from disk' });
  }
});

app.post('/api/data', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Atomic write to prevent partial file writes
    const tempFile = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(payload, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);

    res.json({ success: true, savedAt: new Date().toISOString() });
  } catch (error) {
    console.error('Error saving JSON to disk:', error);
    res.status(500).json({ error: 'Failed to write data to disk' });
  }
});

app.get('/api/data/export', (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return res.status(404).json({ error: 'Data file not found' });
    }
    res.download(DATA_FILE, 'projectflow-backup.json');
  } catch (error) {
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// -------------------------------------------------------------
// File System & Repository Explorer Endpoints
// -------------------------------------------------------------

// Helper to get all permissible root directories (workspace cwd + active projects)
function getAllowedRoots(): string[] {
  const roots: string[] = [path.resolve(process.cwd())];
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.projects)) {
        for (const proj of data.projects) {
          if (proj.rootDirectory && typeof proj.rootDirectory === 'string') {
            const resolved = path.resolve(proj.rootDirectory);
            if (fs.existsSync(resolved)) {
              roots.push(resolved);
            }
          }
        }
      }
    }
  } catch {
    // Ignore JSON read errors during fallback
  }
  return roots;
}

const FORBIDDEN_ROOT_PREFIXES = [
  '/etc', '/var', '/usr', '/bin', '/sbin', '/boot', '/proc', '/sys', '/dev',
  'c:\\windows', 'c:\\program files', 'c:\\program files (x86)', 'c:\\programdata'
];

function isPathAllowed(targetPath: string): boolean {
  const resolved = path.resolve(targetPath);
  const normalized = path.normalize(resolved).toLowerCase();

  // Block sensitive OS and system folders
  for (const forbidden of FORBIDDEN_ROOT_PREFIXES) {
    if (normalized === forbidden || normalized.startsWith(forbidden + path.sep)) {
      return false;
    }
  }

  // Ensure path is within workspace root or any registered project directory
  const allowedRoots = getAllowedRoots();
  for (const root of allowedRoots) {
    const normRoot = path.normalize(root).toLowerCase();
    if (normalized === normRoot || normalized.startsWith(normRoot + path.sep)) {
      return true;
    }
  }

  return false;
}

// Helper to safely resolve path
function resolveSafePath(inputPath?: string): string {
  if (!inputPath || inputPath.trim() === '') {
    return process.cwd();
  }
  return path.resolve(inputPath);
}

// Browse directories for Finder modal
app.get('/api/fs/browse', (req, res) => {
  try {
    const dirQuery = req.query.dir as string | undefined;
    const targetDir = resolveSafePath(dirQuery);

    if (!fs.existsSync(targetDir)) {
      return res.status(404).json({
        exists: false,
        error: `Directory not found: ${targetDir}`,
        currentPath: targetDir,
        parentPath: null,
        directories: [],
        workspaceRoot: process.cwd(),
      });
    }

    const stat = fs.statSync(targetDir);
    if (!stat.isDirectory()) {
      return res.status(400).json({
        exists: false,
        error: `Path is not a directory: ${targetDir}`,
        currentPath: targetDir,
        parentPath: null,
        directories: [],
        workspaceRoot: process.cwd(),
      });
    }

    const entries = fs.readdirSync(targetDir, { withFileTypes: true });
    const directories: string[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        directories.push(entry.name);
      }
    }

    directories.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const parsed = path.parse(targetDir);
    const parentPath = targetDir === parsed.root ? null : path.dirname(targetDir);

    res.json({
      exists: true,
      currentPath: targetDir,
      parentPath,
      directories,
      workspaceRoot: process.cwd(),
    });
  } catch (error: any) {
    console.error('Error browsing directory:', error);
    res.status(500).json({ error: error.message || 'Failed to browse directory' });
  }
});

// Recursive file tree reader for left pane
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.npm',
  '.turbo',
  '.next',
]);

interface FileNodeDto {
  name: string;
  path: string;
  relativePath: string;
  isDirectory: boolean;
  size?: number;
  extension?: string;
  children?: FileNodeDto[];
}

function buildDirectoryTree(
  dirPath: string,
  rootPath: string,
  depth = 0,
  maxDepth = 6
): FileNodeDto[] {
  if (depth > maxDepth) return [];

  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: FileNodeDto[] = [];

    for (const entry of entries) {
      if (IGNORED_DIRS.has(entry.name)) {
        continue;
      }

      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(rootPath, fullPath);

      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: fullPath,
          relativePath,
          isDirectory: true,
          children: buildDirectoryTree(fullPath, rootPath, depth + 1, maxDepth),
        });
      } else {
        let size = 0;
        try {
          size = fs.statSync(fullPath).size;
        } catch {}
        nodes.push({
          name: entry.name,
          path: fullPath,
          relativePath,
          isDirectory: false,
          size,
          extension: path.extname(entry.name).toLowerCase(),
        });
      }
    }

    // Sort: directories first, then files alphabetically
    nodes.sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });

    return nodes;
  } catch (err) {
    console.warn(`Could not read dir ${dirPath}:`, err);
    return [];
  }
}

app.get('/api/fs/tree', (req, res) => {
  try {
    const rootQuery = req.query.root as string | undefined;
    const rootPath = resolveSafePath(rootQuery);

    if (!isPathAllowed(rootPath)) {
      return res.status(403).json({ error: 'Access denied: Root directory is outside allowed project boundaries' });
    }

    if (!fs.existsSync(rootPath)) {
      return res.status(404).json({ error: `Root directory does not exist: ${rootPath}` });
    }

    const tree = buildDirectoryTree(rootPath, rootPath);
    res.json({
      rootPath,
      tree,
    });
  } catch (error: any) {
    console.error('Error building file tree:', error);
    res.status(500).json({ error: error.message || 'Failed to read directory tree' });
  }
});

// Read file contents for CodeMirror
app.get('/api/fs/read', (req, res) => {
  try {
    const filePath = req.query.file as string | undefined;
    if (!filePath) {
      return res.status(400).json({ error: 'file query parameter required' });
    }

    const resolved = path.resolve(filePath);
    if (!isPathAllowed(resolved)) {
      return res.status(403).json({ error: 'Access denied: Target path is outside allowed project boundaries' });
    }

    if (!fs.existsSync(resolved)) {
      return res.status(404).json({ error: `File not found: ${resolved}` });
    }

    const stat = fs.statSync(resolved);
    if (stat.isDirectory()) {
      return res.status(400).json({ error: `Specified path is a directory: ${resolved}` });
    }

    if (stat.size > 5 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large to open (limit 5MB)' });
    }

    const content = fs.readFileSync(resolved, 'utf-8');
    res.json({
      filePath: resolved,
      content,
      size: stat.size,
      extension: path.extname(resolved).toLowerCase(),
      modifiedAt: stat.mtime.toISOString(),
    });
  } catch (error: any) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: error.message || 'Failed to read file' });
  }
});

// Write edited file content to disk
app.post('/api/fs/write', (req, res) => {
  try {
    const { filePath, content } = req.body;
    if (!filePath || typeof content !== 'string') {
      return res.status(400).json({ error: 'filePath and content string required' });
    }

    const resolved = path.resolve(filePath);
    if (!isPathAllowed(resolved)) {
      return res.status(403).json({ error: 'Access denied: Target path is outside allowed project boundaries' });
    }

    const parent = path.dirname(resolved);

    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }

    // Atomic write
    const tempFile = `${resolved}.cmtmp`;
    fs.writeFileSync(tempFile, content, 'utf-8');
    fs.renameSync(tempFile, resolved);

    const stat = fs.statSync(resolved);

    res.json({
      success: true,
      filePath: resolved,
      size: stat.size,
      savedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error writing file:', error);
    res.status(500).json({ error: error.message || 'Failed to write file' });
  }
});

// Create new file or folder
app.post('/api/fs/create', (req, res) => {
  try {
    const { targetPath, isDirectory } = req.body;
    if (!targetPath) {
      return res.status(400).json({ error: 'targetPath is required' });
    }
    const resolved = path.resolve(targetPath);
    if (!isPathAllowed(resolved)) {
      return res.status(403).json({ error: 'Access denied: Target path is outside allowed project boundaries' });
    }

    if (fs.existsSync(resolved)) {
      return res.status(409).json({ error: 'File or folder already exists at path' });
    }

    if (isDirectory) {
      fs.mkdirSync(resolved, { recursive: true });
    } else {
      const parent = path.dirname(resolved);
      if (!fs.existsSync(parent)) {
        fs.mkdirSync(parent, { recursive: true });
      }
      fs.writeFileSync(resolved, '', 'utf-8');
    }

    res.json({ success: true, path: resolved });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create item' });
  }
});

// -------------------------------------------------------------
// Server startup with Vite middlewares
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Check for web folder next to exe/server first, then fallback to dist
    const webDir = fs.existsSync(path.join(__dirname, 'web'))
      ? path.join(__dirname, 'web')
      : path.join(__dirname, 'dist');

    app.use(express.static(webDir));
    app.get('*', (req, res) => {
      res.sendFile(path.join(webDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

startServer();
