import { URL } from 'node:url';
import { handleRequest as handleIndex } from './index.js';
import { handleRequest as handleDb } from './db-status.js';
import { handleVersionRequest as handleVersion } from './version.js';
import { handleRequest as handleStaticFile } from './static-file.js';

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
router.addRoute('GET', '/', handleIndex);
router.addRoute('GET', '/api/status', handleDb);
router.addRoute('GET', '/api/version', handleVersion);

export default router; 