import { URL } from 'node:url';
import { handleMainRequest } from '../main/handler.js';
import { handleRequest as handleDb } from '../db/db-status.js';
import { handleVersionRequest as handleVersion } from '../api/version.js';
import { handleStaticFile } from '../static/file.js';

export class Router {
  constructor() {
    this.routes = new Map();
  }

  addRoute(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handler);
  }

  async route(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = `${req.method}:${url.pathname}`;
    
    // First check for exact route matches
    const handler = this.routes.get(key);
    if (handler) {
      return await handler(req, res);
    }
    
    // Check for pattern-based handlers
    if (req.url.startsWith('/api/')) {
      // Try version endpoints
      const handled = await handleVersion(req, res);
      if (handled) return true;
      
      // Try database status endpoints
      const dbHandled = await handleDb(req, res);
      if (dbHandled) return true;
    }
    
    // If no exact match, try to handle as a static file
    const handled = await handleStaticFile(req, res);
    if (handled) {
      return true;
    }
    
    return false;
  }
}

export const router = new Router();

// Register routes
router.addRoute('GET', '/', handleMainRequest);
router.addRoute('GET', '/api/status', handleDb);
router.addRoute('GET', '/api/version', handleVersion);
router.addRoute('GET', '/api/build-info', handleVersion);

export default router; 