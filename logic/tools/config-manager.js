/**
 * Configuration Manager
 * Business logic for handling configuration files
 */

/**
 * Validates configuration content against expected format
 * @param {string} name - Configuration file name
 * @param {string|object} content - Content to validate
 * @returns {boolean} Validation result
 */
export function validateConfig(name, content) {
  if (!content) {
    return false;
  }
  
  switch (name) {
    case 'app.yaml':
      return typeof content === 'string' && 
             content.includes('runtime:') && 
             content.includes('nodejs');
             
    case 'package.json':
      return content && 
             typeof content === 'object' && 
             content.name && 
             content.version && 
             content.scripts;
             
    case '.gitignore':
      return typeof content === 'string' && 
             content.includes('node_modules') && 
             content.length > 0;
             
    case '.gcloudignore':
      return typeof content === 'string' && 
             content.includes('node_modules') && 
             content.length > 0;
             
    default:
      return false;
  }
}

/**
 * Audits configuration files for security issues
 * @param {string} name - Configuration file name
 * @param {string|object} content - Content to audit
 * @returns {string[]} List of security issues found
 */
export function auditConfig(name, content) {
  const issues = [];
  
  switch (name) {
    case 'app.yaml':
      // Check for secrets in app.yaml
      if (typeof content === 'string') {
        if (content.includes('password') || content.includes('secret') || 
            content.includes('key:') || content.includes('token:')) {
          issues.push('app.yaml may contain secrets or credentials');
        }
      }
      break;
      
    case 'package.json':
      // Check for insecure package configurations
      if (content && typeof content === 'object') {
        if (content.scripts) {
          for (const script in content.scripts) {
            const scriptContent = content.scripts[script];
            if (scriptContent.includes('sudo') || scriptContent.includes('chmod 777')) {
              issues.push(`package.json contains potentially unsafe script: ${script}`);
            }
          }
        }
      }
      break;
      
    case '.gitignore':
      // Check for proper ignoring of sensitive files
      if (typeof content === 'string') {
        if (!content.includes('secrets.json') && !content.includes('secrets/')) {
          issues.push('.gitignore may not be correctly ignoring secrets');
        }
      }
      break;
  }
  
  return issues;
}

/**
 * Ensures configuration files are compatible with each other
 * @param {object} configs - Object containing all configuration content
 * @returns {boolean} Compatibility status
 */
export function ensureCompatibility(configs) {
  try {
    // Check Node.js version compatibility
    if (configs.packageJson && configs.appYaml) {
      const packageNodeVersion = configs.packageJson.engines?.node;
      const appYamlNodeVersion = configs.appYaml.match(/runtime: nodejs(\d+)/)?.[1];
      
      if (packageNodeVersion && appYamlNodeVersion) {
        // Extract minimum Node.js version from package.json
        const minNodeVersion = packageNodeVersion.replace('>=', '').split('.')[0];
        
        // Compare with app.yaml Node.js version
        if (parseInt(minNodeVersion, 10) > parseInt(appYamlNodeVersion, 10)) {
          console.warn('[ConfigManager] Warning: package.json requires a newer Node.js version than app.yaml');
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('[ConfigManager] Compatibility check error:', error);
    return false;
  }
}

/**
 * Configuration manager exports
 */
export const configManager = {
  validateConfig,
  auditConfig,
  ensureCompatibility
};

export default configManager; 