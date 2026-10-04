import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'projects.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

// REST Endpoints for disk JSON persistence
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

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
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
