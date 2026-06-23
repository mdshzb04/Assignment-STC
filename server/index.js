import 'dotenv/config';
import fs from 'fs';
import http from 'http';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { registerApiRoutes } from './api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function isAllowedOrigin(origin) {
  if (!origin) return true;

  try {
    const { hostname } = new URL(origin);
    if (hostname.endsWith('.vercel.app')) return true;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
    if (process.env.CLIENT_URL && origin === process.env.CLIENT_URL) return true;
  } catch {
    return false;
  }

  return false;
}

async function start() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
    }),
  );
  app.use(express.json({ limit: '16kb' }));

  registerApiRoutes(app);

  const server = http.createServer(app);

  if (isProduction) {
    const distPath = path.join(__dirname, '../dist');
    const indexPath = path.join(distPath, 'index.html');

    if (!fs.existsSync(indexPath)) {
      console.error('Production build not found. Run: npm run build');
      process.exit(1);
    }

    app.use(express.static(distPath, { index: false, maxAge: '1d' }));
    app.get(/^(?!\/api).*/, (_req, res, next) => {
      res.sendFile(indexPath, (err) => {
        if (err) next(err);
      });
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      configFile: path.join(__dirname, '../vite.config.js'),
      server: {
        middlewareMode: true,
        hmr: { server },
        strictPort: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.use((err, req, res, _next) => {
    console.error('Request error:', err.message);
    if (req.path.startsWith('/api')) {
      return res.status(500).json({ error: 'Internal server error.' });
    }
    res.status(500).send('Internal server error.');
  });

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`App running on http://localhost:${PORT}${isProduction ? ' (production)' : ''}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Run: npm run stop`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
