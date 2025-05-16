/**
 * Configuration Port Interface
 * Defines the contract for configuration adapters
 */

/**
 * ConfigPort interface
 * Defines methods for reading and writing configuration files
 */
export class ConfigPort {
  /**
   * Initializes all configuration files
   * @returns {boolean} Success status
   */
  initialize() {
    throw new Error('ConfigPort.initialize() must be implemented');
  }
  
  /**
   * Reads a configuration file
   * @param {string} name - Name of the configuration file
   * @returns {string|object} Configuration content
   */
  read(name) {
    throw new Error('ConfigPort.read() must be implemented');
  }
  
  /**
   * Writes a configuration file
   * @param {string} name - Name of the configuration file
   * @param {string|object} content - Content to write
   * @returns {boolean} Success status
   */
  write(name, content) {
    throw new Error('ConfigPort.write() must be implemented');
  }
}

export default ConfigPort; 