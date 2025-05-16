// Static file handler port
import path from 'path';
import { fileURLToPath } from 'url';
import { URL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

// Store references for dependency injection
let staticFileAdapter = null;
let staticFilePresenter = null;
let staticFileLogic = null;

/**
 * Initialize this port with the required dependencies
 * @param {Object} deps Dependencies object
 * @param {Object} deps.adapter The static file adapter implementation
 * @param {Object} deps.presenter The static file presenter implementation
 * @param {Function} deps.logic The static file processing logic
 */
export function initialize(deps = {}) {
  staticFileAdapter = deps.adapter || null;
  staticFilePresenter = deps.presenter || null;
  staticFileLogic = deps.logic || null;
  
  console.log('[Static File Port] Initialized with deps:', {
    hasAdapter: !!staticFileAdapter,
    hasPresenter: !!staticFilePresenter,
    hasLogic: !!staticFileLogic
  });
  
  return { handleStaticFile };
}

// Export the handler function for use in the router
export async function handleStaticFile(req, res) {
  // Extract the path from the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = url.pathname;
  
  // Lazy load dependencies if not injected
  if (!staticFileAdapter || !staticFilePresenter || !staticFileLogic) {
    const { staticFileAdapter: defaultAdapter } = !staticFileAdapter ? 
      await import('../../adapters/static/file.js') : { staticFileAdapter: null };
    const { presenter: defaultPresenter } = !staticFilePresenter ?
      await import('../../presenters/static/file.js') : { presenter: null };
    const { processStaticFileRequest: defaultLogic } = !staticFileLogic ?
      await import('../../logic/static/file.js') : { processStaticFileRequest: null };
    
    staticFileAdapter = staticFileAdapter || defaultAdapter;
    staticFilePresenter = staticFilePresenter || defaultPresenter;
    staticFileLogic = staticFileLogic || defaultLogic;
  }
  
  // Special case for favicon.ico
  if (filePath === '/favicon.ico') {
    return handleFavicon(req, res, staticFileAdapter, staticFilePresenter);
  }

  // Base directory for static files
  const STATIC_DIR = path.join(process.cwd());
  const fullPath = path.join(STATIC_DIR, filePath);
  
  try {
    // Gather file information for the logic layer
    const exists = await staticFileAdapter.fileExists(fullPath);
    const mimeType = staticFileAdapter.getMimeType(fullPath);
    
    // Process the request in the logic layer
    const result = staticFileLogic({
      path: filePath,
      exists,
      mimeType
    });
    
    // Handle based on result from logic layer
    if (!result.success) {
      console.log(`[Static File] ${result.error}: ${filePath}`);
      return false;
    }
    
    // Read the file content
    const fileContent = await staticFileAdapter.readFile(fullPath);
    
    // Use the presenter to format and send the response
    staticFilePresenter.present(res, fileContent, result.headers);
    
    console.log(`[Static File] Served: ${filePath} (${mimeType})`);
    return true;
  } catch (error) {
    console.error(`[Static File] Error serving ${filePath}:`, error);
    return false;
  }
}

// Handle favicon requests specially
async function handleFavicon(req, res, adapter, presenter) {
  console.log('[Static File] Handling favicon.ico request');
  
  // Create response headers specifically for favicon
  const faviconHeaders = {
    'Content-Type': 'image/x-icon',
    'Cache-Control': 'public, max-age=14400, must-revalidate',
    'X-Content-Type-Options': 'nosniff'
  };
  
  // Check if favicon.ico exists
  const STATIC_DIR = path.join(process.cwd());
  const faviconPath = path.join(STATIC_DIR, 'favicon.ico');
  const exists = await adapter.fileExists(faviconPath);
  
  if (!exists) {
    console.log('[Static File] favicon.ico not found, creating a simple one');
    
    // Load the fallback icon
    const { getFallbackFaviconBuffer } = await import('../../logic/static/favicon.js');
    const simpleIconBuffer = await getFallbackFaviconBuffer();
    
    // Use the presenter to serve this simple favicon
    presenter.present(res, simpleIconBuffer, faviconHeaders);
    
    return true;
  }
  
  // If favicon exists, serve it with proper headers
  try {
    const fileContent = await adapter.readFile(faviconPath);
    presenter.present(res, fileContent, faviconHeaders);
    console.log(`[Static File] Served favicon.ico`);
    return true;
  } catch (error) {
    console.error(`[Static File] Error serving favicon.ico:`, error);
    // Create a specific error with proper type but maintain correct Content-Type
    const faviconError = new Error(`Failed to read favicon: ${error.message}`);
    // Pass the favicon headers to ensure correct Content-Type is maintained
    presenter.presentError(res, faviconError, faviconHeaders);
    return true; // Return true to indicate we handled the request
  }
} 