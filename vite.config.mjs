import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const recordsPath = path.resolve(process.cwd(), 'data/session-records.json');

function ensureRecordsFile() {
  if (!fs.existsSync(recordsPath)) {
    fs.mkdirSync(path.dirname(recordsPath), { recursive: true });
    fs.writeFileSync(recordsPath, '[]\n', 'utf8');
  }
}

function sessionRecordsHandler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'GET') {
    try {
      ensureRecordsFile();
      res.statusCode = 200;
      res.end(fs.readFileSync(recordsPath, 'utf8'));
    } catch {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Unable to read session records.' }));
    }
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Only GET and POST are supported.' }));
    return;
  }

  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    try {
      const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if (!Array.isArray(parsed)) {
        throw new Error('Session records must be an array.');
      }
      ensureRecordsFile();
      fs.writeFileSync(recordsPath, JSON.stringify(parsed, null, 2) + '\n', 'utf8');
      res.statusCode = 200;
      res.end(JSON.stringify(parsed));
    } catch {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid session records payload.' }));
    }
  });
}

function sessionRecordsPlugin() {
  return {
    name: 'sillage-session-records',
    configureServer(server) {
      server.middlewares.use('/api/session-records', sessionRecordsHandler);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/session-records', sessionRecordsHandler);
    },
  };
}

export default defineConfig({
  plugins: [react(), sessionRecordsPlugin()],
});
