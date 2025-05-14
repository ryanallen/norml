import { StaticFilePort } from '../ports/interfaces.js';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { extname } from 'path';

export class StaticFileAdapter extends StaticFilePort {
  constructor() {
    super();
    this.mimeTypes = {
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
      '.woff2': 'font/woff2'
    };
  }

  /**
   * Read a file from the filesystem
   * @param {string} filePath - Path to the file
   * @returns {Promise<Buffer>} - File contents
   */
  async readFile(filePath) {
    try {
      return await readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to read file ${filePath}: ${error.message}`);
    }
  }

  /**
   * Check if a file exists
   * @param {string} filePath - Path to check
   * @returns {Promise<boolean>} - True if file exists
   */
  async fileExists(filePath) {
    return existsSync(filePath);
  }

  /**
   * Get the MIME type for a file
   * @param {string} filePath - Path to the file
   * @returns {string} - MIME type
   */
  getMimeType(filePath) {
    const ext = extname(filePath).toLowerCase();
    return this.mimeTypes[ext] || 'application/octet-stream';
  }
}

export default new StaticFileAdapter(); 