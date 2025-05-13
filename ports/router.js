import { URL } from 'node:url';
import { handleRequest as handleIndex } from './index.js';
import { handleRequest as handleDbStatus } from './db-status.js';
import { handleRequest as handleVersion } from './version.js';

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
    
    const handler = this.routes.get(key);
    if (handler) {
      return await handler(req, res);
    }
    
    return false;
  }
}

export const router = new Router();

// Register routes
router.addRoute('GET', '/', handleIndex);
router.addRoute('GET', '/api/status', handleDbStatus);
router.addRoute('GET', '/api/version', handleVersion);

export default router; 