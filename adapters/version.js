// Version information adapter
// This adapter provides access to our single source of truth for version info
import { VersionPort } from '../ports/interfaces.js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { config } from './config.js';

export class VersionAdapter extends VersionPort {
  constructor() {
    super();
    this.packageJson = null;
  }

  async loadPackageJson() {
    if (!this.packageJson) {
      const content = await readFile(join(process.cwd(), 'package.json'), 'utf-8');
      this.packageJson = JSON.parse(content);
    }
    return this.packageJson;
  }

  async getVersion() {
    const pkg = await this.loadPackageJson();
    return pkg.version;
  }

  async getBuildInfo() {
    return {
      version: await this.getVersion(),
      node: process.version,
      environment: config.get('NODE_ENV') || 'development',
      timestamp: new Date().toISOString()
    };
  }
}

// Export a singleton instance
export const version = new VersionAdapter(); 