// Version information adapter
// This adapter provides access to our single source of truth for version info
import { VersionPort } from '../ports/interfaces.js';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from './config.js';

export class VersionAdapter extends VersionPort {
  async getVersion() {
    try {
      const packageJson = JSON.parse(
        readFileSync(join(process.cwd(), 'package.json'), 'utf8')
      );
      return {
        version: packageJson.version,
        name: packageJson.name
      };
    } catch (error) {
      throw new Error(`Failed to read version: ${error.message}`);
    }
  }

  async getBuildInfo() {
    const versionInfo = await this.getVersion();
    return {
      version: versionInfo.version,
      node: process.version,
      environment: config.get('NODE_ENV') || 'development',
      timestamp: new Date().toISOString()
    };
  }
}

// Export a singleton instance
export const version = new VersionAdapter(); 