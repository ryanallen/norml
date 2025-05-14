// Test output cleanup adapter
// Implements file system operations for cleaning up test outputs
import { TestCleanupPort } from '../ports/interfaces.js';
import { promises as fs } from 'fs';
import { join } from 'path';

export class TestCleanupAdapter extends TestCleanupPort {
  constructor() {
    super();
    this.rootDir = process.cwd();
  }
  
  async cleanupTestOutput(patterns = ['test-output', 'tests/coverage', 'test-*']) {
    try {
      let cleanupCount = 0;
      
      for (const pattern of patterns) {
        try {
          await this.removeDirectory(pattern);
          cleanupCount++;
        } catch (err) {
          // Ignore errors for non-existent paths
          if (err.code !== 'ENOENT') {
            console.error(`Error cleaning up ${pattern}:`, err.message);
          }
        }
      }
      
      return {
        success: true,
        cleanedItems: cleanupCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
  
  async removeDirectory(path) {
    const targetPath = join(this.rootDir, path);
    await fs.rm(targetPath, { recursive: true, force: true });
    console.log(`✓ Removed ${path}`);
    return true;
  }
}

// Export a singleton instance
export const testCleanup = new TestCleanupAdapter(); 