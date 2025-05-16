/**
 * Configuration API implementation
 * Implements the ConfigPort interface
 */

import { ConfigPort } from '../interfaces/config-port.js';
import { appYaml } from '../../adapters/cloud/app-yaml.js';
import { packageConfig } from '../../adapters/env/package-config.js';
import { ignoreFiles } from '../../adapters/env/ignore-files.js';

/**
 * Configuration implementation
 * Handles all configuration files in the RHOMBUS architecture
 */
export class ConfigAPI extends ConfigPort {
  /**
   * Initializes all configuration files
   * Creates or updates all required config files in the root directory
   * @returns {boolean} Success status
   */
  initialize() {
    try {
      // Write all configuration files
      const yamlSuccess = appYaml.write();
      const packageSuccess = packageConfig.writePackageJson();
      const packageLockSuccess = packageConfig.writePackageLockJson();
      const gitignoreSuccess = ignoreFiles.writeGitignore();
      const gcloudignoreSuccess = ignoreFiles.writeGcloudignore();
      
      // Log initialization status
      console.log('[Config] Configuration files initialized:');
      console.log('- app.yaml:', yamlSuccess ? 'Success' : 'Failed');
      console.log('- package.json:', packageSuccess ? 'Success' : 'Failed');
      console.log('- package-lock.json:', packageLockSuccess ? 'Success' : 'Failed');
      console.log('- .gitignore:', gitignoreSuccess ? 'Success' : 'Failed');
      console.log('- .gcloudignore:', gcloudignoreSuccess ? 'Success' : 'Failed');
      
      return yamlSuccess && packageSuccess && packageLockSuccess && 
             gitignoreSuccess && gcloudignoreSuccess;
    } catch (error) {
      console.error('[Config] Initialization error:', error);
      return false;
    }
  }
  
  /**
   * Reads a configuration file
   * @param {string} name - Name of the configuration file
   * @returns {string|object} Configuration content
   */
  read(name) {
    switch (name) {
      case 'app.yaml':
        return appYaml.read();
      case 'package.json':
        return packageConfig.readPackageJson();
      case '.gitignore':
        return ignoreFiles.readGitignore();
      case '.gcloudignore':
        return ignoreFiles.readGcloudignore();
      default:
        throw new Error(`Unknown configuration file: ${name}`);
    }
  }
  
  /**
   * Writes a configuration file
   * @param {string} name - Name of the configuration file
   * @param {string|object} content - Content to write
   * @returns {boolean} Success status
   */
  write(name, content) {
    throw new Error('Direct writing of configuration files is not supported. Use initialize() instead.');
  }
}

// Export a singleton instance
export const configAPI = new ConfigAPI();

export default configAPI; 