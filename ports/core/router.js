import { URL } from 'node:url';

// Store handler references
let mainHandler = null;
let dbHandler = null;
let versionHandler = null;
let staticFileHandler = null;

export class Router {
  constructor() {
    this.routes = new Map();
  }

  addRoute(method, path, handler) {
    const key = `${method.toUpperCase()}:${path}`;
    this.routes.set(key, handler);
  }

  /**
   * Initialize the router with handlers
   * @param {Object} handlers Handler functions
   */
  initialize(handlers = {}) {
    mainHandler = handlers.main || null;
    dbHandler = handlers.db || null;
    versionHandler = handlers.version || null;
    staticFileHandler = handlers.staticFile || null;
    
    return this;
  }

  async route(req, res, context = {}) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const key = `${req.method}:${url.pathname}`;
    
    // First check for exact route matches
    const handler = this.routes.get(key);
    if (handler) {
      return await handler(req, res, context);
    }
    
    // Check for pattern-based handlers
    if (req.url.startsWith('/api/')) {
      if (!versionHandler) {
        const { handleVersionRequest } = await import('../api/version.js');
        versionHandler = handleVersionRequest;
      }
      
      if (!dbHandler) {
        const { handleRequest } = await import('../db/db-status.js');
        dbHandler = handleRequest;
      }
      
      // Try version endpoints
      const handled = await versionHandler(req, res, context);
      if (handled) return true;
      
      // Try database status endpoints
      const dbHandled = await dbHandler(req, res, context);
      if (dbHandled) return true;
    }
    
    // If no exact match, try to handle as a static file
    if (!staticFileHandler) {
      const { handleStaticFile } = await import('../static/file.js');
      staticFileHandler = handleStaticFile;
    }
    
    const handled = await staticFileHandler(req, res, context);
    if (handled) {
      return true;
    }
    
    return false;
  }
}

export const router = new Router();

// Register routes
router.addRoute('GET', '/', async (req, res, context = {}) => {
  if (!mainHandler) {
    const { handleMainRequest } = await import('../main/handler.js');
    mainHandler = handleMainRequest;
  }
  return mainHandler(req, res, context);
});

router.addRoute('GET', '/api/status', async (req, res, context = {}) => {
  if (!dbHandler) {
    const { handleRequest } = await import('../db/db-status.js');
    dbHandler = handleRequest;
  }
  return dbHandler(req, res, context);
});

router.addRoute('GET', '/api/status/db', async (req, res, context = {}) => {
  if (!dbHandler) {
    const { handleRequest } = await import('../db/db-status.js');
    dbHandler = handleRequest;
  }
  return dbHandler(req, res, context);
});

router.addRoute('GET', '/api/version', async (req, res, context = {}) => {
  if (!versionHandler) {
    const { handleVersionRequest } = await import('../api/version.js');
    versionHandler = handleVersionRequest;
  }
  return versionHandler(req, res, context);
});

router.addRoute('GET', '/api/build-info', async (req, res, context = {}) => {
  if (!versionHandler) {
    const { handleVersionRequest } = await import('../api/version.js');
    versionHandler = handleVersionRequest;
  }
  return versionHandler(req, res, context);
});

// Import feature handlers
import { handleFeaturesRequest } from '../api/features.js';

router.addRoute('GET', '/api/features', handleFeaturesRequest);

export default router; 