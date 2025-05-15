// Version information adapter
// This adapter provides access to our single source of truth for version info
import { VersionPort } from '../../ports/interfaces/ports.js';
import { readFileSync } from 'fs';
import { join } from 'path';

export class VersionAdapter extends VersionPort {
  constructor(configProvider = null) {
    super();
    this.configProvider = configProvider;
  }
  
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
    const environment = this.configProvider ? 
      this.configProvider.get('NODE_ENV') : 
      process.env.NODE_ENV || 'development';
      
    return {
      version: versionInfo.version,
      node: process.version,
      environment: environment,
      timestamp: new Date().toISOString()
    };
  }
  
  // Set the config provider after construction
  setConfigProvider(configProvider) {
    this.configProvider = configProvider;
    return this;
  }
}

// Export a singleton instance
export const version = new VersionAdapter(); 