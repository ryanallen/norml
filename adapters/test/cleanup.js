// Test output cleanup adapter
// Implements file system operations for cleaning up test outputs
import { TestCleanupPort } from '../../ports/interfaces/ports.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export class TestCleanupAdapter extends TestCleanupPort {
  constructor() {
    super();
    this.rootDir = process.cwd();
    console.log('TestCleanupAdapter initialized with root dir:', this.rootDir);
  }
  
  async cleanupTestOutput(patterns = ['test-output', 'tests/coverage', 'test-*', 'test-files']) {
    try {
      console.log('Starting cleanup with patterns:', patterns);
      let cleanupCount = 0;
      
      for (const pattern of patterns) {
        try {
          console.log(`Attempting to remove: ${pattern}`);
          
          // Handle glob patterns
          if (pattern.includes('*')) {
            console.log(`Pattern contains wildcard: ${pattern}`);
            // For test-* pattern, list directories and remove matching ones
            const dirPrefix = pattern.split('*')[0];
            console.log(`Looking for directories with prefix: ${dirPrefix}`);
            
            const entries = await fs.readdir(this.rootDir, { withFileTypes: true });
            for (const entry of entries) {
              if (entry.isDirectory() && entry.name.startsWith(dirPrefix)) {
                console.log(`Found matching directory: ${entry.name}`);
                await this.removeDirectory(entry.name);
                cleanupCount++;
              }
            }
          } else {
            // Direct path removal
            const targetPath = join(this.rootDir, pattern);
            console.log(`Full path: ${targetPath}`);
            
            try {
              const stats = await fs.stat(targetPath);
              console.log(`Path exists: ${targetPath}, is directory: ${stats.isDirectory()}`);
              await this.removeDirectory(pattern);
              cleanupCount++;
            } catch (statErr) {
              console.log(`Path does not exist: ${targetPath}, error: ${statErr.code}`);
            }
          }
        } catch (err) {
          // Ignore errors for non-existent paths
          if (err.code !== 'ENOENT') {
            console.error(`Error cleaning up ${pattern}:`, err.message, err.stack);
          } else {
            console.log(`Path not found (ENOENT): ${pattern}`);
          }
        }
      }
      
      return {
        success: true,
        cleanedItems: cleanupCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Cleanup failed with error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async removeDirectory(path) {
    const targetPath = join(this.rootDir, path);
    try {
      console.log(`Removing directory: ${targetPath}`);
      await fs.rm(targetPath, { recursive: true, force: true });
      console.log(`✓ Removed ${path}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${path}:`, error.message);
      throw error;
    }
  }
}

// Export a singleton instance
export const testCleanup = new TestCleanupAdapter(); 