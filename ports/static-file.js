// Static file handler port
import path from 'path';
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
  
  // Security check - prevent directory traversal
  if (filePath.includes('..')) {
    console.log('[Static File] Security warning: Path contains ".."');
    return false;
  }
  
  // Special case for favicon.ico which is commonly requested by browsers
  if (filePath === '/favicon.ico') {
    filePath = '/favicon.ico';
  }
  
  // Construct the full file path
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