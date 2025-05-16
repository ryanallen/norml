/**
 * Configuration Presenter
 * Formats configuration data for APIs and UI
 */

/**
 * Formats configuration file content for display
 * @param {string} name - Configuration file name
 * @param {string|object} content - Raw configuration content
 * @returns {string|object} Formatted configuration
 */
export function formatConfigForDisplay(name, content) {
  if (!content) {
    return { error: `No content available for ${name}` };
  }
  
  try {
    switch (name) {
      case 'app.yaml':
        // Format YAML content by preserving line breaks
        return typeof content === 'string' ? { content } : { error: 'Invalid YAML format' };
        
      case 'package.json':
        // Format package.json with pretty printing
        return typeof content === 'object' ? 
          { content: JSON.stringify(content, null, 2) } : 
          { error: 'Invalid package.json format' };
          
      case '.gitignore':
      case '.gcloudignore':
        // Format ignore files by preserving line breaks
        return typeof content === 'string' ? 
          { content: content.split('\n').filter(line => line.trim().length > 0) } : 
          { error: 'Invalid ignore file format' };
          
      default:
        return { error: `Unknown configuration file: ${name}` };
    }
  } catch (error) {
    return { error: `Error formatting ${name}: ${error.message}` };
  }
}

/**
 * Formats configuration status for API response
 * @param {object} status - Configuration status object
 * @returns {object} Formatted API response
 */
export function formatConfigStatus(status) {
  return {
    success: status.success,
    files: status.files || [],
    timestamp: new Date().toISOString(),
    message: status.success ? 
      'Configuration successfully initialized' : 
      'Configuration initialization failed'
  };
}

/**
 * Configuration presenter exports
 */
export const configPresenter = {
  formatConfigForDisplay,
  formatConfigStatus
};

export default configPresenter; 