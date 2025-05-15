// Static file handler port
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fsPromises from 'fs/promises';
import { StaticFilePort } from '../interfaces/ports.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

// Map file extensions to MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'font/eot',
  '.otf': 'font/otf'
};

// Export the handler function for use in the router
export async function handleStaticFile(req, res) {
  // Extract the path from the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = url.pathname;
  
  // Get references to the adapters and presenters needed
  const { staticFileAdapter } = await import('../../adapters/static/file.js');
  const { presenter } = await import('../../presenters/static/file.js');
  const { processStaticFileRequest } = await import('../../logic/static/file.js');
  
  // Special case for favicon.ico
  if (filePath === '/favicon.ico') {
    return handleFavicon(req, res, staticFileAdapter, presenter);
  }

  // Base directory for static files
  const STATIC_DIR = path.join(process.cwd());
  const fullPath = path.join(STATIC_DIR, filePath);
  
  try {
    // Gather file information for the logic layer
    const exists = await staticFileAdapter.fileExists(fullPath);
    const mimeType = staticFileAdapter.getMimeType(fullPath);
    
    // Process the request in the logic layer
    const result = processStaticFileRequest({
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
    presenter.present(res, fileContent, result.headers);
    
    console.log(`[Static File] Served: ${filePath} (${mimeType})`);
    return true;
  } catch (error) {
    console.error(`[Static File] Error serving ${filePath}:`, error);
    return false;
  }
}

// Handle favicon requests specially
async function handleFavicon(req, res, staticFileAdapter, presenter) {
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
  const exists = await staticFileAdapter.fileExists(faviconPath);
  
  if (!exists) {
    console.log('[Static File] favicon.ico not found, creating a simple one');
    
    // If favicon doesn't exist, create a simple one (1x1 transparent pixel)
    const simpleIconBuffer = Buffer.from([
      0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01, 0x01, 
      0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x0A, 0x00, 
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00, 0x28, 0x00, 
      0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00, 
      0x00, 0x00, 0x01, 0x00, 0x18, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
      0x00, 0x00
    ]);
    
    // Use the presenter to serve this simple favicon
    presenter.present(res, simpleIconBuffer, faviconHeaders);
    
    return true;
  }
  
  // If favicon exists, serve it with proper headers
  try {
    const fileContent = await staticFileAdapter.readFile(faviconPath);
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