// Static file handler port
import path from 'path';
import fs from 'fs';
import staticFileAdapter from '../adapters/static-file.js';
import { presenter } from '../presenters/static-file.js';
import { processStaticFileRequest } from '../logic/static-file.js';

// Base directory for static files
const STATIC_DIR = path.join(process.cwd());

/**
 * Handle requests for static files like favicon.ico, CSS, JS, etc.
 */
export async function handleRequest(req, res) {
  // Extract the path from the URL
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = url.pathname;
  
  // Special case for favicon.ico which is commonly requested by browsers
  if (filePath === '/favicon.ico') {
    console.log('[Static File] Handling favicon.ico request');
    
    // Check if favicon.ico exists
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
      presenter.present(res, simpleIconBuffer, {
        'Content-Type': 'image/x-icon',
        'Cache-Control': 'public, max-age=604800',
        'X-Content-Type-Options': 'nosniff'
      });
      
      return true;
    }
    
    // If favicon exists, serve it
    const mimeType = 'image/x-icon';
    const result = processStaticFileRequest({
      path: filePath,
      exists: true,
      mimeType
    });
    
    if (result.success) {
      const fileContent = await staticFileAdapter.readFile(faviconPath);
      presenter.present(res, fileContent, result.headers);
      console.log(`[Static File] Served favicon.ico`);
      return true;
    }
  }
  
  // Handle other static files
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