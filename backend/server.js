// ==============================================================================
// Intizomly — Standalone Backend Admin Server
// Ishga tushirish: node backend/server.js (yoki npm run backend)
// ==============================================================================

import http from 'node:http';
import { handleAdminApi } from './adminHandler.js';

const PORT = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 5000;

const server = http.createServer(async (req, res) => {
  // 1. Admin API so'rovlarini qayta ishlash
  const handled = await handleAdminApi(req, res);
  if (handled) return;

  // 2. Health check
  if (req.url === '/health' || req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'intizomly-backend', timestamp: new Date().toISOString() }));
    return;
  }

  // 3. Fallback
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Intizomly Backend Admin Server ishga tushdi: http://localhost:${PORT}`);
});
