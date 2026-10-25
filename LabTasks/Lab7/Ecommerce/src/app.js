import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { routes } from './routes/index.js';
import { controllers } from './controllers/api.js';
import { authenticate } from './services/auth.js';
import { fail, readBody, send } from './utils/http.js';

const pages = new Set(['index.html', 'login.html', 'signup.html', 'cart.html', 'edit-cart.html', 'checkout.html', 'review-order.html']);
export function createApp(store) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/assets/js/app.js' && req.method === 'GET') {
        const script = await readFile(fileURLToPath(new URL('../assets/js/app.js', import.meta.url)));
        res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
        return res.end(script);
      }
      if (!url.pathname.startsWith('/api/')) {
        const page = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
        if (req.method !== 'GET' || !pages.has(page)) fail(404, 'Not found');
        const html = await readFile(fileURLToPath(new URL(`../${page}`, import.meta.url)));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(html);
      }
      for (const [method, path, handler, protectedRoute, status = 200] of routes) {
        const keys = [];
        const expression = path.replace(/:([a-z]+)/g, (_, key) => { keys.push(key); return '([^/]+)'; });
        const match = url.pathname.match(new RegExp(`^${expression}/?$`));
        if (method !== req.method || !match) continue;
        const auth = protectedRoute ? authenticate(store, req) : null;
        const body = ['POST', 'PATCH'].includes(method) ? await readBody(req) : {};
        const params = Object.fromEntries(keys.map((key, i) => [key, match[i + 1]]));
        return send(res, status, { data: controllers[handler]({ store, req, url, body, params, auth }) });
      }
      fail(404, 'Endpoint not found');
    } catch (error) {
      if (!error.status) console.error(error);
      send(res, error.status || 500, { error: error.status ? error.message : 'Internal server error' });
    }
  });
}
