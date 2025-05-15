import { StaticGeneratorPort } from '../../ports/interfaces/ports.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

/**
 * Adapter that generates static files
 * Implements the StaticGeneratorPort interface for file operations
 */
export class StaticGeneratorAdapter extends StaticGeneratorPort {
  /**
   * Generate static content
   * @param {string} content - Content to generate
   * @returns {Promise<string>} Generated content
   */
  async generateStatic(content) {
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: must be a non-empty string');
    }
    return content;
  }

  /**
   * Write HTML output to a file
   * @param {string} html - HTML content
   * @param {string} path - Path to write to
   * @returns {Promise<boolean>} Success status
   */
  async writeOutput(html, path) {
    if (!path || typeof path !== 'string') {
      throw new Error('Invalid path: must be a non-empty string');
    }
    if (!html || typeof html !== 'string') {
      throw new Error('Invalid HTML: must be a non-empty string');
    }
    return this.writeFile(path, html);
  }

  /**
   * Write file contents
   * @param {string} filename - File path
   * @param {string} content - File content
   * @returns {Promise<boolean>} Success status
   */
  async writeFile(filename, content) {
    if (!filename || typeof filename !== 'string') {
      throw new Error('Invalid filename: must be a non-empty string');
    }
    if (!content || typeof content !== 'string') {
      throw new Error('Invalid content: must be a non-empty string');
    }

    try {
      // Ensure directory exists
      const dir = path.dirname(filename);
      await fs.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.writeFile(filename, content, 'utf8');
      return true;
    } catch (error) {
      const message = error.message || 'Unknown error';
      throw new Error(`Failed to write file ${filename}: ${message}`);
    }
  }

  /**
   * Copy assets to the build directory
   * @param {string} assetsDir - Source assets directory
   * @param {string} targetDir - Target directory for assets
   * @returns {Promise<boolean>} Success status
   */
  async copyAssets(assetsDir = path.join(rootDir, 'presenters/static/assets'), targetDir) {
    try {
      // If no target directory is specified, use the default
      // But always use presenters/static/assets as the target to avoid creating duplicates
      if (!targetDir) {
        targetDir = path.join(rootDir, 'presenters/static/assets');
      }
      
      // Ensure the target directory exists
      await fs.mkdir(targetDir, { recursive: true });
      
      // Check if source directory exists
      try {
        await fs.access(assetsDir);
      } catch {
        console.log('⚠️ Assets directory not found, skipping copy');
        return false;
      }
      
      // Copy the directory recursively
      await this.copyDir(assetsDir, targetDir);
      
      console.log('✅ Assets copied successfully');
      return true;
    } catch (error) {
      console.error('❌ Error copying assets:', error);
      throw error;
    }
  }
  
  /**
   * Recursively copy a directory
   * @param {string} src - Source directory
   * @param {string} dest - Destination directory
   * @returns {Promise<void>}
   */
  async copyDir(src, dest) {
    // Read the source directory
    const entries = await fs.readdir(src, { withFileTypes: true });
    
    // Process each entry
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        // Create and recursively copy subdirectory
        await fs.mkdir(destPath, { recursive: true });
        await this.copyDir(srcPath, destPath);
      } else {
        // Copy file
        await fs.copyFile(srcPath, destPath);
      }
    }
  }
} 