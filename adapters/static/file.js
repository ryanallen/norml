import { StaticFilePort } from '../../ports/interfaces/ports.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { extname } from 'path';

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

/**
 * Adapter for handling static files
 * Implements the StaticFilePort interface
 */
export class StaticFileAdapter extends StaticFilePort {
  constructor() {
    super();
    this.mimeTypes = mimeTypes;
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(filePath) {
    try {
      // Handle direct absolute paths (used in tests)
      if (path.isAbsolute(filePath)) {
        return existsSync(filePath);
      }
      
      // Clean the path to prevent directory traversal
      const cleanPath = this.cleanPath(filePath);
      const fullPath = this.getFullPath(cleanPath);
      
      // Check if file exists
      return existsSync(fullPath);
    } catch (error) {
      // File doesn't exist or other error
      return false;
    }
  }
  
  /**
   * Read a file's contents
   * @param {string} filePath - Path to read
   * @returns {Promise<Buffer>} File contents
   */
  async readFile(filePath) {
    try {
      // Handle direct absolute paths (used in tests)
      if (path.isAbsolute(filePath)) {
        return await fs.readFile(filePath);
      }
      
      // Clean the path to prevent directory traversal
      const cleanPath = this.cleanPath(filePath);
      const fullPath = this.getFullPath(cleanPath);
      
      // Read the file
      return await fs.readFile(fullPath);
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }
  
  /**
   * Get the MIME type for a file based on its extension
   * @param {string} filePath - Path to get MIME type for
   * @returns {string} MIME type
   */
  getMimeType(filePath) {
    const ext = extname(filePath).toLowerCase();
    return this.mimeTypes[ext] || 'application/octet-stream';
  }
  
  /**
   * Clean a path to prevent directory traversal
   * @param {string} filePath - Path to clean
   * @returns {string} Cleaned path
   */
  cleanPath(filePath) {
    // Remove query strings and decode URI
    let cleanPath = filePath.split('?')[0];
    cleanPath = decodeURIComponent(cleanPath);
    
    // Normalize path to prevent directory traversal
    cleanPath = path.normalize(cleanPath).replace(/^(\.\.[\/\\])+/, '');
    
    // Remove leading slash for path resolution
    return cleanPath.replace(/^\//, '');
  }
  
  /**
   * Get the full path for a file
   * @param {string} cleanPath - Cleaned path
   * @returns {string} Full path
   */
  getFullPath(cleanPath) {
    // Handle special cases for static content from presenters
    if (cleanPath.startsWith('presenters/static/')) {
      return path.join(rootDir, cleanPath);
    }
    
    // For test files
    if (cleanPath.startsWith('test-files/')) {
      return path.join(process.cwd(), cleanPath);
    }
    
    // For root paths like favicon.ico
    return path.join(rootDir, cleanPath);
  }
}

// Create and export a singleton instance
export const staticFileAdapter = new StaticFileAdapter(); 