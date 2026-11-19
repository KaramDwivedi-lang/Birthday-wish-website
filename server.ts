import express from 'express';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { DEFAULT_WISH } from './src/data/presets';
import { sanitizeWishConfig, slugifyWishId } from './src/utils/wishLogic';
import type { WishConfig } from './src/types/wish';

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const WISHES_FILE = path.join(DATA_DIR, 'wishes.json');

function ensureStore(): Record<string, WishConfig> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(WISHES_FILE)) {
    const initial: Record<string, WishConfig> = {
      [DEFAULT_WISH.id]: DEFAULT_WISH,
    };
    fs.writeFileSync(WISHES_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(WISHES_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, WishConfig>;
    if (!parsed[DEFAULT_WISH.id]) {
      parsed[DEFAULT_WISH.id] = DEFAULT_WISH;
    }
    return parsed;
  } catch {
    const fallback: Record<string, WishConfig> = {
      [DEFAULT_WISH.id]: DEFAULT_WISH,
    };
    fs.writeFileSync(WISHES_FILE, JSON.stringify(fallback, null, 2), 'utf8');
    return fallback;
  }
}

function writeStore(store: Record<string, WishConfig>) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempPath = `${WISHES_FILE}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tempPath, WISHES_FILE);
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/wishes', (_req, res) => {
    const store = ensureStore();
    const list = Object.values(store)
      .map((w) => ({
        id: w.id,
        recipientName: w.recipientName,
        occasion: w.occasion,
        celebrationDate: w.celebrationDate,
        updatedAt: w.updatedAt,
      }))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    res.json({ wishes: list });
  });

  app.get('/api/wishes/:id', (req, res) => {
    const store = ensureStore();
    const wish = store[req.params.id];
    if (!wish) {
      res.status(404).json({ error: 'Wish not found' });
      return;
    }
    res.json({ wish: sanitizeWishConfig(wish) });
  });

  app.post('/api/wishes', (req, res) => {
    const store = ensureStore();
    const incoming = sanitizeWishConfig(req.body?.wish ?? req.body);
    const suffix = Math.random().toString(36).slice(2, 6);
    const id = slugifyWishId(incoming.recipientName, incoming.occasion, suffix);
    const saved: WishConfig = {
      ...incoming,
      id,
      updatedAt: new Date().toISOString(),
    };
    store[id] = saved;
    writeStore(store);
    res.status(201).json({ wish: saved });
  });

  app.put('/api/wishes/:id', (req, res) => {
    const store = ensureStore();
    const id = req.params.id;
    const incoming = sanitizeWishConfig({ ...(req.body?.wish ?? req.body), id });
    const saved: WishConfig = {
      ...incoming,
      id,
      updatedAt: new Date().toISOString(),
    };
    store[id] = saved;
    writeStore(store);
    res.json({ wish: saved });
  });

  if (process.env.NODE_ENV === 'production') {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
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

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
