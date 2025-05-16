/**
 * Configuration Port Interface
 * Defines the interface for configuration adapters to implement
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

  /**
   * Get a configuration value
   * @param {string} key - The configuration key
   * @param {*} defaultValue - Default value if key not found
   * @returns {*} The configuration value
   */
  get(key, defaultValue = null) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Check if a configuration key exists
   * @param {string} key - The configuration key
   * @returns {boolean} Whether the key exists
   */
  has(key) {
    throw new Error('Method not implemented');
  }
  
  /**
   * Set a configuration value
   * @param {string} key - The configuration key
   * @param {*} value - The value to set
   * @returns {boolean} Success indicator
   */
  set(key, value) {
    throw new Error('Method not implemented');
  }
}

export default ConfigPort; 